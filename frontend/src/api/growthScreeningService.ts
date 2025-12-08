import apiClient from './client';
import {GrowthScreeningRequest, GrowthScreeningResult, GrowthStockScore} from '../types/GrowthScreening';

export const growthScreeningService = {
  /**
   * Screen all stocks in watchlist for growth potential
   */
  async screenAllStocks(params?: {
    minScore?: number;
    minRevenueGrowth?: number;
    minEarningsGrowth?: number;
    sectors?: string[];
    maxPeRatio?: number;
  }): Promise<GrowthScreeningResult> {
    const queryParams = new URLSearchParams();
    if (params?.minScore !== undefined) queryParams.append('minScore', params.minScore.toString());
    if (params?.minRevenueGrowth !== undefined) queryParams.append('minRevenueGrowth', params.minRevenueGrowth.toString());
    if (params?.minEarningsGrowth !== undefined) queryParams.append('minEarningsGrowth', params.minEarningsGrowth.toString());
    if (params?.maxPeRatio !== undefined) queryParams.append('maxPeRatio', params.maxPeRatio.toString());
    if (params?.sectors && params.sectors.length > 0) {
      params.sectors.forEach(sector => queryParams.append('sectors', sector));
    }

    const response = await apiClient.get<GrowthScreeningResult>(
      `/api/growth-screening${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data;
  },

  /**
   * Screen specific stocks for growth potential
   */
  async screenSpecificStocks(request: GrowthScreeningRequest): Promise<GrowthScreeningResult> {
    const response = await apiClient.post<GrowthScreeningResult>('/api/growth-screening', request);
    return response.data;
  },

  /**
   * Get detailed growth score for a single stock
   */
  async getGrowthScore(symbol: string): Promise<GrowthStockScore> {
    const response = await apiClient.get<GrowthStockScore>(`/api/growth-screening/${symbol}`);
    return response.data;
  },

  /**
   * Get top N growth stocks
   */
  async getTopGrowthStocks(limit: number = 10, minScore?: number): Promise<GrowthStockScore[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    if (minScore !== undefined) queryParams.append('minScore', minScore.toString());

    const response = await apiClient.get<GrowthStockScore[]>(`/api/growth-screening/top?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get high growth stocks (score >= 80)
   */
  async getHighGrowthStocks(): Promise<GrowthStockScore[]> {
    const response = await apiClient.get<GrowthStockScore[]>('/api/growth-screening/high-growth');
    return response.data;
  }
};
