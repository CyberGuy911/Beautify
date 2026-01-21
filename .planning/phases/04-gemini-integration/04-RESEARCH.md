# Phase 4: Gemini Integration - Research

**Researched:** 2026-01-21
**Domain:** Google Gemini API (Nano Banana) image transformation
**Confidence:** MEDIUM

## Summary

Google's Gemini API provides native image generation and transformation capabilities under the brand name "Nano Banana." The current production-ready model is **gemini-2.5-flash-image**, optimized for speed and efficiency at $0.039 per image. The API accepts base64-encoded images up to 100MB, supports image transformation through text prompts, and includes built-in safety filters with configurable thresholds.

Integration requires the **@google/genai** npm package (v1.37.0+), an API key from Google AI Studio, and proper error handling for three critical failure modes: rate limiting (429), safety filter blocking (finish_reason: SAFETY), and service overload (503). The success criteria specify Tier 1 quota (10 IPM), but research shows Tier 1 actually provides 150-300 RPM depending on model, with IPM being one of four rate limit dimensions.

**Primary recommendation:** Use gemini-2.5-flash-image with exponential backoff retry logic, base64 inline data (not Files API), and descriptive prompts emphasizing lighting, atmosphere, and style. Implement safety filter detection via response metadata, not HTTP errors.

## Standard Stack

The established libraries/tools for Gemini image generation:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @google/genai | 1.37.0+ | Official Gemini SDK | Google's "vanilla" SDK, replaces legacy @google/generative-ai, supports Gemini 2.0+ features |
| server-only | 0.0.1 | Compile-time enforcement | Already in project, prevents API key exposure in client bundles |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsparticles | Latest | Particle animations | For sparkle effect around transformed image (React component available) |
| react-sparkle | Latest | Lightweight sparkles | Alternative if tsparticles is too heavy (500+ particles impact mobile) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @google/genai | @google-cloud/vertexai | Vertex AI for enterprise, requires GCP project setup, not needed for simple API key auth |
| gemini-2.5-flash-image | gemini-3-pro-image-preview | Gemini 3 Pro has higher quality but Pre-GA (frequent 503 errors), slower (20-40s vs 2-5s) |
| tsparticles | Custom CSS keyframes | Lighter bundle, less configurability, harder to control particle count/physics |

**Installation:**
```bash
npm install @google/genai
# Already have: server-only@0.0.1

# For sparkle effect (choose one):
npm install @tsparticles/react @tsparticles/slim
# OR
npm install react-sparkle
```

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── data.ts              # Existing: environment variable access
├── gemini.ts            # NEW: Gemini client initialization + retry logic
└── prompt-engineering.ts # NEW: Prompt templates for mystical cosmic style

app/api/transform/
└── route.ts             # MODIFY: Replace mock with real Gemini call
```

### Pattern 1: Server-Side API Client Initialization
**What:** Initialize Gemini client once per request using server-only enforced config
**When to use:** Every API route that calls Gemini
**Example:**
```typescript
// lib/gemini.ts
import 'server-only'
import { GoogleGenAI } from '@google/genai'
import { getEnv } from '@/lib/data'

export function createGeminiClient() {
  const apiKey = getEnv('GEMINI_API_KEY')
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable not configured')
  }
  return new GoogleGenAI({ apiKey })
}
```

### Pattern 2: Exponential Backoff with Jitter
**What:** Retry rate-limited requests with progressively longer delays plus randomization
**When to use:** All Gemini API calls (handles 429, 503 errors)
**Example:**
```typescript
// lib/gemini.ts
interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
}

