# Dark Theme Guide

This guide explains how to ensure consistent dark theme styling when creating new pages.

## Quick Start

When creating a new page component, follow these steps:

### 1. Import the Theme CSS

At the top of your component's CSS file, import the theme variables:

```css
@import '../../styles/theme.css';
```

### 2. Use CSS Variables

Instead of hardcoding colors, use the CSS variables defined in `theme.css`:

```css
/* ❌ DON'T DO THIS */
.my-component {
  background: white;
  color: #333;
}

/* ✅ DO THIS */
.my-component {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
```

## CSS Variables Reference

### Background Colors
- `--bg-primary: #1a1a1a` - Main app background
- `--bg-secondary: #2d2d2d` - Container backgrounds
- `--bg-tertiary: #3d3d3d` - Card/panel backgrounds
- `--bg-card: #2d2d2d` - Card backgrounds (darker variant)
- `--bg-input: #2d2d2d` - Input field backgrounds
- `--bg-hover: #3d3d3d` - Hover state backgrounds

### Text Colors
- `--text-primary: #f0f0f0` - Primary text (headings, important content)
- `--text-secondary: #b0b0b0` - Secondary text (labels, subtitles)
- `--text-tertiary: #888` - Tertiary text (hints, placeholders)
- `--text-muted: #666` - Muted text (disabled states)

### Border Colors
- `--border-primary: #4d4d4d` - Primary borders
- `--border-secondary: #555` - Secondary borders
- `--border-light: #333` - Light borders (dividers)

### Accent Colors
- `--accent-blue: #3498db` - Primary action color
- `--accent-blue-hover: #2980b9` - Primary action hover
- `--accent-green: #2ecc71` - Success/positive color
- `--accent-red: #e74c3c` - Error/negative color

### Shadows
- `--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3)` - Small shadow
- `--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.5)` - Medium shadow
- `--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.6)` - Large shadow

### Focus
- `--focus-ring: 0 0 0 3px rgba(52, 152, 219, 0.2)` - Focus ring for inputs

## Pre-built Component Classes

The theme file includes ready-to-use classes:

### Containers
```css
.page-container { /* Page wrapper with padding */ }
.card { /* Card-style container */ }
.card-dark { /* Darker card with border */ }
```

### Headers
```css
.page-header { /* Page header container */ }
.page-subtitle { /* Subtitle text */ }
```

### Buttons
```css
.btn-primary { /* Primary action button */ }
.btn-secondary { /* Secondary button */ }
```

### Inputs
```css
.input-dark { /* Dark themed input field */ }
```

### Tables
```css
.table-dark { /* Dark themed table */ }
```

### States
```css
.loading-dark { /* Loading state */ }
.empty-state-dark { /* Empty state message */ }
```

### Utilities
```css
.text-primary, .text-secondary, .text-muted
.bg-primary, .bg-secondary, .bg-tertiary
```

## Example: Creating a New Page

### Component CSS (NewPage.css)

```css
@import '../../styles/theme.css';

.new-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.content-card {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.info-text {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.action-button {
  padding: 0.5rem 1rem;
  background: var(--accent-blue);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button:hover {
  background: var(--accent-blue-hover);
}
```

### Component TSX (NewPage.tsx)

```tsx
import React from 'react';
import './NewPage.css';

const NewPage: React.FC = () => {
  return (
    <div className="new-page">
      <h1 className="page-title">My New Page</h1>

      <div className="content-card">
        <p className="info-text">This page uses the dark theme!</p>
        <button className="action-button">Click Me</button>
      </div>
    </div>
  );
};

export default NewPage;
```

## Color Palette Quick Reference

Use these colors for consistency:

**Backgrounds:** `#1a1a1a`, `#2d2d2d`, `#3d3d3d`
**Text:** `#f0f0f0`, `#b0b0b0`, `#888`
**Borders:** `#4d4d4d`, `#555`, `#333`
**Accent:** `#3498db` (blue), `#2ecc71` (green), `#e74c3c` (red)

## Checklist for New Pages

- [ ] Import `theme.css` at the top of your CSS file
- [ ] Use CSS variables instead of hardcoded colors
- [ ] Test hover states (should be lighter than base)
- [ ] Ensure text has sufficient contrast (use `--text-primary` for important content)
- [ ] Use consistent shadows (`--shadow-sm`, `--shadow-md`, `--shadow-lg`)
- [ ] Test focus states on interactive elements

## Tips

1. **Always use variables** - This makes theme updates easier in the future
2. **Follow the hierarchy** - Primary text for headings, secondary for labels, tertiary for hints
3. **Consistent spacing** - Use rem units for padding/margins (typically 1rem, 1.5rem, 2rem)
4. **Hover feedback** - Interactive elements should have visible hover states
5. **Shadows for depth** - Use shadows to create visual hierarchy

## Common Patterns

### Card with Header
```css
.my-card {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.my-card-header {
  color: var(--text-primary);
  border-bottom: 2px solid var(--accent-blue);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
```

### Input Group
```css
.input-group label {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  display: block;
}

.input-group input {
  background: var(--bg-input);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
  border-radius: 4px;
  padding: 0.5rem;
}

.input-group input:focus {
  border-color: var(--accent-blue);
  box-shadow: var(--focus-ring);
  outline: none;
}
```

### List/Grid Items
```css
.item-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--accent-blue);
}
```
