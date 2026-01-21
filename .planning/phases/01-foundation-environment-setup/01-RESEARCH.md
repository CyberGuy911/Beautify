# Phase 1: Foundation & Environment Setup - Research

**Researched:** 2026-01-21
**Domain:** Next.js 16 full-stack web application with Tailwind CSS v4
**Confidence:** HIGH

## Summary

This phase establishes a Next.js 16 application with TypeScript, App Router, and Tailwind CSS v4, implementing dark/light theme switching with proper environment variable security for API keys, and Google Cloud billing protection.

**Key findings:**
- Next.js 16 uses `create-next-app` with Turbopack as the default bundler, providing TypeScript, Tailwind v4, and App Router out-of-the-box
- Tailwind CSS v4 fundamentally changed from JavaScript configuration to CSS-first configuration using CSS variables and `@theme` directive
- Dark mode implementation requires `next-themes` library to prevent flash-on-load (FOUC) in SSR environments
- Environment variables must NEVER use `NEXT_PUBLIC_` prefix for API keys; server-only access requires Server Components or API Routes
- Google Cloud billing alerts are configured via console or API (not gcloud CLI commands)

**Primary recommendation:** Use the official `create-next-app` with defaults, add `next-themes` for flash-free dark mode, implement theme colors via CSS variables in the global stylesheet, and verify API keys stay server-side using bundle analyzer.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.x | React framework with App Router | Latest version with Turbopack bundler, async component model |
| React | 19.x (canary) | UI library | Next.js 16 uses React 19 canary with stable features |
| TypeScript | ≥5.1.0 | Type safety | Built-in Next.js support, automatic tsconfig.json generation |
| Tailwind CSS | 4.x | Utility-first CSS | CSS-first configuration, modern CSS features (@property, color-mix) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-themes | Latest | Theme switching without flash | Required for SSR dark mode without FOUC |
| shadcn/ui | Latest | Component library | Copy-paste components with Tailwind v4 styling |
| lucide-react | Latest | Icon library | Sun/moon icons for theme toggle, used by shadcn/ui |
| @next/bundle-analyzer | Latest | Bundle inspection | Verify environment variables don't leak to client |
| @google/genai | 1.37.0 | Google AI SDK | Server-side AI integration (Phase 2+) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-themes | Manual localStorage script | Manual approach causes flashing in production, no system preference support |
| shadcn/ui | Other component libraries | shadcn copies source into project (full control), others are dependencies |
| Tailwind CSS | CSS-in-JS | Tailwind v4 uses native CSS features, better performance |

**Installation:**
```bash
# Create Next.js 16 project with all defaults
npx create-next-app@latest beautify --yes

# Add theme switching
npm install next-themes

# Initialize shadcn/ui
npx shadcn@latest init

# Add bundle analyzer for verification
npm install --save-dev @next/bundle-analyzer

# Add Google AI SDK (Phase 2, but set up env vars now)
npm install @google/genai
```

## Architecture Patterns

### Recommended Project Structure
```
beautify/
├── app/
│   ├── layout.tsx           # Root layout with ThemeProvider
│   ├── page.tsx             # Home page
│   └── api/                 # Server-side API routes (AI integration)
│       └── transform/
│           └── route.ts     # POST endpoint for AI requests
├── components/
│   ├── theme-provider.tsx   # Client component wrapping next-themes
│   ├── theme-toggle.tsx     # Sun/moon toggle button
│   └── ui/                  # shadcn components (button, dropdown, etc.)
├── lib/
│   ├── data.ts              # Data Access Layer (DAL) with 'server-only'
│   └── utils.ts             # Utility functions
├── app/globals.css          # Tailwind + theme variables
└── .env.local               # Environment variables (gitignored)
```

### Pattern 1: CSS-First Theme Configuration (Tailwind v4)

**What:** Define theme colors using CSS variables in the global stylesheet instead of JavaScript config

**When to use:** Always in Tailwind v4 — the `tailwind.config.js` file is optional or removed entirely

