package jp.stocks.service

import jp.stocks.model.dto.*
import jp.stocks.model.entity.BalanceSheetEntity
import jp.stocks.model.entity.CashFlowStatementEntity
import jp.stocks.model.entity.CompanyOverviewEntity
import jp.stocks.model.entity.IncomeStatementEntity
import jp.stocks.repository.BalanceSheetRepository
import jp.stocks.repository.CashFlowStatementRepository
import jp.stocks.repository.CompanyOverviewRepository
import jp.stocks.repository.IncomeStatementRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class FundamentalAnalysisService(
    private val incomeStatementRepository: IncomeStatementRepository,
    private val balanceSheetRepository: BalanceSheetRepository,
    private val cashFlowStatementRepository: CashFlowStatementRepository,
    private val companyOverviewRepository: CompanyOverviewRepository
) {

    /**
     * Get complete financial statements for a symbol
     */
    fun getFinancialStatements(symbol: String, fiscalDateEnding: LocalDate): FinancialStatements? {
        val incomeStatement = incomeStatementRepository
            .findBySymbolAndFiscalDateEnding(symbol, fiscalDateEnding)
            ?: return null

        val balanceSheet = balanceSheetRepository
            .findBySymbolAndFiscalDateEnding(symbol, fiscalDateEnding)
            ?: return null

        val cashFlowStatement = cashFlowStatementRepository
            .findBySymbolAndFiscalDateEnding(symbol, fiscalDateEnding)
            ?: return null

        return FinancialStatements(
            symbol = symbol,
            incomeStatement = incomeStatement.toDto(),
            balanceSheet = balanceSheet.toDto(),
            cashFlowStatement = cashFlowStatement.toDto()
        )
    }

    /**
     * Get latest financial statements
     */
    fun getLatestFinancialStatements(symbol: String): FinancialStatements? {
        val incomeStatement = incomeStatementRepository
            .findTopBySymbolOrderByFiscalDateEndingDesc(symbol)
            ?: return null

        val balanceSheet = balanceSheetRepository
            .findTopBySymbolOrderByFiscalDateEndingDesc(symbol)
            ?: return null

        val cashFlowStatement = cashFlowStatementRepository
            .findTopBySymbolOrderByFiscalDateEndingDesc(symbol)
            ?: return null

        return FinancialStatements(
            symbol = symbol,
            incomeStatement = incomeStatement.toDto(),
            balanceSheet = balanceSheet.toDto(),
            cashFlowStatement = cashFlowStatement.toDto()
        )
    }

    /**
     * Get income statements history
     */
    fun getIncomeStatements(symbol: String): List<IncomeStatement> {
        return incomeStatementRepository
            .findBySymbolOrderByFiscalDateEndingDesc(symbol)
            .map { it.toDto() }
    }

    /**
     * Get balance sheets history
     */
    fun getBalanceSheets(symbol: String): List<BalanceSheet> {
        return balanceSheetRepository
            .findBySymbolOrderByFiscalDateEndingDesc(symbol)
            .map { it.toDto() }
    }

    /**
     * Get cash flow statements history
     */
    fun getCashFlowStatements(symbol: String): List<CashFlowStatement> {
        return cashFlowStatementRepository
            .findBySymbolOrderByFiscalDateEndingDesc(symbol)
            .map { it.toDto() }
    }

    /**
     * Get company overview
     */
    fun getCompanyOverview(symbol: String): CompanyOverview? {
        return companyOverviewRepository.findBySymbol(symbol)?.toDto()
    }

    /**
     * Save income statement
     */
    @Transactional
    fun saveIncomeStatement(incomeStatement: IncomeStatement): IncomeStatement {
        val entity = incomeStatement.toEntity()
        val saved = incomeStatementRepository.save(entity)
        return saved.toDto()
    }

    /**
     * Save balance sheet
     */
    @Transactional
    fun saveBalanceSheet(balanceSheet: BalanceSheet): BalanceSheet {
        val entity = balanceSheet.toEntity()
        val saved = balanceSheetRepository.save(entity)
        return saved.toDto()
    }

    /**
     * Save cash flow statement
     */
    @Transactional
    fun saveCashFlowStatement(cashFlowStatement: CashFlowStatement): CashFlowStatement {
        val entity = cashFlowStatement.toEntity()
        val saved = cashFlowStatementRepository.save(entity)
        return saved.toDto()
    }

    /**
     * Save company overview
     */
    @Transactional
    fun saveCompanyOverview(companyOverview: CompanyOverview): CompanyOverview {
        val entity = companyOverview.toEntity()
        val saved = companyOverviewRepository.save(entity)
        return saved.toDto()
    }
}

