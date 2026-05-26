const KEY = 'app.recent.symbols';
const MAX = 8;

export function readRecentSymbols(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
    } catch {
        return [];
    }
}

export function pushRecentSymbol(symbol: string): string[] {
    const upper = symbol.trim().toUpperCase();
    if (!upper) return readRecentSymbols();
    const current = readRecentSymbols().filter((s) => s !== upper);
    const next = [upper, ...current].slice(0, MAX);
    try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        // Ignore storage errors.
    }
    return next;
}
