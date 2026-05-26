import * as React from 'react';
import {ExternalLink, Newspaper} from 'lucide-react';
import {newsService} from '@/api/newsService';
import {watchlistService} from '@/api/watchlistService';
import type {NewsFeedItem, NewsPageResponse} from '@/types/News';
import type {StockWatchlist} from '@/types/Watchlist';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {EmptyState} from '@/components/ui/empty-state';
import {Skeleton} from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {toast} from '@/components/ui/toaster';
import {NewsSourcesSheet} from '@/components/NewsSourcesSheet';

const ALL_VALUE = '__all__';

function formatDateTime(value?: string | null) {
    if (!value) return 'Unknown date';
    return new Date(value).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function hostnameOf(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

export default function NewsPage() {
    const [stocks, setStocks] = React.useState<StockWatchlist[]>([]);
    const [filter, setFilter] = React.useState<string>(ALL_VALUE);
    const [items, setItems] = React.useState<NewsFeedItem[]>([]);
    const [pageInfo, setPageInfo] = React.useState<NewsPageResponse<NewsFeedItem> | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [sheetSymbol, setSheetSymbol] = React.useState<string | null>(null);

    React.useEffect(() => {
        void watchlistService.getAllStocks().then(setStocks).catch((err) => {
            console.error(err);
        });
    }, []);

    const loadFeed = React.useCallback(
        async (page = 0, append = false) => {
            if (append) setLoadingMore(true);
            else setLoading(true);
            try {
                const symbol = filter === ALL_VALUE ? null : filter;
                const data = await newsService.listFeed(symbol, page, 20);
                setPageInfo(data);
                setItems((prev) => (append ? [...prev, ...data.items] : data.items));
            } catch (err) {
                console.error(err);
                toast.error('Failed to load news');
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [filter],
    );

    React.useEffect(() => {
        void loadFeed(0, false);
    }, [loadFeed]);

    const canLoadMore = pageInfo ? pageInfo.page < pageInfo.totalPages - 1 : false;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">News</h1>
                <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
                    Articles scraped from sources you've attached to your watchlist stocks.
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <CardTitle className="text-base">Feed</CardTitle>
                        <CardDescription>
                            {pageInfo
                                ? `${pageInfo.totalItems} article${pageInfo.totalItems === 1 ? '' : 's'} ${filter === ALL_VALUE ? 'across all stocks' : `for ${filter}`}`
                                : 'Loading…'}
                        </CardDescription>
                    </div>
                    <div className="w-full sm:w-56">
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>All stocks</SelectItem>
                                {stocks.map((s) => (
                                    <SelectItem key={s.symbol} value={s.symbol}>
                                        {s.symbol}
                                        {s.name ? ` — ${s.name}` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-20 w-full"/>
                            <Skeleton className="h-20 w-full"/>
                            <Skeleton className="h-20 w-full"/>
                        </div>
                    ) : items.length === 0 ? (
                        <EmptyState
                            icon={<Newspaper/>}
                            title="No articles yet"
                            description="Add news sources from the Watchlist page using the row actions menu."
                        />
                    ) : (
                        <>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li
                                        key={`${item.symbol}-${item.id}`}
                                        className="flex flex-col gap-2 rounded-lg border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] p-4 sm:flex-row sm:items-start sm:gap-4"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setSheetSymbol(item.symbol)}
                                            className="shrink-0"
                                            title={`Manage sources for ${item.symbol}`}
                                        >
                                            <Badge variant="secondary" className="cursor-pointer font-mono">
                                                {item.symbol}
                                            </Badge>
                                        </button>
                                        <div className="min-w-0 flex-1">
                                            <a
                                                href={item.articleUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group inline-flex items-start gap-1.5 text-sm font-medium text-[color:var(--color-fg)] hover:text-[color:var(--color-brand-cyan)]"
                                            >
                                                <span>{item.headline}</span>
                                                <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"/>
                                            </a>
                                            <div className="mt-1 text-xs font-mono text-[color:var(--color-fg-muted)]">
                                                {hostnameOf(item.articleUrl)} · {formatDateTime(item.publishedAt)}
                                            </div>
                                            {item.summary && (
                                                <p className="mt-2 line-clamp-3 text-sm text-[color:var(--color-fg-muted)]">
                                                    {item.summary}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {canLoadMore && (
                                <div className="flex justify-center pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => loadFeed((pageInfo?.page ?? 0) + 1, true)}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? 'Loading…' : 'Load more'}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <NewsSourcesSheet
                symbol={sheetSymbol ?? ''}
                open={!!sheetSymbol}
                onOpenChange={(o) => {
                    if (!o) setSheetSymbol(null);
                }}
            />
        </div>
    );
}
