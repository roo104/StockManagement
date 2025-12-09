import apiClient from './client';

export interface IpoCalendarEntry {
  symbol: string;
  name: string;
  ipoDate: string;
  priceRangeLow: number | null;
  priceRangeHigh: number | null;
  currency: string;
  exchange: string | null;
}

export interface IpoCalendar {
  month: string;
  ipos: IpoCalendarEntry[];
}

export const ipoCalendarService = {
  /**
   * Fetch current IPO calendar
   */
  async getIpoCalendar(): Promise<IpoCalendar> {
    const response = await apiClient.get<IpoCalendar>('/ipo-calendar');
    return response.data;
  },

  /**
   * Fetch IPO calendar for a specific month
   * @param yearMonth - Format: YYYY-MM (e.g., "2025-01")
   */
  async getIpoCalendarForMonth(yearMonth: string): Promise<IpoCalendar> {
    const response = await apiClient.get<IpoCalendar>(`/ipo-calendar/month/${yearMonth}`);
    return response.data;
  },
};
