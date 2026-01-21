---
path: /root/Beautify/app/api/transform/route.ts
type: api
updated: 2026-01-21
status: active
---

# route.ts

## Purpose

Next.js API route handler for image transformation requests. Accepts base64-encoded images, validates them, applies rate limiting, and uses Google Gemini AI to transform/beautify the images.

## Exports

- `maxDuration` - Timeout configuration (60 seconds) for Vercel serverless function
- `POST` - Async request handler for image transformation endpoint

## Dependencies

- `next/server` (NextRequest, NextResponse)
- [[root-beautify-lib-rate-limit]] - Rate limiting utility
- [[root-beautify-lib-image-validation]] - Base64 image validation
- [[root-beautify-lib-gemini]] - Gemini AI transformation service

## Used By

TBD

## Notes

- Rate limited to 5 requests per minute per IP address
- Extracts MIME type from data URL prefix, defaults to `image/jpeg`
- Uses `x-forwarded-for` or `x-real-ip` headers for client identification
- Returns structured JSON responses with `success` boolean and either `transformedImage` or `error`