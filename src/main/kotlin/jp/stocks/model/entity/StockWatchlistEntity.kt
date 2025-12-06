package jp.stocks.model.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "stock_watchlist")
data class StockWatchlistEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, unique = true)
    val symbol: String,

    @Column
    val name: String? = null,

    @Column(nullable = false)
    val active: Boolean = true,

    @Column
    val lastFetchedAt: LocalDateTime? = null,

    @Column(nullable = false)
    val fetchFrequencyHours: Int = 24,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
