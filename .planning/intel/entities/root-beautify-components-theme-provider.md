---
path: /root/Beautify/components/theme-provider.tsx
type: component
updated: 2026-01-21
status: active
---

# theme-provider.tsx

## Purpose

Client-side wrapper component for next-themes that provides theme context (light/dark mode) to the application. Exists to mark the provider as a client component since next-themes requires client-side rendering.

## Exports

- `ThemeProvider` - React component that wraps NextThemesProvider, accepting the same props and passing them through along with children

## Dependencies

- next-themes (external) - provides the underlying NextThemesProvider for theme management

## Used By

TBD

## Notes

- Must be used with `"use client"` directive as next-themes requires client-side hydration
- Props are spread to NextThemesProvider, supporting all next-themes configuration options (attribute, defaultTheme, enableSystem, etc.)