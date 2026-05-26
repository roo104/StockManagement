package jp.stocks.model.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "news_item",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["stock_watchlist_id", "article_url"]),
    ],
)
data class NewsItemEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "stock_watchlist_id", nullable = false)
    val stockWatchlistId: Long,

    @Column(name = "source_url_id", nullable = false)
    val sourceUrlId: Long,

    @Column(name = "article_url", nullable = false, length = 500)
    val articleUrl: String,

    @Column(nullable = false, length = 1024)
    val headline: String,

    @Column(columnDefinition = "TEXT")
    val summary: String? = null,

    @Column
    val publishedAt: LocalDateTime? = null,

    @Column(nullable = false)
    val scrapedAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
)
