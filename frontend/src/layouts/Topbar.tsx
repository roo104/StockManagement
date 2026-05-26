import * as React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Menu, Search, Command as CommandIcon} from 'lucide-react';
import {useSidebar} from '@/hooks/useSidebar';
import {cn} from '@/lib/utils';

const ROUTE_LABELS: Record<string, string> = {
    '': 'Dashboard',
    analysis: 'Analysis',
    watchlist: 'Watchlist',
    screening: 'Growth Screening',
    ipo: 'IPO Calendar',
    overview: 'Overview',
    financials: 'Financials',
    valuation: 'Valuation',
    historical: 'Historical',
    chart: 'Chart',
};

function labelFor(segment: string) {
    return ROUTE_LABELS[segment] ?? segment.toUpperCase();
}

interface TopbarProps {
    onOpenCommand?: () => void;
}

export function Topbar({onOpenCommand}: TopbarProps) {
    const {setMobileOpen} = useSidebar();
    const {pathname} = useLocation();
    const segments = pathname.split('/').filter(Boolean);

    const crumbs = [{href: '/', label: 'Dashboard'}];
    let acc = '';
    for (const seg of segments) {
        acc += `/${seg}`;
        crumbs.push({href: acc, label: labelFor(seg)});
    }

    const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[color:var(--color-border-soft)] bg-[color:var(--color-bg)]/85 px-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="md:hidden flex h-9 w-9 items-center justify-center rounded-md text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-hover)]"
                    aria-label="Open menu"
                >
                    <Menu className="h-5 w-5"/>
                </button>

                <nav className="hidden md:flex items-center gap-1.5 text-sm">
                    {crumbs.map((crumb, i) => {
                        const isLast = i === crumbs.length - 1;
                        return (
                            <React.Fragment key={crumb.href}>
                                {i > 0 && (
                                    <span className="text-[color:var(--color-fg-subtle)]">/</span>
                                )}
                                {isLast ? (
                                    <span className="font-medium text-[color:var(--color-fg)]">
                    {crumb.label}
                  </span>
                                ) : (
                                    <Link
                                        to={crumb.href}
                                        className="text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                )}
                            </React.Fragment>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onOpenCommand}
                    className={cn(
                        'group flex items-center gap-2 rounded-md border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-input)] px-3 py-1.5 text-sm text-[color:var(--color-fg-muted)] transition-colors',
                        'hover:border-[color:var(--color-border)] hover:text-[color:var(--color-fg)]'
                    )}
                >
                    <Search className="h-4 w-4"/>
                    <span className="hidden sm:inline">Search ticker or page…</span>
                    <kbd
                        className="ml-2 hidden sm:inline-flex items-center gap-0.5 rounded border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-2)] px-1.5 py-0.5 text-[10px] font-mono text-[color:var(--color-fg-subtle)]">
                        {isMac ? <CommandIcon className="h-3 w-3"/> : 'Ctrl'} K
                    </kbd>
                </button>
            </div>
        </header>
    );
}
