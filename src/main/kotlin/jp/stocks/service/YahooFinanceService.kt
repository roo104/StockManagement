package jp.stocks.service

import jp.stocks.model.dto.OhlcData
import jp.stocks.model.dto.YahooFinanceResponse
import kotlinx.coroutines.reactor.awaitSingle
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import java.time.Instant
import java.time.ZoneId

@Service
class YahooFinanceService(
    private val webClient: WebClient = WebClient.builder()
        .baseUrl("https://query1.finance.yahoo.com")
        .defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        .defaultHeader("Accept", "application/json")
        .build()
) {

    suspend fun getOhlcData(symbol: String, period: String = "1mo", interval: String = "1d"): List<OhlcData> {
        val response = webClient.get()
            .uri { uriBuilder ->
                uriBuilder
                    .path("/v8/finance/chart/{symbol}")
                    .queryParam("interval", interval)
                    .queryParam("range", period)
                    .build(symbol)
            }
            .retrieve()
            .bodyToMono(YahooFinanceResponse::class.java)
            .awaitSingle()

        return parseYahooFinanceResponse(response)
    }

    private fun parseYahooFinanceResponse(response: YahooFinanceResponse): List<OhlcData> {
        val result = response.chart.result?.firstOrNull() ?: return emptyList()
        val timestamps = result.timestamp
        val quote = result.indicators.quote.firstOrNull() ?: return emptyList()

        return timestamps.indices.mapNotNull { i ->
            val open = quote.open.getOrNull(i)
            val high = quote.high.getOrNull(i)
            val low = quote.low.getOrNull(i)
            val close = quote.close.getOrNull(i)
            val volume = quote.volume.getOrNull(i)

            if (open != null && high != null && low != null && close != null && volume != null) {
                OhlcData(
                    date = Instant.ofEpochSecond(timestamps[i])
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate(),
                    open = open,
                    high = high,
                    low = low,
                    close = close,
                    volume = volume
                )
            } else {
                null
            }
        }
    }
}
