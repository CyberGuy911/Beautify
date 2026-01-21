---
path: /root/Beautify/lib/data.ts
type: util
updated: 2026-01-21
status: active
---

# data.ts

## Purpose

Server-only utility for managing environment variables and API key access. Enforces that sensitive credentials like the Gemini API key can only be accessed from Server Components or API Routes.

## Exports

- `getGeminiApiKey()`: Retrieves GEMINI_API_KEY from environment, throws if not configured
- `validateEnvironment()`: Validates required env vars at startup, logs warnings for missing config

## Dependencies

- `server-only` (external): Next.js package that prevents client-side imports

## Used By

TBD

## Notes

- Import in a Client Component will cause a build error due to `server-only` import
- Checks for placeholder value `'your-api-key-here'` as unconfigured state
- Fails fast pattern: call `validateEnvironment()` at app startup