package jp.stocks.service

import jp.stocks.model.dto.IpoCalendar
import jp.stocks.model.dto.IpoCalendarEntry
import jp.stocks.model.entity.IpoEntity
import jp.stocks.repository.IpoRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.YearMonth
import java.time.format.DateTimeFormatter

@Service
class IpoCalendarService(
    @Value("\${alphavantage.api.key}") private val apiKey: String,
    private val webClientBuilder: WebClient.Builder,
    private val ipoRepository: IpoRepository
) {
    private val logger = LoggerFactory.getLogger(IpoCalendarService::class.java)
    private val baseUrl = "https://www.alphavantage.co/query"
    private val webClient = webClientBuilder.baseUrl(baseUrl).build()

    /**
     * Fetch IPO calendar from Alpha Vantage API and store in database
     * Returns upcoming and recent IPOs
     */
    @Transactional
    suspend fun fetchIpoCalendar(): IpoCalendar? {
        return try {
            logger.info("Fetching IPO calendar from Alpha Vantage")

            val response = webClient.get()
                .uri { uriBuilder ->
                    uriBuilder
                        .queryParam("function", "IPO_CALENDAR")
                        .queryParam("apikey", apiKey)
                        .build()
                }
                .retrieve()
                .awaitBody<String>()

            val calendar = parseIpoCalendar(response)

            // Store IPOs in database
            if (calendar != null) {
                storeIposInDatabase(calendar.ipos)
            }

            calendar
        } catch (e: Exception) {
            logger.error("Error fetching IPO calendar from Alpha Vantage: ${e.message}", e)
            null
        }
    }

    /**
     * Fetch IPO calendar for a specific month
     * First tries to refresh from API, then queries database for all IPOs in that month
     */
    suspend fun fetchIpoCalendarForMonth(yearMonth: YearMonth): IpoCalendar {
        // Try to fetch latest data from API (will be stored in DB)
        try {
            fetchIpoCalendar()
        } catch (e: Exception) {
            logger.warn("Could not refresh IPO data from API: ${e.message}")
        }

        // Query database for IPOs in the specified month
        val monthStr = yearMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"))
        val ipos = ipoRepository.findByYearAndMonth(yearMonth.year, yearMonth.monthValue)

        logger.info("Found ${ipos.size} IPOs in database for $monthStr")

        return IpoCalendar(
            month = monthStr,
            ipos = ipos.map { it.toDto() }
        )
    }

    /**
     * Parse CSV response from Alpha Vantage IPO Calendar API
     * CSV format: symbol,name,ipoDate,priceRangeLow,priceRangeHigh,currency,exchange
     */
    private fun parseIpoCalendar(csvResponse: String): IpoCalendar? {
        return try {
            val lines = csvResponse.lines().filter { it.isNotBlank() }
            if (lines.isEmpty()) {
                logger.warn("Empty IPO calendar response")
                return null
            }

            // Check for API error messages
            if (lines.first().contains("Error Message") || lines.first().contains("Note")) {
                logger.warn("API error or rate limit: ${lines.first()}")
                return null
            }

            // First line is header
            val entries = mutableListOf<IpoCalendarEntry>()

            for (i in 1 until lines.size) {
                try {
                    val fields = parseCSVLine(lines[i])
                    if (fields.size >= 7) {
                        val entry = IpoCalendarEntry(
                            symbol = fields[0].trim(),
                            name = fields[1].trim(),
                            ipoDate = LocalDate.parse(fields[2].trim()),
                            priceRangeLow = fields[3].trim().toBigDecimalOrNull(),
                            priceRangeHigh = fields[4].trim().toBigDecimalOrNull(),
                            currency = fields[5].trim(),
                            exchange = fields[6].trim().ifBlank { null }
                        )
                        entries.add(entry)
                    }
                } catch (e: Exception) {
                    logger.warn("Error parsing IPO entry line ${i + 1}: ${e.message}")
                    // Continue processing other entries
                }
            }

            // Get current month as default
            val currentMonth = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"))

            IpoCalendar(
                month = currentMonth,
                ipos = entries.sortedBy { it.ipoDate }
            )
        } catch (e: Exception) {
            logger.error("Error parsing IPO calendar CSV: ${e.message}", e)
            null
        }
    }

    /**
     * Parse CSV line handling quoted fields
     */
    private fun parseCSVLine(line: String): List<String> {
        val result = mutableListOf<String>()
        val current = StringBuilder()
        var inQuotes = false

        for (char in line) {
            when {
                char == '"' -> inQuotes = !inQuotes
                char == ',' && !inQuotes -> {
                    result.add(current.toString())
                    current.clear()
                }
                else -> current.append(char)
            }
        }
        result.add(current.toString())

        return result
    }

    /**
     * Store or update IPOs in database
     */
    @Transactional
    private fun storeIposInDatabase(ipos: List<IpoCalendarEntry>) {
        logger.info("Storing ${ipos.size} IPOs in database")

        ipos.forEach { ipo ->
            try {
                val existing = ipoRepository.findBySymbolAndExchange(ipo.symbol, ipo.exchange)

                if (existing != null) {
                    // Update existing IPO
                    val updated = existing.copy(
                        name = ipo.name,
                        ipoDate = ipo.ipoDate,
                        priceRangeLow = ipo.priceRangeLow,
                        priceRangeHigh = ipo.priceRangeHigh,
                        currency = ipo.currency,
                        updatedAt = LocalDateTime.now()
                    )
                    ipoRepository.save(updated)
                    logger.debug("Updated IPO: ${ipo.symbol}")
                } else {
                    // Insert new IPO
                    val entity = IpoEntity(
                        symbol = ipo.symbol,
                        name = ipo.name,
                        ipoDate = ipo.ipoDate,
                        priceRangeLow = ipo.priceRangeLow,
                        priceRangeHigh = ipo.priceRangeHigh,
                        currency = ipo.currency,
                        exchange = ipo.exchange
                    )
                    ipoRepository.save(entity)
                    logger.debug("Inserted new IPO: ${ipo.symbol}")
                }
            } catch (e: Exception) {
                logger.error("Error storing IPO ${ipo.symbol}: ${e.message}")
            }
        }

        logger.info("Finished storing IPOs in database")
    }

    /**
     * Convert IpoEntity to DTO
     */
    private fun IpoEntity.toDto(): IpoCalendarEntry {
        return IpoCalendarEntry(
            symbol = this.symbol,
            name = this.name,
            ipoDate = this.ipoDate,
            priceRangeLow = this.priceRangeLow,
            priceRangeHigh = this.priceRangeHigh,
            currency = this.currency,
            exchange = this.exchange
        )
    }
}
