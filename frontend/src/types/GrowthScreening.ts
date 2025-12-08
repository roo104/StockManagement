export interface GrowthMetrics {
  symbol: string;
  revenueGrowthRate: number | null;
  earningsGrowthRate: number | null;
  freeCashFlowGrowthRate: number | null;
  epsGrowthRate: number | null;
  grossMargin: number | null;
  grossMarginTrend: string | null;
  operatingMarginTrend: string | null;
  yearsOfData: number;
}

export interface GrowthStockScore {
  symbol: string;
  name: string | null;
  sector: string | null;
  industry: string | null;
  growthMetrics: GrowthMetrics;
  currentPrice: number | null;
  marketCap: number | null;
  peRatio: number | null;
  pegRatio: number | null;
  profitMargin: number | null;
  roe: number | null;
  revenueGrowthScore: number;
  earningsGrowthScore: number;
  cashFlowScore: number;
  profitabilityScore: number;
  efficiencyScore: number;
  overallScore: number;
  growthCategory: GrowthCategory;
  flags: string[];
}

export enum GrowthCategory {
  HIGH_GROWTH = 'HIGH_GROWTH',
  STRONG_GROWTH = 'STRONG_GROWTH',
  MODERATE_GROWTH = 'MODERATE_GROWTH',
  LOW_GROWTH = 'LOW_GROWTH',
  NO_GROWTH = 'NO_GROWTH'
}

export interface GrowthScreeningRequest {
  symbols?: string[];
  minScore?: number;
  minRevenueGrowth?: number;
  minEarningsGrowth?: number;
  sectors?: string[];
  maxPeRatio?: number;
}

export interface GrowthScreeningResult {
  totalAnalyzed: number;
  resultsCount: number;
  topGrowthStocks: GrowthStockScore[];
}
