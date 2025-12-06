package jp.stocks.controller

import jp.stocks.model.entity.StockWatchlistEntity
import jp.stocks.service.FundamentalDataFetchService
import jp.stocks.service.StockWatchlistService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/watchlist")
class StockWatchlistController(
    private val stockWatchlistService: StockWatchlistService,
    private val yahooFinanceFundamentalService: FundamentalDataFetchService
) {

    /**
     * Get all stocks in watchlist
     */
    @GetMapping
    fun getAllStocks(): ResponseEntity<List<StockWatchlistEntity>> {
        val stocks = stockWatchlistService.getAllStocks()
        return ResponseEntity.ok(stocks)
    }

    /**
     * Get all active stocks
     */
    @GetMapping("/active")
    fun getActiveStocks(): ResponseEntity<List<StockWatchlistEntity>> {
        val stocks = stockWatchlistService.getActiveStocks()
        return ResponseEntity.ok(stocks)
    }

    /**
     * Get stocks needing update
     */
    @GetMapping("/needs-update")
    fun getStocksNeedingUpdate(): ResponseEntity<List<StockWatchlistEntity>> {
        val stocks = stockWatchlistService.getStocksNeedingUpdate()
        return ResponseEntity.ok(stocks)
    }

    /**
     * Get stock by symbol
     */
    @GetMapping("/{symbol}")
    fun getStock(@PathVariable symbol: String): ResponseEntity<StockWatchlistEntity> {
        val stock = stockWatchlistService.getStock(symbol)
        return if (stock != null) {
            ResponseEntity.ok(stock)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Add stock to watchlist
     */
    @PostMapping
    fun addStock(
        @RequestBody request: AddStockRequest
    ): ResponseEntity<StockWatchlistEntity> {
        val stock = stockWatchlistService.addStock(
            symbol = request.symbol,
            name = request.name,
            fetchFrequencyHours = request.fetchFrequencyHours ?: 24
        )
        return ResponseEntity.ok(stock)
    }

    /**
     * Remove stock from watchlist
     */
    @DeleteMapping("/{symbol}")
    fun removeStock(@PathVariable symbol: String): ResponseEntity<Map<String, Any>> {
        val success = stockWatchlistService.removeStock(symbol)
        return if (success) {
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Stock $symbol removed from watchlist"
            ))
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Activate stock
     */
    @PutMapping("/{symbol}/activate")
    fun activateStock(@PathVariable symbol: String): ResponseEntity<Map<String, Any>> {
        val success = stockWatchlistService.setStockActive(symbol, true)
        return if (success) {
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Stock $symbol activated"
            ))
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Deactivate stock
     */
    @PutMapping("/{symbol}/deactivate")
    fun deactivateStock(@PathVariable symbol: String): ResponseEntity<Map<String, Any>> {
        val success = stockWatchlistService.setStockActive(symbol, false)
        return if (success) {
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Stock $symbol deactivated"
            ))
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Manually fetch data for a stock
     */
    @PostMapping("/{symbol}/fetch")
    suspend fun fetchStockData(@PathVariable symbol: String): ResponseEntity<Map<String, Any>> {
        return try {
            println("Controller: Starting fetch for $symbol")
            val success = yahooFinanceFundamentalService.fetchAndSaveFundamentalData(symbol)
            println("Controller: Fetch completed for $symbol, success=$success")

            if (success) {
                println("Controller: Returning success response for $symbol")
                ResponseEntity.ok(mapOf(
                    "success" to true,
                    "message" to "Data fetched successfully for $symbol"
                ))
            } else {
                println("Controller: Returning failure response for $symbol")
                ResponseEntity.ok(mapOf(
                    "success" to false,
                    "message" to "Failed to fetch data for $symbol"
                ))
            }
        } catch (e: Exception) {
            println("Controller: Exception while fetching $symbol: ${e.message}")
            e.printStackTrace()
            ResponseEntity.ok(mapOf(
                "success" to false,
                "message" to "Error fetching data: ${e.message}"
            ))
        }
    }
}

data class AddStockRequest(
    val symbol: String,
    val name: String? = null,
    val fetchFrequencyHours: Int? = 24
)