async function callWithRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = { maxRetries: 5, baseDelay: 1000, maxDelay: 60000 }
): Promise<T> {
  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      const isRetryable =
        error.message?.includes('429') ||
        error.message?.includes('503') ||
        error.message?.includes('RESOURCE_EXHAUSTED') ||
        error.message?.includes('UNAVAILABLE')

      if (!isRetryable || attempt === config.maxRetries - 1) {
        throw error
      }

      // Exponential backoff: 2^attempt * baseDelay + jitter
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        config.maxDelay
      )
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Retry logic exhausted')
}
```

### Pattern 3: Image Transformation with Prompt + Base64
**What:** Send base64 image + text prompt to generate mystical cosmic portrait
**When to use:** Main transformation flow
**Example:**
```typescript
// app/api/transform/route.ts (modified)
const client = createGeminiClient()
const result = await callWithRetry(async () => {
  return await client.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        parts: [
          {
            text: generateMysticalPrompt() // From prompt-engineering.ts
          },
          {
            inlineData: {
              mimeType: 'image/jpeg', // or image/png based on validation
              data: imageBase64WithoutPrefix // Strip data:image/...;base64,
            }
          }
        ]
      }
    ]
  })
})

// Extract image from response
const transformedImage = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
```

### Pattern 4: Safety Filter Detection
**What:** Check response metadata for safety blocking, not HTTP errors
**When to use:** After every Gemini API call
**Example:**
```typescript
// Check if prompt was blocked
if (response.promptFeedback?.blockReason) {
  throw new Error('Content blocked by safety filters. Please try a different image.')
}

