package jp.stocks.repository

import jp.stocks.model.entity.StockNewsUrlEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StockNewsUrlRepository : JpaRepository<StockNewsUrlEntity, Long> {
    fun findByStockWatchlistId(stockWatchlistId: Long): List<StockNewsUrlEntity>
    fun findAllByActiveTrue(): List<StockNewsUrlEntity>
    fun findByStockWatchlistIdAndUrl(stockWatchlistId: Long, url: String): StockNewsUrlEntity?
}
