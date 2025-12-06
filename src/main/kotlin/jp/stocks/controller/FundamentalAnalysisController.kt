package jp.stocks.controller

import jp.stocks.model.dto.*
import jp.stocks.service.*
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.LocalDate

@RestController
@RequestMapping("/api/fundamental")
class FundamentalAnalysisController(
    private val fundamentalAnalysisService: FundamentalAnalysisService,
    private val valuationMetricsService: ValuationMetricsService,
    private val dcfCalculatorService: DcfCalculatorService,
    private val yahooFinanceFundamentalService: YahooFinanceFundamentalService
) {

    /**
     * Get complete financial statements for a specific date
     */
    @GetMapping("/{symbol}/statements")
    fun getFinancialStatements(
        @PathVariable symbol: String,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate
    ): ResponseEntity<FinancialStatements> {
        val statements = fundamentalAnalysisService.getFinancialStatements(symbol, date)
        return if (statements != null) {
            ResponseEntity.ok(statements)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Get latest financial statements
     */
    @GetMapping("/{symbol}/statements/latest")
    fun getLatestFinancialStatements(
        @PathVariable symbol: String
    ): ResponseEntity<FinancialStatements> {
        val statements = fundamentalAnalysisService.getLatestFinancialStatements(symbol)
        return if (statements != null) {
            ResponseEntity.ok(statements)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Get income statement history
     */
    @GetMapping("/{symbol}/income-statements")
    fun getIncomeStatements(
        @PathVariable symbol: String
    ): ResponseEntity<List<IncomeStatement>> {
        val statements = fundamentalAnalysisService.getIncomeStatements(symbol)
        return ResponseEntity.ok(statements)
    }

    /**
     * Get balance sheet history
     */
    @GetMapping("/{symbol}/balance-sheets")
    fun getBalanceSheets(
        @PathVariable symbol: String
    ): ResponseEntity<List<BalanceSheet>> {
        val statements = fundamentalAnalysisService.getBalanceSheets(symbol)
        return ResponseEntity.ok(statements)
    }

    /**
     * Get cash flow statement history
     */
    @GetMapping("/{symbol}/cash-flow-statements")
    fun getCashFlowStatements(
        @PathVariable symbol: String
    ): ResponseEntity<List<CashFlowStatement>> {
        val statements = fundamentalAnalysisService.getCashFlowStatements(symbol)
        return ResponseEntity.ok(statements)
    }

    /**
     * Get company overview
     */
    @GetMapping("/{symbol}/overview")
    fun getCompanyOverview(
        @PathVariable symbol: String
    ): ResponseEntity<CompanyOverview> {
        val overview = fundamentalAnalysisService.getCompanyOverview(symbol)
        return if (overview != null) {
            ResponseEntity.ok(overview)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Get valuation metrics
     */
    @GetMapping("/{symbol}/valuation")
    fun getValuationMetrics(
        @PathVariable symbol: String,
        @RequestParam currentPrice: BigDecimal
    ): ResponseEntity<ValuationMetrics> {
        val metrics = valuationMetricsService.calculateValuationMetrics(symbol, currentPrice)
        return if (metrics != null) {
            ResponseEntity.ok(metrics)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Calculate DCF valuation
     */
    @PostMapping("/{symbol}/dcf")
    fun calculateDcf(
        @PathVariable symbol: String,
        @RequestBody input: DcfInput,
        @RequestParam currentPrice: BigDecimal
    ): ResponseEntity<DcfResult> {
        val result = dcfCalculatorService.calculateDcf(input, currentPrice)
        return ResponseEntity.ok(result)
    }

    /**
     * Get historical free cash flows
     */
    @GetMapping("/{symbol}/free-cash-flows")
    fun getHistoricalFreeCashFlows(
        @PathVariable symbol: String,
        @RequestParam(defaultValue = "5") years: Int
    ): ResponseEntity<List<BigDecimal>> {
        val cashFlows = dcfCalculatorService.getHistoricalFreeCashFlows(symbol, years)
        return ResponseEntity.ok(cashFlows)
    }

    /**
     * Calculate historical growth rate
     */
    @GetMapping("/{symbol}/growth-rate")
    fun getHistoricalGrowthRate(
        @PathVariable symbol: String,
        @RequestParam(defaultValue = "5") years: Int
    ): ResponseEntity<Map<String, Any>> {
        val cashFlows = dcfCalculatorService.getHistoricalFreeCashFlows(symbol, years)
        val growthRate = dcfCalculatorService.calculateHistoricalGrowthRate(cashFlows)
        return ResponseEntity.ok(
            mapOf(
                "symbol" to symbol,
                "years" to years,
                "growthRate" to growthRate,
                "historicalCashFlows" to cashFlows
            )
        )
    }

    /**
     * Save income statement (admin endpoint)
     */
    @PostMapping("/{symbol}/income-statement")
    fun saveIncomeStatement(
        @PathVariable symbol: String,
        @RequestBody incomeStatement: IncomeStatement
    ): ResponseEntity<IncomeStatement> {
        val saved = fundamentalAnalysisService.saveIncomeStatement(incomeStatement)
        return ResponseEntity.ok(saved)
    }

    /**
     * Save balance sheet (admin endpoint)
     */
    @PostMapping("/{symbol}/balance-sheet")
    fun saveBalanceSheet(
        @PathVariable symbol: String,
        @RequestBody balanceSheet: BalanceSheet
    ): ResponseEntity<BalanceSheet> {
        val saved = fundamentalAnalysisService.saveBalanceSheet(balanceSheet)
        return ResponseEntity.ok(saved)
    }

    /**
     * Save cash flow statement (admin endpoint)
     */
    @PostMapping("/{symbol}/cash-flow-statement")
    fun saveCashFlowStatement(
        @PathVariable symbol: String,
        @RequestBody cashFlowStatement: CashFlowStatement
    ): ResponseEntity<CashFlowStatement> {
        val saved = fundamentalAnalysisService.saveCashFlowStatement(cashFlowStatement)
        return ResponseEntity.ok(saved)
    }

    /**
     * Save company overview (admin endpoint)
     */
    @PostMapping("/{symbol}/overview")
    fun saveCompanyOverview(
        @PathVariable symbol: String,
        @RequestBody companyOverview: CompanyOverview
    ): ResponseEntity<CompanyOverview> {
        val saved = fundamentalAnalysisService.saveCompanyOverview(companyOverview)
        return ResponseEntity.ok(saved)
    }

    /**
     * Fetch and save fundamental data from Yahoo Finance
     */
    @PostMapping("/{symbol}/fetch")
    suspend fun fetchFundamentalData(
        @PathVariable symbol: String
    ): ResponseEntity<Map<String, Any>> {
        val success = yahooFinanceFundamentalService.fetchAndSaveFundamentalData(symbol)
        return if (success) {
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Fundamental data fetched and saved successfully for $symbol"
            ))
        } else {
            ResponseEntity.status(500).body(mapOf(
                "success" to false,
                "message" to "Failed to fetch fundamental data for $symbol"
            ))
        }
    }

    /**
     * Fetch fundamental data from Yahoo Finance without saving
     */
    @GetMapping("/{symbol}/fetch-preview")
    suspend fun fetchFundamentalDataPreview(
        @PathVariable symbol: String
    ): ResponseEntity<YahooFundamentalData> {
        return try {
            val data = yahooFinanceFundamentalService.fetchFundamentalData(symbol)
            ResponseEntity.ok(data)
        } catch (e: Exception) {
            ResponseEntity.status(500).build()
        }
    }
}