**Example:**
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-background-light: #faf8f5; /* Warm cream */
  --color-background-dark: #000000;  /* Deep space black */
  --color-accent: #d4af37;           /* Gold */
  --color-accent-dark: #b87333;      /* Copper */
}

/* Dark mode variant */
@custom-variant dark (&:where(.dark, .dark *));
```

**Source:** [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme)

### Pattern 2: Flash-Free Dark Mode with next-themes

**What:** Wrap app in `ThemeProvider` to inject blocking script that applies theme before first paint

**When to use:** Always for SSR applications with dark mode

**Example:**
```typescript
// components/theme-provider.tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Source:** [next-themes GitHub](https://github.com/pacocoursey/next-themes) | [shadcn/ui Dark Mode Setup](https://ui.shadcn.com/docs/dark-mode/next)

### Pattern 3: Server-Only Environment Variables

**What:** Keep API keys server-side using Data Access Layer pattern with `server-only` package

**When to use:** Always for sensitive credentials (API keys, database secrets)

**Example:**
```typescript
// lib/data.ts
import 'server-only'

// This enforces server-only execution at build time
export async function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY // No NEXT_PUBLIC_ prefix!

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  return new GoogleGenAI({ apiKey })
}

// app/api/transform/route.ts
import { getAIClient } from '@/lib/data'

export async function POST(request: Request) {
  const client = await getAIClient()
  // Use client for AI requests
}
```

**Environment file:**
```bash
# .env.local (gitignored)
GEMINI_API_KEY=your-key-here
# NO NEXT_PUBLIC_ prefix — server-only!
```