// Check if response was blocked
const candidate = response.candidates?.[0]
if (candidate?.finishReason === 'SAFETY') {
  const categories = candidate.safetyRatings
    ?.filter(r => r.probability !== 'NEGLIGIBLE')
    .map(r => r.category)
  throw new Error(
    `Generated content blocked by safety filters: ${categories?.join(', ')}`
  )
}
```

### Anti-Patterns to Avoid
- **Using Files API for image input:** Image-to-image transformation fails silently with Files API, succeeds with base64 inlineData (verified issue as of Jan 2026)
- **Retrying immediately without backoff:** Causes "thundering herd" problem, wastes quota, prolongs outages
- **Using gemini-2.5-pro for image generation:** That model doesn't generate images; use gemini-2.5-flash-image or gemini-3-pro-image-preview
- **Sending base64 with data URI prefix:** Strip `data:image/jpeg;base64,` prefix before sending to API
- **Catching safety blocks as HTTP errors:** Safety blocking returns 200 with metadata, not error status codes

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Retry logic | Custom setTimeout loop | Exponential backoff with jitter pattern | Prevents thundering herd, handles multiple error types, standard practice for rate limits |
| Particle effects | Canvas animation from scratch | tsparticles or react-sparkle | Hardware-accelerated, 60fps guaranteed, configurable physics, React component ready |
| Prompt engineering | Single template string | Structured prompt builder | Mystical cosmic requires multiple elements (lighting, atmosphere, style), combinable components more maintainable |
| Base64 validation | Regex-only check | Existing validateBase64Image (lib/image-validation.ts) | Already handles Buffer decode, MIME type check, size limits |
| API key management | process.env directly | Existing getEnv (lib/data.ts) | Centralized error handling, compile-time enforcement with server-only |

**Key insight:** Gemini API errors are NOT straightforward HTTP failures. Safety blocking, rate limiting, and service overload all require different detection and handling strategies. The response structure is complex with nested candidates, safety ratings, and finish reasons.

## Common Pitfalls

### Pitfall 1: Confusing Rate Limit Dimensions
**What goes wrong:** Upgrading to Tier 1 for "10 IPM" but still hitting rate limits
**Why it happens:** Success criteria mentions "10 IPM" but Gemini has 4 dimensions: RPM (requests per minute), TPM (tokens per minute), RPD (requests per day), IPM (images per minute). Tier 1 gives 150-300 RPM depending on model, but IPM varies separately.
**How to avoid:** Check ALL rate limit dimensions in Google AI Studio dashboard, not just IPM
**Warning signs:** 429 errors despite being under 10 images/minute

### Pitfall 2: Base64 Prefix Stripping
**What goes wrong:** API rejects image data or generates incorrect output
**Why it happens:** Frontend sends `data:image/jpeg;base64,/9j/4AAQ...` but Gemini expects raw base64 string `/9j/4AAQ...` without the data URI prefix
**How to avoid:** Strip prefix before sending to Gemini: `image.replace(/^data:image\/\w+;base64,/, '')`
**Warning signs:** 400 INVALID_ARGUMENT errors about malformed request body

### Pitfall 3: Safety Filter Silent Failures
**What goes wrong:** Request succeeds (200 OK) but transformed image is missing, no clear error
**Why it happens:** Safety filters block content via response metadata (finishReason: 'SAFETY'), not HTTP errors. Developers check for error status codes and miss the blocking.
**How to avoid:** Always check `response.candidates[0].finishReason` and `response.promptFeedback.blockReason` even on successful responses
**Warning signs:** Empty or undefined transformedImage despite 200 status

### Pitfall 4: 503 Errors During Peak Hours
**What goes wrong:** Transformation works in testing but fails in production with "model is overloaded" errors
**Why it happens:** Gemini 2.5 Flash Image shares compute resources across all developers. Peak hours (US business hours) exhaust the pool. Pre-GA models (Gemini 3) are worse.
**How to avoid:** Implement exponential backoff (already needed for 429), set user expectations ("processing may take 2-5 seconds"), consider retry limits to avoid infinite loops
**Warning signs:** 503 UNAVAILABLE errors, especially 9am-5pm Pacific time

### Pitfall 5: Image Size Limits on Vercel
**What goes wrong:** Large base64 images fail to transform even though API supports 100MB
**Why it happens:** Vercel Free tier has 4.5MB request body limit (Nov 2024 increase from 1MB). Even though Gemini API supports 100MB base64, the Next.js API route can't receive it.
**How to avoid:** Validate image size in frontend before upload, compress images before sending, or upgrade Vercel plan if needed
**Warning signs:** 413 Payload Too Large errors or timeouts before reaching Gemini API

### Pitfall 6: Leaked API Keys
**What goes wrong:** API key stops working with "Your API key was reported as leaked" error
**Why it happens:** API key committed to Git, exposed in client-side code, or logged in error messages. Google automatically detects and blocks leaked keys.
**How to avoid:** Use server-only package (already in project), never log API keys, add .env.local to .gitignore, verify with `git log --all -p | grep GEMINI_API_KEY`
**Warning signs:** 403 PERMISSION_DENIED with leaked key message

## Code Examples

Verified patterns from official sources and community best practices:

### Mystical Cosmic Prompt Template
```typescript
// lib/prompt-engineering.ts
export function generateMysticalPrompt(): string {
  // Based on: https://blog.google/products/gemini/prompting-tips-nano-banana-pro/
  // Best practice: Describe the scene, don't just list keywords
  return `Transform this portrait into a mystical cosmic masterpiece.

Create a portrait with:
- Ethereal cosmic atmosphere with deep space backgrounds (nebulas, stars, galaxies)
- Soft magical lighting with subtle sparkles and dreamy glow around the subject
- Mystical color palette: purples, deep blues, cosmic teals, golden highlights
- Enchanting vibe without losing the subject's realistic features and expressions
- Creative cosmic symbols subtly integrated (constellations, celestial patterns)
- Dramatic yet soft lighting that enhances facial features
- Ultra-realistic finish with 4K detail and cinematic color grading

Style: Fantasy portrait photography with cosmic elements, professional magazine quality, warm golden highlights, sharp facial details, whimsical magical atmosphere.`
}
```

### Complete Transformation Function
```typescript
// lib/gemini.ts
import 'server-only'
import { GoogleGenAI } from '@google/genai'
import { getEnv } from '@/lib/data'

interface TransformResult {
  success: boolean
  transformedImage?: string
  error?: string
}

