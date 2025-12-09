package jp.stocks.controller

import jp.stocks.model.dto.IpoCalendar
import jp.stocks.service.IpoCalendarService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.YearMonth
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping("/api/ipo-calendar")
class IpoCalendarController(
    private val ipoCalendarService: IpoCalendarService
) {
    private val logger = LoggerFactory.getLogger(IpoCalendarController::class.java)

    /**
     * Get current IPO calendar
     * GET /api/ipo-calendar
     */
    @GetMapping
    suspend fun getIpoCalendar(): ResponseEntity<IpoCalendar> {
        logger.info("Fetching current IPO calendar")

        return try {
            val calendar = ipoCalendarService.fetchIpoCalendar()
            if (calendar != null) {
                ResponseEntity.ok(calendar)
            } else {
                ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build()
            }
        } catch (e: Exception) {
            logger.error("Error fetching IPO calendar: ${e.message}", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    /**
     * Get IPO calendar for a specific month
     * GET /api/ipo-calendar/month/{yearMonth}
     * Example: /api/ipo-calendar/month/2025-01
     */
    @GetMapping("/month/{yearMonth}")
    suspend fun getIpoCalendarForMonth(
        @PathVariable yearMonth: String
    ): ResponseEntity<IpoCalendar> {
        logger.info("Fetching IPO calendar for month: $yearMonth")

        return try {
            val ym = YearMonth.parse(yearMonth, DateTimeFormatter.ofPattern("yyyy-MM"))
            val calendar = ipoCalendarService.fetchIpoCalendarForMonth(ym)

            if (calendar != null) {
                ResponseEntity.ok(calendar)
            } else {
                ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build()
            }
        } catch (e: Exception) {
            logger.error("Error fetching IPO calendar for month $yearMonth: ${e.message}", e)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).build()
        }
    }
}
