---
path: /root/Beautify/lib/image-validation.ts
type: util
updated: 2026-01-21
status: active
---

# image-validation.ts

## Purpose

Provides utilities for validating and measuring base64-encoded images. Enforces Vercel's 4.5MB payload limit and safely decodes base64 data to buffers.

## Exports

- `calculateBase64Size(base64String)` - Calculates the actual byte size of a base64-encoded string, accounting for data URL prefixes and padding
- `validateBase64Image(base64String)` - Validates a base64 image string, returning the decoded buffer and size if valid, or an error if invalid or too large

## Dependencies

None

## Used By

TBD

## Notes

- Handles both raw base64 and data URL prefixed strings (e.g., `data:image/png;base64,...`)
- Size limit hardcoded to 4.5MB to comply with Vercel serverless function payload limits
- Returns buffer directly for downstream processing without re-decoding