// Extension functions for entity to DTO conversion
private fun IncomeStatementEntity.toDto() = IncomeStatement(
    symbol = symbol,
    fiscalDateEnding = fiscalDateEnding,
    reportedCurrency = reportedCurrency,
    totalRevenue = totalRevenue,
    costOfRevenue = costOfRevenue,
    grossProfit = grossProfit,
    operatingExpenses = operatingExpenses,
    operatingIncome = operatingIncome,
    interestExpense = interestExpense,
    incomeBeforeTax = incomeBeforeTax,
    incomeTaxExpense = incomeTaxExpense,
    netIncome = netIncome,
    ebitda = ebitda,
    eps = eps,
    weightedAverageShares = weightedAverageShares
)

private fun BalanceSheetEntity.toDto() = BalanceSheet(
    symbol = symbol,
    fiscalDateEnding = fiscalDateEnding,
    reportedCurrency = reportedCurrency,
    totalAssets = totalAssets,
    totalCurrentAssets = totalCurrentAssets,
    cashAndCashEquivalents = cashAndCashEquivalents,
    inventory = inventory,
    totalNonCurrentAssets = totalNonCurrentAssets,
    propertyPlantEquipment = propertyPlantEquipment,
    totalLiabilities = totalLiabilities,
    totalCurrentLiabilities = totalCurrentLiabilities,
    totalNonCurrentLiabilities = totalNonCurrentLiabilities,
    longTermDebt = longTermDebt,
    shortTermDebt = shortTermDebt,
    totalShareholderEquity = totalShareholderEquity,
    retainedEarnings = retainedEarnings,
    commonStock = commonStock
)

private fun CashFlowStatementEntity.toDto() = CashFlowStatement(
    symbol = symbol,
    fiscalDateEnding = fiscalDateEnding,
    reportedCurrency = reportedCurrency,
    operatingCashflow = operatingCashflow,
    capitalExpenditures = capitalExpenditures,
    freeCashFlow = freeCashFlow,
    cashflowFromInvestment = cashflowFromInvestment,
    cashflowFromFinancing = cashflowFromFinancing,
    dividendPayout = dividendPayout,
    netChangeInCash = netChangeInCash
)

private fun CompanyOverviewEntity.toDto() = CompanyOverview(
    symbol = symbol,
    name = name,
    description = description,
    sector = sector,
    industry = industry,
    marketCap = marketCap,
    sharesOutstanding = sharesOutstanding,
    currency = currency,
    country = country,
    exchange = exchange
)

// Extension functions for DTO to entity conversion
private fun IncomeStatement.toEntity() = IncomeStatementEntity(
    symbol = symbol,
    fiscalDateEnding = fiscalDateEnding,
    reportedCurrency = reportedCurrency,
    totalRevenue = totalRevenue,
    costOfRevenue = costOfRevenue,
    grossProfit = grossProfit,
    operatingExpenses = operatingExpenses,
    operatingIncome = operatingIncome,
    interestExpense = interestExpense,
    incomeBeforeTax = incomeBeforeTax,
    incomeTaxExpense = incomeTaxExpense,
    netIncome = netIncome,
    ebitda = ebitda,
    eps = eps,
    weightedAverageShares = weightedAverageShares
)

private fun BalanceSheet.toEntity() = BalanceSheetEntity(
    symbol = symbol,
    fiscalDateEnding = fiscalDateEnding,
    reportedCurrency = reportedCurrency,
    totalAssets = totalAssets,
    totalCurrentAssets = totalCurrentAssets,
    cashAndCashEquivalents = cashAndCashEquivalents,
    inventory = inventory,
    totalNonCurrentAssets = totalNonCurrentAssets,
    propertyPlantEquipment = propertyPlantEquipment,
    totalLiabilities = totalLiabilities,
    totalCurrentLiabilities = totalCurrentLiabilities,
    totalNonCurrentLiabilities = totalNonCurrentLiabilities,
    longTermDebt = longTermDebt,
    shortTermDebt = shortTermDebt,
    totalShareholderEquity = totalShareholderEquity,
    retainedEarnings = retainedEarnings,
    commonStock = commonStock
)

private fun CashFlowStatement.toEntity() = CashFlowStatementEntity(
    symbol = symbol,
    fiscalDateEnding = fiscalDateEnding,
    reportedCurrency = reportedCurrency,
    operatingCashflow = operatingCashflow,
    capitalExpenditures = capitalExpenditures,
    freeCashFlow = freeCashFlow,
    cashflowFromInvestment = cashflowFromInvestment,
    cashflowFromFinancing = cashflowFromFinancing,
    dividendPayout = dividendPayout,
    netChangeInCash = netChangeInCash
)

private fun CompanyOverview.toEntity() = CompanyOverviewEntity(
    symbol = symbol,
    name = name,
    description = description,
    sector = sector,
    industry = industry,
    marketCap = marketCap,
    sharesOutstanding = sharesOutstanding,
    currency = currency,
    country = country,
    exchange = exchange
)
