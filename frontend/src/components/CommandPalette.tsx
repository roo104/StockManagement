import * as React from 'react';
import {useNavigate} from 'react-router-dom';
import {
    LayoutDashboard,
    LineChart,
    Star,
    TrendingUp,
    CalendarDays,
    CornerDownLeft,
    Clock,
} from 'lucide-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command';
import {useHotkey} from '@/hooks/useHotkey';
import {pushRecentSymbol, readRecentSymbols} from '@/lib/recent-symbols';

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const PAGES = [
    {to: '/', label: 'Dashboard', Icon: LayoutDashboard},
    {to: '/analysis', label: 'Analysis', Icon: LineChart},
    {to: '/watchlist', label: 'Watchlist', Icon: Star},
    {to: '/screening', label: 'Growth Screening', Icon: TrendingUp},
    {to: '/ipo', label: 'IPO Calendar', Icon: CalendarDays},
];

export function CommandPalette({open, onOpenChange}: CommandPaletteProps) {
    const navigate = useNavigate();
    const [query, setQuery] = React.useState('');
    const [recent, setRecent] = React.useState<string[]>(() => readRecentSymbols());

    useHotkey('mod+k', () => onOpenChange(!open));

    React.useEffect(() => {
        if (open) {
            setRecent(readRecentSymbols());
            setQuery('');
        }
    }, [open]);

    const closeAnd = (fn: () => void) => {
        onOpenChange(false);
        fn();
    };

    const goToSymbol = (symbol: string) => {
        const upper = symbol.trim().toUpperCase();
        if (!upper) return;
        pushRecentSymbol(upper);
        closeAnd(() => navigate(`/analysis/${encodeURIComponent(upper)}`));
    };

    const trimmed = query.trim();
    const looksLikeSymbol = /^[A-Za-z][A-Za-z0-9.\-]{0,9}$/.test(trimmed);

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput
                placeholder="Search a ticker or jump to a page…"
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                <CommandEmpty>No matches. Press Enter to jump to a ticker.</CommandEmpty>

                {looksLikeSymbol && (
                    <>
                        <CommandGroup heading="Jump to ticker">
                            <CommandItem
                                value={`__symbol__${trimmed}`}
                                onSelect={() => goToSymbol(trimmed)}
                            >
                                <LineChart className="text-[color:var(--color-brand-cyan)]"/>
                                <span>
                  Open <span className="font-mono font-semibold">{trimmed.toUpperCase()}</span>
                </span>
                                <CommandShortcut>
                                    <CornerDownLeft className="h-3 w-3 inline"/>
                                </CommandShortcut>
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator/>
                    </>
                )}

                {recent.length > 0 && (
                    <>
                        <CommandGroup heading="Recent">
                            {recent.map((sym) => (
                                <CommandItem
                                    key={`recent-${sym}`}
                                    value={`recent ${sym}`}
                                    onSelect={() => goToSymbol(sym)}
                                >
                                    <Clock className="text-[color:var(--color-fg-subtle)]"/>
                                    <span className="font-mono">{sym}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator/>
                    </>
                )}

                <CommandGroup heading="Pages">
                    {PAGES.map(({to, label, Icon}) => (
                        <CommandItem
                            key={to}
                            value={label}
                            onSelect={() => closeAnd(() => navigate(to))}
                        >
                            <Icon className="text-[color:var(--color-fg-muted)]"/>
                            <span>{label}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
