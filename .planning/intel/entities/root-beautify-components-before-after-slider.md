---
path: /root/Beautify/components/before-after-slider.tsx
type: component
updated: 2026-01-21
status: active
---

# before-after-slider.tsx

## Purpose

A comparison slider component that displays before/after images side-by-side with an interactive draggable handle. Used to showcase image transformation results by allowing users to visually compare the original and processed versions.

## Exports

- `BeforeAfterSlider` - React component accepting `beforeSrc` and `afterSrc` image URLs, renders an interactive comparison slider with custom gold-themed handle styling

## Dependencies

- `react-compare-slider` (external) - Provides ReactCompareSlider, ReactCompareSliderImage, and ReactCompareSliderHandle components

## Used By

TBD

## Notes

- Client component ("use client" directive)
- Handle styled with gold accent color (#d4af37) matching app theme
- Images use `objectFit: "contain"` to preserve aspect ratios
- Max height constrained to 60vh for viewport-friendly display