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
import java.time.LocalDateTime

@Service
class FundamentalAnalysisService(
    private val incomeStatementRepository: IncomeStatementRepository,
    private val balanceSheetRepository: BalanceSheetRepository,
    private val cashFlowStatementRepository: CashFlowStatementRepository,
    private val companyOverviewRepository: CompanyOverviewRepository,
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
            cashFlowStatement = cashFlowStatement.toDto(),
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
            cashFlowStatement = cashFlowStatement.toDto(),
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
     * Save income statement (upsert - update if exists, insert if new)
     */
    @Transactional
    fun saveIncomeStatement(incomeStatement: IncomeStatement): IncomeStatement {
        val existing = incomeStatementRepository.findBySymbolAndFiscalDateEnding(
            incomeStatement.symbol,
            incomeStatement.fiscalDateEnding
        )

        val entity = if (existing != null) {
            // Update existing record
            existing.copy(
                reportedCurrency = incomeStatement.reportedCurrency,
                totalRevenue = incomeStatement.totalRevenue,
                costOfRevenue = incomeStatement.costOfRevenue,
                grossProfit = incomeStatement.grossProfit,
                operatingExpenses = incomeStatement.operatingExpenses,
                operatingIncome = incomeStatement.operatingIncome,
                interestExpense = incomeStatement.interestExpense,
                incomeBeforeTax = incomeStatement.incomeBeforeTax,
                incomeTaxExpense = incomeStatement.incomeTaxExpense,
                netIncome = incomeStatement.netIncome,
                ebitda = incomeStatement.ebitda,
                eps = incomeStatement.eps,
                weightedAverageShares = incomeStatement.weightedAverageShares,
                updatedAt = LocalDateTime.now()
            )
        } else {
            // Insert new record
            incomeStatement.toEntity()
        }

        val saved = incomeStatementRepository.save(entity)
        return saved.toDto()
    }

    /**
     * Save balance sheet (upsert - update if exists, insert if new)
     */
    @Transactional
    fun saveBalanceSheet(balanceSheet: BalanceSheet): BalanceSheet {
        val existing = balanceSheetRepository.findBySymbolAndFiscalDateEnding(
            balanceSheet.symbol,
            balanceSheet.fiscalDateEnding
        )

        val entity = if (existing != null) {
            // Update existing record
            existing.copy(
                reportedCurrency = balanceSheet.reportedCurrency,
                totalAssets = balanceSheet.totalAssets,
                totalCurrentAssets = balanceSheet.totalCurrentAssets,
                cashAndCashEquivalents = balanceSheet.cashAndCashEquivalents,
                inventory = balanceSheet.inventory,
                totalNonCurrentAssets = balanceSheet.totalNonCurrentAssets,
                propertyPlantEquipment = balanceSheet.propertyPlantEquipment,
                totalLiabilities = balanceSheet.totalLiabilities,
                totalCurrentLiabilities = balanceSheet.totalCurrentLiabilities,
                totalNonCurrentLiabilities = balanceSheet.totalNonCurrentLiabilities,
                longTermDebt = balanceSheet.longTermDebt,
                shortTermDebt = balanceSheet.shortTermDebt,
                totalShareholderEquity = balanceSheet.totalShareholderEquity,
                retainedEarnings = balanceSheet.retainedEarnings,
                commonStock = balanceSheet.commonStock,
                updatedAt = LocalDateTime.now()
            )
        } else {
            // Insert new record
            balanceSheet.toEntity()
        }

        val saved = balanceSheetRepository.save(entity)
        return saved.toDto()
    }

    /**
     * Save cash flow statement (upsert - update if exists, insert if new)
     */
    @Transactional
    fun saveCashFlowStatement(cashFlowStatement: CashFlowStatement): CashFlowStatement {
        val existing = cashFlowStatementRepository.findBySymbolAndFiscalDateEnding(
            cashFlowStatement.symbol,
            cashFlowStatement.fiscalDateEnding
        )

        val entity = if (existing != null) {
            // Update existing record
            existing.copy(
                reportedCurrency = cashFlowStatement.reportedCurrency,
                operatingCashflow = cashFlowStatement.operatingCashflow,
                capitalExpenditures = cashFlowStatement.capitalExpenditures,
                freeCashFlow = cashFlowStatement.freeCashFlow,
                cashflowFromInvestment = cashFlowStatement.cashflowFromInvestment,
                cashflowFromFinancing = cashFlowStatement.cashflowFromFinancing,
                dividendPayout = cashFlowStatement.dividendPayout,
                netChangeInCash = cashFlowStatement.netChangeInCash,
                updatedAt = LocalDateTime.now()
            )
        } else {
            // Insert new record
            cashFlowStatement.toEntity()
        }

        val saved = cashFlowStatementRepository.save(entity)
        return saved.toDto()
    }

    /**
     * Save company overview
     */
    @Transactional
    fun saveCompanyOverview(companyOverview: CompanyOverview): CompanyOverview {
        val existing = companyOverviewRepository.findBySymbol(companyOverview.symbol)
        // Update existing record
        val entity = existing?.copy(
            name = companyOverview.name,
            description = companyOverview.description,
            sector = companyOverview.sector,
            industry = companyOverview.industry,
            exchange = companyOverview.exchange,
            currency = companyOverview.currency,
            country = companyOverview.country,
            marketCap = companyOverview.marketCap,
            sharesOutstanding = companyOverview.sharesOutstanding,
            yearlyRevenue = companyOverview.yearlyRevenue,
            yearlyNetIncome = companyOverview.yearlyNetIncome,
            yearlyEbitda = companyOverview.yearlyEbitda,
            yearlyEps = companyOverview.yearlyEps,
            nextFiscalQuarterEnd = companyOverview.nextFiscalQuarterEnd,
            updatedAt = LocalDateTime.now(),
        )
            ?: // Create new record
            companyOverview.toEntity()
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
    weightedAverageShares = weightedAverageShares,
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
    commonStock = commonStock,
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
    netChangeInCash = netChangeInCash,
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
    exchange = exchange,
    nextFiscalQuarterEnd = nextFiscalQuarterEnd,
    yearlyRevenue = yearlyRevenue,
    yearlyNetIncome = yearlyNetIncome,
    yearlyEbitda = yearlyEbitda,
    yearlyEps = yearlyEps,
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
    weightedAverageShares = weightedAverageShares,
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
    commonStock = commonStock,
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
    netChangeInCash = netChangeInCash,
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
    exchange = exchange,
    nextFiscalQuarterEnd = nextFiscalQuarterEnd,
    yearlyRevenue = yearlyRevenue,
    yearlyNetIncome = yearlyNetIncome,
    yearlyEbitda = yearlyEbitda,
    yearlyEps = yearlyEps,
)
