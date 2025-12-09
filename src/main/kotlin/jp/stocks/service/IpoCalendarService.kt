package jp.stocks.service

import jp.stocks.model.dto.IpoCalendar
import jp.stocks.model.dto.IpoCalendarEntry
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter

@Service
class IpoCalendarService(
    @Value("\${alphavantage.api.key}") private val apiKey: String,
    private val webClientBuilder: WebClient.Builder
) {
    private val logger = LoggerFactory.getLogger(IpoCalendarService::class.java)
    private val baseUrl = "https://www.alphavantage.co/query"
    private val webClient = webClientBuilder.baseUrl(baseUrl).build()

    /**
     * Fetch IPO calendar from Alpha Vantage API
     * Returns upcoming and recent IPOs
     */
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

            parseIpoCalendar(response)
        } catch (e: Exception) {
            logger.error("Error fetching IPO calendar from Alpha Vantage: ${e.message}", e)
            null
        }
    }

    /**
     * Fetch IPO calendar for a specific month
     */
    suspend fun fetchIpoCalendarForMonth(yearMonth: YearMonth): IpoCalendar? {
        val calendar = fetchIpoCalendar() ?: return null

        // Filter IPOs for the specified month
        val monthStr = yearMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"))
        val filteredIpos = calendar.ipos.filter { ipo ->
            val ipoYearMonth = YearMonth.from(ipo.ipoDate)
            ipoYearMonth == yearMonth
        }

        return IpoCalendar(
            month = monthStr,
            ipos = filteredIpos
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
}
