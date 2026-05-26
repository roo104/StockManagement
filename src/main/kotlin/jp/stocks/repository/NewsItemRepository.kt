package jp.stocks.repository

import jp.stocks.model.entity.NewsItemEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface NewsItemRepository : JpaRepository<NewsItemEntity, Long> {

    fun existsByStockWatchlistIdAndArticleUrl(stockWatchlistId: Long, articleUrl: String): Boolean

    @Query(
        """
        SELECT n FROM NewsItemEntity n
        WHERE n.stockWatchlistId = :stockId
        ORDER BY
            CASE WHEN n.publishedAt IS NULL THEN 1 ELSE 0 END,
            n.publishedAt DESC,
            n.scrapedAt DESC
        """,
    )
    fun findForStock(@Param("stockId") stockId: Long, pageable: Pageable): Page<NewsItemEntity>

    @Query(
        """
        SELECT n FROM NewsItemEntity n
        ORDER BY
            CASE WHEN n.publishedAt IS NULL THEN 1 ELSE 0 END,
            n.publishedAt DESC,
            n.scrapedAt DESC
        """,
    )
    fun findFeed(pageable: Pageable): Page<NewsItemEntity>
}
