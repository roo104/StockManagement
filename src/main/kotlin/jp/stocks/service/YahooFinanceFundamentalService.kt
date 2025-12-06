package jp.stocks.service

import org.springframework.stereotype.Service

@Service
class YahooFinanceFundamentalService(
    private val fundamentalAnalysisService: FundamentalAnalysisService,
    private val financialDataProvider: FinancialDataProvider
) {

    /**
     * Fetch and save all fundamental data for a symbol
     * Uses the configured financial data provider (Finnhub, Yahoo Finance, etc.)
     */
    suspend fun fetchAndSaveFundamentalData(symbol: String): Boolean {
        return try {
            println("Fetching fundamental data from ${financialDataProvider.getProviderName()} for $symbol")

            // Fetch company profile
            val companyOverview = financialDataProvider.fetchCompanyProfile(symbol)
            companyOverview?.let {
                fundamentalAnalysisService.saveCompanyOverview(it)
            }

            // Fetch financial statements
            val financialData = financialDataProvider.fetchFinancialStatements(symbol)
            financialData?.let {
                // Save income statement
                it.incomeStatement?.let { income ->
                    fundamentalAnalysisService.saveIncomeStatement(income)
                }

                // Save balance sheet
                it.balanceSheet?.let { balance ->
                    fundamentalAnalysisService.saveBalanceSheet(balance)
                }

                // Save cash flow statement
                it.cashFlowStatement?.let { cashFlow ->
                    fundamentalAnalysisService.saveCashFlowStatement(cashFlow)
                }
            }

            true
        } catch (e: Exception) {
            println("Error fetching fundamental data for $symbol from ${financialDataProvider.getProviderName()}: ${e.message}")
            false
        }
    }

}