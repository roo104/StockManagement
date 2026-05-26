import apiClient from './client';
import type {
    NewsFeedItem,
    NewsItem,
    NewsPageResponse,
    ScrapedNewsItem,
    ScrapeResult,
    StockNewsUrl,
} from '../types/News';

export const newsService = {
    listNewsUrls: async (symbol: string): Promise<StockNewsUrl[]> => {
        const response = await apiClient.get<StockNewsUrl[]>(
            `/watchlist/${encodeURIComponent(symbol)}/news-urls`,
        );
        return response.data;
    },

    addNewsUrl: async (symbol: string, url: string): Promise<StockNewsUrl> => {
        const response = await apiClient.post<StockNewsUrl>(
            `/watchlist/${encodeURIComponent(symbol)}/news-urls`,
            {url},
        );
        return response.data;
    },

    deleteNewsUrl: async (symbol: string, urlId: number): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete<{ success: boolean; message: string }>(
            `/watchlist/${encodeURIComponent(symbol)}/news-urls/${urlId}`,
        );
        return response.data;
    },

    scrapeNewsUrl: async (symbol: string, urlId: number): Promise<ScrapeResult> => {
        const response = await apiClient.post<ScrapeResult>(
            `/watchlist/${encodeURIComponent(symbol)}/news-urls/${urlId}/scrape`,
            {},
            {timeout: 60000},
        );
        return response.data;
    },

    listNewsForSymbol: async (
        symbol: string,
        page = 0,
        size = 20,
    ): Promise<NewsPageResponse<NewsItem>> => {
        const response = await apiClient.get<NewsPageResponse<NewsItem>>(
            `/watchlist/${encodeURIComponent(symbol)}/news`,
            {params: {page, size}},
        );
        return response.data;
    },

    listFeed: async (
        symbol: string | null,
        page = 0,
        size = 20,
    ): Promise<NewsPageResponse<NewsFeedItem>> => {
        const response = await apiClient.get<NewsPageResponse<NewsFeedItem>>('/news', {
            params: {
                page,
                size,
                ...(symbol ? {symbol} : {}),
            },
        });
        return response.data;
    },

    preview: async (url: string): Promise<ScrapedNewsItem[]> => {
        const response = await apiClient.post<ScrapedNewsItem[]>(
            '/news/preview',
            {url},
            {timeout: 60000},
        );
        return response.data;
    },
};
