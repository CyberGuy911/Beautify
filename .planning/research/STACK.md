# Technology Stack Research

**Project:** Beautify - AI Image Transformation Web App
**Researched:** 2026-01-21
**Domain:** Image transformation web application with AI image generation
**Constraints:** Next.js framework, Vercel hosting, Gemini API (Nano Banana)

---

## Executive Summary

The 2026 stack for AI image transformation web apps centers on Next.js 16 with Turbopack, React Server Components, and Server Actions. The ecosystem has matured significantly: Gemini 2.5 Flash Image (Nano Banana) provides production-ready image generation, Tailwind CSS with shadcn/ui dominates UI development, and TypeScript 5.7 offers enhanced type safety. Key architectural shift: Server Actions replace traditional API routes for mutations, enabling type-safe server-side operations without REST endpoints.

**Recommended stack:**
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5.7+
- **AI Model:** Gemini 2.5 Flash Image via @google/genai
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Image Upload:** react-dropzone + native File API
- **Validation:** Zod + React Hook Form
- **Deployment:** Vercel (serverless)

---

## Core Framework

### Next.js 16
**Version:** Latest (16.x, released October 2025)
**Why:** Production-ready with major performance gains

**Key Features:**
- **Turbopack as default bundler**: 2-5× faster production builds, up to 10× faster Fast Refresh
- **React 19 complete support**: Including stable React Compiler for automatic memoization
- **Improved caching APIs**: Explicit control with revalidateTag(), updateTag(), refresh()
- **Server Components**: Default rendering mode, reduces client-side JavaScript
- **Server Actions**: Type-safe server mutations without API routes

**Real-world evidence:**
- 50%+ of development sessions and 20%+ of production builds on Next.js 15.3+ already use Turbopack
- Build times drop from 56s to 14s in reported cases
- App Router has been production-stable since Next.js 13.4 (May 2023)

**Installation:**
```bash
npx create-next-app@latest beautify --typescript --tailwind --app
```

**Confidence:** HIGH (Official stable release, proven production usage)

