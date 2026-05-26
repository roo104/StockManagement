import * as React from 'react';
import {NavLink} from 'react-router-dom';
import {
    LayoutDashboard,
    LineChart,
    Star,
    TrendingUp,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    Newspaper,
} from 'lucide-react';
import {useSidebar} from '@/hooks/useSidebar';
import {cn} from '@/lib/utils';
import {Tooltip, TooltipContent, TooltipTrigger, TooltipProvider} from '@/components/ui/tooltip';

interface NavItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
    {to: '/', label: 'Dashboard', icon: LayoutDashboard},
    {to: '/analysis', label: 'Analysis', icon: LineChart},
    {to: '/watchlist', label: 'Watchlist', icon: Star},
    {to: '/news', label: 'News', icon: Newspaper},
    {to: '/screening', label: 'Growth Screening', icon: TrendingUp},
    {to: '/ipo', label: 'IPO Calendar', icon: CalendarDays},
];

export function SidebarContents({onNavigate}: { onNavigate?: () => void }) {
    const {collapsed, toggle} = useSidebar();

    return (
        <div className="flex h-full flex-col">
            <div
                className={cn(
                    'flex h-14 items-center border-b border-[color:var(--color-border-soft)]',
                    collapsed ? 'justify-center px-2' : 'justify-between px-4'
                )}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[image:var(--gradient-brand)] text-white font-bold shadow-md">
                        S
                    </div>
                    {!collapsed && (
                        <span className="text-sm font-semibold tracking-tight bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
              Stock Analysis
            </span>
                    )}
                </div>
                {!collapsed && (
                    <button
                        type="button"
                        onClick={toggle}
                        className="hidden md:flex h-7 w-7 items-center justify-center rounded-md text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-hover)]"
                        aria-label="Collapse sidebar"
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </button>
                )}
            </div>

            <nav className="flex-1 space-y-0.5 p-2">
                <TooltipProvider delayDuration={150}>
                    {NAV.map(({to, label, icon: Icon}) => (
                        <Tooltip key={to} disableHoverableContent>
                            <TooltipTrigger asChild>
                                <NavLink
                                    to={to}
                                    end={to === '/'}
                                    onClick={onNavigate}
                                    className={({isActive}) =>
                                        cn(
                                            'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                            collapsed && 'justify-center px-2',
                                            isActive
                                                ? 'bg-[color:var(--color-surface-hover)] text-[color:var(--color-fg)]'
                                                : 'text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface-hover)]/60'
                                        )
                                    }
                                >
                                    <Icon className="h-4 w-4 shrink-0"/>
                                    {!collapsed && <span className="truncate">{label}</span>}
                                </NavLink>
                            </TooltipTrigger>
                            {collapsed && (
                                <TooltipContent side="right" sideOffset={8}>
                                    {label}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </nav>

            <div className="border-t border-[color:var(--color-border-soft)] p-2">
                {collapsed ? (
                    <button
                        type="button"
                        onClick={toggle}
                        className="hidden md:flex h-9 w-full items-center justify-center rounded-md text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-surface-hover)]"
                        aria-label="Expand sidebar"
                    >
                        <ChevronRight className="h-4 w-4"/>
                    </button>
                ) : (
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface-hover)]/60"
                    >
                        <HelpCircle className="h-4 w-4"/>
                        <span>Help & docs</span>
                    </a>
                )}
            </div>
        </div>
    );
}
