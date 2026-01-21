# Phase 3: API Route & Mock Transformation - Research

**Researched:** 2026-01-21
**Domain:** Next.js App Router API routes, base64 image handling, rate limiting
**Confidence:** HIGH

## Summary

Phase 3 establishes client-server communication for the Beautify app using Next.js 16 App Router route handlers. The standard approach is to create a POST route handler at `app/api/transform/route.ts` that receives base64-encoded images from the client, validates them server-side, and returns a mock-transformed image. Rate limiting is implemented to prevent abuse (5 requests per minute), while staying within Vercel's 4.5MB payload constraint.

Next.js 16 uses Route Handlers (not the older Pages Router API Routes) which leverage Web Request/Response APIs with Next.js extensions. For a simple mock transformation phase, the most pragmatic approach is in-memory rate limiting using a Map-based implementation rather than requiring Redis infrastructure. Base64 validation is straightforward using Node.js Buffer methods to verify data integrity and size before processing.

**Primary recommendation:** Use Next.js route handlers with standard fetch patterns, implement simple in-memory rate limiting with a Map, validate base64 payloads server-side, and return mock transformations by adding a timestamp or text overlay to prove the round-trip works.

## Standard Stack

The established libraries/tools for Next.js API routes with base64 image handling:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1+ | Route handlers in App Router | Official Next.js App Router API pattern |
| TypeScript | 5.x | Type safety for route handlers | Standard for Next.js projects, catch errors at compile time |
| Node.js Buffer | Native | Base64 encode/decode | Built-in Node.js API, no dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| file-type | 19.x | MIME type detection from buffers | When validating image types beyond base64 structure |
| express-rate-limit | 7.x | In-memory rate limiting | Simple single-instance deployments |
| @upstash/ratelimit | Latest | Redis-based rate limiting | Production multi-instance deployments with Redis |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-memory Map | Redis/Upstash | Map works for single instance (Vercel), Redis needed for multi-instance |
| Node.js Buffer | Third-party base64 libs | Buffer is native and sufficient |
| Manual validation | Zod/Yup schemas | Schema validation adds overhead for simple image validation |

**Installation:**
```bash
# No additional packages required for basic implementation
# Optional: for advanced validation
npm install file-type
# Optional: for Redis-based rate limiting
npm install @upstash/ratelimit @upstash/redis
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── api/
│   └── transform/
│       └── route.ts      # POST handler for image transformation
├── lib/
│   ├── data.ts           # Server-only Data Access Layer (existing)
│   ├── rate-limit.ts     # Rate limiting logic
│   └── image-validation.ts  # Base64 validation utilities
components/
└── upload-zone.tsx       # Client component (existing)
```

### Pattern 1: Route Handler with Request/Response APIs
**What:** Next.js 16 App Router route handlers export async functions named after HTTP methods
**When to use:** All API endpoints in Next.js 16 App Router
**Example:**
```typescript
// app/api/transform/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image } = body // base64 string

    // Process image
    const result = await transformImage(image)

    return NextResponse.json({
      success: true,
      transformedImage: result
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Transformation failed' },
      { status: 500 }
    )
  }
}
```

### Pattern 2: Base64 Validation with Node.js Buffer
**What:** Use Node.js native Buffer to decode and validate base64 image data
**When to use:** Server-side validation of base64 payloads from client
**Example:**
```typescript
// lib/image-validation.ts
export function validateBase64Image(base64String: string) {
  try {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '')

    // Decode to buffer
    const buffer = Buffer.from(base64Data, 'base64')

    // Check size (4.5MB Vercel limit)
    const sizeInMB = buffer.length / (1024 * 1024)
    if (sizeInMB > 4.5) {
      throw new Error('Image exceeds 4.5MB limit')
    }

    return { valid: true, buffer, sizeInMB }
  } catch (error) {
    return { valid: false, error: 'Invalid base64 data' }
  }
}
```

