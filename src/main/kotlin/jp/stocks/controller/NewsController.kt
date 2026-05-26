package jp.stocks.controller

import jp.stocks.model.dto.ScrapedNewsItem
import jp.stocks.model.entity.NewsItemEntity
import jp.stocks.model.entity.StockNewsUrlEntity
import jp.stocks.repository.StockNewsUrlRepository
import jp.stocks.service.NewsScrapingService
import jp.stocks.service.StockWatchlistService
import org.slf4j.LoggerFactory
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/api")
class NewsController(
    private val stockWatchlistService: StockWatchlistService,
    private val stockNewsUrlRepository: StockNewsUrlRepository,
    private val newsScrapingService: NewsScrapingService,
) {

    private val logger = LoggerFactory.getLogger(NewsController::class.java)

    @GetMapping("/watchlist/{symbol}/news-urls")
    fun listNewsUrls(@PathVariable symbol: String): ResponseEntity<List<StockNewsUrlEntity>> {
        val stock = stockWatchlistService.getStock(symbol) ?: return ResponseEntity.notFound().build()
        val stockId = stock.id ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(stockNewsUrlRepository.findByStockWatchlistId(stockId))
    }

    @PostMapping("/watchlist/{symbol}/news-urls")
    @Transactional
    fun addNewsUrl(
        @PathVariable symbol: String,
        @RequestBody request: AddNewsUrlRequest,
    ): ResponseEntity<StockNewsUrlEntity> {
        val stock = stockWatchlistService.getStock(symbol) ?: return ResponseEntity.notFound().build()
        val stockId = stock.id ?: return ResponseEntity.notFound().build()
        val url = request.url.trim()
        if (url.isBlank()) return ResponseEntity.badRequest().build()

        val existing = stockNewsUrlRepository.findByStockWatchlistIdAndUrl(stockId, url)
        if (existing != null) return ResponseEntity.ok(existing)

        val saved = stockNewsUrlRepository.save(
            StockNewsUrlEntity(
                stockWatchlistId = stockId,
                url = url,
                active = true,
            ),
        )
        return ResponseEntity.ok(saved)
    }

    @DeleteMapping("/watchlist/{symbol}/news-urls/{newsUrlId}")
    @Transactional
    fun deleteNewsUrl(
        @PathVariable symbol: String,
        @PathVariable newsUrlId: Long,
    ): ResponseEntity<Map<String, Any>> {
        val stock = stockWatchlistService.getStock(symbol) ?: return ResponseEntity.notFound().build()
        val stockId = stock.id ?: return ResponseEntity.notFound().build()
        val newsUrl = stockNewsUrlRepository.findById(newsUrlId).orElse(null)
            ?: return ResponseEntity.notFound().build()
        if (newsUrl.stockWatchlistId != stockId) return ResponseEntity.notFound().build()

        stockNewsUrlRepository.delete(newsUrl)
        return ResponseEntity.ok(mapOf("success" to true, "message" to "News URL $newsUrlId deleted"))
    }

    @PostMapping("/watchlist/{symbol}/news-urls/{newsUrlId}/scrape")
    suspend fun scrapeNewsUrl(
        @PathVariable symbol: String,
        @PathVariable newsUrlId: Long,
    ): ResponseEntity<Map<String, Any>> {
        val stock = stockWatchlistService.getStock(symbol) ?: return ResponseEntity.notFound().build()
        val stockId = stock.id ?: return ResponseEntity.notFound().build()
        val newsUrl = stockNewsUrlRepository.findById(newsUrlId).orElse(null)
            ?: return ResponseEntity.notFound().build()
        if (newsUrl.stockWatchlistId != stockId) return ResponseEntity.notFound().build()

        return try {
            val newItems = newsScrapingService.scrapeUrl(newsUrlId)
            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "newsUrlId" to newsUrlId,
                    "newItems" to newItems,
                ),
            )
        } catch (e: Exception) {
            logger.error("Manual scrape failed for newsUrlId=$newsUrlId: ${e.message}", e)
            ResponseEntity.ok(
                mapOf(
                    "success" to false,
                    "message" to (e.message ?: "scrape failed"),
                ),
            )
        }
    }

    @GetMapping("/watchlist/{symbol}/news")
    fun listNews(
        @PathVariable symbol: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): ResponseEntity<NewsPageResponse> {
        val pageable = PageRequest.of(page.coerceAtLeast(0), size.coerceIn(1, 100))
        val result = newsScrapingService.listNewsForSymbol(symbol, pageable) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(
            NewsPageResponse(
                items = result.content.map { it.toDto() },
                page = result.number,
                size = result.size,
                totalItems = result.totalElements,
                totalPages = result.totalPages,
            ),
        )
    }

    @PostMapping("/news/preview")
    suspend fun preview(@RequestBody request: PreviewRequest): ResponseEntity<List<ScrapedNewsItem>> {
        if (request.url.isBlank()) return ResponseEntity.badRequest().build()
        return ResponseEntity.ok(newsScrapingService.preview(request.url.trim()))
    }

    @GetMapping("/news")
    fun feed(
        @RequestParam(required = false) symbol: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): ResponseEntity<NewsFeedPageResponse> {
        val pageable = PageRequest.of(page.coerceAtLeast(0), size.coerceIn(1, 100))
        val result = newsScrapingService.listFeed(symbol?.takeIf { it.isNotBlank() }, pageable)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(
            NewsFeedPageResponse(
                items = result.content.map { entry ->
                    NewsFeedItemDto(
                        id = entry.item.id ?: 0,
                        symbol = entry.symbol,
                        companyName = entry.companyName,
                        sourceUrlId = entry.item.sourceUrlId,
                        articleUrl = entry.item.articleUrl,
                        headline = entry.item.headline,
                        summary = entry.item.summary,
                        publishedAt = entry.item.publishedAt,
                        scrapedAt = entry.item.scrapedAt,
                    )
                },
                page = result.number,
                size = result.size,
                totalItems = result.totalElements,
                totalPages = result.totalPages,
            ),
        )
    }
}

private fun NewsItemEntity.toDto() = NewsItemDto(
    id = this.id ?: 0,
    sourceUrlId = this.sourceUrlId,
    articleUrl = this.articleUrl,
    headline = this.headline,
    summary = this.summary,
    publishedAt = this.publishedAt,
    scrapedAt = this.scrapedAt,
)

data class AddNewsUrlRequest(
    val url: String,
)

data class PreviewRequest(
    val url: String,
)

data class NewsItemDto(
    val id: Long,
    val sourceUrlId: Long,
    val articleUrl: String,
    val headline: String,
    val summary: String?,
    val publishedAt: LocalDateTime?,
    val scrapedAt: LocalDateTime,
)

data class NewsPageResponse(
    val items: List<NewsItemDto>,
    val page: Int,
    val size: Int,
    val totalItems: Long,
    val totalPages: Int,
)

data class NewsFeedItemDto(
    val id: Long,
    val symbol: String,
    val companyName: String?,
    val sourceUrlId: Long,
    val articleUrl: String,
    val headline: String,
    val summary: String?,
    val publishedAt: LocalDateTime?,
    val scrapedAt: LocalDateTime,
)

data class NewsFeedPageResponse(
    val items: List<NewsFeedItemDto>,
    val page: Int,
    val size: Int,
    val totalItems: Long,
    val totalPages: Int,
)
