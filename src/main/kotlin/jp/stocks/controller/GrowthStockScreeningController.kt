package jp.stocks.controller

import jp.stocks.model.dto.GrowthScreeningRequest
import jp.stocks.model.dto.GrowthScreeningResult
import jp.stocks.model.dto.GrowthStockScore
import jp.stocks.service.GrowthStockScreeningService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/growth-screening")
class GrowthStockScreeningController(
    private val growthStockScreeningService: GrowthStockScreeningService
) {

    /**
     * Screen all stocks in watchlist for growth potential
     * GET /api/growth-screening
     */
    @GetMapping
    fun screenAllStocks(
        @RequestParam(required = false) minScore: Int?,
        @RequestParam(required = false) minRevenueGrowth: Double?,
        @RequestParam(required = false) minEarningsGrowth: Double?,
        @RequestParam(required = false) sectors: List<String>?,
        @RequestParam(required = false) maxPeRatio: Double?
    ): ResponseEntity<GrowthScreeningResult> {
        val request = GrowthScreeningRequest(
            symbols = null, // Screen all active stocks
            minScore = minScore,
            minRevenueGrowth = minRevenueGrowth?.toBigDecimal(),
            minEarningsGrowth = minEarningsGrowth?.toBigDecimal(),
            sectors = sectors,
            maxPeRatio = maxPeRatio?.toBigDecimal()
        )

        val result = growthStockScreeningService.screenGrowthStocks(request)
        return ResponseEntity.ok(result)
    }

    /**
     * Screen specific stocks for growth potential
     * POST /api/growth-screening
     */
    @PostMapping
    fun screenSpecificStocks(
        @RequestBody request: GrowthScreeningRequest
    ): ResponseEntity<GrowthScreeningResult> {
        val result = growthStockScreeningService.screenGrowthStocks(request)
        return ResponseEntity.ok(result)
    }

    /**
     * Get detailed growth score for a single stock
     * GET /api/growth-screening/{symbol}
     */
    @GetMapping("/{symbol}")
    fun getGrowthScore(
        @PathVariable symbol: String
    ): ResponseEntity<GrowthStockScore> {
        val score = growthStockScreeningService.calculateGrowthScore(symbol)
        return if (score != null) {
            ResponseEntity.ok(score)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Get top N growth stocks
     * GET /api/growth-screening/top?limit=10
     */
    @GetMapping("/top")
    fun getTopGrowthStocks(
        @RequestParam(defaultValue = "10") limit: Int,
        @RequestParam(required = false) minScore: Int?
    ): ResponseEntity<List<GrowthStockScore>> {
        val request = GrowthScreeningRequest(
            minScore = minScore ?: 60 // Default: only strong growth and above
        )

        val result = growthStockScreeningService.screenGrowthStocks(request)
        val topStocks = result.topGrowthStocks.take(limit)

        return ResponseEntity.ok(topStocks)
    }

    /**
     * Get high growth stocks (score >= 80)
     * GET /api/growth-screening/high-growth
     */
    @GetMapping("/high-growth")
    fun getHighGrowthStocks(): ResponseEntity<List<GrowthStockScore>> {
        val request = GrowthScreeningRequest(minScore = 80)
        val result = growthStockScreeningService.screenGrowthStocks(request)
        return ResponseEntity.ok(result.topGrowthStocks)
    }
}
