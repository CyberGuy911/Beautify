---
path: components/upload-zone.tsx
type: component
updated: 2026-01-21
status: active
---

# upload-zone.tsx

## Purpose

Full-viewport drag-and-drop upload zone with image preview, download, and reset functionality. Manages its own state for the complete upload-preview-download flow.

## Exports

- `UploadZone` - React component with optional `onFileAccepted` callback and `disabled` prop

## Dependencies

- `react` - useState, useCallback, useEffect, useRef
- `lucide-react` - Upload, Loader2, Download, RefreshCw icons
- [[components-ui-button]] - Button component with asChild for download anchor

## Used By

- [[app-page]] - Main page renders UploadZone for image upload flow

## Notes

- Uses document-level drag event listeners with drag counter pattern for reliable enter/leave tracking
- FileReader.readAsDataURL() generates preview data URLs
- Download uses anchor tag with download attribute and data URL href
- Three visual states: upload (default), loading (spinner), preview (image + actions)
- Full-viewport overlay appears on drag with backdrop blur
- Accepts JPEG, PNG, WebP only with validation error display
