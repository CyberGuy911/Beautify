# Phase 5: Output Features & Production Readiness - Research

**Researched:** 2026-01-21
**Domain:** UI/UX polish, browser APIs, deployment
**Confidence:** HIGH

## Summary

This research covers the four main areas required for Phase 5: download functionality, before/after comparison slider, smooth animations, and Vercel deployment with proper timeout configuration.

For the before/after slider, **react-compare-slider** is the recommended library. It's actively maintained (v3.1.0 stable, v4 beta), has zero dependencies, and supports React 16.8+. The download functionality should use the existing data URL approach with a programmatic anchor element. Tailwind v4's CSS-first `@theme` block already supports custom animations, which the project uses. Vercel deployment requires `maxDuration` configuration to support the 60-second timeout requirement.

**Primary recommendation:** Use react-compare-slider for comparison, native anchor download for file saving, extend existing @theme animations for transitions, and export `maxDuration = 60` in the API route.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-compare-slider | ^3.1.0 | Before/after image comparison | Zero dependencies, actively maintained, React 16.8+ support |
| Tailwind CSS | v4 | Animations and transitions | Already in use, CSS-first @theme approach for custom animations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| exponential-backoff | ^3.1.1 | Retry with backoff | If custom retry logic becomes complex (OPTIONAL) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-compare-slider | img-comparison-slider | Web component, works across frameworks but less React-native |
| react-compare-slider | react-compare-image | Simpler but less customizable |
| Custom retry | exponential-backoff lib | Library adds dependency; custom is ~20 lines |

**Installation:**
```bash
npm install react-compare-slider
```

## Architecture Patterns

### Recommended Component Structure
```
components/
  before-after-slider.tsx   # Wraps ReactCompareSlider
  download-button.tsx       # (Optional) Extract if download logic grows
  upload-zone.tsx           # Already exists - will add reset + download
```

### Pattern 1: Before/After Slider Component
**What:** Wrapper around ReactCompareSlider with project styling
**When to use:** Result display after transformation completes
**Example:**
```typescript
// Source: https://github.com/nerdyman/react-compare-slider
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "Before",
  afterAlt = "After"
}: BeforeAfterSliderProps) {
  return (
    <ReactCompareSlider
      itemOne={<ReactCompareSliderImage src={beforeSrc} alt={beforeAlt} />}
      itemTwo={<ReactCompareSliderImage src={afterSrc} alt={afterAlt} />}
      position={50}
    />
  );
}
```

