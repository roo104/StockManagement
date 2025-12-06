package jp.stocks.service

import jp.stocks.model.dto.BalanceSheet
import jp.stocks.model.dto.CashFlowStatement
import jp.stocks.model.dto.CompanyOverview
import jp.stocks.model.dto.IncomeStatement
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import java.math.BigDecimal
import java.time.LocalDate

@Service
class FinnhubService(
    @Value("\${finnhub.api.key}") private val apiKey: String,
    private val webClientBuilder: WebClient.Builder
) : FinancialDataProvider {
    private val logger = LoggerFactory.getLogger(FinnhubService::class.java)
    private val baseUrl = "https://finnhub.io/api/v1"
    private val webClient = webClientBuilder.baseUrl(baseUrl).build()

    override fun getProviderName(): String = "Finnhub"

    /**
     * Fetch company profile from Finnhub
     */
    override suspend fun fetchCompanyProfile(symbol: String): CompanyOverview? {
        return try {
            val response = webClient.get()
                .uri { uriBuilder ->
                    uriBuilder
                        .path("/stock/profile2")
                        .queryParam("symbol", symbol)
                        .queryParam("token", apiKey)
                        .build()
                }
                .retrieve()
                .awaitBody<Map<String, Any>>()

            CompanyOverview(
                symbol = symbol,
                name = response["name"] as? String ?: "",
                description = response["description"] as? String ?: "",
                sector = response["finnhubIndustry"] as? String ?: "",
                industry = response["finnhubIndustry"] as? String ?: "",
                exchange = response["exchange"] as? String ?: "",
                currency = response["currency"] as? String ?: "USD",
                country = response["country"] as? String ?: "",
                marketCap = (response["marketCapitalization"] as? Number)?.let {
                    BigDecimal(it.toDouble() * 1_000_000)
                } ?: BigDecimal.ZERO,
                sharesOutstanding = (response["shareOutstanding"] as? Number)?.let {
                    (it.toDouble() * 1_000_000).toLong()
                } ?: 0L,
                yearlyRevenue = null,
                yearlyNetIncome = null,
                yearlyEbitda = null,
                yearlyEps = null,
                lastReportedQuarter = null,
                nextEarningsDate = null
            )
        } catch (e: Exception) {
            logger.error("Error fetching company profile for $symbol from Finnhub: ${e.message}", e)
            null
        }
    }

    /**
     * Fetch basic financials from Finnhub
     */
    suspend fun fetchBasicFinancials(symbol: String): Map<String, Any>? {
        return try {
            val response = webClient.get()
                .uri { uriBuilder ->
                    uriBuilder
                        .path("/stock/metric")
                        .queryParam("symbol", symbol)
                        .queryParam("metric", "all")
                        .queryParam("token", apiKey)
                        .build()
                }
                .retrieve()
                .awaitBody<Map<String, Any>>()

            response
        } catch (e: Exception) {
            logger.error("Error fetching basic financials for $symbol from Finnhub: ${e.message}", e)
            null
        }
    }

    /**
     * Fetch financial statements from Finnhub (annual)
     */
    override suspend fun fetchFinancialStatements(symbol: String): FinancialData? {
        val finnhubData = fetchFinnhubFinancialStatements(symbol) ?: return null

        return FinancialData(
            symbol = symbol,
            companyOverview = null, // Fetch separately if needed
            incomeStatement = finnhubData.incomeStatement,
            balanceSheet = finnhubData.balanceSheet,
            cashFlowStatement = finnhubData.cashFlowStatement
        )
    }

    /**
     * Fetch financial statements from Finnhub API (internal)
     */
    private suspend fun fetchFinnhubFinancialStatements(symbol: String): FinnhubFinancialData? {
        return try {
            val response = webClient.get()
                .uri { uriBuilder ->
                    uriBuilder
                        .path("/stock/financials-reported")
                        .queryParam("symbol", symbol)
                        .queryParam("freq", "annual")
                        .queryParam("token", apiKey)
                        .build()
                }
                .retrieve()
                .awaitBody<Map<String, Any>>()

            parseFinnhubFinancials(symbol, response)
        } catch (e: Exception) {
            logger.error("Error fetching financial statements for $symbol from Finnhub: ${e.message}", e)
            null
        }
    }

    private fun parseFinnhubFinancials(symbol: String, response: Map<String, Any>): FinnhubFinancialData? {
        val data = response["data"] as? List<Map<String, Any>> ?: return null
        if (data.isEmpty()) return null

        val latestReport = data[0]
        val report = latestReport["report"] as? Map<String, Any> ?: return null
        val bs = report["bs"] as? List<Map<String, Any>> ?: emptyList()
        val ic = report["ic"] as? List<Map<String, Any>> ?: emptyList()
        val cf = report["cf"] as? List<Map<String, Any>> ?: emptyList()

        val year = latestReport["year"] as? Number ?: return null
        val period = latestReport["period"] as? String ?: "Q4"
        val filedDate = latestReport["filedDate"] as? String ?: return null

        // Estimate fiscal date ending (use filed date as approximation)
        // Extract only the date part if the string contains time information
        val fiscalDateEnding = LocalDate.parse(filedDate.substring(0, 10))

        return FinnhubFinancialData(
            symbol = symbol,
            fiscalDateEnding = fiscalDateEnding,
            balanceSheet = parseBalanceSheet(symbol, fiscalDateEnding, bs),
            incomeStatement = parseIncomeStatement(symbol, fiscalDateEnding, ic),
            cashFlowStatement = parseCashFlowStatement(symbol, fiscalDateEnding, cf)
        )
    }

    private fun parseBalanceSheet(symbol: String, date: LocalDate, bs: List<Map<String, Any>>): BalanceSheet {
        fun findValue(vararg labels: String): BigDecimal? {
            for (label in labels) {
                val value = bs.find { it["label"] == label }?.get("value")?.let {
                    when (it) {
                        is Number -> BigDecimal(it.toDouble())
                        is String -> it.toBigDecimalOrNull()
                        else -> null
                    }
                }
                if (value != null) return value
            }
            return null
        }

        val totalAssets = findValue("Assets", "TotalAssets") ?: BigDecimal.ZERO
        val totalCurrentAssets = findValue("Assets, Current", "CurrentAssets") ?: BigDecimal.ZERO
        val totalLiabilities = findValue("Liabilities", "TotalLiabilities") ?: BigDecimal.ZERO
        val totalCurrentLiabilities = findValue("Liabilities, Current", "CurrentLiabilities") ?: BigDecimal.ZERO
        val totalNonCurrentAssets = totalAssets - totalCurrentAssets
        val totalNonCurrentLiabilities = totalLiabilities - totalCurrentLiabilities

        return BalanceSheet(
            symbol = symbol,
            fiscalDateEnding = date,
            reportedCurrency = "USD",
            totalAssets = totalAssets,
            totalCurrentAssets = totalCurrentAssets,
            cashAndCashEquivalents = findValue(
                "Cash and Cash Equivalents, at Carrying Value",
                "CashAndCashEquivalentsAtCarryingValue"
            ) ?: BigDecimal.ZERO,
            inventory = findValue("Inventory, Net", "Inventory"),
            totalNonCurrentAssets = totalNonCurrentAssets,
            propertyPlantEquipment = findValue(
                "Property, Plant and Equipment, Net",
                "PropertyPlantAndEquipmentNet"
            ) ?: BigDecimal.ZERO,
            totalLiabilities = totalLiabilities,
            totalCurrentLiabilities = totalCurrentLiabilities,
            totalNonCurrentLiabilities = totalNonCurrentLiabilities,
            longTermDebt = findValue(
                "Long-Term Debt, Excluding Current Maturities",
                "LongTermDebt"
            ) ?: BigDecimal.ZERO,
            shortTermDebt = findValue(
                "Long-Term Debt, Current Maturities",
                "Commercial Paper",
                "ShortTermDebt"
            ) ?: BigDecimal.ZERO,
            totalShareholderEquity = findValue(
                "Stockholders' Equity Attributable to Parent",
                "TotalEquity"
            ) ?: BigDecimal.ZERO,
            retainedEarnings = findValue("Retained Earnings (Accumulated Deficit)", "RetainedEarnings") ?: BigDecimal.ZERO,
            commonStock = findValue(
                "Common Stocks, Including Additional Paid in Capital",
                "CommonStock"
            ) ?: BigDecimal.ZERO
        )
    }

    private fun parseIncomeStatement(symbol: String, date: LocalDate, ic: List<Map<String, Any>>): IncomeStatement {
        fun findValue(vararg labels: String): BigDecimal? {
            for (label in labels) {
                val value = ic.find { it["label"] == label }?.get("value")?.let {
                    when (it) {
                        is Number -> BigDecimal(it.toDouble())
                        is String -> it.toBigDecimalOrNull()
                        else -> null
                    }
                }
                if (value != null) return value
            }
            return null
        }

        val totalRevenue = findValue(
            "Revenue from Contract with Customer, Excluding Assessed Tax",
            "Revenues",
            "RevenueFromContractWithCustomerExcludingAssessedTax"
        ) ?: BigDecimal.ZERO
        val costOfRevenue = findValue(
            "Cost of Goods and Services Sold",
            "CostOfRevenue"
        ) ?: BigDecimal.ZERO
        val grossProfit = findValue("Gross Profit", "GrossProfit") ?: run {
            if (totalRevenue != BigDecimal.ZERO && costOfRevenue != BigDecimal.ZERO) {
                totalRevenue - costOfRevenue
            } else {
                BigDecimal.ZERO
            }
        }

        // Calculate operating expenses from individual components
        val rdExpense = findValue("Research and Development Expense", "ResearchAndDevelopmentExpense") ?: BigDecimal.ZERO
        val sellingExpense = findValue("Selling and Marketing Expense", "SellingAndMarketingExpense") ?: BigDecimal.ZERO
        val gaExpense = findValue("General and Administrative Expense", "GeneralAndAdministrativeExpense") ?: BigDecimal.ZERO
        val operatingExpenses = findValue("Operating Expenses", "OperatingExpenses")
            ?: (rdExpense + sellingExpense + gaExpense)

        val operatingIncome = findValue(
            "Operating Income (Loss)",
            "OperatingIncomeLoss"
        ) ?: BigDecimal.ZERO

        val netIncome = findValue("Net income", "NetIncomeLoss") ?: BigDecimal.ZERO
        val weightedAverageShares = findValue(
            "Weighted Average Number of Shares Outstanding, Basic",
            "WeightedAverageNumberOfSharesOutstandingBasic"
        )?.toLong() ?: 1L
        val eps = findValue("Basic (A/B)", "Earnings Per Share, Basic", "EarningsPerShareBasic") ?: run {
            if (weightedAverageShares > 0 && netIncome != BigDecimal.ZERO) {
                netIncome.divide(BigDecimal(weightedAverageShares), 4, java.math.RoundingMode.HALF_UP)
            } else {
                BigDecimal.ZERO
            }
        }

        // Calculate EBITDA: Operating Income + Depreciation + Amortization
        val depreciation = findValue(
            "Depreciation, Depletion and Amortization",
            "DepreciationDepletionAndAmortization",
            "Depreciation and Amortization"
        ) ?: BigDecimal.ZERO
        val ebitda = findValue("EBITDA") ?: run {
            if (operatingIncome != BigDecimal.ZERO || depreciation != BigDecimal.ZERO) {
                operatingIncome + depreciation
            } else {
                BigDecimal.ZERO
            }
        }

        return IncomeStatement(
            symbol = symbol,
            fiscalDateEnding = date,
            reportedCurrency = "USD",
            totalRevenue = totalRevenue,
            costOfRevenue = costOfRevenue,
            grossProfit = grossProfit,
            operatingExpenses = operatingExpenses,
            operatingIncome = operatingIncome,
            ebitda = ebitda,
            interestExpense = findValue("Interest Expense", "InterestExpense"),
            incomeTaxExpense = findValue(
                "Income Tax Expense (Benefit)",
                "IncomeTaxExpenseBenefit"
            ) ?: BigDecimal.ZERO,
            incomeBeforeTax = findValue(
                "Income (Loss) from Continuing Operations before Income Taxes, Noncontrolling Interest",
                "IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest"
            ) ?: BigDecimal.ZERO,
            netIncome = netIncome,
            eps = eps,
            weightedAverageShares = weightedAverageShares
        )
    }

    private fun parseCashFlowStatement(symbol: String, date: LocalDate, cf: List<Map<String, Any>>): CashFlowStatement {
        // Debug: Print all available labels in cash flow statement
        logger.info("Cash flow labels for $symbol: ${cf.map { it["label"] }}")

        fun findValue(vararg labels: String): BigDecimal? {
            for (label in labels) {
                val value = cf.find { it["label"] == label }?.get("value")?.let {
                    when (it) {
                        is Number -> BigDecimal(it.toDouble())
                        is String -> it.toBigDecimalOrNull()
                        else -> null
                    }
                }
                if (value != null) return value
            }
            return null
        }

        val operatingCashFlow = findValue(
            "Net cash from operations",
            "Net cash provided by operating activities",
            "Net Cash Provided by (Used in) Operating Activities",
            "NetCashProvidedByUsedInOperatingActivities"
        ) ?: BigDecimal.ZERO
        val capex = findValue(
            "Additions to property and equipment",
            "Purchases of property and equipment",
            "Payments to Acquire Property, Plant, and Equipment",
            "PaymentsToAcquirePropertyPlantAndEquipment"
        ) ?: BigDecimal.ZERO
        val freeCashFlow = operatingCashFlow + capex // capex is usually negative

        return CashFlowStatement(
            symbol = symbol,
            fiscalDateEnding = date,
            reportedCurrency = "USD",
            operatingCashflow = operatingCashFlow,
            capitalExpenditures = capex,
            freeCashFlow = freeCashFlow,
            cashflowFromInvestment = findValue(
                "Net cash used in investing",
                "Net cash used in investing activities",
                "Net Cash Provided by (Used in) Investing Activities",
                "NetCashProvidedByUsedInInvestingActivities"
            ) ?: BigDecimal.ZERO,
            cashflowFromFinancing = findValue(
                "Net cash used in financing",
                "Net cash used in financing activities",
                "Net Cash Provided by (Used in) Financing Activities",
                "NetCashProvidedByUsedInFinancingActivities"
            ) ?: BigDecimal.ZERO,
            dividendPayout = findValue(
                "Dividend payments",
                "Total Amount",
                "Payments of Ordinary Dividends, Common Stock",
                "PaymentsOfDividends"
            )?.abs(),
            netChangeInCash = findValue(
                "Net increase (decrease) in cash and cash equivalents",
                "Cash, Cash Equivalents, Restricted Cash, and Restricted Cash Equivalents, Period Increase (Decrease), Including Exchange Rate Effect",
                "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalentsPeriodIncreaseDecreaseIncludingExchangeRateEffect"
            ) ?: BigDecimal.ZERO
        )
    }
}

data class FinnhubFinancialData(
    val symbol: String,
    val fiscalDateEnding: LocalDate,
    val incomeStatement: IncomeStatement,
    val balanceSheet: BalanceSheet,
    val cashFlowStatement: CashFlowStatement
)
