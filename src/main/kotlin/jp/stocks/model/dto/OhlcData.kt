package jp.stocks.model.dto

import java.time.LocalDate

data class OhlcData(
    val date: LocalDate,
    val open: Double,
    val high: Double,
    val low: Double,
    val close: Double,
    val volume: Long
)

data class YahooFinanceResponse(
    val chart: Chart
)

data class Chart(
    val result: List<Result>?
)

data class Result(
    val meta: Meta,
    val timestamp: List<Long>,
    val indicators: Indicators
)

data class Meta(
    val symbol: String
)

data class Indicators(
    val quote: List<Quote>
)

data class Quote(
    val open: List<Double?>,
    val high: List<Double?>,
    val low: List<Double?>,
    val close: List<Double?>,
    val volume: List<Long?>
)
