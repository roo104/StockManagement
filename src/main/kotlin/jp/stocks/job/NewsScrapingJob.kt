package jp.stocks.job

import jp.stocks.service.NewsScrapingService
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
class NewsScrapingJob(
    private val newsScrapingService: NewsScrapingService,
) {

    private val logger = LoggerFactory.getLogger(NewsScrapingJob::class.java)

    @Scheduled(cron = "0 0 * * * *")
    fun scrapeHourly() {
        logger.info("Starting hourly news scraping job")
        try {
            val summary = runBlocking { newsScrapingService.scrapeAllActive() }
            logger.info(
                "Hourly news scraping completed. URLs: {}, success: {}, failures: {}, new items: {}",
                summary.urlsProcessed, summary.successCount, summary.failureCount, summary.newItems,
            )
        } catch (e: Exception) {
            logger.error("Hourly news scraping job failed: ${e.message}", e)
        }
    }
}
