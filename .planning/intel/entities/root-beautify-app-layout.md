---
path: /root/Beautify/app/layout.tsx
type: component
updated: 2026-01-21
status: active
---

# layout.tsx

## Purpose

Root layout component for the Next.js application that wraps all pages with font configuration and theme provider. Establishes the base HTML structure with dark theme as default and Geist font family for both sans-serif and monospace text.

## Exports

- `metadata` - Next.js Metadata object defining page title ("Beautify") and description for SEO
- `RootLayout` (default) - Root layout component that wraps children with ThemeProvider and applies font CSS variables

## Dependencies

- `next/font/google` - Geist and Geist_Mono font loaders
- [[theme-provider]] - ThemeProvider component for dark/light mode support
- `./globals.css` - Global stylesheet

## Used By

TBD

## Notes

- Uses `suppressHydrationWarning` on html element for theme provider compatibility
- Font CSS variables: `--font-geist-sans` and `--font-geist-mono`
- ThemeProvider configured with `attribute="class"` for class-based theme switching
- Body className appears to be empty/incomplete in current state