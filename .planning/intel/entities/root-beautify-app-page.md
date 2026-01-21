---
path: /root/Beautify/app/page.tsx
type: component
updated: 2026-01-21
status: active
---

# page.tsx

## Purpose

Main landing page component for the Beautify application. Renders the app layout with header, upload zone for image transformation, and footer.

## Exports

- `default` / `Home` - Main page component that displays the upload interface for photo transformation

## Dependencies

- [[theme-toggle]] - Theme switching UI component
- [[upload-zone]] - Drag-and-drop file upload component

## Used By

TBD

## Notes

- Uses "use client" directive for client-side interactivity
- `handleFileAccepted` currently only logs file info to console (temporary implementation)
- Layout uses flexbox for full-height responsive design