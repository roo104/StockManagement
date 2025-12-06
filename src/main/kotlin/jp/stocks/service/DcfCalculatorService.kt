package jp.stocks.service

import jp.stocks.model.dto.DcfInput
import jp.stocks.model.dto.DcfResult
import jp.stocks.repository.BalanceSheetRepository
import jp.stocks.repository.CashFlowStatementRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import kotlin.math.pow

@Service
class DcfCalculatorService(
    private val cashFlowStatementRepository: CashFlowStatementRepository,
    private val balanceSheetRepository: BalanceSheetRepository
) {

    /**
     * Calculate Discounted Cash Flow (DCF) valuation
     */
    fun calculateDcf(input: DcfInput, currentPrice: BigDecimal): DcfResult {
        // Get the most recent free cash flow as base
        val baseFcf = input.freeCashFlows.lastOrNull() ?: BigDecimal.ZERO

        // Project future cash flows
        val projectedCashFlows = mutableListOf<BigDecimal>()
        var currentFcf = baseFcf

        for (year in 1..input.projectionYears) {
            currentFcf = currentFcf.multiply(BigDecimal.ONE + input.projectedGrowthRate)
            projectedCashFlows.add(currentFcf)
        }

        // Calculate present value of projected cash flows
        var presentValueOfCashFlows = BigDecimal.ZERO
        projectedCashFlows.forEachIndexed { index, cashFlow ->
            val year = index + 1
            val discountFactor = calculateDiscountFactor(input.discountRate, year)
            presentValueOfCashFlows = presentValueOfCashFlows.add(
                cashFlow.multiply(discountFactor)
            )
        }

        // Calculate terminal value using Gordon Growth Model
        val terminalFcf = projectedCashFlows.last()
            .multiply(BigDecimal.ONE + input.terminalGrowthRate)

        val terminalValue = terminalFcf.divide(
            input.discountRate.subtract(input.terminalGrowthRate),
            2,
            RoundingMode.HALF_UP
        )

        // Discount terminal value to present value
        val terminalDiscountFactor = calculateDiscountFactor(
            input.discountRate,
            input.projectionYears
        )
        val presentValueOfTerminalValue = terminalValue.multiply(terminalDiscountFactor)

        // Calculate enterprise value
        val enterpriseValue = presentValueOfCashFlows.add(presentValueOfTerminalValue)

        // Get balance sheet data to calculate equity value
        val balanceSheet = balanceSheetRepository.findTopBySymbolOrderByFiscalDateEndingDesc(input.symbol)
        val cash = balanceSheet?.cashAndCashEquivalents ?: BigDecimal.ZERO
        val debt = balanceSheet?.let { it.longTermDebt + it.shortTermDebt } ?: BigDecimal.ZERO

        // Equity Value = Enterprise Value + Cash - Debt
        val equityValue = enterpriseValue.add(cash).subtract(debt)

        // Fair value per share
        val fairValuePerShare = equityValue.divide(
            BigDecimal(input.sharesOutstanding),
            2,
            RoundingMode.HALF_UP
        )

        // Calculate upside/downside percentage
        val upside = if (currentPrice > BigDecimal.ZERO) {
            (fairValuePerShare.subtract(currentPrice))
                .divide(currentPrice, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal(100))
        } else {
            BigDecimal.ZERO
        }

        return DcfResult(
            symbol = input.symbol,
            projectedCashFlows = projectedCashFlows,
            terminalValue = terminalValue,
            presentValueOfCashFlows = presentValueOfCashFlows,
            presentValueOfTerminalValue = presentValueOfTerminalValue,
            enterpriseValue = enterpriseValue,
            equityValue = equityValue,
            fairValuePerShare = fairValuePerShare,
            currentPrice = currentPrice,
            upside = upside
        )
    }

    /**
     * Calculate discount factor: 1 / (1 + r)^n
     */
    private fun calculateDiscountFactor(discountRate: BigDecimal, years: Int): BigDecimal {
        val rate = discountRate.toDouble()
        val factor = 1.0 / (1.0 + rate).pow(years.toDouble())
        return BigDecimal.valueOf(factor).setScale(6, RoundingMode.HALF_UP)
    }

    /**
     * Get historical free cash flows for a symbol
     */
    fun getHistoricalFreeCashFlows(symbol: String, years: Int = 5): List<BigDecimal> {
        val cashFlowStatements = cashFlowStatementRepository
            .findBySymbolOrderByFiscalDateEndingDesc(symbol)
            .take(years)
            .reversed() // Oldest to newest

        return cashFlowStatements.map { it.freeCashFlow }
    }

    /**
     * Calculate average growth rate from historical cash flows
     */
    fun calculateHistoricalGrowthRate(cashFlows: List<BigDecimal>): BigDecimal {
        if (cashFlows.size < 2) {
            return BigDecimal.ZERO
        }

        val firstValue = cashFlows.first()
        val lastValue = cashFlows.last()

        if (firstValue <= BigDecimal.ZERO) {
            return BigDecimal.ZERO
        }

        val years = cashFlows.size - 1
        // CAGR = (Ending Value / Beginning Value)^(1/n) - 1
        val ratio = lastValue.divide(firstValue, 6, RoundingMode.HALF_UP).toDouble()
        val cagr = ratio.pow(1.0 / years) - 1.0

        return BigDecimal.valueOf(cagr).setScale(4, RoundingMode.HALF_UP)
    }

    /**
     * Calculate WACC (Weighted Average Cost of Capital) as discount rate
     * Simplified version - in practice this would require more data
     */
    fun estimateWacc(
        costOfEquity: BigDecimal,
        costOfDebt: BigDecimal,
        taxRate: BigDecimal,
        marketValueEquity: BigDecimal,
        marketValueDebt: BigDecimal
    ): BigDecimal {
        val totalValue = marketValueEquity.add(marketValueDebt)

        if (totalValue <= BigDecimal.ZERO) {
            return costOfEquity // Default to cost of equity
        }

        val equityWeight = marketValueEquity.divide(totalValue, 4, RoundingMode.HALF_UP)
        val debtWeight = marketValueDebt.divide(totalValue, 4, RoundingMode.HALF_UP)

        val afterTaxCostOfDebt = costOfDebt.multiply(BigDecimal.ONE.subtract(taxRate))

        return equityWeight.multiply(costOfEquity)
            .add(debtWeight.multiply(afterTaxCostOfDebt))
    }
}