**Sources:**
- [Next.js 16 Release](https://nextjs.org/blog/next-16)
- [Next.js 15 vs 16 Comparison](https://peerlist.io/mrchamp/articles/nextjs-16-vs-nextjs-15)
- [App Router Stability Discussion](https://www.nucamp.co/blog/next.js-in-2026-the-full-stack-react-framework-that-dominates-the-industry)

### TypeScript 5.7+
**Version:** 5.7 (November 2024) or later
**Why:** Native Next.js integration with enhanced type safety

**Key Features:**
- Import rewriting with --rewriteRelativeImportExtensions flag
- Direct execution support (no compile step in development)
- Full compatibility with Next.js typed routes
- Native TypeScript config support (next.config.ts)

**Next.js Integration:**
- Built-in TypeScript support, zero configuration
- Typed routes in Next.js 15.5+ provide compile-time route safety
- Server Components have full TypeScript support

**Confidence:** HIGH (Official Next.js integration, current version)

**Sources:**
- [TypeScript 5.7 Features](https://javascript-conference.com/blog/typescript-5-7-5-8-features-ecmascript-direct-execution/)
- [Next.js TypeScript Configuration](https://nextjs.org/docs/pages/api-reference/config/typescript)

---

## AI / Image Generation

### Google Gemini API with @google/genai
**Package:** `@google/genai`
**Version:** 1.37.0 (as of January 2026)
**Why:** Official unified SDK for Gemini 2.5 Flash Image (Nano Banana)

**Model:** `gemini-2.5-flash-image` (official name: Nano Banana)
- State-of-the-art image generation and editing model
- Generally available and production-ready (2026)
- 10 aspect ratios supported
- $0.039 per image (1290 output tokens)

**Key Features:**
- Blend multiple images into single output
- Character consistency for storytelling
- Targeted transformations via natural language
- Uses Gemini's world knowledge for generation

**Installation:**
```bash
npm install @google/genai
```

**Basic Usage Pattern:**
```typescript
import { GoogleGenerativeAI } from '@google/genai';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash-image' });
```

**Important Notes:**
- API key MUST stay server-side (use Server Actions)
- Available via Gemini API (Google AI Studio) and Vertex AI
- SDK reached General Availability (GA) in May 2025
- Replaces deprecated `@google/generative-ai` package

**Confidence:** HIGH (Official GA package, production-ready model)

**Sources:**
- [@google/genai npm package](https://www.npmjs.com/package/@google/genai)
- [Gemini 2.5 Flash Image Documentation](https://ai.google.dev/gemini-api/docs/image-generation)
- [Gemini 2.5 Flash Image Announcement](https://developers.googleblog.com/en/introducing-gemini-2-5-flash-image/)

### Alternative: Vercel AI SDK (NOT RECOMMENDED for this project)
**Why NOT to use:**
- Adds abstraction layer over direct Gemini API
- Project requires ONLY Gemini (no multi-provider support needed)
- Direct @google/genai gives more control and simpler debugging
- Vercel AI SDK better for multi-provider scenarios (OpenAI, Anthropic, etc.)

**When to use Vercel AI SDK:**
- Need to swap between multiple AI providers
- Building conversational UI with streaming
- Require unified interface across providers

**Confidence:** HIGH (Clear use case differentiation)

---

## Frontend / UI

### Tailwind CSS v4
**Version:** 4.x (released 2025)
**Why:** Zero-runtime cost, native Next.js integration, faster than v3

**Key Advantages:**
- Compile-time CSS generation (no runtime JavaScript)
- Full compatibility with Server Components
- Faster builds than Tailwind v3
- Utility-first approach = 10x faster development than CSS-in-JS
- Native Next.js support (recommended in official docs)

**Installation:**
```bash
npm install -D tailwindcss@latest postcss autoprefixer
npx tailwindcss init -p
```

**Configuration:**
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
```

**Confidence:** HIGH (Official Next.js recommendation, v4 stable)

**Sources:**
- [Tailwind vs CSS-in-JS 2026](https://medium.com/@sureshdotariya/styling-strategies-in-next-js-2025-css-modules-vs-tailwind-css-4-vs-css-in-js-c63107ba533c)
- [Next.js Tailwind Guide](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)

### shadcn/ui
**Version:** Latest (continuously updated)
**Why:** Copy-paste components, full customization, no dependency lock-in

**Key Advantages:**
- Components built on Radix UI (accessible primitives) + Tailwind CSS
- Copy-paste approach = full code ownership (not a package dependency)
- Server Components support (non-interactive components run server-side)
- Interactive components auto-marked with "use client"
- Seamless Next.js App Router integration

**Installation:**
```bash
npx shadcn@latest init
```

**Common Components for Image App:**
- Button
- Card (for image display)
- Dialog (for upload modal if needed)
- Progress (for upload/generation progress)
- Toast (for notifications)

**Confidence:** HIGH (Leading choice for Next.js in 2026, official Next.js examples use it)

**Sources:**
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next)
- [React Component Libraries 2026](https://www.untitledui.com/blog/react-component-libraries)

### Alternative: CSS-in-JS (NOT RECOMMENDED)
**Why avoid:**
- Runtime overhead incompatible with Server Components
- Slower performance (JavaScript execution required)
- Tailwind 10x faster for rapid development
- Next.js 2026 ecosystem has moved to Tailwind

**Confidence:** HIGH (Clear industry consensus)

---

## Image Handling

### Image Upload: react-dropzone
**Version:** Latest (14.x as of 2026)
**Why:** Lightweight, HTML5-compliant, excellent DX

**Key Features:**
- Drag-and-drop + click to upload
- File type validation
- File size validation
- Fully customizable UI
- Works with React hooks
- No backend logic (just UI handling)

**Installation:**
```bash
npm install react-dropzone
```

**Basic Usage:**
```typescript
import { useDropzone } from 'react-dropzone';

const { getRootProps, getInputProps } = useDropzone({
  accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
  maxSize: 5242880, // 5MB
  onDrop: (files) => handleUpload(files)
});
```

**Confidence:** HIGH (Battle-tested library, widely used in production)

**Sources:**
- [React Dropzone Official](https://react-dropzone.js.org/)
- [React File Upload Libraries 2026](https://reactscript.com/best-file-upload/)

### Image Processing: sharp (if needed)
**Version:** Latest (0.33.x)
**Why:** 4-5× faster than alternatives, official Next.js default

**Use Case for Beautify:**
- Likely NOT needed if Gemini handles all processing
- Use only if need to: resize uploads before sending to Gemini, create thumbnails, or optimize downloads

**Installation:**
```bash
npm install sharp
```

**Key Advantages:**
- Ships as default in Next.js
- Supports WebP, AVIF, modern formats
- Server-side only (uses Node-API)
- 4-5× faster than jimp or ImageMagick

**Confidence:** HIGH (Official Next.js default, proven performance)

**Sources:**
- [sharp Performance](https://sharp.pixelplumbing.com/performance/)
- [sharp vs jimp Comparison](https://www.peterbe.com/plog/sharp-vs-jimp)

### Next.js Image Component
**Component:** `next/image`
**Why:** Automatic optimization, WebP conversion, lazy loading

**Key Features:**
- Automatic format conversion (WebP/AVIF)
- Responsive image sizing
- Prevents layout shift
- Native lazy loading
- Blur placeholder support

**Usage:**
```typescript
import Image from 'next/image';

<Image
  src="/generated-image.png"
  alt="Generated portrait"
  width={500}
  height={500}
  placeholder="blur"
  blurDataURL={blurData}
/>
```

**Remote Images Configuration:**
```typescript
// next.config.ts
const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'generativelanguage.googleapis.com',
        pathname: '/**',
      },
    ],
  },
}
```

**Confidence:** HIGH (Official Next.js component, current docs)

**Sources:**
- [Next.js Image Component Docs](https://nextjs.org/docs/app/api-reference/components/image)
- [Next.js Image Optimization Guide](https://nextjs.org/docs/app/getting-started/images)

---

## Form Handling & Validation

### Zod
**Version:** 4.x (stable)
**Why:** TypeScript-first schema validation, integrates with Server Actions

**Key Features:**
- Type inference (schema → TypeScript types)
- Works on client AND server (shared schemas)
- safeParse() for error handling
- Integrates with React Hook Form

**Installation:**
```bash
npm install zod
```

**Usage Pattern:**
```typescript
import { z } from 'zod';

const uploadSchema = z.object({
  image: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Max 5MB')
    .refine((file) => ['image/png', 'image/jpeg'].includes(file.type), 'PNG or JPEG only')
});

// Server Action
export async function uploadImage(formData: FormData) {
  const result = uploadSchema.safeParse({
    image: formData.get('image')
  });

  if (!result.success) {
    return { error: result.error.flatten() };
  }
  // Process...
}
```

**Confidence:** HIGH (Recommended by Next.js official docs)

**Sources:**
- [Zod Official Docs](https://zod.dev/)
- [Next.js Forms with Zod](https://www.freecodecamp.org/news/handling-forms-nextjs-server-actions-zod/)

### React Hook Form
**Version:** 7.x
**Why:** Minimal re-renders, excellent DX, works with Server Actions

**Key Features:**
- Performance (uncontrolled components, minimal re-renders)
- Built-in validation with Zod resolver
- Works with useActionState (React 19)
- Error handling for server actions

**Installation:**
```bash
npm install react-hook-form @hookform/resolvers
```

**Usage with Server Actions:**
```typescript
'use client'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(uploadSchema),
  mode: 'onBlur' // Validate before server submission
});
```

**Confidence:** MEDIUM-HIGH (Works well, but Server Actions may reduce need)

**Note:** For simple forms, Server Actions + native FormData may be sufficient. Use React Hook Form when you need:
- Complex client-side validation
- Multi-step forms
- Field-level error handling

**Sources:**
- [React Hook Form with Next.js 15](https://medium.com/@sankalpa115/mastering-form-handling-in-next-js-15-with-server-actions-react-hook-form-react-query-and-shadcn-108f6863200f)
- [React Hook Form Official](https://react-hook-form.com/)

---

## Server-Side Architecture

### Server Actions (Primary)
**Why:** Type-safe mutations without REST endpoints

**Use Server Actions for:**
- Image upload handling
- Calling Gemini API (keeps API key server-side)
- Form submissions
- Database mutations (if added later)

**Pattern:**
```typescript
'use server'

export async function generateImage(formData: FormData) {
  const file = formData.get('image') as File;

  // Validate
  const result = uploadSchema.safeParse({ image: file });
  if (!result.success) return { error: result.error };

  // Process with Gemini
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  // ... generation logic

  return { success: true, imageUrl: '...' };
}
```

**Advantages:**
- End-to-end type safety
- No HTTP endpoint exposed
- Automatic serialization
- Simplified error handling

**Confidence:** HIGH (Official Next.js pattern, production-ready)

**Sources:**
- [Server Actions vs API Routes](https://dev.to/myogeshchavan97/nextjs-server-actions-vs-api-routes-dont-build-your-app-until-you-read-this-4kb9)
- [Next.js Server Actions Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### API Routes (Secondary)
**When to use:** ONLY if you need:
- External webhooks
- Public API endpoints
- Non-Next.js clients

**For Beautify:** NOT NEEDED (Server Actions handle everything)

**Confidence:** HIGH (Clear guidance on when to use each)

---

## File Storage

### Development: Local Filesystem (Temporary)
**Why:** Simple, no cost during development

**Pattern:**
```typescript
import fs from 'fs/promises';
import path from 'path';

// Temporary storage in /public/uploads
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
await fs.writeFile(path.join(uploadDir, filename), buffer);
```

**Use ONLY for development.** Not suitable for production (Vercel serverless limits).

### Production: Vercel Blob Storage
**Package:** `@vercel/blob`
**Why:** Native Vercel integration, globally distributed, supports large files

**Key Features:**
- Up to 5TB file support
- Multi-part uploads with resumability
- Powered by AWS S3 (99.999999999% reliability)
- Native integration with Next.js Image component
- Global CDN distribution

**Installation:**
```bash
npm install @vercel/blob
```

**Usage:**
```typescript
import { put } from '@vercel/blob';

const blob = await put('generated-image.png', file, {
  access: 'public',
});

// blob.url can be used directly in <Image src={blob.url} />
```

**Cost:** Pay-as-you-go, efficient for image storage

**Confidence:** HIGH (Official Vercel solution, production-ready)

**Sources:**
- [Vercel Blob Documentation](https://vercel.com/docs/vercel-blob)
- [Vercel Blob GA Announcement](https://vercel.com/blog/vercel-blob-now-generally-available)

### Alternative: Vercel KV or Postgres (NOT NEEDED)
**Why avoid:** Overkill for simple image app with no persistence requirements

---

## Development Tools

### ESLint 9
**Why:** Supported in Next.js 15+, improved performance

**Installation:** (Included in create-next-app)
```bash
npm install -D eslint@latest eslint-config-next@latest
```

**Confidence:** HIGH (Official Next.js support)

### Prettier (Optional but Recommended)
**Why:** Consistent code formatting across team

**Installation:**
```bash
npm install -D prettier prettier-plugin-tailwindcss
```

**Config:**
```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

**Confidence:** HIGH (Industry standard)

---

## Deployment

### Vercel (Required per Constraints)
**Why:** Native Next.js integration, serverless, global CDN

**Key Features:**
- Zero-config deployment (connect GitHub repo)
- Automatic preview deployments for PRs
- Environment variable management
- Edge network (low latency globally)
- Built-in analytics and monitoring

**Environment Variables Required:**
```bash
GEMINI_API_KEY=your_api_key_here
BLOB_READ_WRITE_TOKEN=auto_generated_by_vercel
```

**Confidence:** HIGH (Official Next.js deployment platform)

---

## Complete Installation Script

```bash
# Create Next.js 16 app
npx create-next-app@latest beautify \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd beautify

# Core dependencies
npm install @google/genai zod react-dropzone

# Form handling (if needed)
npm install react-hook-form @hookform/resolvers

# UI components
npx shadcn@latest init
npx shadcn@latest add button card progress toast

# Image processing (if needed)
npm install sharp

# Storage (for production)
npm install @vercel/blob

# Dev dependencies
npm install -D @types/node prettier prettier-plugin-tailwindcss

# Initialize git
git init
git add .
git commit -m "Initial commit with full stack"
```

---

## Stack Dependencies Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 16.x | App framework |
| **Language** | TypeScript | 5.7+ | Type safety |
| **AI SDK** | @google/genai | 1.37.0+ | Gemini API client |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **UI Library** | shadcn/ui | Latest | Component primitives |
| **Upload** | react-dropzone | 14.x | File upload UI |
| **Validation** | Zod | 4.x | Schema validation |
| **Forms** | React Hook Form | 7.x | Form state management |
| **Image Processing** | sharp | 0.33.x | Server-side image ops |
| **Storage** | @vercel/blob | Latest | Production file storage |
| **Deployment** | Vercel | N/A | Hosting platform |

---

## What NOT to Use

### ❌ Vercel AI SDK
**Why:** Unnecessary abstraction for single-provider app. Direct @google/genai gives better control.

### ❌ CSS-in-JS (styled-components, emotion, etc.)
**Why:** Runtime overhead, incompatible with Server Components, slower than Tailwind.

### ❌ jimp or ImageMagick
**Why:** 4-5× slower than sharp, not optimized for Next.js.

### ❌ express.js or custom server
**Why:** Breaks Vercel serverless model, loses Next.js optimizations.

### ❌ @google/generative-ai (old SDK)
**Why:** Deprecated. Use @google/genai instead.

### ❌ React FilePond or heavy upload libraries
**Why:** Overkill for simple single-image upload. react-dropzone is sufficient.

### ❌ Vercel KV / Postgres / Database
**Why:** Not needed for stateless image transformation app. Adds complexity.

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| **Framework (Next.js 16)** | HIGH | Official stable release, proven production usage, 50%+ adoption |
| **AI SDK (@google/genai)** | HIGH | Official GA package, production-ready model, current documentation |
| **Styling (Tailwind + shadcn)** | HIGH | Industry standard 2026, official Next.js recommendation |
| **Image Upload (react-dropzone)** | HIGH | Battle-tested, widely used, simple integration |
| **Validation (Zod)** | HIGH | TypeScript-native, recommended by Next.js docs |
| **Storage (Vercel Blob)** | HIGH | Official Vercel solution, GA status, proven reliability |
| **Server Actions** | HIGH | Official Next.js pattern, stable since 13.4 |
| **Form Handling (React Hook Form)** | MEDIUM | Works well but may be overkill for simple forms |

---

## Sources

### Official Documentation
- [Next.js Official Docs](https://nextjs.org/docs)
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [@google/genai npm Package](https://www.npmjs.com/package/@google/genai)
- [Vercel Blob Documentation](https://vercel.com/docs/vercel-blob)

### Performance & Comparisons
- [Next.js 15 vs 16 Comparison](https://peerlist.io/mrchamp/articles/nextjs-16-vs-nextjs-15)
- [Tailwind vs CSS-in-JS 2026](https://medium.com/@sureshdotariya/styling-strategies-in-next-js-2025-css-modules-vs-tailwind-css-4-vs-css-in-js-c63107ba533c)
- [Server Actions vs API Routes](https://dev.to/myogeshchavan97/nextjs-server-actions-vs-api-routes-dont-build-your-app-until-you-read-this-4kb9)
- [sharp Performance Benchmarks](https://sharp.pixelplumbing.com/performance/)

### Integration Guides
- [React Hook Form with Next.js 15](https://medium.com/@sankalpa115/mastering-form-handling-in-next-js-15-with-server-actions-react-hook-form-react-query-and-shadcn-108f6863200f)
- [Next.js Image Upload Best Practices](https://strapi.io/blog/epic-next-js-15-tutorial-part-5-file-upload-using-server-actions)
- [Zod with Next.js Forms](https://www.freecodecamp.org/news/handling-forms-nextjs-server-actions-zod/)

### Community Resources
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next)
- [React Component Libraries 2026](https://www.untitledui.com/blog/react-component-libraries)
- [React Dropzone Official Site](https://react-dropzone.js.org/)

---

## Notes for Roadmap Creation

### Phase Structure Implications

**Phase 1 should focus on:**
- Next.js 16 project scaffolding
- Basic UI with Tailwind + shadcn/ui
- Image upload component (react-dropzone)
- Simple Server Action for file handling

**Phase 2 should add:**
- Gemini API integration (@google/genai)
- Image transformation logic
- Error handling and validation (Zod)

**Phase 3 should implement:**
- Download functionality
- Polish UI/UX
- Add Vercel Blob storage for production

**Defer to later:**
- React Hook Form (use native FormData initially)
- Complex image processing (sharp) - only if Gemini output needs optimization
- Database/persistence - not needed for MVP

### Technology Maturity

**Battle-tested (low risk):**
- Next.js 16 (stable, proven)
- Tailwind CSS (industry standard)
- react-dropzone (mature library)
- Zod (widely adopted)

**Recently stable (medium-low risk):**
- @google/genai (GA since May 2025)
- Gemini 2.5 Flash Image model (production-ready 2026)
- Server Actions (stable since Next.js 13.4)

**Cutting edge (monitor closely):**
- Tailwind CSS v4 (recently released, but stable)
- React 19 features (new, but Next.js 16 has full support)

---

**Research completed:** 2026-01-21
**Confidence overall:** HIGH
**Ready for roadmap creation:** YES
