package jp.stocks.service

import jp.stocks.model.dto.*
import jp.stocks.repository.CashFlowStatementRepository
import jp.stocks.repository.CompanyOverviewRepository
import jp.stocks.repository.IncomeStatementRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import kotlin.math.pow

@Service
class GrowthStockScreeningService(
    private val incomeStatementRepository: IncomeStatementRepository,
    private val cashFlowStatementRepository: CashFlowStatementRepository,
    private val companyOverviewRepository: CompanyOverviewRepository,
    private val valuationMetricsService: ValuationMetricsService,
    private val stockWatchlistService: StockWatchlistService
) {

    /**
     * Screen stocks for growth potential
     */
    fun screenGrowthStocks(request: GrowthScreeningRequest): GrowthScreeningResult {
        // Get list of symbols to analyze
        val symbols = request.symbols ?: stockWatchlistService.getActiveStocks().map { it.symbol }

        val scores = symbols.mapNotNull { symbol ->
            try {
                calculateGrowthScore(symbol)
            } catch (e: Exception) {
                null // Skip stocks with insufficient data
            }
        }.filter { score ->
            // Apply filters
            (request.minScore == null || score.overallScore >= request.minScore) &&
                    (request.minRevenueGrowth == null || (score.growthMetrics.revenueGrowthRate ?: BigDecimal.ZERO) >= request.minRevenueGrowth) &&
                    (request.minEarningsGrowth == null || (score.growthMetrics.earningsGrowthRate ?: BigDecimal.ZERO) >= request.minEarningsGrowth) &&
                    (request.sectors == null || score.sector in request.sectors) &&
                    (request.maxPeRatio == null || (score.peRatio ?: BigDecimal.ZERO) <= request.maxPeRatio)
        }.sortedByDescending { it.overallScore }

        return GrowthScreeningResult(
            totalAnalyzed = symbols.size,
            resultsCount = scores.size,
            topGrowthStocks = scores
        )
    }

    /**
     * Calculate comprehensive growth score for a single stock
     */
    fun calculateGrowthScore(symbol: String): GrowthStockScore? {
        val growthMetrics = calculateGrowthMetrics(symbol) ?: return null
        val companyOverview = companyOverviewRepository.findBySymbol(symbol)

        // Get current price (using market cap / shares outstanding as proxy if needed)
        val currentPrice = companyOverview?.marketCap?.let { marketCap ->
            marketCap.divide(BigDecimal(companyOverview.sharesOutstanding), 2, RoundingMode.HALF_UP)
        }

        // Get valuation metrics
        val valuationMetrics = currentPrice?.let {
            valuationMetricsService.calculateValuationMetrics(symbol, it)
        }

        // Calculate individual scores
        val revenueGrowthScore = scoreGrowthRate(growthMetrics.revenueGrowthRate)
        val earningsGrowthScore = scoreGrowthRate(growthMetrics.earningsGrowthRate)
        val cashFlowScore = scoreCashFlow(growthMetrics.freeCashFlowGrowthRate, valuationMetrics?.priceToFreeCashFlow)
        val profitabilityScore = scoreProfitability(
            growthMetrics.grossMargin,
            valuationMetrics?.profitMargin,
            growthMetrics.grossMarginTrend
        )
        val efficiencyScore = scoreEfficiency(valuationMetrics?.returnOnEquity, valuationMetrics?.returnOnAssets)

        // Calculate overall score (weighted average)
        val overallScore = calculateOverallScore(
            revenueGrowthScore,
            earningsGrowthScore,
            cashFlowScore,
            profitabilityScore,
            efficiencyScore
        )

        // Determine category
        val growthCategory = when {
            overallScore >= 80 -> GrowthCategory.HIGH_GROWTH
            overallScore >= 60 -> GrowthCategory.STRONG_GROWTH
            overallScore >= 40 -> GrowthCategory.MODERATE_GROWTH
            overallScore >= 20 -> GrowthCategory.LOW_GROWTH
            else -> GrowthCategory.NO_GROWTH
        }

        // Generate flags
        val flags = generateFlags(growthMetrics, valuationMetrics, overallScore)

        // Calculate PEG ratio if we have PE and earnings growth
        val pegRatio = if (valuationMetrics?.peRatio != null && growthMetrics.earningsGrowthRate != null) {
            calculatePEGRatio(valuationMetrics.peRatio, growthMetrics.earningsGrowthRate)
        } else null

        return GrowthStockScore(
            symbol = symbol,
            name = companyOverview?.name,
            sector = companyOverview?.sector,
            industry = companyOverview?.industry,
            growthMetrics = growthMetrics,
            currentPrice = currentPrice,
            marketCap = companyOverview?.marketCap,
            peRatio = valuationMetrics?.peRatio,
            pegRatio = pegRatio,
            profitMargin = valuationMetrics?.profitMargin,
            roe = valuationMetrics?.returnOnEquity,
            revenueGrowthScore = revenueGrowthScore,
            earningsGrowthScore = earningsGrowthScore,
            cashFlowScore = cashFlowScore,
            profitabilityScore = profitabilityScore,
            efficiencyScore = efficiencyScore,
            overallScore = overallScore,
            growthCategory = growthCategory,
            flags = flags
        )
    }

    /**
     * Calculate growth metrics from historical data
     */
    private fun calculateGrowthMetrics(symbol: String): GrowthMetrics? {
        val incomeStatements = incomeStatementRepository
            .findBySymbolOrderByFiscalDateEndingDesc(symbol)
            .take(5) // Last 5 years

        val cashFlowStatements = cashFlowStatementRepository
            .findBySymbolOrderByFiscalDateEndingDesc(symbol)
            .take(5)

        if (incomeStatements.size < 2) {
            return null // Need at least 2 years of data
        }

        val yearsOfData = incomeStatements.size - 1

        // Calculate revenue CAGR
        val revenueGrowth = calculateCAGR(
            incomeStatements.last().totalRevenue,
            incomeStatements.first().totalRevenue,
            yearsOfData
        )

        // Calculate earnings CAGR
        val earningsGrowth = calculateCAGR(
            incomeStatements.last().netIncome,
            incomeStatements.first().netIncome,
            yearsOfData
        )

        // Calculate EPS CAGR
        val epsGrowth = calculateCAGR(
            incomeStatements.last().eps,
            incomeStatements.first().eps,
            yearsOfData
        )

        // Calculate FCF CAGR
        val fcfGrowth = if (cashFlowStatements.size >= 2) {
            calculateCAGR(
                cashFlowStatements.last().freeCashFlow,
                cashFlowStatements.first().freeCashFlow,
                cashFlowStatements.size - 1
            )
        } else null

        // Calculate margins
        val latestIncome = incomeStatements.first()
        val grossMargin = latestIncome.grossProfit
            .divide(latestIncome.totalRevenue, 4, RoundingMode.HALF_UP)

        // Determine margin trends
        val grossMarginTrend = if (incomeStatements.size >= 3) {
            determineTrend(incomeStatements.map {
                it.grossProfit.divide(it.totalRevenue, 4, RoundingMode.HALF_UP)
            })
        } else null

        val operatingMarginTrend = if (incomeStatements.size >= 3) {
            determineTrend(incomeStatements.map {
                it.operatingIncome.divide(it.totalRevenue, 4, RoundingMode.HALF_UP)
            })
        } else null

        return GrowthMetrics(
            symbol = symbol,
            revenueGrowthRate = revenueGrowth,
            earningsGrowthRate = earningsGrowth,
            freeCashFlowGrowthRate = fcfGrowth,
            epsGrowthRate = epsGrowth,
            grossMargin = grossMargin,
            grossMarginTrend = grossMarginTrend,
            operatingMarginTrend = operatingMarginTrend,
            yearsOfData = yearsOfData
        )
    }

    /**
     * Calculate Compound Annual Growth Rate
     */
    private fun calculateCAGR(startValue: BigDecimal, endValue: BigDecimal, years: Int): BigDecimal? {
        if (startValue <= BigDecimal.ZERO || endValue <= BigDecimal.ZERO || years <= 0) {
            return null
        }

        val ratio = endValue.divide(startValue, 10, RoundingMode.HALF_UP).toDouble()
        val cagr = ratio.pow(1.0 / years) - 1.0

        return BigDecimal(cagr).setScale(4, RoundingMode.HALF_UP)
    }

    /**
     * Determine if a metric is improving, stable, or declining
     */
    private fun determineTrend(values: List<BigDecimal>): String {
        if (values.size < 3) return "UNKNOWN"

        val recentAvg = values.take(2).average()
        val olderAvg = values.drop(values.size - 2).average()

        val change = (recentAvg - olderAvg).divide(olderAvg, 4, RoundingMode.HALF_UP)

        return when {
            change > BigDecimal("0.05") -> "IMPROVING"
            change < BigDecimal("-0.05") -> "DECLINING"
            else -> "STABLE"
        }
    }

    private fun List<BigDecimal>.average(): BigDecimal {
        return fold(BigDecimal.ZERO) { acc, value -> acc + value }
            .divide(BigDecimal(size), 4, RoundingMode.HALF_UP)
    }

    // Scoring functions

    private fun scoreGrowthRate(growthRate: BigDecimal?): Int {
        if (growthRate == null) return 0

        return when {
            growthRate >= BigDecimal("0.30") -> 100 // 30%+ growth
            growthRate >= BigDecimal("0.20") -> 85  // 20-30% growth
            growthRate >= BigDecimal("0.15") -> 70  // 15-20% growth
            growthRate >= BigDecimal("0.10") -> 55  // 10-15% growth
            growthRate >= BigDecimal("0.05") -> 35  // 5-10% growth
            growthRate > BigDecimal.ZERO -> 20      // Positive growth
            else -> 0                                // No growth or negative
        }
    }

    private fun scoreCashFlow(fcfGrowth: BigDecimal?, priceToFCF: BigDecimal?): Int {
        var score = 0

        // Score based on FCF growth
        score += when {
            fcfGrowth == null -> 0
            fcfGrowth >= BigDecimal("0.25") -> 60
            fcfGrowth >= BigDecimal("0.15") -> 50
            fcfGrowth >= BigDecimal("0.10") -> 40
            fcfGrowth > BigDecimal.ZERO -> 25
            else -> 0
        }

        // Bonus for reasonable valuation
        score += when {
            priceToFCF == null -> 0
            priceToFCF <= BigDecimal("15") -> 40
            priceToFCF <= BigDecimal("25") -> 25
            priceToFCF <= BigDecimal("35") -> 15
            else -> 0
        }

        return score.coerceAtMost(100)
    }

    private fun scoreProfitability(
        grossMargin: BigDecimal?,
        profitMargin: BigDecimal?,
        marginTrend: String?
    ): Int {
        var score = 0

        // Score gross margin
        score += when {
            grossMargin == null -> 0
            grossMargin >= BigDecimal("0.60") -> 40
            grossMargin >= BigDecimal("0.40") -> 30
            grossMargin >= BigDecimal("0.25") -> 20
            else -> 10
        }

        // Score profit margin
        score += when {
            profitMargin == null -> 0
            profitMargin >= BigDecimal("0.25") -> 40
            profitMargin >= BigDecimal("0.15") -> 30
            profitMargin >= BigDecimal("0.10") -> 20
            profitMargin > BigDecimal.ZERO -> 10
            else -> 0
        }

        // Bonus for improving margins
        score += when (marginTrend) {
            "IMPROVING" -> 20
            "STABLE" -> 10
            else -> 0
        }

        return score.coerceAtMost(100)
    }

    private fun scoreEfficiency(roe: BigDecimal?, roa: BigDecimal?): Int {
        var score = 0

        // Score ROE
        score += when {
            roe == null -> 0
            roe >= BigDecimal("0.25") -> 60
            roe >= BigDecimal("0.15") -> 45
            roe >= BigDecimal("0.10") -> 30
            roe > BigDecimal.ZERO -> 15
            else -> 0
        }

        // Score ROA
        score += when {
            roa == null -> 0
            roa >= BigDecimal("0.15") -> 40
            roa >= BigDecimal("0.10") -> 30
            roa >= BigDecimal("0.05") -> 20
            roa > BigDecimal.ZERO -> 10
            else -> 0
        }

        return score.coerceAtMost(100)
    }

    private fun calculateOverallScore(
        revenueGrowth: Int,
        earningsGrowth: Int,
        cashFlow: Int,
        profitability: Int,
        efficiency: Int
    ): Int {
        // Weighted average
        val weights = mapOf(
            revenueGrowth to 0.25,
            earningsGrowth to 0.25,
            cashFlow to 0.20,
            profitability to 0.15,
            efficiency to 0.15
        )

        val weightedScore = weights.entries.fold(0.0) { acc, (score, weight) ->
            acc + (score * weight)
        }

        return weightedScore.toInt()
    }

    private fun calculatePEGRatio(peRatio: BigDecimal, earningsGrowthRate: BigDecimal): BigDecimal? {
        val growthRatePercent = earningsGrowthRate.multiply(BigDecimal(100))
        return if (growthRatePercent > BigDecimal.ZERO) {
            peRatio.divide(growthRatePercent, 2, RoundingMode.HALF_UP)
        } else null
    }

    private fun generateFlags(
        growthMetrics: GrowthMetrics,
        valuationMetrics: ValuationMetrics?,
        overallScore: Int
    ): List<String> {
        val flags = mutableListOf<String>()

        // Positive flags
        if ((growthMetrics.revenueGrowthRate ?: BigDecimal.ZERO) >= BigDecimal("0.25")) {
            flags.add("🚀 Exceptional revenue growth (25%+)")
        }
        if ((growthMetrics.earningsGrowthRate ?: BigDecimal.ZERO) >= BigDecimal("0.25")) {
            flags.add("💰 Exceptional earnings growth (25%+)")
        }
        if (growthMetrics.grossMarginTrend == "IMPROVING") {
            flags.add("📈 Improving margins")
        }
        if ((valuationMetrics?.returnOnEquity ?: BigDecimal.ZERO) >= BigDecimal("0.20")) {
            flags.add("⚡ High ROE (20%+)")
        }
        if ((growthMetrics.grossMargin ?: BigDecimal.ZERO) >= BigDecimal("0.50")) {
            flags.add("💎 Strong pricing power (50%+ gross margin)")
        }

        // Valuation flags
        val pegRatio = if (valuationMetrics?.peRatio != null && growthMetrics.earningsGrowthRate != null) {
            calculatePEGRatio(valuationMetrics.peRatio, growthMetrics.earningsGrowthRate)
        } else null

        if (pegRatio != null && pegRatio <= BigDecimal("1.5")) {
            flags.add("💵 Reasonable valuation (PEG ≤ 1.5)")
        }

        // Warning flags
        if ((growthMetrics.revenueGrowthRate ?: BigDecimal.ZERO) < BigDecimal.ZERO) {
            flags.add("⚠️ Declining revenue")
        }
        if ((growthMetrics.earningsGrowthRate ?: BigDecimal.ZERO) < BigDecimal.ZERO) {
            flags.add("⚠️ Declining earnings")
        }
        if (growthMetrics.grossMarginTrend == "DECLINING") {
            flags.add("⚠️ Declining margins")
        }
        if (pegRatio != null && pegRatio > BigDecimal("3.0")) {
            flags.add("⚠️ High valuation (PEG > 3.0)")
        }

        // Overall assessment
        if (overallScore >= 80) {
            flags.add("🏆 Top growth candidate")
        }

        return flags
    }
}
