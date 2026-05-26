export interface StockNewsUrl {
    id: number;
    stockWatchlistId: number;
    url: string;
    active: boolean;
    lastScrapedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ScrapedNewsItem {
    articleUrl: string;
    headline: string;
    summary?: string | null;
    publishedAt?: string | null;
}

export interface NewsItem {
    id: number;
    sourceUrlId: number;
    articleUrl: string;
    headline: string;
    summary?: string | null;
    publishedAt?: string | null;
    scrapedAt: string;
}

export interface NewsFeedItem extends NewsItem {
    symbol: string;
    companyName?: string | null;
}

export interface NewsPageResponse<T> {
    items: T[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}

export interface ScrapeResult {
    success: boolean;
    newsUrlId?: number;
    newItems?: number;
    message?: string;
}