### Pattern 3: In-Memory Rate Limiting with Map
**What:** Simple rate limiter using JavaScript Map to track requests per IP
**When to use:** Single-instance deployments (Vercel serverless), development, MVP phase
**Example:**
```typescript
// lib/rate-limit.ts
const requestCounts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(identifier: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  // Reset window if expired
  if (!record || now > record.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + windowMs })
    return true
  }

  // Check limit
  if (record.count >= limit) {
    return false
  }

  // Increment
  record.count++
  return true
}
```

### Pattern 4: Client-Side Fetch with Loading States
**What:** Standard fetch pattern with React state for loading indicators
**When to use:** Client components calling API routes
**Example:**
```typescript
// In upload-zone.tsx or new transform component
const [isTransforming, setIsTransforming] = useState(false)
const [error, setError] = useState<string | null>(null)

async function handleTransform(base64Image: string) {
  setIsTransforming(true)
  setError(null)

  try {
    const response = await fetch('/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()
    // Handle result
  } catch (err) {
    setError('Transformation failed')
  } finally {
    setIsTransforming(false)
  }
}
```

### Pattern 5: Mock Transformation Strategy
**What:** Simple mock transformation that proves the pipeline works without real AI
**When to use:** Testing infrastructure before integrating expensive APIs
**Example:**
```typescript
// lib/mock-transform.ts
export function mockTransform(base64Image: string): string {
  // For mock, just return same image with timestamp metadata
  // In real implementation, you'd process the image

  // Option 1: Return same image (fastest)
  return base64Image

  // Option 2: Add timestamp overlay using data URL manipulation
  // (More complex, would require canvas or image processing)

  // Option 3: Return a test pattern or gradient
  // const testPattern = generateTestPattern()
  // return testPattern
}
```

### Anti-Patterns to Avoid
- **Blocking operations in route handlers:** Use async/await, don't block the event loop with synchronous operations
- **Missing error boundaries:** Always wrap route handler logic in try-catch and return proper HTTP status codes
- **Ignoring Vercel payload limits:** Validate payload size before processing to avoid 413 errors
- **Client-side only validation:** Always validate server-side; client validation can be bypassed
- **Forgetting to clean up rate limit Map:** For long-running instances, periodically clean expired entries to prevent memory leaks

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MIME type detection | Manual byte inspection | `file-type` package | Handles dozens of file formats, magic number detection |
| Base64 encoding/decoding | Custom implementation | Node.js `Buffer` class | Native, optimized, handles edge cases |
| Request body parsing | Manual JSON parsing | `await request.json()` | Built into Next.js, handles errors gracefully |
| HTTP status codes | Numeric literals | Semantic names or constants | Readability, but Next.js doesn't provide constants |
| Production rate limiting | Custom Map with Redis | `@upstash/ratelimit` | Battle-tested, handles distributed rate limiting |

**Key insight:** Base64 and image handling have subtle edge cases (padding, MIME types, corrupted data). Using built-in APIs like Buffer and established libraries like file-type prevents bugs that only appear in production with edge-case inputs.

## Common Pitfalls

### Pitfall 1: Forgetting to Strip Data URL Prefix
**What goes wrong:** Base64 strings from FileReader include `data:image/png;base64,` prefix, causing Buffer.from() to fail or produce incorrect output
**Why it happens:** Client-side FileReader.readAsDataURL() returns complete data URLs, not raw base64
**How to avoid:** Always strip prefix with regex: `base64Data.replace(/^data:image\/\w+;base64,/, '')`
**Warning signs:** Buffer decoding works but produces wrong file size, or transformation returns corrupt images

### Pitfall 2: Exceeding Vercel's 4.5MB Payload Limit
**What goes wrong:** Large images cause 413 FUNCTION_PAYLOAD_TOO_LARGE errors
**Why it happens:** Base64 encoding increases file size by ~33%, so a 3.5MB image becomes ~4.7MB encoded
**How to avoid:**
- Validate size client-side before upload (check file.size)
- Calculate base64 size: `(base64String.length * 3) / 4` bytes
- Set practical limit at ~3MB original file size to ensure base64 stays under 4.5MB
**Warning signs:** Uploads work for small images but fail for larger ones

