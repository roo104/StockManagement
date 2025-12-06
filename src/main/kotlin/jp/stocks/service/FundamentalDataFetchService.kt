package jp.stocks.service

import org.springframework.stereotype.Service

@Service
class FundamentalDataFetchService(
    private val fundamentalAnalysisService: FundamentalAnalysisService,
    private val financialDataProvider: FinancialDataProvider,
    private val stockWatchlistService: StockWatchlistService
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
            if (companyOverview != null) {
                println("✓ Fetched company overview for $symbol")
                fundamentalAnalysisService.saveCompanyOverview(companyOverview)
            } else {
                println("✗ Failed to fetch company overview for $symbol")
            }

            // Fetch financial statements
            val financialData = financialDataProvider.fetchFinancialStatements(symbol)
            if (financialData != null) {
                println("✓ Fetched financial data for $symbol")

                // Save income statement
                if (financialData.incomeStatement != null) {
                    println("  ✓ Saving income statement for $symbol")
                    fundamentalAnalysisService.saveIncomeStatement(financialData.incomeStatement)
                } else {
                    println("  ✗ No income statement data for $symbol")
                }

                // Save balance sheet
                if (financialData.balanceSheet != null) {
                    println("  ✓ Saving balance sheet for $symbol")
                    fundamentalAnalysisService.saveBalanceSheet(financialData.balanceSheet)
                } else {
                    println("  ✗ No balance sheet data for $symbol")
                }

                // Save cash flow statement
                if (financialData.cashFlowStatement != null) {
                    println("  ✓ Saving cash flow statement for $symbol")
                    fundamentalAnalysisService.saveCashFlowStatement(financialData.cashFlowStatement)
                } else {
                    println("  ✗ No cash flow statement data for $symbol")
                }
            } else {
                println("✗ Failed to fetch financial statements for $symbol")
            }

            // Update last fetched timestamp in watchlist
            stockWatchlistService.updateLastFetched(symbol)

            true
        } catch (e: Exception) {
            println("Error fetching fundamental data for $symbol from ${financialDataProvider.getProviderName()}: ${e.message}")
            e.printStackTrace()
            false
        }
    }

}
