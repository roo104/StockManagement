# Theming Guide

The frontend is dark-only and uses **Tailwind v4** with a CSS-first `@theme` block declared in `src/index.css`. All design tokens live in that one file.

## Where the tokens live

`src/index.css` → `@theme { … }` block. Every token is a CSS variable and is exposed as a Tailwind utility (`bg-bg`, `text-fg`, `border-border`, etc.) and as raw CSS for inline `style={{}}` use.

Categories:

- **Brand:** `--color-brand-purple`, `--color-brand-cyan`, `--color-brand-yellow`, `--color-brand-blue`, plus `--gradient-brand` (purple → cyan).
- **Surfaces:** `--color-bg` (page), `--color-surface` (containers), `--color-surface-2/3` (cards, hover), `--color-surface-input`.
- **Text:** `--color-fg` (primary), `--color-fg-muted`, `--color-fg-subtle`, `--color-fg-faint`.
- **Borders:** `--color-border`, `--color-border-soft`, `--color-border-strong`.
- **Semantic:** `--color-success`, `--color-danger`, `--color-warning`, `--color-info`, `--color-ring`.
- **Typography:** `--font-sans` (Inter), `--font-mono` (JetBrains Mono).
- **Radius:** `--radius-{xs,sm,md,lg,xl,2xl}`.
- **Shadows:** `--shadow-{sm,md,lg,glow,glow-cyan}`.

## How to consume them in components

```tsx
// Prefer the shadcn-style primitives in src/components/ui/
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Need a raw token? Use the `var(--color-…)` form inside an arbitrary class.
<div className="bg-[color:var(--color-surface)] text-[color:var(--color-fg)]">…</div>
```

## Adding a new color

1. Add the token to the `@theme` block in `src/index.css`.
2. Use it via the auto-generated Tailwind utility, e.g. `bg-brand-purple`, or as `var(--color-brand-purple)`.

## Charts

`src/lib/chart-theme.ts` resolves chart colors from the same CSS variables at runtime via `getComputedStyle`. Use `getChartTheme()` from any chart component to keep visuals consistent with the rest of
the UI.

## Don't

- **Don't hardcode hex values** in component files. Run `rg "#[0-9a-fA-F]{3,6}" src/` periodically — the only legitimate matches are in `src/index.css`, `src/lib/chart-theme.ts`, and small inline rgba
  glows.
- **Don't create per-page `.css` files.** Use Tailwind utilities and the primitives in `src/components/ui/`.
