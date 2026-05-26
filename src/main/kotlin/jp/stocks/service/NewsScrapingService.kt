package jp.stocks.service

import jp.stocks.model.dto.ScrapedNewsItem
import jp.stocks.model.entity.NewsItemEntity
import jp.stocks.model.entity.StockNewsUrlEntity
import jp.stocks.repository.NewsItemRepository
import jp.stocks.repository.StockNewsUrlRepository
import jp.stocks.repository.StockWatchlistRepository
import kotlinx.coroutines.delay
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

data class ScrapeSummary(
    val urlsProcessed: Int,
    val successCount: Int,
    val failureCount: Int,
    val newItems: Int,
)

data class NewsFeedEntry(
    val item: NewsItemEntity,
    val symbol: String,
    val companyName: String?,
)

@Service
class NewsScrapingService(
    private val stockNewsUrlRepository: StockNewsUrlRepository,
    private val newsItemRepository: NewsItemRepository,
    private val stockWatchlistRepository: StockWatchlistRepository,
    private val newsScraperService: NewsScraperService,
) {

    private val logger = LoggerFactory.getLogger(NewsScrapingService::class.java)
    private val delayBetweenUrlsMs = 1000L

    suspend fun preview(url: String): List<ScrapedNewsItem> = newsScraperService.scrape(url)

    suspend fun scrapeUrl(newsUrlId: Long): Int {
        val newsUrl = stockNewsUrlRepository.findById(newsUrlId).orElse(null)
            ?: throw IllegalArgumentException("News URL $newsUrlId not found")
        return scrapeOne(newsUrl)
    }

    suspend fun scrapeAllActive(): ScrapeSummary {
        val urls = stockNewsUrlRepository.findAllByActiveTrue()
        logger.info("Scraping {} active news URLs", urls.size)

        var success = 0
        var failure = 0
        var totalNew = 0

        urls.forEachIndexed { index, newsUrl ->
            try {
                val added = scrapeOne(newsUrl)
                totalNew += added
                success++
            } catch (e: Exception) {
                failure++
                logger.error("Error scraping news URL id=${newsUrl.id} url=${newsUrl.url}: ${e.message}", e)
            }
            if (index < urls.size - 1) {
                delay(delayBetweenUrlsMs)
            }
        }

        return ScrapeSummary(
            urlsProcessed = urls.size,
            successCount = success,
            failureCount = failure,
            newItems = totalNew,
        )
    }

    fun listNewsForSymbol(symbol: String, pageable: Pageable): Page<NewsItemEntity>? {
        val stock = stockWatchlistRepository.findBySymbol(symbol) ?: return null
        val id = stock.id ?: return null
        return newsItemRepository.findForStock(id, pageable)
    }

    fun listFeed(symbol: String?, pageable: Pageable): Page<NewsFeedEntry>? {
        val page = if (symbol.isNullOrBlank()) {
            newsItemRepository.findFeed(pageable)
        } else {
            val stock = stockWatchlistRepository.findBySymbol(symbol) ?: return null
            val id = stock.id ?: return null
            newsItemRepository.findForStock(id, pageable)
        }
        if (page.isEmpty) return page.map { NewsFeedEntry(it, "", null) }

        val stockIds = page.content.map { it.stockWatchlistId }.toSet()
        val stocks = stockWatchlistRepository.findAllById(stockIds).associateBy { it.id }
        return page.map { item ->
            val stock = stocks[item.stockWatchlistId]
            NewsFeedEntry(
                item = item,
                symbol = stock?.symbol ?: "?",
                companyName = stock?.name,
            )
        }
    }

    private suspend fun scrapeOne(newsUrl: StockNewsUrlEntity): Int {
        logger.info("Scraping news URL id={} url={}", newsUrl.id, newsUrl.url)
        val scraped = newsScraperService.scrape(newsUrl.url)
        val saved = persistScrapedItems(newsUrl, scraped)
        logger.info("URL id={} scraped={} new={}", newsUrl.id, scraped.size, saved)
        return saved
    }

    @Transactional
    fun persistScrapedItems(newsUrl: StockNewsUrlEntity, scraped: List<ScrapedNewsItem>): Int {
        val urlId = newsUrl.id ?: return 0
        var newCount = 0
        for (item in scraped) {
            val articleUrl = item.articleUrl.take(500)
            if (newsItemRepository.existsByStockWatchlistIdAndArticleUrl(newsUrl.stockWatchlistId, articleUrl)) {
                continue
            }
            newsItemRepository.save(
                NewsItemEntity(
                    stockWatchlistId = newsUrl.stockWatchlistId,
                    sourceUrlId = urlId,
                    articleUrl = articleUrl,
                    headline = item.headline.take(1024),
                    summary = item.summary,
                    publishedAt = item.publishedAt,
                    scrapedAt = LocalDateTime.now(),
                ),
            )
            newCount++
        }
        val now = LocalDateTime.now()
        stockNewsUrlRepository.save(newsUrl.copy(lastScrapedAt = now, updatedAt = now))
        return newCount
    }
}
