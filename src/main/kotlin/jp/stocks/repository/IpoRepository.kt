package jp.stocks.repository

import jp.stocks.model.entity.IpoEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface IpoRepository : JpaRepository<IpoEntity, Long> {
    /**
     * Find IPO by symbol and exchange
     */
    fun findBySymbolAndExchange(symbol: String, exchange: String?): IpoEntity?

    /**
     * Find all IPOs for a specific month
     */
    @Query("""
        SELECT i FROM IpoEntity i
        WHERE YEAR(i.ipoDate) = :year
        AND MONTH(i.ipoDate) = :month
        ORDER BY i.ipoDate ASC
    """)
    fun findByYearAndMonth(@Param("year") year: Int, @Param("month") month: Int): List<IpoEntity>

    /**
     * Find all IPOs within a date range
     */
    fun findByIpoDateBetweenOrderByIpoDateAsc(startDate: LocalDate, endDate: LocalDate): List<IpoEntity>
}
