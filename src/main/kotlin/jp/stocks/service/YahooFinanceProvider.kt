package jp.stocks.service

import jp.stocks.model.dto.BalanceSheet
import jp.stocks.model.dto.CashFlowStatement
import jp.stocks.model.dto.CompanyOverview
import jp.stocks.model.dto.IncomeStatement
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

@Service
class YahooFinanceProvider(
    private val webClient: WebClient = WebClient.builder()
        .baseUrl("https://query2.finance.yahoo.com")
        .defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        .defaultHeader("Accept", "application/json")
        .build()
) : FinancialDataProvider {

    override fun getProviderName(): String = "Yahoo Finance"

    override suspend fun fetchCompanyProfile(symbol: String): CompanyOverview? {
        val data = fetchYahooFundamentalData(symbol)
        return data.companyOverview
    }

    override suspend fun fetchFinancialStatements(symbol: String): FinancialData? {
        val yahooData = fetchYahooFundamentalData(symbol)

        return FinancialData(
            symbol = symbol,
            companyOverview = yahooData.companyOverview,
            incomeStatement = yahooData.incomeStatements.firstOrNull(),
            balanceSheet = yahooData.balanceSheets.firstOrNull(),
            cashFlowStatement = yahooData.cashFlowStatements.firstOrNull()
        )
    }

    /**
     * Fetch fundamental data from Yahoo Finance
     */
    private suspend fun fetchYahooFundamentalData(symbol: String): YahooFundamentalData {
        return try {
            val response = webClient.get()
                .uri { uriBuilder ->
                    uriBuilder
                        .path("/v10/finance/quoteSummary/{symbol}")
                        .queryParam("modules", "incomeStatementHistory,incomeStatementHistoryQuarterly," +
                                "balanceSheetHistory,balanceSheetHistoryQuarterly," +
                                "cashflowStatementHistory,cashflowStatementHistoryQuarterly," +
                                "defaultKeyStatistics,financialData,summaryProfile," +
                                "assetProfile,price,summaryDetail")
                        .build(symbol)
                }
                .retrieve()
                .awaitBody<Map<String, Any>>()

            parseYahooFundamentalResponse(symbol, response)
        } catch (e: Exception) {
            println("Yahoo Finance API error for $symbol: ${e.message}")
            println("Note: Yahoo Finance quoteSummary API requires authentication.")
            println("Consider using alternative data sources or manual data entry.")
            throw Exception("Yahoo Finance API is currently unavailable. The quoteSummary endpoint requires authentication tokens (crumb/cookie). Please use manual data entry or alternative data providers.")
        }
    }

    /**
     * Parse Yahoo Finance fundamental data response
     */
    @Suppress("UNCHECKED_CAST")
    private fun parseYahooFundamentalResponse(symbol: String, response: Map<String, Any>): YahooFundamentalData {
        val quoteSummary = response["quoteSummary"] as? Map<String, Any>
        val result = (quoteSummary?.get("result") as? List<Map<String, Any>>)?.firstOrNull()
            ?: return YahooFundamentalData(symbol)

        // Parse company overview
        val companyOverview = parseCompanyOverview(symbol, result)

        // Parse income statements (annual)
        val incomeStatements = parseIncomeStatements(symbol, result, "incomeStatementHistory")

        // Parse balance sheets (annual)
        val balanceSheets = parseBalanceSheets(symbol, result, "balanceSheetHistory")

        // Parse cash flow statements (annual)
        val cashFlowStatements = parseCashFlowStatements(symbol, result, "cashflowStatementHistory")

        return YahooFundamentalData(
            symbol = symbol,
            companyOverview = companyOverview,
            incomeStatements = incomeStatements,
            balanceSheets = balanceSheets,
            cashFlowStatements = cashFlowStatements
        )
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseCompanyOverview(symbol: String, result: Map<String, Any>): CompanyOverview? {
        val profile = result["assetProfile"] as? Map<String, Any>
        val price = result["price"] as? Map<String, Any>
        val summaryDetail = result["summaryDetail"] as? Map<String, Any>
        val defaultKeyStats = result["defaultKeyStatistics"] as? Map<String, Any>

        val marketCap = extractRawValue(price?.get("marketCap")) ?: return null
        val sharesOutstanding = extractRawValue(defaultKeyStats?.get("sharesOutstanding"))?.toLong() ?: return null

        return CompanyOverview(
            symbol = symbol,
            name = extractStringValue(price?.get("longName")) ?: symbol,
            description = extractStringValue(profile?.get("longBusinessSummary")),
            sector = extractStringValue(profile?.get("sector")),
            industry = extractStringValue(profile?.get("industry")),
            marketCap = marketCap,
            sharesOutstanding = sharesOutstanding,
            currency = extractStringValue(price?.get("currency")) ?: "USD",
            country = extractStringValue(profile?.get("country")),
            exchange = extractStringValue(price?.get("exchangeName")),
            nextFiscalQuarterEnd = null,
            yearlyRevenue = null,
            yearlyNetIncome = null,
            yearlyEbitda = null,
            yearlyEps = null
        )
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseIncomeStatements(
        symbol: String,
        result: Map<String, Any>,
        key: String
    ): List<IncomeStatement> {
        val history = result[key] as? Map<String, Any> ?: return emptyList()
        val statements = history["incomeStatementHistory"] as? List<Map<String, Any>> ?: return emptyList()

        return statements.mapNotNull { statement ->
            try {
                val endDate = extractDate(statement["endDate"]) ?: return@mapNotNull null

                val totalRevenue = extractRawValue(statement["totalRevenue"]) ?: return@mapNotNull null
                val costOfRevenue = extractRawValue(statement["costOfRevenue"]) ?: BigDecimal.ZERO
                val grossProfit = extractRawValue(statement["grossProfit"]) ?: (totalRevenue - costOfRevenue)
                val operatingExpenses = extractRawValue(statement["totalOperatingExpenses"]) ?: BigDecimal.ZERO
                val operatingIncome = extractRawValue(statement["operatingIncome"]) ?: BigDecimal.ZERO
                val interestExpense = extractRawValue(statement["interestExpense"])
                val incomeBeforeTax = extractRawValue(statement["incomeBeforeTax"]) ?: BigDecimal.ZERO
                val incomeTaxExpense = extractRawValue(statement["incomeTaxExpense"]) ?: BigDecimal.ZERO
                val netIncome = extractRawValue(statement["netIncome"]) ?: BigDecimal.ZERO
                val ebitda = extractRawValue(statement["ebitda"]) ?: BigDecimal.ZERO

                // Calculate EPS (basic)
                val eps = extractRawValue(statement["eps"]) ?: BigDecimal.ZERO
                val shares = extractRawValue(statement["weightedAverageSharesOutstanding"])?.toLong() ?: 1L

                IncomeStatement(
                    symbol = symbol,
                    fiscalDateEnding = endDate,
                    reportedCurrency = "USD",
                    totalRevenue = totalRevenue,
                    costOfRevenue = costOfRevenue,
                    grossProfit = grossProfit,
                    operatingExpenses = operatingExpenses,
                    operatingIncome = operatingIncome,
                    interestExpense = interestExpense,
                    incomeBeforeTax = incomeBeforeTax,
                    incomeTaxExpense = incomeTaxExpense,
                    netIncome = netIncome,
                    ebitda = ebitda,
                    eps = eps,
                    weightedAverageShares = shares
                )
            } catch (e: Exception) {
                println("Error parsing income statement: ${e.message}")
                null
            }
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseBalanceSheets(
        symbol: String,
        result: Map<String, Any>,
        key: String
    ): List<BalanceSheet> {
        val history = result[key] as? Map<String, Any> ?: return emptyList()
        val statements = history["balanceSheetStatements"] as? List<Map<String, Any>> ?: return emptyList()

        return statements.mapNotNull { statement ->
            try {
                val endDate = extractDate(statement["endDate"]) ?: return@mapNotNull null

                val totalAssets = extractRawValue(statement["totalAssets"]) ?: return@mapNotNull null
                val totalCurrentAssets = extractRawValue(statement["totalCurrentAssets"]) ?: BigDecimal.ZERO
                val cash = extractRawValue(statement["cash"]) ?: BigDecimal.ZERO
                val inventory = extractRawValue(statement["inventory"])
                val totalNonCurrentAssets = totalAssets - totalCurrentAssets
                val ppe = extractRawValue(statement["propertyPlantEquipment"]) ?: BigDecimal.ZERO

                val totalLiabilities = extractRawValue(statement["totalLiab"]) ?: BigDecimal.ZERO
                val totalCurrentLiabilities = extractRawValue(statement["totalCurrentLiabilities"]) ?: BigDecimal.ZERO
                val totalNonCurrentLiabilities = totalLiabilities - totalCurrentLiabilities
                val longTermDebt = extractRawValue(statement["longTermDebt"]) ?: BigDecimal.ZERO
                val shortTermDebt = extractRawValue(statement["shortTermDebt"]) ?:
                                    extractRawValue(statement["shortLongTermDebt"]) ?: BigDecimal.ZERO

                val totalEquity = extractRawValue(statement["totalStockholderEquity"]) ?: BigDecimal.ZERO
                val retainedEarnings = extractRawValue(statement["retainedEarnings"]) ?: BigDecimal.ZERO
                val commonStock = extractRawValue(statement["commonStock"]) ?: BigDecimal.ZERO

                BalanceSheet(
                    symbol = symbol,
                    fiscalDateEnding = endDate,
                    reportedCurrency = "USD",
                    totalAssets = totalAssets,
                    totalCurrentAssets = totalCurrentAssets,
                    cashAndCashEquivalents = cash,
                    inventory = inventory,
                    totalNonCurrentAssets = totalNonCurrentAssets,
                    propertyPlantEquipment = ppe,
                    totalLiabilities = totalLiabilities,
                    totalCurrentLiabilities = totalCurrentLiabilities,
                    totalNonCurrentLiabilities = totalNonCurrentLiabilities,
                    longTermDebt = longTermDebt,
                    shortTermDebt = shortTermDebt,
                    totalShareholderEquity = totalEquity,
                    retainedEarnings = retainedEarnings,
                    commonStock = commonStock
                )
            } catch (e: Exception) {
                println("Error parsing balance sheet: ${e.message}")
                null
            }
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseCashFlowStatements(
        symbol: String,
        result: Map<String, Any>,
        key: String
    ): List<CashFlowStatement> {
        val history = result[key] as? Map<String, Any> ?: return emptyList()
        val statements = history["cashflowStatements"] as? List<Map<String, Any>> ?: return emptyList()

        return statements.mapNotNull { statement ->
            try {
                val endDate = extractDate(statement["endDate"]) ?: return@mapNotNull null

                val operatingCashFlow = extractRawValue(statement["totalCashFromOperatingActivities"]) ?: BigDecimal.ZERO
                val capex = extractRawValue(statement["capitalExpenditures"]) ?: BigDecimal.ZERO
                val freeCashFlow = operatingCashFlow + capex // capex is usually negative
                val investingCashFlow = extractRawValue(statement["totalCashflowsFromInvestingActivities"]) ?: BigDecimal.ZERO
                val financingCashFlow = extractRawValue(statement["totalCashFromFinancingActivities"]) ?: BigDecimal.ZERO
                val dividendPayout = extractRawValue(statement["dividendsPaid"])?.abs()
                val netChangeInCash = extractRawValue(statement["changeInCash"]) ?: BigDecimal.ZERO

                CashFlowStatement(
                    symbol = symbol,
                    fiscalDateEnding = endDate,
                    reportedCurrency = "USD",
                    operatingCashflow = operatingCashFlow,
                    capitalExpenditures = capex,
                    freeCashFlow = freeCashFlow,
                    cashflowFromInvestment = investingCashFlow,
                    cashflowFromFinancing = financingCashFlow,
                    dividendPayout = dividendPayout,
                    netChangeInCash = netChangeInCash
                )
            } catch (e: Exception) {
                println("Error parsing cash flow statement: ${e.message}")
                null
            }
        }
    }

    // Helper functions to extract values from Yahoo Finance response

    @Suppress("UNCHECKED_CAST")
    private fun extractRawValue(value: Any?): BigDecimal? {
        return when (value) {
            is Map<*, *> -> {
                val raw = (value as? Map<String, Any>)?.get("raw")
                when (raw) {
                    is Number -> BigDecimal.valueOf(raw.toDouble())
                    else -> null
                }
            }
            is Number -> BigDecimal.valueOf(value.toDouble())
            else -> null
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun extractStringValue(value: Any?): String? {
        return when (value) {
            is String -> value
            is Map<*, *> -> (value as? Map<String, Any>)?.get("raw") as? String
            else -> null
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun extractDate(value: Any?): LocalDate? {
        return when (value) {
            is Map<*, *> -> {
                val raw = (value as? Map<String, Any>)?.get("raw")
                when (raw) {
                    is Number -> Instant.ofEpochSecond(raw.toLong())
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate()
                    else -> null
                }
            }
            is Number -> Instant.ofEpochSecond(value.toLong())
                .atZone(ZoneId.systemDefault())
                .toLocalDate()
            else -> null
        }
    }
}

/**
 * Container for Yahoo Finance fundamental data
 */
data class YahooFundamentalData(
    val symbol: String,
    val companyOverview: CompanyOverview? = null,
    val incomeStatements: List<IncomeStatement> = emptyList(),
    val balanceSheets: List<BalanceSheet> = emptyList(),
    val cashFlowStatements: List<CashFlowStatement> = emptyList()
)
