package jp.stocks.model.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "stock_news_url",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["stock_watchlist_id", "url"]),
    ],
)
data class StockNewsUrlEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "stock_watchlist_id", nullable = false)
    val stockWatchlistId: Long,

    @Column(nullable = false, length = 500)
    val url: String,

    @Column(nullable = false)
    val active: Boolean = true,

    @Column
    val lastScrapedAt: LocalDateTime? = null,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now(),
)
