export interface IncomeStatement {
  symbol: string;
  fiscalDateEnding: string;
  reportedCurrency: string;
  totalRevenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  interestExpense?: number;
  incomeBeforeTax: number;
  incomeTaxExpense: number;
  netIncome: number;
  ebitda: number;
  eps: number;
  weightedAverageShares: number;
}

export interface BalanceSheet {
  symbol: string;
  fiscalDateEnding: string;
  reportedCurrency: string;
  totalAssets: number;
  totalCurrentAssets: number;
  cashAndCashEquivalents: number;
  inventory?: number;
  totalNonCurrentAssets: number;
  propertyPlantEquipment: number;
  totalLiabilities: number;
  totalCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  longTermDebt: number;
  shortTermDebt: number;
  totalShareholderEquity: number;
  retainedEarnings: number;
  commonStock: number;
}

export interface CashFlowStatement {
  symbol: string;
  fiscalDateEnding: string;
  reportedCurrency: string;
  operatingCashflow: number;
  capitalExpenditures: number;
  freeCashFlow: number;
  cashflowFromInvestment: number;
  cashflowFromFinancing: number;
  dividendPayout?: number;
  netChangeInCash: number;
}

export interface FinancialStatements {
  symbol: string;
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  cashFlowStatement: CashFlowStatement;
}

export interface ValuationMetrics {
  symbol: string;
  currentPrice: number;
  marketCap: number;
  enterpriseValue: number;
  peRatio?: number;
  pbRatio?: number;
  psRatio?: number;
  pegRatio?: number;
  evToEbitda?: number;
  evToSales?: number;
  priceToFreeCashFlow?: number;
  debtToEquity?: number;
  currentRatio?: number;
  quickRatio?: number;
  returnOnEquity?: number;
  returnOnAssets?: number;
  profitMargin?: number;
  operatingMargin?: number;
  dividendYield?: number;
  payoutRatio?: number;
}

export interface CompanyOverview {
  symbol: string;
  name: string;
  description?: string;
  sector?: string;
  industry?: string;
  marketCap: number;
  sharesOutstanding: number;
  currency: string;
  country?: string;
  exchange?: string;
}

export interface DcfInput {
  symbol: string;
  freeCashFlows: number[];
  projectedGrowthRate: number;
  terminalGrowthRate: number;
  discountRate: number;
  projectionYears?: number;
  sharesOutstanding: number;
}

export interface DcfResult {
  symbol: string;
  projectedCashFlows: number[];
  terminalValue: number;
  presentValueOfCashFlows: number;
  presentValueOfTerminalValue: number;
  enterpriseValue: number;
  equityValue: number;
  fairValuePerShare: number;
  currentPrice: number;
  upside: number;
}
