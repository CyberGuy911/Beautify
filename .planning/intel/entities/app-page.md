---
path: app/page.tsx
type: component
updated: 2026-01-21
status: active
---

# page.tsx

## Purpose

Main landing page for Beautify app. Displays header with branding and theme toggle, centered upload zone for image transformation flow, and footer with Gemini attribution.

## Exports

- `Home` (default) - Server component for main page layout

## Dependencies

- [[components-theme-toggle]] - Theme toggle button in header
- [[components-upload-zone]] - Upload zone component managing image upload/preview/download

## Used By

- Next.js routing (/) - Root page of the application

## Notes

- Clean minimal layout with flex column for header/main/footer structure
- Content area constrained to max-w-2xl for optimal image preview sizing
- UploadZone manages its own state, no callback needed at page level
- Responsive text sizing (text-3xl md:text-4xl) for heading
