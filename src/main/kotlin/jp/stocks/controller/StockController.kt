package jp.stocks.controller

import jp.stocks.model.dto.OhlcData
import jp.stocks.service.YahooFinanceService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/stocks")
class StockController(
    private val yahooFinanceService: YahooFinanceService
) {

    @GetMapping("/{symbol}/ohlc")
    suspend fun getOhlcData(
        @PathVariable symbol: String,
        @RequestParam(defaultValue = "1mo") period: String,
        @RequestParam(defaultValue = "1d") interval: String
    ): List<OhlcData> {
        return yahooFinanceService.getOhlcData(symbol, period, interval)
    }
}
