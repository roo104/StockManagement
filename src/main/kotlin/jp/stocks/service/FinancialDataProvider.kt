package jp.stocks.service

import jp.stocks.model.dto.BalanceSheet
import jp.stocks.model.dto.CashFlowStatement
import jp.stocks.model.dto.CompanyOverview
import jp.stocks.model.dto.IncomeStatement

/**
 * Interface for financial data providers
 * Implementations can use different data sources (Finnhub, Yahoo Finance, etc.)
 */
interface FinancialDataProvider {
    /**
     * Get the provider name for logging and identification
     */
    fun getProviderName(): String

    /**
     * Fetch company overview/profile
     */
    suspend fun fetchCompanyProfile(symbol: String): CompanyOverview?

    /**
     * Fetch complete financial statements
     */
    suspend fun fetchFinancialStatements(symbol: String): FinancialData?
}

/**
 * Container for complete financial data from a provider
 */
data class FinancialData(
    val symbol: String,
    val companyOverview: CompanyOverview? = null,
    val incomeStatement: IncomeStatement? = null,
    val balanceSheet: BalanceSheet? = null,
    val cashFlowStatement: CashFlowStatement? = null
)
