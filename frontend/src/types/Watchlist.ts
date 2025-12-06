export interface StockWatchlist {
  id?: number;
  symbol: string;
  name?: string;
  active: boolean;
  lastFetchedAt?: string;
  fetchFrequencyHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddStockRequest {
  symbol: string;
  name?: string;
  fetchFrequencyHours?: number;
}
