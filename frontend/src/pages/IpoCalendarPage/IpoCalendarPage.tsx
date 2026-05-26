import * as React from 'react';
import {ChevronLeft, ChevronRight, RefreshCw, CalendarDays} from 'lucide-react';
import {
    IpoCalendar,
    IpoCalendarEntry,
    ipoCalendarService,
} from '@/api/ipoCalendarService';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {Skeleton} from '@/components/ui/skeleton';
import {EmptyState} from '@/components/ui/empty-state';
import {toast} from '@/components/ui/toaster';

function currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(value: string, delta: number): string {
    const [yearStr, monthStr] = value.split('-');
    const date = new Date(Number(yearStr), Number(monthStr) - 1 + delta, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(value: string): string {
    const [yearStr, monthStr] = value.split('-');
    const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
    return date.toLocaleDateString('en-US', {month: 'long', year: 'numeric'});
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatPrice(low: number | null, high: number | null, currency: string): string {
    if (low && high) return `${currency} ${low.toFixed(2)} – ${high.toFixed(2)}`;
    if (low) return `${currency} ${low.toFixed(2)}+`;
    return 'TBA';
}

export default function IpoCalendarPage() {
    const [month, setMonth] = React.useState<string>(() => currentMonth());
    const [calendar, setCalendar] = React.useState<IpoCalendar | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [exchange, setExchange] = React.useState<string>('all');

    const fetch = React.useCallback(async (m: string) => {
    setLoading(true);
    try {
        const data = await ipoCalendarService.getIpoCalendarForMonth(m);
      setCalendar(data);
    } catch (err) {
        console.error(err);
        toast.error('Failed to load IPO calendar');
        setCalendar(null);
    } finally {
      setLoading(false);
    }
    }, []);

    React.useEffect(() => {
        void fetch(month);
    }, [month, fetch]);

    const exchanges = React.useMemo(() => {
        const set = new Set<string>();
        calendar?.ipos.forEach((ipo) => {
            if (ipo.exchange) set.add(ipo.exchange);
    });
        return Array.from(set).sort();
    }, [calendar]);

    const filtered = React.useMemo(() => {
        if (!calendar) return [] as IpoCalendarEntry[];
        return exchange === 'all'
            ? calendar.ipos
            : calendar.ipos.filter((ipo) => ipo.exchange === exchange);
    }, [calendar, exchange]);

    const grouped = React.useMemo(() => {
        const map = new Map<string, IpoCalendarEntry[]>();
        for (const ipo of filtered) {
            const existing = map.get(ipo.ipoDate);
            if (existing) existing.push(ipo);
            else map.set(ipo.ipoDate, [ipo]);
        }
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [filtered]);

  return (
      <div className="space-y-6">
          <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">IPO Calendar</h1>
              <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
                  Upcoming and recent IPOs grouped by date.
              </p>
      </div>

          <Card>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                      <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setMonth((m) => shiftMonth(m, -1))}
                          aria-label="Previous month"
                      >
                          <ChevronLeft className="h-4 w-4"/>
                      </Button>
                      <div className="min-w-[10rem] text-center text-sm font-medium">
                          {formatMonth(month)}
            </div>
                      <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setMonth((m) => shiftMonth(m, 1))}
                          aria-label="Next month"
                      >
                          <ChevronRight className="h-4 w-4"/>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setMonth(currentMonth())}>
                          Today
                      </Button>
                  </div>
                  <div className="flex items-center gap-2">
                      {exchanges.length > 0 && (
                          <Select value={exchange} onValueChange={setExchange}>
                              <SelectTrigger className="w-40">
                                  <SelectValue placeholder="All exchanges"/>
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">All exchanges</SelectItem>
                                  {exchanges.map((ex) => (
                                      <SelectItem key={ex} value={ex}>
                                          {ex}
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      )}
                      <Button variant="secondary" onClick={() => fetch(month)}>
                          <RefreshCw className="h-4 w-4"/>
                          Refresh
                      </Button>
          </div>
              </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryCard label="Total IPOs" value={filtered.length} loading={loading}/>
              <SummaryCard label="Exchanges" value={exchanges.length} loading={loading}/>
              <SummaryCard label="Period" value={formatMonth(month)} loading={loading} small/>
              <SummaryCard
                  label="Filter"
                  value={exchange === 'all' ? 'All' : exchange}
                  loading={loading}
                  small
              />
          </div>

          {loading ? (
              <div className="space-y-4">
                  {Array.from({length: 3}).map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full"/>
                  ))}
              </div>
          ) : grouped.length === 0 ? (
              <EmptyState
                  icon={<CalendarDays/>}
                  title={`No IPOs in ${formatMonth(month)}`}
                  description="Try another month or remove the exchange filter."
              />
          ) : (
              <div className="space-y-6">
                  {grouped.map(([date, ipos]) => (
                      <section key={date} className="space-y-3">
                          <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                              {formatDate(date)}
                              <span className="ml-2 font-normal normal-case tracking-normal text-[color:var(--color-fg-muted)]">
                  · {ipos.length} {ipos.length === 1 ? 'listing' : 'listings'}
                </span>
                          </h2>
                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                              {ipos.map((ipo) => (
                                  <Card key={`${ipo.symbol}-${ipo.ipoDate}`}>
                                      <CardHeader className="gap-2">
                                          <div className="flex items-center justify-between gap-2">
                                              <CardTitle className="font-mono text-base">
                                                  {ipo.symbol}
                                              </CardTitle>
                                              {ipo.exchange && (
                                                  <Badge variant="outline">{ipo.exchange}</Badge>
                                              )}
                                          </div>
                                          <CardDescription className="line-clamp-2">{ipo.name}</CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                          <div className="flex items-center justify-between text-sm">
                                              <span className="text-[color:var(--color-fg-muted)]">Price range</span>
                                              <span
                                                  className={
                                                      ipo.priceRangeLow
                                                          ? 'font-mono font-semibold tabular-nums text-[color:var(--color-fg)]'
                                                          : 'text-[color:var(--color-fg-subtle)] italic'
                                                  }
                                              >
                          {formatPrice(ipo.priceRangeLow, ipo.priceRangeHigh, ipo.currency)}
                        </span>
                                          </div>
                                      </CardContent>
                                  </Card>
                              ))}
                          </div>
                      </section>
                  ))}
              </div>
          )}
      </div>
  );
}

function SummaryCard({
                         label,
                         value,
                         loading,
                         small,
                     }: {
    label: string;
    value: React.ReactNode;
    loading?: boolean;
    small?: boolean;
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                    {label}
                </div>
                {loading ? (
                    <Skeleton className="mt-1 h-8 w-24"/>
                ) : (
                    <div
                        className={
                            small
                                ? 'mt-1 text-sm font-semibold text-[color:var(--color-fg)]'
                                : 'mt-1 font-mono text-3xl font-bold tabular-nums leading-tight text-[color:var(--color-fg)]'
                        }
                    >
                        {value}
                    </div>
                )}
            </CardContent>
        </Card>
  );
}
