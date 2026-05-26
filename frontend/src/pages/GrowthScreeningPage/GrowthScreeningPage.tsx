import * as React from 'react';
import {useSearchParams} from 'react-router-dom';
import {RotateCcw, TrendingUp, Filter} from 'lucide-react';
import {growthScreeningService} from '@/api/growthScreeningService';
import {GrowthCategory, GrowthScreeningResult} from '@/types/GrowthScreening';
import GrowthStockCard from '@/components/GrowthStockCard/GrowthStockCard';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {EmptyState} from '@/components/ui/empty-state';
import {cn} from '@/lib/utils';

interface Filters {
    minScore: number;
    minRevenueGrowth: string;
    minEarningsGrowth: string;
    maxPeRatio: string;
}

const DEFAULTS: Filters = {
    minScore: 60,
    minRevenueGrowth: '',
    minEarningsGrowth: '',
    maxPeRatio: '',
};

function readFilters(params: URLSearchParams): Filters {
    return {
        minScore: Number(params.get('minScore') ?? DEFAULTS.minScore),
        minRevenueGrowth: params.get('minRevenueGrowth') ?? '',
        minEarningsGrowth: params.get('minEarningsGrowth') ?? '',
        maxPeRatio: params.get('maxPeRatio') ?? '',
    };
}

function useDebouncedValue<T>(value: T, delayMs = 350): T {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(id);
    }, [value, delayMs]);
    return debounced;
}