### Pattern 2: Programmatic Download from Data URL
**What:** Download transformed image without server round-trip
**When to use:** User clicks download button
**Example:**
```typescript
// Source: https://www.geeksforgeeks.org/javascript/how-to-download-image-on-button-click-in-javascript/
function downloadImage(dataUrl: string, originalFilename: string) {
  // Extract base name without extension
  const baseName = originalFilename.replace(/\.[^/.]+$/, '') || 'image';
  const filename = `MsFrozen-${baseName}.jpg`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

### Pattern 3: Tailwind v4 CSS-First Animations
**What:** Define custom animations in @theme block
**When to use:** Fade-in, slide-in, and other transitions
**Example:**
```css
/* Source: https://tailwindcss.com/docs/animation */
@theme {
  --animate-fade-in: fade-in 0.3s ease-out forwards;
  --animate-fade-out: fade-out 0.3s ease-in forwards;
  --animate-slide-up: slide-up 0.3s ease-out forwards;

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes slide-up {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
}
```

### Pattern 4: Exponential Backoff Retry
**What:** Retry failed API calls with increasing delays
**When to use:** Transform API calls that may fail transiently
**Example:**
```typescript
// Source: https://advancedweb.hu/how-to-implement-an-exponential-backoff-retry-strategy-in-javascript/
async function fetchWithRetry(
  fn: () => Promise<Response>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fn();
      if (response.ok) return response;

      // Only retry on 5xx errors or specific retryable status codes
      if (response.status < 500 && response.status !== 429) {
        return response; // Don't retry client errors
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }

    if (attempt < maxAttempts - 1) {
      // Exponential backoff with jitter
      const delay = baseDelayMs * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError ?? new Error('Max retries exceeded');
}
```

### Pattern 5: Vercel Function Timeout Configuration
**What:** Set maxDuration for API routes
**When to use:** Routes that need more than 10s (Gemini processing)
**Example:**
```typescript
// Source: https://vercel.com/docs/functions/configuring-functions/duration
// app/api/transform/route.ts
export const maxDuration = 60; // 60 seconds

export async function POST(request: Request) {
  // ... existing handler
}
```

### Anti-Patterns to Avoid
- **Window.open for download:** Unreliable across browsers; use anchor element instead
- **Animated layout properties:** Avoid animating width/height; use transform/opacity for performance
- **Missing motion-reduce support:** Always add `motion-reduce:` variants for accessibility
- **Retry without backoff:** Can overwhelm server; always use exponential delay
- **Retry everything:** Only retry transient errors (5xx, network); not 4xx client errors

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Before/after slider | Custom drag implementation | react-compare-slider | Handles touch, keyboard, resize, clipping edge cases |
| Exponential backoff | Simple retry loop | Pattern with jitter (or library) | Jitter prevents thundering herd; timing math is error-prone |
| Cross-browser download | window.open or location.href | Anchor element with download attribute | Consistent behavior, works with data URLs |

**Key insight:** The before/after slider seems simple but has many edge cases: touch vs mouse, keyboard accessibility, proper clipping, resize handling. A library handles all of these.

## Common Pitfalls

### Pitfall 1: React 19 Peer Dependency Conflicts
**What goes wrong:** react-compare-slider may report peer dependency warnings with React 19
**Why it happens:** Many libraries still specify React 18 as peer dependency
**How to avoid:** Use `--legacy-peer-deps` if needed, or verify compatibility first with `npm info react-compare-slider peerDependencies`
**Warning signs:** npm ERESOLVE errors during installation

### Pitfall 2: Data URL Download Filename Ignored
**What goes wrong:** Browser ignores the download attribute filename
**Why it happens:** Cross-origin restrictions or blob URL issues
**How to avoid:** Since we're using data URLs from same origin, this shouldn't occur; but test on Safari
**Warning signs:** File downloads with generic name like "download"

### Pitfall 3: Animation on Width/Height Properties
**What goes wrong:** Janky, stuttering animations
**Why it happens:** width/height trigger layout recalculation
**How to avoid:** Animate only `transform` and `opacity`; use `scale` instead of width
**Warning signs:** CPU spikes during animation, dropped frames

### Pitfall 4: Missing maxDuration in Production
**What goes wrong:** API calls timeout after 10 seconds on Vercel
**Why it happens:** Vercel default is 10s without Fluid Compute, or 300s with Fluid Compute
**How to avoid:** Export `maxDuration = 60` explicitly in route file
**Warning signs:** Gateway timeout (504) errors in production only

### Pitfall 5: Retry Loop Without Maximum
**What goes wrong:** Infinite retry consumes resources, never fails
**Why it happens:** Network stays down, server never recovers
**How to avoid:** Set maxAttempts (3 recommended); surface error after exhaustion
**Warning signs:** UI stuck in "loading" state indefinitely

### Pitfall 6: Tailwind v4 Animation Not Working
**What goes wrong:** Custom `animate-*` class has no effect
**Why it happens:** Keyframes defined outside @theme block, or wrong CSS variable prefix
**How to avoid:** Define keyframes inside @theme, use `--animate-*` prefix
**Warning signs:** Class appears in HTML but no animation plays

## Code Examples

Verified patterns from official sources:

### Complete Download Implementation
```typescript
// Source: Combined from MDN and best practices
interface DownloadOptions {
  dataUrl: string;
  originalFilename: string;
}

export function downloadTransformedImage({ dataUrl, originalFilename }: DownloadOptions): void {
  // Extract base name, remove extension
  const baseName = originalFilename.replace(/\.[^/.]+$/, '') || 'image';
  const filename = `MsFrozen-${baseName}.jpg`;

  // Create and trigger download
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
}
```

### ReactCompareSlider with Custom Handle
```typescript
// Source: https://github.com/nerdyman/react-compare-slider
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
  ReactCompareSliderHandle
} from 'react-compare-slider';

export function BeforeAfterSlider({ beforeSrc, afterSrc }: Props) {
  return (
    <ReactCompareSlider
      itemOne={
        <ReactCompareSliderImage
          src={beforeSrc}
          alt="Original"
          className="object-contain"
        />
      }
      itemTwo={
        <ReactCompareSliderImage
          src={afterSrc}
          alt="Transformed"
          className="object-contain"
        />
      }
      handle={
        <ReactCompareSliderHandle
          buttonStyle={{
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '2px solid #d4af37', // accent color
          }}
          linesStyle={{
            color: '#d4af37',
          }}
        />
      }
      position={50}
      onPositionChange={(pos) => {
        // Optional: track for analytics
      }}
    />
  );
}
```

### Complete Animation Set for globals.css
```css
/* Source: Tailwind v4 docs + project styling */
@theme {
  /* Fade animations */
  --animate-fade-in: fade-in 0.3s ease-out forwards;
  --animate-fade-out: fade-out 0.2s ease-in forwards;

  /* Slide animations */
  --animate-slide-up: slide-up 0.3s ease-out forwards;
  --animate-slide-down: slide-down 0.3s ease-out forwards;

  /* Scale animations */
  --animate-scale-in: scale-in 0.2s ease-out forwards;

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
}
```

### Vercel Configuration for 60s Timeout
```typescript
// app/api/transform/route.ts
// Source: https://vercel.com/docs/functions/configuring-functions/duration
export const maxDuration = 60; // Allow up to 60 seconds

export async function POST(request: Request) {
  // existing implementation
}
```

Alternative via vercel.json (if route export doesn't work):
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "functions": {
    "app/api/transform/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### Environment Variables for Vercel
```bash
# Via CLI
vercel env add GEMINI_API_KEY production
vercel env add GEMINI_API_KEY preview

# Required environment variables
# - GEMINI_API_KEY: Google AI API key for Gemini
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js animations | @theme CSS block | Tailwind v4 (2024) | Define animations in CSS, not JS config |
| Vercel 10s default timeout | 300s default with Fluid Compute | 2024 | Less need to configure maxDuration |
| react-compare-slider v2 | v3.1.0 stable (v4 beta) | April 2024 | Improved TypeScript, new props |

**Deprecated/outdated:**
- `tailwindcss-animate` plugin: Less needed with v4's native @theme keyframes
- Pages Router timeout config: Use route segment export, not pages config

## Open Questions

Things that couldn't be fully resolved:

1. **React 19 + react-compare-slider compatibility**
   - What we know: Library requires React 16.8+, tested with React 18
   - What's unclear: Whether v3.1.0 has explicit React 19 peer dependency support
   - Recommendation: Install with `--legacy-peer-deps` if ERESOLVE error occurs; test thoroughly

2. **Vercel Hobby plan timeout limits**
   - What we know: With Fluid Compute (default), Hobby gets 300s max, 300s default
   - What's unclear: Whether Fluid Compute is auto-enabled for all new projects
   - Recommendation: Export maxDuration = 60 explicitly to be safe; verify in dashboard

## Sources

### Primary (HIGH confidence)
- [Vercel Docs: Function Duration](https://vercel.com/docs/functions/configuring-functions/duration) - maxDuration configuration, limits by plan
- [Tailwind CSS Animation Docs](https://tailwindcss.com/docs/animation) - @theme keyframes syntax
- [react-compare-slider GitHub](https://github.com/nerdyman/react-compare-slider) - Props, usage, installation

### Secondary (MEDIUM confidence)
- [Croct Blog: React Comparison Sliders](https://blog.croct.com/post/best-react-before-after-image-comparison-slider-libraries) - Library comparison
- [GeeksforGeeks: Download Image on Click](https://www.geeksforgeeks.org/javascript/how-to-download-image-on-button-click-in-javascript/) - Anchor download pattern
- [Advanced Web: Exponential Backoff](https://advancedweb.hu/how-to-implement-an-exponential-backoff-retry-strategy-in-javascript/) - Retry implementation

### Tertiary (LOW confidence)
- WebSearch results for React 19 compatibility - may need validation during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - react-compare-slider is the clear choice, well-documented
- Architecture: HIGH - Patterns derived from official documentation
- Pitfalls: MEDIUM - Some edge cases may exist in production that weren't documented
- Vercel config: HIGH - Official documentation is comprehensive

**Research date:** 2026-01-21
**Valid until:** 30 days (libraries stable, Vercel config stable)