### Pitfall 3: Rate Limit Map Memory Leaks
**What goes wrong:** In-memory Map grows indefinitely, eventually causing out-of-memory errors
**Why it happens:** Map entries are never cleaned up, accumulate over time in long-running instances
**How to avoid:**
- Implement periodic cleanup: remove expired entries every N minutes
- Use TTL-based cleanup when checking rate limits
- Consider Redis for production (handles expiry automatically)
**Warning signs:** Memory usage grows over time, slower responses, eventual crashes

### Pitfall 4: Not Handling Async Request APIs in Next.js 16
**What goes wrong:** Synchronous access to request params/headers throws errors
**Why it happens:** Next.js 16 breaking change - all request APIs must be accessed asynchronously
**How to avoid:** Always await: `const body = await request.json()`, `const headers = await headers()`
**Warning signs:** Build errors or runtime errors about synchronous access

### Pitfall 5: Missing Content-Type Headers in Responses
**What goes wrong:** Browsers misinterpret response format, JSON appears as text
**Why it happens:** Forgetting to set Content-Type in manual Response objects
**How to avoid:** Use `NextResponse.json()` which sets headers automatically, or manually set: `{ headers: { 'Content-Type': 'application/json' } }`
**Warning signs:** API works but client can't parse response, needs JSON.parse() twice

### Pitfall 6: Client Identifier for Rate Limiting
**What goes wrong:** Rate limiting fails because IP address is undefined or always localhost
**Why it happens:** In serverless/proxy environments, `request.ip` may be undefined or incorrect
**How to avoid:**
- Check `x-forwarded-for` header first: `request.headers.get('x-forwarded-for')`
- Fall back to `x-real-ip` header
- Use session ID or user ID if authenticated
**Warning signs:** Rate limiting never triggers, or blocks all users simultaneously

## Code Examples

Verified patterns from official sources:

### Complete Route Handler with Validation and Rate Limiting
```typescript
// app/api/transform/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateBase64Image } from '@/lib/image-validation'

export async function POST(request: NextRequest) {
  try {
    // Get client identifier for rate limiting
    const identifier =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Check rate limit (5 requests per minute)
    if (!checkRateLimit(identifier, 5, 60000)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { image } = body

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid request: image field required' },
        { status: 400 }
      )
    }

    // Validate base64 image
    const validation = validateBase64Image(image)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid image data' },
        { status: 400 }
      )
    }

    // Mock transformation (just return original with success flag)
    // In Phase 4, this will call actual AI transformation
    const transformedImage = image // Mock: return same image

    return NextResponse.json({
      success: true,
      transformedImage,
      message: 'Mock transformation complete'
    })

  } catch (error) {
    console.error('Transform error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Base64 Size Calculation Utility
```typescript
// lib/image-validation.ts
export function calculateBase64Size(base64String: string): number {
  // Remove data URL prefix if present
  const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, '')

  // Count padding characters
  let padding = 0
  if (cleanBase64.endsWith('==')) padding = 2
  else if (cleanBase64.endsWith('=')) padding = 1

  // Calculate actual byte size
  // Base64: 4 chars = 3 bytes, minus padding
  const sizeInBytes = (cleanBase64.length * 3) / 4 - padding

  return sizeInBytes
}

export function isWithinSizeLimit(base64String: string, maxMB = 4.5): boolean {
  const sizeInBytes = calculateBase64Size(base64String)
  const sizeInMB = sizeInBytes / (1024 * 1024)
  return sizeInMB <= maxMB
}
```

### Rate Limit Cleanup Pattern
```typescript
// lib/rate-limit.ts
interface RateLimitRecord {
  count: number
  resetAt: number
}

const requestCounts = new Map<string, RateLimitRecord>()

// Cleanup expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetAt) {
      requestCounts.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

