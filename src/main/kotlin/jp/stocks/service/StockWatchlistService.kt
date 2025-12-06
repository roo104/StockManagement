package jp.stocks.service

import jp.stocks.model.entity.StockWatchlistEntity
import jp.stocks.repository.StockWatchlistRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class StockWatchlistService(
    private val stockWatchlistRepository: StockWatchlistRepository
) {

    /**
     * Get all active stocks in watchlist
     */
    fun getActiveStocks(): List<StockWatchlistEntity> {
        return stockWatchlistRepository.findByActive(true)
    }

    /**
     * Get stocks that need to be updated based on their fetch frequency
     */
    fun getStocksNeedingUpdate(): List<StockWatchlistEntity> {
        val now = LocalDateTime.now()
        return stockWatchlistRepository.findAll().filter { stock ->
            stock.active && shouldFetchStock(stock, now)
        }
    }

    /**
     * Check if a stock should be fetched based on last fetch time and frequency
     */
    private fun shouldFetchStock(stock: StockWatchlistEntity, now: LocalDateTime): Boolean {
        if (stock.lastFetchedAt == null) {
            return true
        }
        val hoursSinceLastFetch = java.time.Duration.between(stock.lastFetchedAt, now).toHours()
        return hoursSinceLastFetch >= stock.fetchFrequencyHours
    }

    /**
     * Update last fetched timestamp for a stock
     */
    @Transactional
    fun updateLastFetched(symbol: String) {
        val stock = stockWatchlistRepository.findBySymbol(symbol)
        stock?.let {
            val updated = it.copy(
                lastFetchedAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now()
            )
            stockWatchlistRepository.save(updated)
        }
    }

    /**
     * Add a stock to watchlist
     */
    @Transactional
    fun addStock(symbol: String, name: String? = null, fetchFrequencyHours: Int = 24): StockWatchlistEntity {
        val existing = stockWatchlistRepository.findBySymbol(symbol)
        if (existing != null) {
            return existing
        }

        val stock = StockWatchlistEntity(
            symbol = symbol,
            name = name,
            active = true,
            fetchFrequencyHours = fetchFrequencyHours
        )
        return stockWatchlistRepository.save(stock)
    }

    /**
     * Remove a stock from watchlist
     */
    @Transactional
    fun removeStock(symbol: String): Boolean {
        val stock = stockWatchlistRepository.findBySymbol(symbol) ?: return false
        stockWatchlistRepository.delete(stock)
        return true
    }

    /**
     * Activate/deactivate a stock
     */
    @Transactional
    fun setStockActive(symbol: String, active: Boolean): Boolean {
        val stock = stockWatchlistRepository.findBySymbol(symbol) ?: return false
        val updated = stock.copy(
            active = active,
            updatedAt = LocalDateTime.now()
        )
        stockWatchlistRepository.save(updated)
        return true
    }

    /**
     * Get all stocks in watchlist
     */
    fun getAllStocks(): List<StockWatchlistEntity> {
        return stockWatchlistRepository.findAll()
    }

    /**
     * Get stock by symbol
     */
    fun getStock(symbol: String): StockWatchlistEntity? {
        return stockWatchlistRepository.findBySymbol(symbol)
    }
}