**Source:** [Next.js Data Security Guide](https://nextjs.org/docs/app/guides/data-security)

### Pattern 4: Theme Toggle with Smooth Transitions

**What:** Button component with sun/moon icons that rotate and scale for visual feedback

**When to use:** Primary UI control for theme switching

**Example:**
```typescript
// components/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-90" />
      <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

**Source:** [shadcn/ui Theme Toggle](https://github.com/shadcn-ui/next-template/blob/main/components/theme-toggle.tsx)

### Anti-Patterns to Avoid

- **Using NEXT_PUBLIC_ for API keys:** Exposes secrets in client bundle, visible in DevTools
- **Manual localStorage theme switching:** Causes flash-of-unstyled-content (FOUC) on page load in SSR
- **Tailwind v3 JavaScript config in v4:** Config file is optional; use `@theme` directive in CSS instead
- **Omitting suppressHydrationWarning on <html>:** Causes hydration mismatch errors when next-themes applies class
- **Accessing process.env directly in components:** Always use Data Access Layer to isolate environment variables

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode toggle | Custom localStorage + script injection | `next-themes` | Handles SSR/SSG flash prevention, system preferences, tab sync |
| Theme persistence | Manual localStorage read/write | `next-themes` with `localStorage` storage | Handles edge cases, React 18 suspense boundaries |
| UI components | Custom styled components | shadcn/ui | Copy-paste into codebase (full control), Tailwind v4 compatible |
| Icon library | SVG files or custom icons | `lucide-react` | Tree-shakeable, consistent design system, shadcn default |
| Bundle inspection | Manual webpack config | `@next/bundle-analyzer` | Official Next.js tool, works with Turbopack |

**Key insight:** Server-side rendering makes dark mode complex — the server doesn't know user preference, causing initial render mismatches. Next-themes solves this with a blocking script that reads preference before first paint. Don't try to reimplement this.

## Common Pitfalls

### Pitfall 1: Environment Variables Leaking to Client Bundle

**What goes wrong:** Developers use `NEXT_PUBLIC_` prefix for API keys, exposing them in client JavaScript bundle

**Why it happens:** Confusion about Next.js environment variable prefixes; assumption that "public" means "accessible to my code"

**How to avoid:**
- Never use `NEXT_PUBLIC_` prefix for secrets
- Use `server-only` package to enforce server-side execution
- Implement Data Access Layer (DAL) pattern
- Verify with bundle analyzer: `ANALYZE=true npm run build` and check `client.html`

**Warning signs:**
- API key visible in browser DevTools Network tab
- Environment variables visible in `_next/static/chunks/` files
- 403/401 errors from quota exhaustion (key stolen and abused)

**Source:** [Next.js Data Security](https://nextjs.org/docs/app/guides/data-security)

### Pitfall 2: Flash of Unstyled Content (FOUC) on Theme Switch

**What goes wrong:** Page loads in light mode, then flashes to dark mode after JavaScript executes

**Why it happens:** Server renders with default theme (can't access localStorage), client hydrates with user preference

**How to avoid:**
- Always use `next-themes` library (handles blocking script injection)
- Add `suppressHydrationWarning` to `<html>` tag
- Set `defaultTheme` in `ThemeProvider` to match user decisions (dark mode default in this project)
- Don't use manual localStorage scripts

**Warning signs:**
- Visible theme "pop" on page load or navigation
- Console warnings about hydration mismatches
- Different theme in dev vs production (next-themes optimizes for production)

**Source:** [next-themes GitHub](https://github.com/pacocoursey/next-themes)

### Pitfall 3: Tailwind v4 Config Migration Confusion

**What goes wrong:** Developers try to use `tailwind.config.js` with theme colors like Tailwind v3

**Why it happens:** Tailwind v4 fundamentally changed from JavaScript config to CSS-first configuration

**How to avoid:**
- Define colors in `@theme` directive in `globals.css`
- Use CSS variables: `--color-accent`, `--color-background-light`
- Use `@custom-variant dark` for dark mode selector
- Remove or minimize `tailwind.config.js` (it's optional in v4)

**Warning signs:**
- Theme colors not working despite config file
- Error: "Cannot find module 'tailwindcss/defaultTheme'"
- Dark mode classes not applying

**Source:** [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)

### Pitfall 4: Google Cloud Budget Alert Delays

**What goes wrong:** Developer expects real-time cost alerts but receives them hours or days later

**Why it happens:** Budget alerts have processing delays; Google states "may take several hours" for first alert

**How to avoid:**
- Set budget thresholds conservatively (50%/100%/200%)
- Budget alerts don't automatically stop spending — they only notify
- Use multiple threshold levels for escalating awareness
- Consider programmatic notifications via Pub/Sub for faster alerts

**Warning signs:**
- Surprise costs before receiving alerts
- Assuming $50 alert means spending stops at $50

**Source:** [Google Cloud Billing Budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets)

### Pitfall 5: Next.js 16 Caching Confusion

**What goes wrong:** Developers expect automatic caching like Next.js 14, but v16 changed to opt-in caching

**Why it happens:** Next.js 16 overhauled caching to be explicit rather than implicit

**How to avoid:**
- Understand that dynamic code executes at request time by default
- Use Cache Components explicitly when caching is needed
- Review the Next.js 16 upgrade guide for caching changes
- Don't assume behavior from previous versions

**Warning signs:**
- Performance slower than expected
- API routes executing on every request (if caching was expected)

**Source:** [Next.js 16 Release](https://nextjs.org/blog/next-16) | [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)

## Code Examples

Verified patterns from official sources:

### Create Next.js 16 Project
```bash
# Quick start with all defaults (TypeScript, Tailwind v4, App Router, Turbopack)
npx create-next-app@latest beautify --yes
cd beautify
npm run dev
```

**Source:** [Next.js Installation](https://nextjs.org/docs/app/getting-started/installation)

### Initialize shadcn/ui
```bash
# Initialize with interactive prompts
npx shadcn@latest init

# Add specific components (button, dropdown menu for theme toggle)
npx shadcn@latest add button
npx shadcn@latest add dropdown-menu
```

**Source:** [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next)

### Verify Environment Variables Don't Leak
```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... other config
})

# Build and analyze
ANALYZE=true npm run build

