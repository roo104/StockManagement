package jp.stocks.model.dto

import java.math.BigDecimal
import java.time.LocalDate

/**
 * Income Statement data
 */
data class IncomeStatement(
    val symbol: String,
    val fiscalDateEnding: LocalDate,
    val reportedCurrency: String,
    val totalRevenue: BigDecimal,
    val costOfRevenue: BigDecimal,
    val grossProfit: BigDecimal,
    val operatingExpenses: BigDecimal,
    val operatingIncome: BigDecimal,
    val interestExpense: BigDecimal?,
    val incomeBeforeTax: BigDecimal,
    val incomeTaxExpense: BigDecimal,
    val netIncome: BigDecimal,
    val ebitda: BigDecimal,
    val eps: BigDecimal, // Earnings Per Share
    val weightedAverageShares: Long
)

/**
 * Balance Sheet data
 */
data class BalanceSheet(
    val symbol: String,
    val fiscalDateEnding: LocalDate,
    val reportedCurrency: String,
    val totalAssets: BigDecimal,
    val totalCurrentAssets: BigDecimal,
    val cashAndCashEquivalents: BigDecimal,
    val inventory: BigDecimal?,
    val totalNonCurrentAssets: BigDecimal,
    val propertyPlantEquipment: BigDecimal,
    val totalLiabilities: BigDecimal,
    val totalCurrentLiabilities: BigDecimal,
    val totalNonCurrentLiabilities: BigDecimal,
    val longTermDebt: BigDecimal,
    val shortTermDebt: BigDecimal,
    val totalShareholderEquity: BigDecimal,
    val retainedEarnings: BigDecimal,
    val commonStock: BigDecimal
)

/**
 * Cash Flow Statement data
 */
data class CashFlowStatement(
    val symbol: String,
    val fiscalDateEnding: LocalDate,
    val reportedCurrency: String,
    val operatingCashflow: BigDecimal,
    val capitalExpenditures: BigDecimal,
    val freeCashFlow: BigDecimal,
    val cashflowFromInvestment: BigDecimal,
    val cashflowFromFinancing: BigDecimal,
    val dividendPayout: BigDecimal?,
    val netChangeInCash: BigDecimal
)

/**
 * Complete Financial Statements
 */
data class FinancialStatements(
    val symbol: String,
    val incomeStatement: IncomeStatement,
    val balanceSheet: BalanceSheet,
    val cashFlowStatement: CashFlowStatement
)

/**
 * Valuation Metrics
 */
data class ValuationMetrics(
    val symbol: String,
    val currentPrice: BigDecimal,
    val marketCap: BigDecimal,
    val enterpriseValue: BigDecimal,
    val peRatio: BigDecimal?, // Price to Earnings
    val pbRatio: BigDecimal?, // Price to Book
    val psRatio: BigDecimal?, // Price to Sales
    val pegRatio: BigDecimal?, // PEG Ratio (PE / Growth Rate)
    val evToEbitda: BigDecimal?, // Enterprise Value to EBITDA
    val evToSales: BigDecimal?, // Enterprise Value to Sales
    val priceToFreeCashFlow: BigDecimal?,
    val debtToEquity: BigDecimal?,
    val currentRatio: BigDecimal?, // Current Assets / Current Liabilities
    val quickRatio: BigDecimal?, // (Current Assets - Inventory) / Current Liabilities
    val returnOnEquity: BigDecimal?, // ROE
    val returnOnAssets: BigDecimal?, // ROA
    val profitMargin: BigDecimal?,
    val operatingMargin: BigDecimal?,
    val dividendYield: BigDecimal?,
    val payoutRatio: BigDecimal?
)

/**
 * DCF (Discounted Cash Flow) Model Input
 */
data class DcfInput(
    val symbol: String,
    val freeCashFlows: List<BigDecimal>, // Historical FCF
    val projectedGrowthRate: BigDecimal, // Expected growth rate (as decimal, e.g., 0.05 for 5%)
    val terminalGrowthRate: BigDecimal, // Terminal growth rate
    val discountRate: BigDecimal, // WACC or required rate of return
    val projectionYears: Int = 5, // Number of years to project
    val sharesOutstanding: Long
)

/**
 * DCF Model Result
 */
data class DcfResult(
    val symbol: String,
    val projectedCashFlows: List<BigDecimal>,
    val terminalValue: BigDecimal,
    val presentValueOfCashFlows: BigDecimal,
    val presentValueOfTerminalValue: BigDecimal,
    val enterpriseValue: BigDecimal,
    val equityValue: BigDecimal,
    val fairValuePerShare: BigDecimal,
    val currentPrice: BigDecimal,
    val upside: BigDecimal // Percentage upside/downside
)

/**
 * Company Overview/Profile
 */
data class CompanyOverview(
    val symbol: String,
    val name: String,
    val description: String?,
    val sector: String?,
    val industry: String?,
    val marketCap: BigDecimal,
    val sharesOutstanding: Long,
    val currency: String,
    val country: String?,
    val exchange: String?,
    val lastReportedQuarter: LocalDate?,
    val nextEarningsDate: LocalDate?,
    val yearlyRevenue: BigDecimal?,
    val yearlyNetIncome: BigDecimal?,
    val yearlyEbitda: BigDecimal?,
    val yearlyEps: BigDecimal?
)

/**
 * IPO Calendar Entry
 */
data class IpoCalendarEntry(
    val symbol: String,
    val name: String,
    val ipoDate: LocalDate,
    val priceRangeLow: BigDecimal?,
    val priceRangeHigh: BigDecimal?,
    val currency: String,
    val exchange: String?
)

/**
 * IPO Calendar Response
 */
data class IpoCalendar(
    val month: String, // Format: YYYY-MM
    val ipos: List<IpoCalendarEntry>
)
