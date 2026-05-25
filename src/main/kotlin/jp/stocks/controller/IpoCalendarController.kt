package jp.stocks.controller

import jp.stocks.model.dto.IpoCalendar
import jp.stocks.service.IpoCalendarService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
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
     * Get current IPO calendar from the database (no upstream call).
     * GET /api/ipo-calendar
     */
    @GetMapping
    fun getIpoCalendar(): ResponseEntity<IpoCalendar> {
        logger.info("Reading current IPO calendar from database")
        val calendar = ipoCalendarService.getIpoCalendarForMonth(YearMonth.now())
        return ResponseEntity.ok(calendar)
    }

    /**
     * Get IPO calendar for a specific month from the database (no upstream call).
     * GET /api/ipo-calendar/month/{yearMonth}
     * Example: /api/ipo-calendar/month/2025-01
     */
    @GetMapping("/month/{yearMonth}")
    fun getIpoCalendarForMonth(
        @PathVariable yearMonth: String,
    ): ResponseEntity<IpoCalendar> {
        logger.info("Reading IPO calendar for month: $yearMonth")

        return try {
            val ym = YearMonth.parse(yearMonth, DateTimeFormatter.ofPattern("yyyy-MM"))
            val calendar = ipoCalendarService.getIpoCalendarForMonth(ym)
            ResponseEntity.ok(calendar)
        } catch (e: Exception) {
            logger.error("Error reading IPO calendar for month $yearMonth: ${e.message}", e)
            ResponseEntity.status(HttpStatus.BAD_REQUEST).build()
        }
    }

    /**
     * Refresh IPO calendar from Alpha Vantage and store in the database.
     * POST /api/ipo-calendar/refresh
     */
    @PostMapping("/refresh")
    suspend fun refreshIpoCalendar(): ResponseEntity<IpoCalendar> {
        logger.info("Refreshing IPO calendar from Alpha Vantage")

        return try {
            val calendar = ipoCalendarService.fetchIpoCalendar()
            if (calendar != null) {
                ResponseEntity.ok(calendar)
            } else {
                ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build()
            }
        } catch (e: Exception) {
            logger.error("Error refreshing IPO calendar: ${e.message}", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }
}
