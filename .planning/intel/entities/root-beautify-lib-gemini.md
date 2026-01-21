---
path: /root/Beautify/lib/gemini.ts
type: service
updated: 2026-01-21
status: active
---

# gemini.ts

## Purpose

Provides image transformation functionality using the Google Gemini API. Handles API communication with exponential backoff retry logic for rate limiting and transient errors.

## Exports

- `TransformResult` - Interface defining the result shape with success status, optional transformed image, and optional error message
- `transformImage` - Async function that sends a base64 image to Gemini API for transformation, returning transformed image or error

## Dependencies

- `@google/genai` - Google Generative AI SDK for Gemini API access
- `server-only` - Ensures this module only runs on the server
- [[root-beautify-lib-data]] - `getGeminiApiKey` for API key retrieval
- `@/lib/prompt-engineering` - `generateMysticalPrompt` for prompt generation

## Used By

TBD

## Notes

- Retry logic handles 429 (rate limit), 503, RESOURCE_EXHAUSTED, and UNAVAILABLE errors
- Uses exponential backoff with jitter (base 1s, max 60s, up to 5 retries)
- Maps technical errors to user-friendly messages for better UX