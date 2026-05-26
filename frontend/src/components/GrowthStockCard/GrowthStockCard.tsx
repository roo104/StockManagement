import {Link} from 'react-router-dom';
import {TrendingUp, TrendingDown, ArrowRight} from 'lucide-react';
import {GrowthCategory, GrowthStockScore} from '@/types/GrowthScreening';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {cn} from '@/lib/utils';

interface GrowthStockCardProps {
  stock: GrowthStockScore;
}

function scoreColor(score: number): string {
    if (score >= 80) return 'text-[color:var(--color-success)]';
    if (score >= 60) return 'text-[color:var(--color-brand-cyan)]';
    if (score >= 40) return 'text-[color:var(--color-warning)]';
    return 'text-[color:var(--color-danger)]';
}

function categoryVariant(category: GrowthCategory) {
    switch (category) {
        case GrowthCategory.HIGH_GROWTH:
            return 'success' as const;
        case GrowthCategory.STRONG_GROWTH:
            return 'info' as const;
        case GrowthCategory.MODERATE_GROWTH:
            return 'warning' as const;
        default:
            return 'secondary' as const;
    }
}

function categoryLabel(category: GrowthCategory): string {
    return category
        .toString()
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/(^|\s)\w/g, (m) => m.toUpperCase());
}

function fmtPct(value: number | null, decimals = 1): string {
    if (value === null || value === undefined) return '—';
    return `${(value * 100).toFixed(decimals)}%`;
}

function fmtNum(value: number | null, decimals = 2): string {
    if (value === null || value === undefined) return '—';
    return value.toFixed(decimals);
}

function fmtMarketCap(value: number | null): string {
    if (value === null || value === undefined) return '—';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
}

function deltaClass(value: number | null): string {
    if (value === null || value === undefined) return 'text-[color:var(--color-fg)]';
    return value > 0
        ? 'text-[color:var(--color-success)]'
        : 'text-[color:var(--color-danger)]';
}

const SCORE_FIELDS: Array<[string, keyof GrowthStockScore]> = [
    ['Revenue', 'revenueGrowthScore'],
    ['Earnings', 'earningsGrowthScore'],
    ['Cash Flow', 'cashFlowScore'],
    ['Profit', 'profitabilityScore'],
    ['Efficiency', 'efficiencyScore'],
];

export default function GrowthStockCard({stock}: GrowthStockCardProps) {
  return (
      <Card className="group flex flex-col">
          <CardHeader className="gap-3">
              <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                      <Link
                          to={`/analysis/${encodeURIComponent(stock.symbol)}`}
                          className="inline-flex items-center gap-1.5 font-mono text-lg font-semibold tracking-tight text-[color:var(--color-fg)] hover:text-[color:var(--color-brand-cyan)]"
                      >
                          {stock.symbol}
                          <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"/>
                      </Link>
                      {(stock.name || stock.sector) && (
                          <p className="truncate text-xs text-[color:var(--color-fg-muted)]">
                              {stock.name}
                              {stock.name && stock.sector ? ' · ' : ''}
                              {stock.sector}
                          </p>
                      )}
                      <Badge variant={categoryVariant(stock.growthCategory)}>
                          {categoryLabel(stock.growthCategory)}
                      </Badge>
          </div>
                  <div className="text-right shrink-0">
                      <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                          Score
                      </div>
                      <div
                          className={cn(
                              'font-mono text-3xl font-bold tabular-nums leading-none',
                              scoreColor(stock.overallScore)
                          )}
                      >
                          {stock.overallScore}
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-5 gap-1.5 rounded-md border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-3)]/40 p-2">
                  {SCORE_FIELDS.map(([label, key]) => {
                      const value = stock[key] as number;
                      return (
                          <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                  {label}
                </span>
                              <span className={cn('font-mono text-sm font-semibold tabular-nums', scoreColor(value))}>
                  {value}
                </span>
                          </div>
                      );
                  })}
        </div>
          </CardHeader>

          <CardContent className="space-y-3">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <Metric label="Revenue Growth" value={fmtPct(stock.growthMetrics.revenueGrowthRate)} valueClass={deltaClass(stock.growthMetrics.revenueGrowthRate)}/>
                  <Metric label="Earnings Growth" value={fmtPct(stock.growthMetrics.earningsGrowthRate)} valueClass={deltaClass(stock.growthMetrics.earningsGrowthRate)}/>
                  <Metric label="FCF Growth" value={fmtPct(stock.growthMetrics.freeCashFlowGrowthRate)} valueClass={deltaClass(stock.growthMetrics.freeCashFlowGrowthRate)}/>
                  <Metric
                      label="Gross Margin"
                      value={fmtPct(stock.growthMetrics.grossMargin)}
                      trailing={
                          stock.growthMetrics.grossMarginTrend === 'IMPROVING' ? (
                              <TrendingUp className="h-3 w-3 text-[color:var(--color-success)]"/>
                          ) : stock.growthMetrics.grossMarginTrend === 'DECLINING' ? (
                              <TrendingDown className="h-3 w-3 text-[color:var(--color-danger)]"/>
                          ) : null
                      }
                  />
                  <Metric label="P/E Ratio" value={fmtNum(stock.peRatio)}/>
                  <Metric label="PEG Ratio" value={fmtNum(stock.pegRatio)}/>
                  <Metric label="ROE" value={fmtPct(stock.roe)}/>
                  <Metric label="Market Cap" value={fmtMarketCap(stock.marketCap)}/>
              </dl>

              {stock.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                      {stock.flags.map((flag, i) => (
                          <Badge key={i} variant="outline" className="font-normal">
                              {flag}
                          </Badge>
                      ))}
                  </div>
              )}
          </CardContent>
      </Card>
  );
}

function Metric({
                    label,
                    value,
                    valueClass,
                    trailing,
                }: {
    label: string;
    value: string;
    valueClass?: string;
    trailing?: React.ReactNode;
}) {
    return (
        <div className="flex items-baseline justify-between gap-2">
            <dt className="text-xs text-[color:var(--color-fg-muted)]">{label}</dt>
            <dd className={cn('font-mono text-sm font-semibold tabular-nums inline-flex items-center gap-1', valueClass ?? 'text-[color:var(--color-fg)]')}>
                {value}
                {trailing}
            </dd>
    </div>
  );
}
