---
path: /root/Beautify/components/upload-zone.tsx
type: component
updated: 2026-01-21
status: active
---

# upload-zone.tsx

## Purpose

Main upload component that handles drag-and-drop/click-to-upload for images, displays preview, triggers AI transformation via the `/api/transform` endpoint, and shows before/after comparison with download capability.

## Exports

- `UploadZone` - React component with drag-drop zone, image preview, transform button, and before/after slider display

## Dependencies

- react (useCallback, useEffect, useRef, useState)
- lucide-react (Upload, Loader2, Download, RefreshCw, Sparkles icons)
- [[root-beautify-components-ui-button]] (@/components/ui/button)
- [[root-beautify-components-sparkle-effect]] (@/components/sparkle-effect)
- [[root-beautify-components-before-after-slider]] (@/components/before-after-slider)

## Used By

TBD

## Notes

- Accepts JPEG, PNG, and WebP images only (validated client-side)
- Uses FileReader API to create data URL previews
- Manages complex state machine: idle → loading → preview → transforming → result
- Includes sparkle animation effect on successful transformation
- Downloads transformed images with `_beautified` suffix appended to original filename