export async function transformImage(
  imageBase64: string,
  mimeType: string
): Promise<TransformResult> {
  const client = new GoogleGenAI({ apiKey: getEnv('GEMINI_API_KEY') })

  // Strip data URI prefix if present
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '')

  try {
    const result = await callWithRetry(async () => {
      return await client.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [
          {
            parts: [
              { text: generateMysticalPrompt() },
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64
                }
              }
            ]
          }
        ]
      })
    })

    // Check for safety blocking
    if (result.response.promptFeedback?.blockReason) {
      return {
        success: false,
        error: 'Content blocked by safety filters. Please try a different image.'
      }
    }

    const candidate = result.response.candidates?.[0]
    if (candidate?.finishReason === 'SAFETY') {
      return {
        success: false,
        error: 'Generated content blocked by safety filters. Please try again with a different image.'
      }
    }

    // Extract transformed image
    const transformedData = candidate?.content?.parts?.[0]?.inlineData?.data
    if (!transformedData) {
      return {
        success: false,
        error: 'No image generated. Please try again.'
      }
    }

    // Return with data URI prefix for browser display
    return {
      success: true,
      transformedImage: `data:image/jpeg;base64,${transformedData}`
    }
  } catch (error: any) {
    console.error('Gemini transformation error:', error)

    // Friendly error messages
    if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return {
        success: false,
        error: 'Service is busy. Please try again in a moment.'
      }
    }

    if (error.message?.includes('503') || error.message?.includes('UNAVAILABLE')) {
      return {
        success: false,
        error: 'Service temporarily unavailable. Please try again.'
      }
    }

    if (error.message?.includes('403') || error.message?.includes('PERMISSION_DENIED')) {
      return {
        success: false,
        error: 'API authentication failed. Please contact support.'
      }
    }

    return {
      success: false,
      error: 'Transformation failed. Please try again.'
    }
  }
}

// Retry helper (from Pattern 2 above)
async function callWithRetry<T>(
  fn: () => Promise<T>,
  config = { maxRetries: 5, baseDelay: 1000, maxDelay: 60000 }
): Promise<T> {
  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      const isRetryable =
        error.message?.includes('429') ||
        error.message?.includes('503') ||
        error.message?.includes('RESOURCE_EXHAUSTED') ||
        error.message?.includes('UNAVAILABLE')

      if (!isRetryable || attempt === config.maxRetries - 1) {
        throw error
      }

      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        config.maxDelay
      )
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Max retries exceeded')
}
```

### Sparkle Effect Implementation (React)
```typescript
// components/sparkle-effect.tsx
// Source: https://www.npmjs.com/package/react-sparkle
import Sparkle from 'react-sparkle'

export function SparkleEffect() {
  return (
    <div className="relative">
      <Sparkle
        color="gold"
        count={30}
        minSize={5}
        maxSize={12}
        overflowPx={20}
        fadeOutSpeed={20}
        flicker={true}
      />
    </div>
  )
}

// Usage: Wrap transformed image container
<div className="relative">
  <img src={transformedImage} alt="Transformed" />
  {showSparkles && <SparkleEffect />}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @google/generative-ai | @google/genai | Gemini 2.0 release (Dec 2024) | Unified SDK for both Google AI Studio and Vertex AI |
| Imagen API separate | Gemini native image gen (Nano Banana) | Jan 2025 | Simpler API, conversational editing, better prompt understanding |
| 20MB base64 limit | 100MB base64 limit | Jan 2026 | Can handle higher resolution images without Files API workarounds |
| Default safety ON | Default safety OFF (Gemini 2.5/3) | Gemini 2.5 release | More permissive by default, reduces unexpected blocking |
| Free tier 10 RPM | Free tier 5 RPM (Gemini 2.0 Flash) | Dec 2025 quota adjustment | Tighter free tier limits, faster need for Tier 1 upgrade |

**Deprecated/outdated:**
- **@google/generative-ai package:** Replaced by @google/genai, though still maintained for legacy projects
- **Files API for image input:** Works for analysis but fails for image-to-image generation as of Jan 2026; use base64 inlineData instead
- **Gemini Pro for image gen:** Never supported; common misconception that gets 404 errors

## Open Questions

Things that couldn't be fully resolved:

1. **Exact Tier 1 IPM (Images Per Minute) limit**
   - What we know: Success criteria mentions "10 IPM" but official docs say "verify in AI Studio dashboard" without publishing exact numbers. Tier 1 provides 150-300 RPM.
   - What's unclear: Whether IPM is actually 10, or if it scales with RPM/TPM
   - Recommendation: Test in production after Tier 1 upgrade, implement monitoring to track actual limits. Rate limits vary by model and can change.

