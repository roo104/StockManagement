package jp.stocks.config

import jp.stocks.service.FinancialDataProvider
import jp.stocks.service.FinnhubService
import jp.stocks.service.YahooFinanceProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary

@Configuration
class FinancialDataProviderConfig {

    @Value("\${financial.data.provider:finnhub}")
    private lateinit var providerName: String

    @Bean
    @Primary
    fun financialDataProvider(
        finnhubService: FinnhubService,
        yahooFinanceProvider: YahooFinanceProvider
    ): FinancialDataProvider {
        return when (providerName.lowercase()) {
            "yahoo" -> {
                println("Using Yahoo Finance as financial data provider")
                yahooFinanceProvider
            }
            "finnhub" -> {
                println("Using Finnhub as financial data provider")
                finnhubService
            }
            else -> {
                println("Unknown provider '$providerName', defaulting to Finnhub")
                finnhubService
            }
        }
    }
}
