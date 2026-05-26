package jp.stocks.model.dto

import java.time.LocalDateTime

data class ScrapedNewsItem(
    val articleUrl: String,
    val headline: String,
    val summary: String? = null,
    val publishedAt: LocalDateTime? = null,
)
