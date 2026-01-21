---
path: /root/Beautify/lib/rate-limit.ts
type: util
updated: 2026-01-21
status: active
---

# rate-limit.ts

## Purpose

Provides in-memory rate limiting functionality to restrict the number of requests per identifier within a configurable time window. Includes automatic cleanup of expired entries to prevent memory leaks.

## Exports

- `checkRateLimit(identifier, limit?, windowMs?)` - Checks if a request is allowed for the given identifier, returns `{ allowed: boolean, remaining: number }`

## Dependencies

None

## Used By

TBD

## Notes

- Uses a sliding window approach with configurable limit (default: 5) and window duration (default: 60 seconds)
- In-memory storage via Map - state is lost on server restart
- Cleanup interval runs every 5 minutes to remove expired entries