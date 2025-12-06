import apiClient from './client';
import {AddStockRequest, StockWatchlist} from '../types/Watchlist';

export const watchlistService = {
  /**
   * Get all stocks in watchlist
   */
  getAllStocks: async (): Promise<StockWatchlist[]> => {
    const response = await apiClient.get<StockWatchlist[]>('/watchlist');
    return response.data;
  },

  /**
   * Get all active stocks
   */
  getActiveStocks: async (): Promise<StockWatchlist[]> => {
    const response = await apiClient.get<StockWatchlist[]>('/watchlist/active');
    return response.data;
  },

  /**
   * Get stocks needing update
   */
  getStocksNeedingUpdate: async (): Promise<StockWatchlist[]> => {
    const response = await apiClient.get<StockWatchlist[]>('/watchlist/needs-update');
    return response.data;
  },

  /**
   * Get stock by symbol
   */
  getStock: async (symbol: string): Promise<StockWatchlist> => {
    const response = await apiClient.get<StockWatchlist>(`/watchlist/${symbol}`);
    return response.data;
  },

  /**
   * Add stock to watchlist
   */
  addStock: async (request: AddStockRequest): Promise<StockWatchlist> => {
    const response = await apiClient.post<StockWatchlist>('/watchlist', request);
    return response.data;
  },

  /**
   * Remove stock from watchlist
   */
  removeStock: async (symbol: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/watchlist/${symbol}`);
    return response.data;
  },

  /**
   * Activate stock
   */
  activateStock: async (symbol: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put<{ success: boolean; message: string }>(`/watchlist/${symbol}/activate`);
    return response.data;
  },

  /**
   * Deactivate stock
   */
  deactivateStock: async (symbol: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put<{ success: boolean; message: string }>(`/watchlist/${symbol}/deactivate`);
    return response.data;
  },

  /**
   * Fetch stock data from provider
   */
  fetchStock: async (symbol: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/watchlist/${symbol}/fetch`,
      {},
      { timeout: 120000 } // 2 minutes timeout for data fetching
    );
    return response.data;
  },
};