export function checkRateLimit(
  identifier: string,
  limit = 5,
  windowMs = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  // Reset window if expired
  if (!record || now > record.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  // Check limit
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  // Increment
  record.count++
  return { allowed: true, remaining: limit - record.count }
}
```

### Client-Side Transform Trigger
```typescript
// In components/upload-zone.tsx or new component
async function handleTransform(base64Image: string) {
  setIsTransforming(true)
  setError(null)
  setTransformedImage(null)

  try {
    const response = await fetch('/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`)
    }

    if (result.success) {
      setTransformedImage(result.transformedImage)
    } else {
      throw new Error(result.error || 'Transformation failed')
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Transformation failed')
  } finally {
    setIsTransforming(false)
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router API Routes (`pages/api/*.ts`) | App Router Route Handlers (`app/api/*/route.ts`) | Next.js 13 (2023) | New syntax, async request APIs, better TypeScript support |
| Synchronous request access | Async request APIs | Next.js 16 (2025) | Must await all request methods: `await request.json()` |
| Express middleware patterns | Native Web APIs (Request/Response) | Next.js 13 (2023) | More standard, less Express-specific |
| Custom rate limit implementations | Upstash/Redis-based solutions | 2023-2024 | Better for edge/serverless, automatic cleanup |

**Deprecated/outdated:**
- **Pages Router API Routes:** Still supported but App Router is the future
- **req.body direct access:** Must use `await request.json()` in route handlers
- **res.status().json():** Use `NextResponse.json(data, { status })` instead

## Open Questions

Things that couldn't be fully resolved:

1. **Mock transformation visualization**
   - What we know: Can return same image, add text overlay, or generate pattern
   - What's unclear: Best UX for showing mock worked (timestamp overlay vs. success message)
   - Recommendation: Return original image with success message, defer visual changes to Phase 4

2. **Rate limit persistence across Vercel deployments**
   - What we know: In-memory Map resets on each cold start
   - What's unclear: How frequently Vercel recycles serverless instances
   - Recommendation: Accept that rate limits reset on cold starts for MVP, migrate to Redis in Phase 4+ if needed

3. **MIME type validation necessity**
   - What we know: Can validate with file-type package
   - What's unclear: Whether base64 validation alone is sufficient for security
   - Recommendation: Start with base64 validation, add MIME validation if security review requires it

## Sources

### Primary (HIGH confidence)
- [Next.js Getting Started: Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) - Official Next.js 16 route handler documentation
- [Vercel Functions Limitations](https://vercel.com/docs/functions/limitations) - Official Vercel payload and function limits
- [Node.js Buffer Documentation](https://nodejs.org/api/buffer.html) - Official Node.js v25 Buffer API
- [Upstash Ratelimit Documentation](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) - Official rate limiting library docs

### Secondary (MEDIUM confidence)
- [Strapi: Next.js 16 Route Handlers Explained](https://strapi.io/blog/nextjs-16-route-handlers-explained-3-advanced-usecases) - Route handler patterns and examples
- [Upstash Blog: Rate Limiting with Vercel Edge](https://upstash.com/blog/edge-rate-limiting) - Edge middleware rate limiting implementation
- [Medium: Rate Limiting Techniques in Next.js](https://medium.com/@jigsz6391/rate-limiting-techniques-in-next-js-with-examples-4ec436de6dff) - In-memory and Redis patterns
- [Lioncoding: Calculate File Size from Base64](https://lioncoding.com/calculate-a-file-size-from-base64-string/) - Base64 size calculation formulas

### Tertiary (LOW confidence)
- [DEV Community: 4 Best Rate Limiting Solutions for Next.js Apps](https://dev.to/ethanleetech/4-best-rate-limiting-solutions-for-nextjs-apps-2024-3ljj) - Rate limiting library comparison
- [GitHub Discussions: Next.js Rate Limiting](https://github.com/vercel/next.js/discussions/12134) - Community patterns and gotchas

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Next.js docs and Node.js native APIs
- Architecture: HIGH - Verified patterns from official documentation
- Pitfalls: MEDIUM - Combination of official docs and experienced community sources
- Rate limiting: MEDIUM - Well-established patterns but in-memory approach is pragmatic trade-off

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stable technologies with slow-moving patterns)
