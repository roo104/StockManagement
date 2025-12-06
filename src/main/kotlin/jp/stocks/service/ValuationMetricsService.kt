package jp.stocks.service

import jp.stocks.model.dto.ValuationMetrics
import jp.stocks.repository.BalanceSheetRepository
import jp.stocks.repository.CashFlowStatementRepository
import jp.stocks.repository.CompanyOverviewRepository
import jp.stocks.repository.IncomeStatementRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode

@Service
class ValuationMetricsService(
    private val incomeStatementRepository: IncomeStatementRepository,
    private val balanceSheetRepository: BalanceSheetRepository,
    private val cashFlowStatementRepository: CashFlowStatementRepository,
    private val companyOverviewRepository: CompanyOverviewRepository
) {

    /**
     * Calculate comprehensive valuation metrics for a stock
     */
    fun calculateValuationMetrics(
        symbol: String,
        currentPrice: BigDecimal
    ): ValuationMetrics? {
        val incomeStatement = incomeStatementRepository.findTopBySymbolOrderByFiscalDateEndingDesc(symbol)
        val balanceSheet = balanceSheetRepository.findTopBySymbolOrderByFiscalDateEndingDesc(symbol)
        val cashFlowStatement = cashFlowStatementRepository.findTopBySymbolOrderByFiscalDateEndingDesc(symbol)
        val companyOverview = companyOverviewRepository.findBySymbol(symbol)

        if (incomeStatement == null || balanceSheet == null || companyOverview == null) {
            return null
        }

        val marketCap = companyOverview.marketCap
        val sharesOutstanding = companyOverview.sharesOutstanding

        // Calculate Enterprise Value
        val totalDebt = balanceSheet.longTermDebt + balanceSheet.shortTermDebt
        val enterpriseValue = marketCap + totalDebt - balanceSheet.cashAndCashEquivalents

        return ValuationMetrics(
            symbol = symbol,
            currentPrice = currentPrice,
            marketCap = marketCap,
            enterpriseValue = enterpriseValue,
            peRatio = calculatePERatio(currentPrice, incomeStatement.eps),
            pbRatio = calculatePBRatio(currentPrice, balanceSheet.totalShareholderEquity, sharesOutstanding),
            psRatio = calculatePSRatio(marketCap, incomeStatement.totalRevenue),
            pegRatio = null, // Requires growth rate data
            evToEbitda = calculateEVToEBITDA(enterpriseValue, incomeStatement.ebitda),
            evToSales = calculateEVToSales(enterpriseValue, incomeStatement.totalRevenue),
            priceToFreeCashFlow = cashFlowStatement?.let {
                calculatePriceToFCF(marketCap, it.freeCashFlow)
            },
            debtToEquity = calculateDebtToEquity(totalDebt, balanceSheet.totalShareholderEquity),
            currentRatio = calculateCurrentRatio(balanceSheet.totalCurrentAssets, balanceSheet.totalCurrentLiabilities),
            quickRatio = calculateQuickRatio(
                balanceSheet.totalCurrentAssets,
                balanceSheet.inventory ?: BigDecimal.ZERO,
                balanceSheet.totalCurrentLiabilities
            ),
            returnOnEquity = calculateROE(incomeStatement.netIncome, balanceSheet.totalShareholderEquity),
            returnOnAssets = calculateROA(incomeStatement.netIncome, balanceSheet.totalAssets),
            profitMargin = calculateProfitMargin(incomeStatement.netIncome, incomeStatement.totalRevenue),
            operatingMargin = calculateOperatingMargin(incomeStatement.operatingIncome, incomeStatement.totalRevenue),
            dividendYield = cashFlowStatement?.dividendPayout?.let {
                calculateDividendYield(it, sharesOutstanding, currentPrice)
            },
            payoutRatio = cashFlowStatement?.dividendPayout?.let {
                calculatePayoutRatio(it, incomeStatement.netIncome)
            }
        )
    }

    // Individual metric calculations

    private fun calculatePERatio(price: BigDecimal, eps: BigDecimal): BigDecimal? {
        return if (eps > BigDecimal.ZERO) {
            price.divide(eps, 2, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculatePBRatio(price: BigDecimal, totalEquity: BigDecimal, sharesOutstanding: Long): BigDecimal? {
        val bookValuePerShare = totalEquity.divide(BigDecimal(sharesOutstanding), 4, RoundingMode.HALF_UP)
        return if (bookValuePerShare > BigDecimal.ZERO) {
            price.divide(bookValuePerShare, 2, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculatePSRatio(marketCap: BigDecimal, totalRevenue: BigDecimal): BigDecimal? {
        return if (totalRevenue > BigDecimal.ZERO) {
            marketCap.divide(totalRevenue, 2, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculateEVToEBITDA(enterpriseValue: BigDecimal, ebitda: BigDecimal): BigDecimal? {
        return if (ebitda > BigDecimal.ZERO) {
            enterpriseValue.divide(ebitda, 2, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculateEVToSales(enterpriseValue: BigDecimal, totalRevenue: BigDecimal): BigDecimal? {
        return if (totalRevenue > BigDecimal.ZERO) {
            enterpriseValue.divide(totalRevenue, 2, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculatePriceToFCF(marketCap: BigDecimal, freeCashFlow: BigDecimal): BigDecimal? {
        return if (freeCashFlow > BigDecimal.ZERO) {
            marketCap.divide(freeCashFlow, 2, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculateDebtToEquity(totalDebt: BigDecimal, totalEquity: BigDecimal): BigDecimal? {
        return if (totalEquity > BigDecimal.ZERO) {
            totalDebt.divide(totalEquity, 2, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculateCurrentRatio(currentAssets: BigDecimal, currentLiabilities: BigDecimal): BigDecimal? {
        return if (currentLiabilities > BigDecimal.ZERO) {
            currentAssets.divide(currentLiabilities, 2, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculateQuickRatio(
        currentAssets: BigDecimal,
        inventory: BigDecimal,
        currentLiabilities: BigDecimal
    ): BigDecimal? {
        return if (currentLiabilities > BigDecimal.ZERO) {
            (currentAssets - inventory).divide(currentLiabilities, 2, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculateROE(netIncome: BigDecimal, totalEquity: BigDecimal): BigDecimal? {
        return if (totalEquity > BigDecimal.ZERO) {
            netIncome.divide(totalEquity, 4, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculateROA(netIncome: BigDecimal, totalAssets: BigDecimal): BigDecimal? {
        return if (totalAssets > BigDecimal.ZERO) {
            netIncome.divide(totalAssets, 4, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculateProfitMargin(netIncome: BigDecimal, totalRevenue: BigDecimal): BigDecimal? {
        return if (totalRevenue > BigDecimal.ZERO) {
            netIncome.divide(totalRevenue, 4, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculateOperatingMargin(operatingIncome: BigDecimal, totalRevenue: BigDecimal): BigDecimal? {
        return if (totalRevenue > BigDecimal.ZERO) {
            operatingIncome.divide(totalRevenue, 4, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculateDividendYield(
        dividendPayout: BigDecimal,
        sharesOutstanding: Long,
        currentPrice: BigDecimal
    ): BigDecimal? {
        val dividendPerShare = dividendPayout.divide(BigDecimal(sharesOutstanding), 4, RoundingMode.HALF_UP)
        return if (currentPrice > BigDecimal.ZERO) {
            dividendPerShare.divide(currentPrice, 4, RoundingMode.HALF_UP)
        } else null
    }

    private fun calculatePayoutRatio(dividendPayout: BigDecimal, netIncome: BigDecimal): BigDecimal? {
        return if (netIncome > BigDecimal.ZERO) {
            dividendPayout.divide(netIncome, 4, RoundingMode.HALF_UP)
        } else null
    }
}