# Check .next/analyze/client.html — search for your env var names
# API keys should NOT appear in client bundle
```

**Source:** [@next/bundle-analyzer npm](https://www.npmjs.com/package/@next/bundle-analyzer)

### Theme Colors with Tailwind v4
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Light mode colors */
  --color-background-light: #faf8f5;
  --color-foreground-light: #1a1a1a;

  /* Dark mode colors */
  --color-background-dark: #000000;
  --color-foreground-dark: #ffffff;

  /* Accent colors */
  --color-accent-gold: #d4af37;
  --color-accent-copper: #b87333;
}

/* Dark mode custom variant */
@custom-variant dark (&:where(.dark, .dark *));

/* Apply colors */
body {
  background: var(--color-background-light);
  color: var(--color-foreground-light);
}

.dark body {
  background: var(--color-background-dark);
  color: var(--color-foreground-dark);
}
```

**Source:** [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme)

### localStorage Theme Persistence with System Preference
```typescript
// User preference priority: explicit choice > localStorage > system preference
// next-themes handles this automatically, but here's the logic:

"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle {theme} mode
    </button>
  )
}
```

**Note:** The `mounted` check prevents hydration mismatches in SSR.

**Source:** [next-themes Documentation](https://github.com/pacocoursey/next-themes)

## State of the Art

| Old Approach (Next.js ≤15) | Current Approach (Next.js 16) | When Changed | Impact |
|----------------------------|-------------------------------|--------------|--------|
| Webpack bundler | Turbopack (default) | Next.js 16 (Nov 2024) | 2-3x faster builds, new config format |
| JavaScript config (Tailwind v3) | CSS-first config (Tailwind v4) | Tailwind v4 (Dec 2024) | Use `@theme` in CSS, not `tailwind.config.js` |
| Implicit caching | Opt-in caching | Next.js 16 | Dynamic code runs at request time by default |
| Manual localStorage theme | `next-themes` library | Industry standard | Prevents FOUC in SSR |
| `@tailwind` directives | `@import "tailwindcss"` | Tailwind v4 | Single import statement |

**Deprecated/outdated:**
- **Tailwind v3 JavaScript config:** Use CSS `@theme` directive instead
- **Manual theme scripts:** Use `next-themes` for SSR compatibility
- **NEXT_PUBLIC_ for secrets:** Never expose API keys; use server-only pattern
- **Webpack in Next.js 16:** Turbopack is default (use `--webpack` flag if needed)

## Open Questions

Things that couldn't be fully resolved:

1. **Google Cloud Billing Alert CLI Commands**
   - What we know: `gcloud billing budgets create` command exists in SDK
   - What's unclear: Official documentation pages didn't load complete syntax/examples in research
   - Recommendation: Use Google Cloud Console for initial setup (well-documented), or use `gcloud billing budgets create --help` in terminal for command syntax. Console provides guided workflow with threshold configuration at 50%, 100%, 200%.

2. **Tailwind v4 Browser Compatibility Verification**
   - What we know: Requires Safari 16.4+, Chrome 111+, Firefox 128+ due to `@property` and `color-mix()`
   - What's unclear: Exact fallback behavior in older browsers
   - Recommendation: Target modern browsers only (matches project requirements); no polyfill available. Test in target browsers during verification phase.

3. **Next.js 16 with shadcn/ui Component Compatibility**
   - What we know: Next.js 16 starter template with shadcn/ui exists on GitHub
   - What's unclear: Whether all shadcn components work with Turbopack (some build tools have edge cases)
   - Recommendation: Test button, dropdown-menu (for theme toggle) early in implementation. These are stable, widely-used components with high compatibility confidence.

## Sources

### Primary (HIGH confidence)
- [Next.js Official Documentation - Installation](https://nextjs.org/docs/app/getting-started/installation) - Setup commands and configuration
- [Next.js Official Documentation - Data Security](https://nextjs.org/docs/app/guides/data-security) - Environment variable security patterns
- [Tailwind CSS v4 Official Documentation - Dark Mode](https://tailwindcss.com/docs/dark-mode) - Theme configuration
- [Tailwind CSS v4 Official Documentation - Theme Variables](https://tailwindcss.com/docs/theme) - CSS-first configuration
- [shadcn/ui Official Documentation - Next.js Installation](https://ui.shadcn.com/docs/installation/next) - Component setup
- [shadcn/ui Official Documentation - Dark Mode](https://ui.shadcn.com/docs/dark-mode/next) - Theme provider setup
- [Google Cloud Billing Documentation - Budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets) - Budget alert configuration
- [next-themes GitHub Repository](https://github.com/pacocoursey/next-themes) - Theme switching library

### Secondary (MEDIUM confidence)
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) - New features and changes (verified with upgrade guide)
- [@next/bundle-analyzer npm](https://www.npmjs.com/package/@next/bundle-analyzer) - Bundle inspection tool (official Next.js package)
- [@google/genai npm](https://www.npmjs.com/package/@google/genai) - Google AI SDK (official package)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide) - Migration instructions (official)
- [shadcn/ui Theme Toggle Component](https://github.com/shadcn-ui/next-template/blob/main/components/theme-toggle.tsx) - Reference implementation

### Tertiary (LOW confidence)
- Multiple Medium/DEV.to articles about Next.js 16 pitfalls - Community experiences (cross-referenced with official docs)
- Stack Overflow discussions about dark mode flash - Common issue patterns (validated against next-themes solution)

## Metadata

**Confidence breakdown:**
- **Standard stack:** HIGH - All packages verified via official documentation and npm registry; versions confirmed
- **Architecture patterns:** HIGH - Patterns sourced from official Next.js, Tailwind, and shadcn/ui documentation
- **Environment security:** HIGH - Directly from Next.js official security guide
- **Dark mode implementation:** HIGH - Official next-themes GitHub and shadcn/ui docs
- **Pitfalls:** MEDIUM-HIGH - Combination of official upgrade guides and verified community reports
- **Google Cloud billing:** MEDIUM - Console process verified in official docs; CLI commands exist but detailed examples not accessible

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stack is stable, but Tailwind v4 and Next.js 16 are recent releases, monitor for updates)

---

## Key Findings Summary

1. **Next.js 16 setup is streamlined:** Single `create-next-app --yes` command provides complete TypeScript + Tailwind v4 + App Router + Turbopack setup
2. **Tailwind v4 is CSS-first:** Configuration moved from JavaScript to CSS `@theme` directive; breaking change from v3
3. **Dark mode requires next-themes:** Manual localStorage causes flash-on-load in SSR; next-themes prevents this with blocking script
4. **API key security is critical:** Never use `NEXT_PUBLIC_` prefix; implement Data Access Layer with `server-only` package; verify with bundle analyzer
5. **Google Cloud billing alerts have delays:** Not real-time; configure multiple thresholds (50%/100%/200%); budget doesn't stop spending
6. **shadcn/ui copies components:** Unlike dependencies, copies source into project for full control; Tailwind v4 compatible

## Implementation Notes for Planning

**Recommended task sequence:**
1. Create Next.js project with defaults
2. Install next-themes and shadcn/ui
3. Set up theme provider and global CSS with color variables
4. Implement theme toggle component
5. Configure environment variables and add bundle analyzer
6. Set up Google Cloud billing alerts via console
7. Verify environment variable security with bundle analyzer

**Critical verification steps:**
- Run `ANALYZE=true npm run build` and check `client.html` for leaked secrets
- Test dark/light mode toggle with no flash on page load
- Verify theme persists across browser refresh
- Confirm Google Cloud billing alerts are configured at $50/$100/$200 thresholds

**Defer to later phases:**
- AI integration implementation (Phase 2)
- Image handling (Phase 2)
- Deployment configuration (Phase 5)

This research provides sufficient detail for the planner to create specific, actionable tasks.
