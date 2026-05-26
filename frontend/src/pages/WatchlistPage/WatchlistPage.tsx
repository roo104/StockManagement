import * as React from 'react';
import {Link} from 'react-router-dom';
import {
    MoreHorizontal,
    RefreshCw,
    Trash2,
    Pause,
    Play,
    Plus,
    Star,
    ExternalLink,
    Newspaper,
} from 'lucide-react';
import {watchlistService} from '@/api/watchlistService';
import type {StockWatchlist} from '@/types/Watchlist';
import {NewsSourcesSheet} from '@/components/NewsSourcesSheet';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Skeleton} from '@/components/ui/skeleton';
import {EmptyState} from '@/components/ui/empty-state';
import {toast} from '@/components/ui/toaster';

function formatDate(dateString: string | undefined) {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function WatchlistPage() {
    const [stocks, setStocks] = React.useState<StockWatchlist[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [newSymbol, setNewSymbol] = React.useState('');
    const [adding, setAdding] = React.useState(false);
    const [newsSymbol, setNewsSymbol] = React.useState<string | null>(null);

    const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await watchlistService.getAllStocks();
      setStocks(data);
    } catch (err) {
        toast.error('Failed to load watchlist');
        console.error(err);
    } finally {
      setLoading(false);
    }
    }, []);

    React.useEffect(() => {
        void refresh();
    }, [refresh]);

    const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
        const symbol = newSymbol.trim().toUpperCase();
        if (!symbol) return;
        setAdding(true);
    try {
        await watchlistService.addStock({symbol, fetchFrequencyHours: 24});
      setNewSymbol('');
        toast.success(`Added ${symbol} to watchlist`);
        await refresh();
    } catch (err: any) {
        toast.error(err?.response?.data?.message ?? `Failed to add ${symbol}`);
    } finally {
        setAdding(false);
    }
  };

    const handleRemove = async (symbol: string) => {
        if (!window.confirm(`Remove ${symbol} from watchlist?`)) return;
    try {
      await watchlistService.removeStock(symbol);
        toast.success(`Removed ${symbol}`);
        await refresh();
    } catch {
        toast.error(`Failed to remove ${symbol}`);
    }
  };

    const handleToggle = async (symbol: string, currentlyActive: boolean) => {
    try {
        if (currentlyActive) {
        await watchlistService.deactivateStock(symbol);
            toast.success(`Paused ${symbol}`);
      } else {
        await watchlistService.activateStock(symbol);
            toast.success(`Activated ${symbol}`);
      }
        await refresh();
    } catch {
        toast.error(`Failed to update ${symbol}`);
    }
  };

    const handleFetch = async (symbol: string) => {
    try {
      await watchlistService.fetchStock(symbol);
        toast.success(`Refreshed ${symbol}`);
        await refresh();
    } catch {
        toast.error(`Failed to refresh ${symbol}`);
    }
  };

  return (
      <div className="space-y-6">
          <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Watchlist</h1>
              <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
                  Track tickers and refresh their fundamental data on demand.
              </p>
          </div>

          <Card>
              <CardHeader>
                  <CardTitle className="text-base">Add a ticker</CardTitle>
                  <CardDescription>The symbol will be resolved against your data provider.</CardDescription>
              </CardHeader>
              <CardContent>
                  <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleAdd}>
                      <Input
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL"
              className="sm:max-w-xs font-mono"
              disabled={adding}
              aria-label="Stock symbol"
            />
                      <Button type="submit" disabled={adding || !newSymbol.trim()}>
                          <Plus className="h-4 w-4"/>
                          {adding ? 'Adding…' : 'Add to watchlist'}
                      </Button>
                  </form>
              </CardContent>
          </Card>

          {loading ? (
              <div className="space-y-2">
                  <Skeleton className="h-12 w-full"/>
                  <Skeleton className="h-12 w-full"/>
                  <Skeleton className="h-12 w-full"/>
              </div>
          ) : stocks.length === 0 ? (
              <EmptyState
                  icon={<Star/>}
                  title="Your watchlist is empty"
                  description="Add a ticker above or press ⌘K to look one up."
              />
          ) : (
              <Card className="overflow-hidden">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead className="w-28">Symbol</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead className="w-28">Status</TableHead>
                              <TableHead className="w-44">Last update</TableHead>
                              <TableHead className="w-12 text-right"/>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
              {stocks.map((stock) => (
                  <TableRow
                  key={stock.symbol}
                  className={!stock.active ? 'opacity-60' : ''}
                >
                      <TableCell>
                          <Link
                              to={`/analysis/${encodeURIComponent(stock.symbol)}`}
                              className="group inline-flex items-center gap-1.5 font-mono font-semibold text-[color:var(--color-fg)] hover:text-[color:var(--color-brand-cyan)]"
                    >
                              {stock.symbol}
                              <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"/>
                          </Link>
                      </TableCell>
                      <TableCell className="text-[color:var(--color-fg-muted)]">
                          {stock.name || '—'}
                      </TableCell>
                      <TableCell>
                          <Badge variant={stock.active ? 'success' : 'secondary'}>
                              {stock.active ? 'Active' : 'Paused'}
                          </Badge>
                      </TableCell>
                      <TableCell className="text-[color:var(--color-fg-muted)] text-xs font-mono">
                          {formatDate(stock.lastFetchedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                                      <MoreHorizontal className="h-4 w-4"/>
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => handleFetch(stock.symbol)}>
                                      <RefreshCw/>
                                      Refresh data
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => setNewsSymbol(stock.symbol)}>
                                      <Newspaper/>
                                      News &amp; sources
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                      onSelect={() => handleToggle(stock.symbol, stock.active)}
                                  >
                                      {stock.active ? <Pause/> : <Play/>}
                                      {stock.active ? 'Pause tracking' : 'Resume tracking'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator/>
                                  <DropdownMenuItem
                                      onSelect={() => handleRemove(stock.symbol)}
                                      className="text-[color:var(--color-danger)] focus:text-[color:var(--color-danger)]"
                                  >
                                      <Trash2/>
                                      Remove
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                  </TableRow>
              ))}
                      </TableBody>
                  </Table>
              </Card>
          )}

          <NewsSourcesSheet
              symbol={newsSymbol ?? ''}
              open={!!newsSymbol}
              onOpenChange={(o) => {
                  if (!o) setNewsSymbol(null);
              }}
          />
    </div>
  );
}
