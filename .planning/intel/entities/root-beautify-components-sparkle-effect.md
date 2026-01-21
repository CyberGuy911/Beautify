---
path: /root/Beautify/components/sparkle-effect.tsx
type: component
updated: 2026-01-21
status: active
---

# sparkle-effect.tsx

## Purpose

A decorative React component that renders animated sparkle/star effects as an overlay. Used to add visual feedback or celebratory effects when activated (e.g., after image transformation completes).

## Exports

- **SparkleEffect**: React component that displays 30 randomly positioned, animated gold star SVGs when `active` prop is true

## Dependencies

- react (useEffect, useState)

## Used By

TBD

## Notes

- Uses CSS animation class `animate-sparkle` which must be defined in global styles or Tailwind config
- Sparkles are absolutely positioned with `pointer-events-none` to avoid blocking interactions
- Each sparkle has randomized position (0-100%), size (5-12px), delay (0-0.5s), and duration (1-2s)