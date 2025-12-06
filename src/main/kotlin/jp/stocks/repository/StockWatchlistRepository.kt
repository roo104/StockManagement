package jp.stocks.repository

import jp.stocks.model.entity.StockWatchlistEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface StockWatchlistRepository : JpaRepository<StockWatchlistEntity, Long> {
    fun findBySymbol(symbol: String): StockWatchlistEntity?
    fun findByActive(active: Boolean): List<StockWatchlistEntity>

    /**
     * Find stocks that need to be updated based on fetch frequency
     */
    @Query("""
        SELECT s FROM StockWatchlistEntity s
        WHERE s.active = true
        AND (s.lastFetchedAt IS NULL
             OR s.lastFetchedAt < :threshold)
    """)
    fun findStocksNeedingUpdate(threshold: LocalDateTime): List<StockWatchlistEntity>
}
