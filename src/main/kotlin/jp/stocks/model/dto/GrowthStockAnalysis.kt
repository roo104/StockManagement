package jp.stocks.model.dto

import java.math.BigDecimal

/**
 * Growth metrics calculated from historical financial data
 */
data class GrowthMetrics(
    val symbol: String,
    val revenueGrowthRate: BigDecimal?, // CAGR over available periods
    val earningsGrowthRate: BigDecimal?, // Net income CAGR
    val freeCashFlowGrowthRate: BigDecimal?, // FCF CAGR
    val epsGrowthRate: BigDecimal?, // EPS CAGR
    val grossMargin: BigDecimal?, // Latest gross margin
    val grossMarginTrend: String?, // IMPROVING, STABLE, DECLINING
    val operatingMarginTrend: String?, // IMPROVING, STABLE, DECLINING
    val yearsOfData: Int // Number of years used for calculations
)

/**
 * Comprehensive growth score and analysis
 */
data class GrowthStockScore(
    val symbol: String,
    val name: String?,
    val sector: String?,
    val industry: String?,

    // Growth metrics
    val growthMetrics: GrowthMetrics,

    // Valuation context
    val currentPrice: BigDecimal?,
    val marketCap: BigDecimal?,
    val peRatio: BigDecimal?,
    val pegRatio: BigDecimal?,
    val profitMargin: BigDecimal?,
    val roe: BigDecimal?,

    // Individual scores (0-100)
    val revenueGrowthScore: Int,
    val earningsGrowthScore: Int,
    val cashFlowScore: Int,
    val profitabilityScore: Int,
    val efficiencyScore: Int,

    // Overall composite score (0-100)
    val overallScore: Int,

    // Classification
    val growthCategory: GrowthCategory,

    // Flags
    val flags: List<String> // Positive or negative indicators
)

/**
 * Growth stock category classification
 */
enum class GrowthCategory {
    HIGH_GROWTH,      // Score >= 80
    STRONG_GROWTH,    // Score >= 60
    MODERATE_GROWTH,  // Score >= 40
    LOW_GROWTH,       // Score >= 20
    NO_GROWTH         // Score < 20
}

/**
 * Request to screen stocks with filters
 */
data class GrowthScreeningRequest(
    val symbols: List<String>? = null, // Specific symbols or null for all in watchlist
    val minScore: Int? = null,
    val minRevenueGrowth: BigDecimal? = null,
    val minEarningsGrowth: BigDecimal? = null,
    val sectors: List<String>? = null,
    val maxPeRatio: BigDecimal? = null
)

/**
 * Screening results
 */
data class GrowthScreeningResult(
    val totalAnalyzed: Int,
    val resultsCount: Int,
    val topGrowthStocks: List<GrowthStockScore>
)
