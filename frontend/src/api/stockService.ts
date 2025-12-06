import apiClient from './client';
import {OhlcData} from '../types/OhlcData';

export interface FetchOhlcParams {
  symbol: string;
  period?: string;
  interval?: string;
}

export const stockService = {
  /**
   * Fetch OHLC data for a stock symbol
   */
  async getOhlcData({ symbol, period = '1mo', interval = '1d' }: FetchOhlcParams): Promise<OhlcData[]> {
    const response = await apiClient.get<OhlcData[]>(`/stocks/${symbol}/ohlc`, {
      params: { period, interval },
    });
    return response.data;
  },

  // Add more stock-related API calls here
  // async getStockInfo(symbol: string) { ... }
  // async searchStocks(query: string) { ... }
};
