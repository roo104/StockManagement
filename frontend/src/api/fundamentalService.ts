import apiClient from './client';
import {BalanceSheet, CashFlowStatement, CompanyOverview, DcfInput, DcfResult, FinancialStatements, IncomeStatement, ValuationMetrics,} from '../types/FundamentalAnalysis';

export const fundamentalService = {
  /**
   * Get latest financial statements for a symbol
   */
  async getLatestFinancialStatements(symbol: string): Promise<FinancialStatements> {
    const response = await apiClient.get<FinancialStatements>(
      `/fundamental/${symbol}/statements/latest`
    );
    return response.data;
  },

  /**
   * Get financial statements for a specific date
   */
  async getFinancialStatements(symbol: string, date: string): Promise<FinancialStatements> {
    const response = await apiClient.get<FinancialStatements>(
      `/fundamental/${symbol}/statements`,
      { params: { date } }
    );
    return response.data;
  },

  /**
   * Get income statement history
   */
  async getIncomeStatements(symbol: string): Promise<IncomeStatement[]> {
    const response = await apiClient.get<IncomeStatement[]>(
      `/fundamental/${symbol}/income-statements`
    );
    return response.data;
  },

  /**
   * Get balance sheet history
   */
  async getBalanceSheets(symbol: string): Promise<BalanceSheet[]> {
    const response = await apiClient.get<BalanceSheet[]>(
      `/fundamental/${symbol}/balance-sheets`
    );
    return response.data;
  },

  /**
   * Get cash flow statement history
   */
  async getCashFlowStatements(symbol: string): Promise<CashFlowStatement[]> {
    const response = await apiClient.get<CashFlowStatement[]>(
      `/fundamental/${symbol}/cash-flow-statements`
    );
    return response.data;
  },

  /**
   * Get company overview
   */
  async getCompanyOverview(symbol: string): Promise<CompanyOverview> {
    const response = await apiClient.get<CompanyOverview>(
      `/fundamental/${symbol}/overview`
    );
    return response.data;
  },

  /**
   * Get valuation metrics
   */
  async getValuationMetrics(symbol: string, currentPrice: number): Promise<ValuationMetrics> {
    const response = await apiClient.get<ValuationMetrics>(
      `/fundamental/${symbol}/valuation`,
      { params: { currentPrice } }
    );
    return response.data;
  },

  /**
   * Calculate DCF valuation
   */
  async calculateDcf(symbol: string, input: DcfInput, currentPrice: number): Promise<DcfResult> {
    const response = await apiClient.post<DcfResult>(
      `/fundamental/${symbol}/dcf`,
      input,
      { params: { currentPrice } }
    );
    return response.data;
  },

  /**
   * Get historical free cash flows
   */
  async getHistoricalFreeCashFlows(symbol: string, years: number = 5): Promise<number[]> {
    const response = await apiClient.get<number[]>(
      `/fundamental/${symbol}/free-cash-flows`,
      { params: { years } }
    );
    return response.data;
  },

  /**
   * Get historical growth rate
   */
  async getHistoricalGrowthRate(symbol: string, years: number = 5): Promise<{
    symbol: string;
    years: number;
    growthRate: number;
    historicalCashFlows: number[];
  }> {
    const response = await apiClient.get(
      `/fundamental/${symbol}/growth-rate`,
      { params: { years } }
    );
    return response.data;
  },

  /**
   * Fetch and save fundamental data from Yahoo Finance
   */
  async fetchFundamentalData(symbol: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/fundamental/${symbol}/fetch`);
    return response.data;
  },
};
