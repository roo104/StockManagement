package jp.stocks.model.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "income_statements")
data class IncomeStatementEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    val symbol: String,

    @Column(nullable = false)
    val fiscalDateEnding: LocalDate,

    @Column(nullable = false)
    val reportedCurrency: String,

    @Column(precision = 20, scale = 2)
    val totalRevenue: BigDecimal,

    @Column(precision = 20, scale = 2)
    val costOfRevenue: BigDecimal,

    @Column(precision = 20, scale = 2)
    val grossProfit: BigDecimal,

    @Column(precision = 20, scale = 2)
    val operatingExpenses: BigDecimal,

    @Column(precision = 20, scale = 2)
    val operatingIncome: BigDecimal,

    @Column(precision = 20, scale = 2)
    val interestExpense: BigDecimal? = null,

    @Column(precision = 20, scale = 2)
    val incomeBeforeTax: BigDecimal,

    @Column(precision = 20, scale = 2)
    val incomeTaxExpense: BigDecimal,

    @Column(precision = 20, scale = 2)
    val netIncome: BigDecimal,

    @Column(precision = 20, scale = 2)
    val ebitda: BigDecimal,

    @Column(precision = 20, scale = 4)
    val eps: BigDecimal,

    @Column(nullable = false)
    val weightedAverageShares: Long,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

@Entity
@Table(name = "balance_sheets")
data class BalanceSheetEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    val symbol: String,

    @Column(nullable = false)
    val fiscalDateEnding: LocalDate,

    @Column(nullable = false)
    val reportedCurrency: String,

    @Column(precision = 20, scale = 2)
    val totalAssets: BigDecimal,

    @Column(precision = 20, scale = 2)
    val totalCurrentAssets: BigDecimal,

    @Column(precision = 20, scale = 2)
    val cashAndCashEquivalents: BigDecimal,

    @Column(precision = 20, scale = 2)
    val inventory: BigDecimal? = null,

    @Column(precision = 20, scale = 2)
    val totalNonCurrentAssets: BigDecimal,

    @Column(precision = 20, scale = 2)
    val propertyPlantEquipment: BigDecimal,

    @Column(precision = 20, scale = 2)
    val totalLiabilities: BigDecimal,

    @Column(precision = 20, scale = 2)
    val totalCurrentLiabilities: BigDecimal,

    @Column(precision = 20, scale = 2)
    val totalNonCurrentLiabilities: BigDecimal,

    @Column(precision = 20, scale = 2)
    val longTermDebt: BigDecimal,

    @Column(precision = 20, scale = 2)
    val shortTermDebt: BigDecimal,

    @Column(precision = 20, scale = 2)
    val totalShareholderEquity: BigDecimal,

    @Column(precision = 20, scale = 2)
    val retainedEarnings: BigDecimal,

    @Column(precision = 20, scale = 2)
    val commonStock: BigDecimal,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

@Entity
@Table(name = "cash_flow_statements")
data class CashFlowStatementEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    val symbol: String,

    @Column(nullable = false)
    val fiscalDateEnding: LocalDate,

    @Column(nullable = false)
    val reportedCurrency: String,

    @Column(precision = 20, scale = 2)
    val operatingCashflow: BigDecimal,

    @Column(precision = 20, scale = 2)
    val capitalExpenditures: BigDecimal,

    @Column(precision = 20, scale = 2)
    val freeCashFlow: BigDecimal,

    @Column(precision = 20, scale = 2)
    val cashflowFromInvestment: BigDecimal,

    @Column(precision = 20, scale = 2)
    val cashflowFromFinancing: BigDecimal,

    @Column(precision = 20, scale = 2)
    val dividendPayout: BigDecimal? = null,

    @Column(precision = 20, scale = 2)
    val netChangeInCash: BigDecimal,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

@Entity
@Table(name = "company_overviews")
data class CompanyOverviewEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, unique = true)
    val symbol: String,

    @Column(nullable = false)
    val name: String,

    @Column(columnDefinition = "TEXT")
    val description: String? = null,

    val sector: String? = null,

    val industry: String? = null,

    @Column(precision = 20, scale = 2)
    val marketCap: BigDecimal,

    @Column(nullable = false)
    val sharesOutstanding: Long,

    @Column(nullable = false)
    val currency: String,

    val country: String? = null,

    val exchange: String? = null,

    val nextFiscalQuarterEnd: LocalDate? = null,

    @Column(precision = 20, scale = 2)
    val yearlyRevenue: BigDecimal? = null,

    @Column(precision = 20, scale = 2)
    val yearlyNetIncome: BigDecimal? = null,

    @Column(precision = 20, scale = 2)
    val yearlyEbitda: BigDecimal? = null,

    @Column(precision = 20, scale = 4)
    val yearlyEps: BigDecimal? = null,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
