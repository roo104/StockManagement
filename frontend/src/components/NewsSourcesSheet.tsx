import * as React from 'react';
import {
    Eye,
    ExternalLink,
    Newspaper,
    Plus,
    RefreshCw,
    Trash2,
} from 'lucide-react';
import {newsService} from '@/api/newsService';
import type {
    NewsItem,
    NewsPageResponse,
    ScrapedNewsItem,
    StockNewsUrl,
} from '@/types/News';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Skeleton} from '@/components/ui/skeleton';
import {EmptyState} from '@/components/ui/empty-state';
import {toast} from '@/components/ui/toaster';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

interface NewsSourcesSheetProps {
    symbol: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function formatDateTime(value?: string | null) {
    if (!value) return 'Never';
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

export function NewsSourcesSheet({symbol, open, onOpenChange}: NewsSourcesSheetProps) {
    const [sources, setSources] = React.useState<StockNewsUrl[]>([]);
    const [news, setNews] = React.useState<NewsItem[]>([]);
    const [newsPage, setNewsPage] = React.useState<NewsPageResponse<NewsItem> | null>(null);
    const [loadingSources, setLoadingSources] = React.useState(false);
    const [loadingNews, setLoadingNews] = React.useState(false);
    const [loadingMore, setLoadingMore] = React.useState(false);

    const [newUrl, setNewUrl] = React.useState('');
    const [adding, setAdding] = React.useState(false);
    const [previewing, setPreviewing] = React.useState(false);
    const [previewResults, setPreviewResults] = React.useState<ScrapedNewsItem[] | null>(null);
    const [scrapingId, setScrapingId] = React.useState<number | null>(null);

    const loadSources = React.useCallback(async () => {
        if (!symbol) return;
        setLoadingSources(true);
        try {
            const data = await newsService.listNewsUrls(symbol);
            setSources(data);
        } catch (err) {
            console.error(err);
            toast.error(`Failed to load sources for ${symbol}`);
        } finally {
            setLoadingSources(false);
        }
    }, [symbol]);

    const loadNews = React.useCallback(
        async (page = 0, append = false) => {
            if (!symbol) return;
            if (append) setLoadingMore(true);
            else setLoadingNews(true);
            try {
                const data = await newsService.listNewsForSymbol(symbol, page, 20);
                setNewsPage(data);
                setNews((prev) => (append ? [...prev, ...data.items] : data.items));
            } catch (err) {
                console.error(err);
                toast.error(`Failed to load news for ${symbol}`);
            } finally {
                setLoadingNews(false);
                setLoadingMore(false);
            }
        },
        [symbol],
    );

    React.useEffect(() => {
        if (!open) return;
        setPreviewResults(null);
        setNewUrl('');
        void loadSources();
        void loadNews(0, false);
    }, [open, loadSources, loadNews]);

    const handlePreview = async () => {
        const url = newUrl.trim();
        if (!url) return;
        setPreviewing(true);
        setPreviewResults(null);
        try {
            const data = await newsService.preview(url);
            setPreviewResults(data);
            if (data.length === 0) {
                toast.warning('Preview returned no articles. The page may not be supported.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Preview failed');
        } finally {
            setPreviewing(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = newUrl.trim();
        if (!url) return;
        setAdding(true);
        try {
            await newsService.addNewsUrl(symbol, url);
            toast.success('Source added');
            setNewUrl('');
            setPreviewResults(null);
            await loadSources();
        } catch (err) {
            console.error(err);
            toast.error('Failed to add source');
        } finally {
            setAdding(false);
        }
    };

    const handleScrape = async (urlId: number) => {
        setScrapingId(urlId);
        try {
            const result = await newsService.scrapeNewsUrl(symbol, urlId);
            if (result.success) {
                const n = result.newItems ?? 0;
                toast.success(n === 0 ? 'No new articles found' : `Found ${n} new article${n === 1 ? '' : 's'}`);
                await Promise.all([loadSources(), loadNews(0, false)]);
            } else {
                toast.error(result.message ?? 'Scrape failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Scrape failed');
        } finally {
            setScrapingId(null);
        }
    };

    const handleDelete = async (urlId: number, url: string) => {
        if (!window.confirm(`Remove source ${hostnameOf(url)}?`)) return;
        try {
            await newsService.deleteNewsUrl(symbol, urlId);
            toast.success('Source removed');
            await Promise.all([loadSources(), loadNews(0, false)]);
        } catch (err) {
            console.error(err);
            toast.error('Failed to remove source');
        }
    };

    const canLoadMore = newsPage ? newsPage.page < newsPage.totalPages - 1 : false;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
            >
                <SheetHeader className="border-b border-[color:var(--color-border-soft)] px-6 py-4">
                    <SheetTitle className="flex items-center gap-2">
                        <Newspaper className="h-5 w-5 text-[color:var(--color-brand-cyan)]"/>
                        News &amp; sources — <span className="font-mono">{symbol}</span>
                    </SheetTitle>
                    <SheetDescription>
                        Attach news pages to scrape on the hour, and read the latest articles found.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                    <section className="space-y-4 px-6 py-5">
                        <div>
                            <h3 className="text-sm font-semibold text-[color:var(--color-fg)]">Sources</h3>
                            <p className="text-xs text-[color:var(--color-fg-muted)]">
                                Newsrooms, press-release pages, or RSS feeds.
                            </p>
                        </div>

                        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleAdd}>
                            <Input
                                type="url"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder="https://example.com/newsroom"
                                className="sm:flex-1"
                                disabled={adding}
                                aria-label="News URL"
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePreview}
                                    disabled={previewing || adding || !newUrl.trim()}
                                >
                                    <Eye className="h-4 w-4"/>
                                    {previewing ? 'Previewing…' : 'Preview'}
                                </Button>
                                <Button type="submit" disabled={adding || !newUrl.trim()}>
                                    <Plus className="h-4 w-4"/>
                                    {adding ? 'Adding…' : 'Add'}
                                </Button>
                            </div>
                        </form>

                        {previewResults !== null && (
                            <div className="rounded-lg border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-2)]/40 p-3">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-fg-muted)]">
                                    Preview {previewResults.length > 0 ? `(${previewResults.length})` : ''}
                                </div>
                                {previewResults.length === 0 ? (
                                    <p className="text-xs text-[color:var(--color-fg-muted)]">
                                        No articles could be extracted. You can still add the URL — extraction may improve over time.
                                    </p>
                                ) : (
                                    <ul className="space-y-2">
                                        {previewResults.slice(0, 5).map((item, idx) => (
                                            <li key={`${item.articleUrl}-${idx}`} className="text-xs">
                                                <div className="font-medium text-[color:var(--color-fg)] line-clamp-1">
                                                    {item.headline}
                                                </div>
                                                <div className="text-[color:var(--color-fg-muted)]">
                                                    {hostnameOf(item.articleUrl)} · {formatDateTime(item.publishedAt)}
                                                </div>
                                            </li>
                                        ))}
                                        {previewResults.length > 5 && (
                                            <li className="text-xs text-[color:var(--color-fg-muted)]">
                                                …and {previewResults.length - 5} more
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        )}

                        {loadingSources ? (
                            <div className="space-y-2">
                                <Skeleton className="h-12 w-full"/>
                                <Skeleton className="h-12 w-full"/>
                            </div>
                        ) : sources.length === 0 ? (
                            <EmptyState
                                icon={<Newspaper/>}
                                title="No sources yet"
                                description="Add a newsroom or press-release URL above."
                            />
                        ) : (
                            <ul className="space-y-2">
                                {sources.map((src) => (
                                    <li
                                        key={src.id}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] px-3 py-2"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <a
                                                href={src.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-fg)] hover:text-[color:var(--color-brand-cyan)]"
                                            >
                                                <span className="truncate">{hostnameOf(src.url)}</span>
                                                <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"/>
                                            </a>
                                            <div className="truncate text-xs text-[color:var(--color-fg-muted)]">
                                                Last scraped: {formatDateTime(src.lastScrapedAt)}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleScrape(src.id)}
                                                disabled={scrapingId === src.id}
                                                aria-label="Scrape now"
                                                title="Scrape now"
                                            >
                                                <RefreshCw
                                                    className={`h-4 w-4 ${scrapingId === src.id ? 'animate-spin' : ''}`}
                                                />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-[color:var(--color-danger)] hover:text-[color:var(--color-danger)]"
                                                onClick={() => handleDelete(src.id, src.url)}
                                                aria-label="Remove source"
                                                title="Remove"
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="space-y-4 border-t border-[color:var(--color-border-soft)] px-6 py-5">
                        <div>
                            <h3 className="text-sm font-semibold text-[color:var(--color-fg)]">Latest news</h3>
                            <p className="text-xs text-[color:var(--color-fg-muted)]">
                                {newsPage ? `${newsPage.totalItems} article${newsPage.totalItems === 1 ? '' : 's'} found` : '—'}
                            </p>
                        </div>

                        {loadingNews ? (
                            <div className="space-y-2">
                                <Skeleton className="h-16 w-full"/>
                                <Skeleton className="h-16 w-full"/>
                                <Skeleton className="h-16 w-full"/>
                            </div>
                        ) : news.length === 0 ? (
                            <EmptyState
                                icon={<Newspaper/>}
                                title="No articles yet"
                                description="Add a source and click the refresh icon to scrape immediately."
                            />
                        ) : (
                            <>
                                <ul className="space-y-3">
                                    {news.map((item) => (
                                        <li
                                            key={item.id}
                                            className="rounded-lg border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] p-3"
                                        >
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
                                                <p className="mt-2 line-clamp-2 text-xs text-[color:var(--color-fg-muted)]">
                                                    {item.summary}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                {canLoadMore && (
                                    <div className="flex justify-center pt-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => loadNews((newsPage?.page ?? 0) + 1, true)}
                                            disabled={loadingMore}
                                        >
                                            {loadingMore ? 'Loading…' : 'Load more'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
