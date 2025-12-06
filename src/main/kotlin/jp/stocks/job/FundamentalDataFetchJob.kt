package jp.stocks.job

import jp.stocks.service.FundamentalDataFetchService
import jp.stocks.service.StockWatchlistService
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
class FundamentalDataFetchJob(
    private val stockWatchlistService: StockWatchlistService,
    private val yahooFinanceFundamentalService: FundamentalDataFetchService
) {

    private val logger = LoggerFactory.getLogger(FundamentalDataFetchJob::class.java)

    /**
     * Run daily at 2 AM to fetch fundamental data for all active stocks
     * Cron: second, minute, hour, day, month, day of week
     */
    @Scheduled(cron = "0 0 2 * * *")
    fun fetchDailyFundamentalData() {
        logger.info("Starting daily fundamental data fetch job")

        val stocks = stockWatchlistService.getStocksNeedingUpdate()
        logger.info("Found ${stocks.size} stocks needing update")

        var successCount = 0
        var failureCount = 0

        runBlocking {
            stocks.forEach { stock ->
                try {
                    logger.info("Fetching fundamental data for ${stock.symbol}")
                    val success = yahooFinanceFundamentalService.fetchAndSaveFundamentalData(stock.symbol)

                    if (success) {
                        stockWatchlistService.updateLastFetched(stock.symbol)
                        successCount++
                        logger.info("Successfully fetched data for ${stock.symbol}")
                    } else {
                        failureCount++
                        logger.warn("Failed to fetch data for ${stock.symbol}")
                    }

                    // Add delay between requests to avoid rate limiting (2 seconds)
                    delay(2000)
                } catch (e: Exception) {
                    failureCount++
                    logger.error("Error fetching data for ${stock.symbol}: ${e.message}", e)
                }
            }
        }

        logger.info("Daily fundamental data fetch job completed. Success: $successCount, Failures: $failureCount")
    }

    /**
     * Run on startup after 30 seconds delay (optional - useful for testing)
     * Uncomment to enable startup fetch
     */
    // @Scheduled(initialDelay = 30000, fixedDelay = Long.MAX_VALUE)
    fun fetchOnStartup() {
        logger.info("Running initial fundamental data fetch on startup")
        fetchDailyFundamentalData()
    }

    /**
     * Manual trigger for testing - runs every hour (optional)
     * Comment out or remove in production
     */
    // @Scheduled(cron = "0 0 * * * *")
    fun fetchHourly() {
        logger.info("Running hourly fundamental data fetch (test mode)")
        fetchDailyFundamentalData()
    }
}
