package jp.stocks.model.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(
    name = "ipo",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["symbol", "exchange"])
    ]
)
data class IpoEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    val symbol: String,

    @Column(nullable = false)
    val name: String,

    @Column(nullable = false)
    val ipoDate: LocalDate,

    @Column(precision = 19, scale = 4)
    val priceRangeLow: BigDecimal? = null,

    @Column(precision = 19, scale = 4)
    val priceRangeHigh: BigDecimal? = null,

    @Column(nullable = false)
    val currency: String,

    @Column
    val exchange: String? = null,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
