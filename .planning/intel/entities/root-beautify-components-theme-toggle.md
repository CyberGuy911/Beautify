---
path: /root/Beautify/components/theme-toggle.tsx
type: component
updated: 2026-01-21
status: active
---

# theme-toggle.tsx

## Purpose

A client-side theme toggle button component that switches between light and dark modes using next-themes. Renders Sun/Moon icons with animated transitions and hover effects while handling hydration mismatch by deferring render until mounted.

## Exports

- **ThemeToggle**: React component that renders a toggle button for switching between light/dark themes with animated icon transitions

## Dependencies

- lucide-react (Moon, Sun icons)
- next-themes (useTheme hook)
- react (useEffect, useState)

## Used By

TBD

## Notes

- Uses `mounted` state pattern to prevent hydration mismatch between server and client renders
- Returns invisible placeholder button while unmounted to prevent layout shift
- Icons use CSS transforms (rotate/scale) for smooth theme transition animations
- Has an incomplete `aria-label` attribute (empty template literal `{}`) that should be fixed