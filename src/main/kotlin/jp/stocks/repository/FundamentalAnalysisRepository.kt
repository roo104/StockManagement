package jp.stocks.repository

import jp.stocks.model.entity.BalanceSheetEntity
import jp.stocks.model.entity.CashFlowStatementEntity
import jp.stocks.model.entity.CompanyOverviewEntity
import jp.stocks.model.entity.IncomeStatementEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface IncomeStatementRepository : JpaRepository<IncomeStatementEntity, Long> {
    fun findBySymbolAndFiscalDateEnding(symbol: String, fiscalDateEnding: LocalDate): IncomeStatementEntity?
    fun findBySymbolOrderByFiscalDateEndingDesc(symbol: String): List<IncomeStatementEntity>
    fun findTopBySymbolOrderByFiscalDateEndingDesc(symbol: String): IncomeStatementEntity?
}

@Repository
interface BalanceSheetRepository : JpaRepository<BalanceSheetEntity, Long> {
    fun findBySymbolAndFiscalDateEnding(symbol: String, fiscalDateEnding: LocalDate): BalanceSheetEntity?
    fun findBySymbolOrderByFiscalDateEndingDesc(symbol: String): List<BalanceSheetEntity>
    fun findTopBySymbolOrderByFiscalDateEndingDesc(symbol: String): BalanceSheetEntity?
}

@Repository
interface CashFlowStatementRepository : JpaRepository<CashFlowStatementEntity, Long> {
    fun findBySymbolAndFiscalDateEnding(symbol: String, fiscalDateEnding: LocalDate): CashFlowStatementEntity?
    fun findBySymbolOrderByFiscalDateEndingDesc(symbol: String): List<CashFlowStatementEntity>
    fun findTopBySymbolOrderByFiscalDateEndingDesc(symbol: String): CashFlowStatementEntity?
}

@Repository
interface CompanyOverviewRepository : JpaRepository<CompanyOverviewEntity, Long> {
    fun findBySymbol(symbol: String): CompanyOverviewEntity?
}
