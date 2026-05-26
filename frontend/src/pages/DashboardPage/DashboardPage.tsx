import {Link} from 'react-router-dom';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {ArrowRight} from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          <span className="bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
            Stock Analysis
          </span>
                </h1>
                <p className="max-w-2xl text-[color:var(--color-fg-muted)]">
                    Fundamental analysis, growth screening, and IPO tracking — all in one
                    place. Press <kbd className="rounded border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-2)] px-1.5 py-0.5 text-xs font-mono">⌘K</kbd> to search a ticker.
                </p>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                    {to: '/analysis', title: 'Fundamental analysis', desc: 'Income, balance sheet, valuation, and historical price data for any ticker.'},
                    {to: '/watchlist', title: 'Watchlist', desc: 'Track your active tickers and refresh data on demand.'},
                    {to: '/screening', title: 'Growth screening', desc: 'Score and filter stocks on revenue, earnings, and margin growth.'},
                    {to: '/ipo', title: 'IPO calendar', desc: 'Upcoming IPOs grouped by date with exchange and price range.'},
                ].map((entry) => (
                    <Card key={entry.to} className="group">
                        <Link to={entry.to} className="block h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    {entry.title}
                                    <ArrowRight
                                        className="h-4 w-4 text-[color:var(--color-fg-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--color-brand-cyan)]"/>
                                </CardTitle>
                                <CardDescription>{entry.desc}</CardDescription>
                            </CardHeader>
                            <CardContent>
                <span className="text-xs uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
                  Open →
                </span>
                            </CardContent>
                        </Link>
                    </Card>
                ))}
            </div>
        </div>
    );
}