2. **Optimal prompt length for mystical cosmic style**
   - What we know: Gemini docs say "describe the scene, don't just list keywords" and examples show detailed prompts work better
   - What's unclear: Whether extremely long prompts (200+ words) improve quality or just waste tokens
   - Recommendation: Start with 100-150 word descriptive prompt (provided in code examples), A/B test if quality issues arise

3. **Sparkle particle count for mobile performance**
   - What we know: Values above 500 particles impact performance on older devices. react-sparkle and tsparticles both support count configuration.
   - What's unclear: Exact threshold for acceptable performance on mid-range 2024-2025 mobile devices
   - Recommendation: Start with 30 particles (low overhead), increase if sparkle effect feels weak, test on real mobile devices

4. **Whether Vercel body size limit applies to API routes**
   - What we know: Vercel Free tier has 4.5MB request body limit (Nov 2024). Gemini supports 100MB base64.
   - What's unclear: Whether this limit applies to App Router API routes or just legacy Pages API routes
   - Recommendation: Frontend validation already limits images; verify actual limit during testing. If issues arise, add explicit body size check before Gemini call.

## Sources

### Primary (HIGH confidence)
- [Nano Banana image generation - Google AI for Developers](https://ai.google.dev/gemini-api/docs/image-generation) - Official API docs, image transformation patterns
- [Safety settings - Google AI for Developers](https://ai.google.dev/gemini-api/docs/safety-settings) - HARM_CATEGORY definitions, blocking detection
- [Troubleshooting guide - Google AI for Developers](https://ai.google.dev/gemini-api/docs/troubleshooting) - Error codes, authentication issues
- [Rate limits - Google AI for Developers](https://ai.google.dev/gemini-api/docs/rate-limits) - Tier structure, four rate limit dimensions

### Secondary (MEDIUM confidence)
- [@google/genai npm package](https://www.npmjs.com/package/@google/genai) - Version info, installation (WebSearch verified, npm is authoritative)
- [Gemini API Rate Limits Explained 2026](https://www.aifreeapi.com/en/posts/gemini-api-rate-limit-explained) - Tier 1 details (150-300 RPM), exponential backoff examples
- [Increased file size limits - Google Blog](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-api-new-file-limits/) - 100MB base64 increase (Jan 2026)
- [Prompting tips Nano Banana Pro - Google Blog](https://blog.google/products/gemini/prompting-tips-nano-banana-pro/) - "Describe the scene" best practice

### Tertiary (LOW confidence - marked for validation)
- [Gemini API 429 error exponential backoff](https://www.hostingseekers.com/blog/gemini-api-error-429-causes-fixes-prevention/) - Retry code examples (not official Google source)
- [Gemini API common errors 2026](https://www.arsturn.com/blog/gemini-api-troubleshooting-guide) - 503 overload issues, Files API image-to-image failure
- [Gemini image generation prompts](https://www.cyberlink.com/blog/trending-topics/5083/gemini-ai-photo-prompts) - Mystical cosmic prompt patterns (community examples)
- [react-sparkle usage](https://www.npmjs.com/package/react-sparkle) - Particle count recommendations (package maintainer, not tested)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official npm package verified, version current as of Jan 2026
- Architecture: MEDIUM - Patterns verified from official docs + community best practices, but retry logic based on community examples not official SDK
- Pitfalls: MEDIUM - Error types from official docs, but specific issues (Files API failure, 503 peak hours) from developer forums
- Prompt engineering: LOW - Based on community examples and blog posts, not empirically tested for "mystical cosmic portrait" specifically

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - Gemini API is fast-moving, quota changes happened Dec 2025)

**Notes for planner:**
- Success criteria mentions "Tier 1 (10 IPM)" but research shows Tier 1 is 150-300 RPM. Verify actual IPM separately or adjust criteria.
- "Nano Banana" is marketing name; technical model name is "gemini-2.5-flash-image"
- Base64 prefix stripping is critical but not obvious from API docs
- Safety filter blocking is NOT an HTTP error - must check response metadata