export default function GrowthScreeningPage() {
    const [params, setParams] = useSearchParams();
    const filters = React.useMemo(() => readFilters(params), [params]);
    const debounced = useDebouncedValue(filters, 350);

    const [result, setResult] = React.useState<GrowthScreeningResult | null>(null);
    const [loading, setLoading] = React.useState(true);

    const update = (patch: Partial<Filters>) => {
        const next = {...filters, ...patch};
        const out = new URLSearchParams();
        if (next.minScore !== DEFAULTS.minScore) out.set('minScore', String(next.minScore));
        if (next.minRevenueGrowth) out.set('minRevenueGrowth', next.minRevenueGrowth);
        if (next.minEarningsGrowth) out.set('minEarningsGrowth', next.minEarningsGrowth);
        if (next.maxPeRatio) out.set('maxPeRatio', next.maxPeRatio);
        setParams(out, {replace: true});
    };

    const reset = () => setParams(new URLSearchParams(), {replace: true});

    React.useEffect(() => {
        let cancelled = false;
    setLoading(true);
        const apiParams: Record<string, number> = {minScore: debounced.minScore};
        if (debounced.minRevenueGrowth) apiParams.minRevenueGrowth = parseFloat(debounced.minRevenueGrowth) / 100;
        if (debounced.minEarningsGrowth) apiParams.minEarningsGrowth = parseFloat(debounced.minEarningsGrowth) / 100;
        if (debounced.maxPeRatio) apiParams.maxPeRatio = parseFloat(debounced.maxPeRatio);

        growthScreeningService
            .screenAllStocks(apiParams)
            .then((data) => {
                if (!cancelled) setResult(data);
            })
            .catch((err) => {
                console.error(err);
                if (!cancelled) setResult(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [debounced]);

    const stats = React.useMemo(() => {
    if (!result) return { high: 0, strong: 0, moderate: 0 };
        const s = result.topGrowthStocks;
    return {
        high: s.filter((x) => x.growthCategory === GrowthCategory.HIGH_GROWTH).length,
        strong: s.filter((x) => x.growthCategory === GrowthCategory.STRONG_GROWTH).length,
        moderate: s.filter((x) => x.growthCategory === GrowthCategory.MODERATE_GROWTH).length,
    };
    }, [result]);

  return (
      <div className="space-y-6">
          <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Growth Screening</h1>
              <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
                  Multi-factor fundamental screen for revenue, earnings, and margin growth.
              </p>
          </div>

          <Card>
              <CardHeader className="flex-row items-center justify-between gap-3 pb-2 sm:items-end">
                  <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-[color:var(--color-fg-muted)]"/>
                      <CardTitle className="text-base">Filters</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={reset}>
                      <RotateCcw className="h-3.5 w-3.5"/>
                      Reset
                  </Button>
              </CardHeader>
              <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1.5">
                          <Label htmlFor="minScore">Min score</Label>
                          <Input
                              id="minScore"
                              type="number"
                              min={0}
                              max={100}
                              value={filters.minScore}
                              onChange={(e) =>
                                  update({minScore: Number(e.target.value) || 0})
                              }
                          />
                      </div>
                      <div className="space-y-1.5">
                          <Label htmlFor="minRev">Min revenue growth (%)</Label>
                          <Input
                              id="minRev"
                              type="number"
                              placeholder="e.g. 15"
                              value={filters.minRevenueGrowth}
                              onChange={(e) => update({minRevenueGrowth: e.target.value})}
                          />
                      </div>
                      <div className="space-y-1.5">
                          <Label htmlFor="minEarn">Min earnings growth (%)</Label>
                          <Input
                              id="minEarn"
                              type="number"
                              placeholder="e.g. 20"
                              value={filters.minEarningsGrowth}
                              onChange={(e) => update({minEarningsGrowth: e.target.value})}
                          />
                      </div>
                      <div className="space-y-1.5">
                          <Label htmlFor="maxPe">Max P/E ratio</Label>
                          <Input
                              id="maxPe"
                              type="number"
                              placeholder="e.g. 35"
                              value={filters.maxPeRatio}
                              onChange={(e) => update({maxPeRatio: e.target.value})}
                          />
                      </div>
                  </div>
                  <p className="mt-3 text-xs text-[color:var(--color-fg-subtle)]">
                      Filters apply automatically. URL keeps your state so it's shareable.
                  </p>
              </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Total analyzed" value={result?.totalAnalyzed ?? '—'} loading={loading}/>
              <Stat
                  label="Results found"
                  value={result?.resultsCount ?? '—'}
                  loading={loading}
                  accent="gradient"
              />
              <Stat label="High growth" value={stats.high} loading={loading} accent="success"/>
              <Stat label="Strong growth" value={stats.strong} loading={loading} accent="info"/>
      </div>

          <section>
              <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Candidates</h2>
          {result && (
              <span className="text-xs text-[color:var(--color-fg-muted)]">
              Showing {result.resultsCount} of {result.totalAnalyzed}
            </span>
          )}
        </div>

              {loading ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {Array.from({length: 6}).map((_, i) => (
                          <Skeleton key={i} className="h-64 w-full"/>
                      ))}
          </div>
              ) : !result || result.topGrowthStocks.length === 0 ? (
                  <EmptyState
                      icon={<TrendingUp/>}
                      title="No matches"
                      description="Try lowering the minimum score or growth thresholds."
                      action={
                          <Button variant="secondary" onClick={reset}>
                              Reset filters
                          </Button>
                      }
                  />
              ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.topGrowthStocks.map((stock) => (
              <GrowthStockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        )}
          </section>
      </div>
  );
}

function Stat({
                  label,
                  value,
                  loading,
                  accent,
              }: {
    label: string;
    value: React.ReactNode;
    loading?: boolean;
    accent?: 'gradient' | 'success' | 'info';
}) {
    const accentClass = {
        gradient: 'bg-[image:var(--gradient-brand)] bg-clip-text text-transparent',
        success: 'text-[color:var(--color-success)]',
        info: 'text-[color:var(--color-brand-cyan)]',
    }[accent ?? 'gradient' as never];

    return (
        <Card>
            <CardContent className="p-4 pt-4">
                <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                    {label}
                </div>
                {loading ? (
                    <Skeleton className="mt-1 h-9 w-20"/>
                ) : (
                    <div
                        className={cn(
                            'mt-1 font-mono text-3xl font-bold tabular-nums leading-tight',
                            accent ? accentClass : 'text-[color:var(--color-fg)]'
                        )}
                    >
                        {value}
                    </div>
                )}
            </CardContent>
        </Card>
  );
}
