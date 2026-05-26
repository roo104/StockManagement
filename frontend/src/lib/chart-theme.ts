/**
 * Resolves chart colors from the design tokens declared in src/index.css.
 * Re-read on each call so a future light/dark toggle is picked up.
 */

function cssVar(name: string, fallback: string): string {
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
}

export function getChartTheme() {
    return {
        text: cssVar('--color-fg', '#e0e0e0'),
        textMuted: cssVar('--color-fg-muted', '#b0b0b0'),
        grid: cssVar('--color-border-soft', 'rgba(82,82,89,0.32)'),
        line: cssVar('--color-brand-cyan', '#41d1ff'),
        success: cssVar('--color-success', '#3dd68c'),
        danger: cssVar('--color-danger', '#f43f5e'),
    };
}
