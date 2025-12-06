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
class AlphaVantageProvider(
    @Value("\${alphavantage.api.key}") private val apiKey: String,
    private val webClientBuilder: WebClient.Builder
) : FinancialDataProvider {
    private val logger = LoggerFactory.getLogger(AlphaVantageProvider::class.java)
    private val baseUrl = "https://www.alphavantage.co/query"
    private val webClient = webClientBuilder.baseUrl(baseUrl).build()

    override fun getProviderName(): String = "Alpha Vantage"

    override suspend fun fetchCompanyProfile(symbol: String): CompanyOverview? {
        return try {
            val response = webClient.get()
                .uri { uriBuilder ->
                    uriBuilder
                        .queryParam("function", "OVERVIEW")
                        .queryParam("symbol", symbol)
                        .queryParam("apikey", apiKey)
                        .build()
                }
                .retrieve()
                .awaitBody<Map<String, Any>>()

            parseCompanyOverview(symbol, response)
        } catch (e: Exception) {
            logger.error("Error fetching company overview for $symbol from Alpha Vantage: ${e.message}", e)
            null
        }
    }

    override suspend fun fetchFinancialStatements(symbol: String): FinancialData? {
        return try {
            // Fetch company overview first to get EPS
            val overview = fetchCompanyProfile(symbol)
            val eps = overview?.yearlyEps

            val incomeStatement = fetchIncomeStatement(symbol, eps)
            val balanceSheet = fetchBalanceSheet(symbol)
            val cashFlowStatement = fetchCashFlowStatement(symbol)

            FinancialData(
                symbol = symbol,
                incomeStatement = incomeStatement,
                balanceSheet = balanceSheet,
                cashFlowStatement = cashFlowStatement
            )
        } catch (e: Exception) {
            logger.error("Error fetching financial statements for $symbol from Alpha Vantage: ${e.message}", e)
            null
        }
    }

    private suspend fun fetchIncomeStatement(symbol: String, eps: BigDecimal?): IncomeStatement? {
        return try {
            val response = webClient.get()
                .uri { uriBuilder ->
                    uriBuilder
                        .queryParam("function", "INCOME_STATEMENT")
                        .queryParam("symbol", symbol)
                        .queryParam("apikey", apiKey)
                        .build()
                }
                .retrieve()
                .awaitBody<Map<String, Any>>()

            parseIncomeStatement(symbol, response, eps)
        } catch (e: Exception) {
            logger.error("Error fetching income statement for $symbol: ${e.message}", e)
            null
        }
    }

    private suspend fun fetchBalanceSheet(symbol: String): BalanceSheet? {
        return try {
            val response = webClient.get()
                .uri { uriBuilder ->
                    uriBuilder
                        .queryParam("function", "BALANCE_SHEET")
                        .queryParam("symbol", symbol)
                        .queryParam("apikey", apiKey)
                        .build()
                }
                .retrieve()
                .awaitBody<Map<String, Any>>()

            parseBalanceSheet(symbol, response)
        } catch (e: Exception) {
            logger.error("Error fetching balance sheet for $symbol: ${e.message}", e)
            null
        }
    }

    private suspend fun fetchCashFlowStatement(symbol: String): CashFlowStatement? {
        return try {
            val response = webClient.get()
                .uri { uriBuilder ->
                    uriBuilder
                        .queryParam("function", "CASH_FLOW")
                        .queryParam("symbol", symbol)
                        .queryParam("apikey", apiKey)
                        .build()
                }
                .retrieve()
                .awaitBody<Map<String, Any>>()

            parseCashFlowStatement(symbol, response)
        } catch (e: Exception) {
            logger.error("Error fetching cash flow statement for $symbol: ${e.message}", e)
            null
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseCompanyOverview(symbol: String, response: Map<String, Any>): CompanyOverview? {
        if (response.isEmpty() || response.containsKey("Error Message") || response.containsKey("Note")) {
            logger.warn("Invalid response for $symbol: ${response["Error Message"] ?: response["Note"]}")
            return null
        }

        return try {
            CompanyOverview(
                symbol = symbol,
                name = response["Name"] as? String ?: "",
                description = response["Description"] as? String ?: "",
                sector = response["Sector"] as? String ?: "",
                industry = response["Industry"] as? String ?: "",
                exchange = response["Exchange"] as? String ?: "",
                currency = response["Currency"] as? String ?: "USD",
                country = response["Country"] as? String ?: "",
                marketCap = (response["MarketCapitalization"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                sharesOutstanding = (response["SharesOutstanding"] as? String)?.toLongOrNull() ?: 0L,
                yearlyRevenue = null,
                yearlyNetIncome = null,
                yearlyEbitda = (response["EBITDA"] as? String)?.toBigDecimalOrNull(),
                yearlyEps = (response["EPS"] as? String)?.toBigDecimalOrNull(),
                nextFiscalQuarterEnd = null
            )
        } catch (e: Exception) {
            logger.error("Error parsing company overview for $symbol: ${e.message}", e)
            null
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseIncomeStatement(symbol: String, response: Map<String, Any>, eps: BigDecimal?): IncomeStatement? {
        val annualReports = response["annualReports"] as? List<Map<String, Any>>
        if (annualReports.isNullOrEmpty()) {
            logger.warn("No annual reports found for $symbol")
            return null
        }

        val latest = annualReports.first()
        return try {
            val fiscalDateEnding = LocalDate.parse(latest["fiscalDateEnding"] as String)
            val netIncome = (latest["netIncome"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO

            // Calculate weighted average shares if EPS is available
            val actualEps = eps ?: BigDecimal.ZERO
            val weightedAverageShares = if (actualEps > BigDecimal.ZERO && netIncome != BigDecimal.ZERO) {
                netIncome.divide(actualEps, 0, java.math.RoundingMode.HALF_UP).toLong()
            } else {
                0L
            }

            IncomeStatement(
                symbol = symbol,
                fiscalDateEnding = fiscalDateEnding,
                reportedCurrency = "USD",
                totalRevenue = (latest["totalRevenue"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                costOfRevenue = (latest["costOfRevenue"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                grossProfit = (latest["grossProfit"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                operatingExpenses = (latest["operatingExpenses"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                operatingIncome = (latest["operatingIncome"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                ebitda = (latest["ebitda"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                interestExpense = (latest["interestExpense"] as? String)?.toBigDecimalOrNull(),
                incomeTaxExpense = (latest["incomeTaxExpense"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                incomeBeforeTax = (latest["incomeBeforeTax"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                netIncome = netIncome,
                eps = actualEps,
                weightedAverageShares = weightedAverageShares
            )
        } catch (e: Exception) {
            logger.error("Error parsing income statement for $symbol: ${e.message}", e)
            null
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseBalanceSheet(symbol: String, response: Map<String, Any>): BalanceSheet? {
        val annualReports = response["annualReports"] as? List<Map<String, Any>>
        if (annualReports.isNullOrEmpty()) {
            logger.warn("No annual reports found for $symbol")
            return null
        }

        val latest = annualReports.first()
        return try {
            val fiscalDateEnding = LocalDate.parse(latest["fiscalDateEnding"] as String)

            BalanceSheet(
                symbol = symbol,
                fiscalDateEnding = fiscalDateEnding,
                reportedCurrency = "USD",
                totalAssets = (latest["totalAssets"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                totalCurrentAssets = (latest["totalCurrentAssets"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                cashAndCashEquivalents = (latest["cashAndCashEquivalentsAtCarryingValue"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                inventory = (latest["inventory"] as? String)?.toBigDecimalOrNull(),
                totalNonCurrentAssets = (latest["totalNonCurrentAssets"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                propertyPlantEquipment = (latest["propertyPlantEquipment"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                totalLiabilities = (latest["totalLiabilities"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                totalCurrentLiabilities = (latest["totalCurrentLiabilities"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                totalNonCurrentLiabilities = (latest["totalNonCurrentLiabilities"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                longTermDebt = (latest["longTermDebt"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                shortTermDebt = (latest["shortTermDebt"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                totalShareholderEquity = (latest["totalShareholderEquity"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                retainedEarnings = (latest["retainedEarnings"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                commonStock = (latest["commonStock"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO
            )
        } catch (e: Exception) {
            logger.error("Error parsing balance sheet for $symbol: ${e.message}", e)
            null
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseCashFlowStatement(symbol: String, response: Map<String, Any>): CashFlowStatement? {
        val annualReports = response["annualReports"] as? List<Map<String, Any>>
        if (annualReports.isNullOrEmpty()) {
            logger.warn("No annual reports found for $symbol")
            return null
        }

        val latest = annualReports.first()
        return try {
            val fiscalDateEnding = LocalDate.parse(latest["fiscalDateEnding"] as String)

            val operatingCashflow = (latest["operatingCashflow"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO
            val capitalExpenditures = (latest["capitalExpenditures"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO

            CashFlowStatement(
                symbol = symbol,
                fiscalDateEnding = fiscalDateEnding,
                reportedCurrency = "USD",
                operatingCashflow = operatingCashflow,
                capitalExpenditures = capitalExpenditures,
                freeCashFlow = operatingCashflow + capitalExpenditures, // capex is usually negative
                cashflowFromInvestment = (latest["cashflowFromInvestment"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                cashflowFromFinancing = (latest["cashflowFromFinancing"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO,
                dividendPayout = (latest["dividendPayout"] as? String)?.toBigDecimalOrNull(),
                netChangeInCash = (latest["changeInCashAndCashEquivalents"] as? String)?.toBigDecimalOrNull() ?: BigDecimal.ZERO
            )
        } catch (e: Exception) {
            logger.error("Error parsing cash flow statement for $symbol: ${e.message}", e)
            null
        }
    }
}
