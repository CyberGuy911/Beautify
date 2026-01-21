# Architecture Research

**Domain:** Image transformation web app with AI backend
**Researched:** 2026-01-21
**Confidence:** HIGH

## Executive Summary

Image transformation web apps with AI backends follow a **client-server-AI service** three-tier architecture. The frontend handles user interaction and file selection, the backend acts as a secure proxy for AI API calls, and the external AI service performs the actual transformation. For Next.js on Vercel with Gemini, the optimal architecture is:

1. **Frontend**: React components with client-side file handling
2. **Backend**: Next.js API Routes as secure proxy
3. **AI Service**: Gemini API (Nano Banana) for image generation
4. **Storage**: Temporary in-memory handling (no persistent storage for MVP)

## Component Overview

### 1. Frontend Components (Client-Side)

**Responsibility:** User interface, file selection, image preview, download handling

**Key Components:**
- **Upload Component** (`use client` directive required)
  - File input with drag-and-drop
  - Client-side validation (file type, size)
  - Image preview before transformation
  - FormData API for multipart upload

- **Transformation Component**
  - Loading state during AI processing
  - Display transformed image result
  - Download button for result

- **Error Handling Component**
  - User-friendly error messages
  - Validation feedback

**Technology Stack:**
- Next.js 15 App Router
- React 19 with `use client` for file interactions
- Native FormData API (no external upload libraries needed for MVP)

**Why This Approach:**
Client-side file handling bypasses Vercel's 4.5MB serverless function body size limit. Files are read in the browser, converted to base64, and sent as JSON payload to API route.

### 2. Backend Proxy Layer (API Routes)

**Responsibility:** Secure API key handling, request validation, Gemini API communication

**Key Components:**
- **API Route Handler** (`/app/api/transform/route.ts`)
  - Receives base64-encoded image from client
  - Server-side validation (size, type, format)
  - Calls Gemini API with secure API key
  - Returns transformed image as base64

**Technology Stack:**
- Next.js API Routes (not Server Actions)
- Environment variables for API key storage
- Standard fetch for Gemini API calls

**Why API Routes (Not Server Actions):**
- Clear API endpoint structure
- Easier to add rate limiting later
- Better error handling for external API calls
- Separation of concerns between UI and API logic

### 3. AI Service Integration (Gemini API)

**Responsibility:** Image transformation via AI model

**Key Details:**
- **Model:** `gemini-2.5-flash-image` (Nano Banana)
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`
- **Authentication:** `x-goog-api-key` header
- **Input Format:** JSON with base64-encoded image
- **Output Format:** JSON with base64-encoded transformed image

**Request Structure:**
```json
{
  "contents": [{
    "parts": [
      {"text": "Transform this into a mystical cosmic portrait"},
      {"inline_data": {"mime_type": "image/jpeg", "data": "<base64>"}}
    ]
  }]
}
```

**Response Structure:**
```json
{
  "candidates": [{
    "content": {
      "parts": [
        {"inline_data": {"mime_type": "image/jpeg", "data": "<base64>"}}
      ]
    }
  }]
}
```

## Data Flow

### Complete User Journey (Upload → Transform → Download)

```
1. USER UPLOADS IMAGE
   └─> Client: File selected via <input type="file">
   └─> Client: Validate file (type: image/*, size: <5MB)
   └─> Client: Read file as base64 using FileReader API
   └─> Client: Display preview (optional)

2. USER CLICKS "CREATE"
   └─> Client: POST /api/transform with JSON body:
       {
         "image": "data:image/jpeg;base64,...",
         "prompt": "mystical cosmic portrait"
       }
   └─> Client: Show loading state

3. SERVER PROCESSES REQUEST
   └─> API Route: Receive request
   └─> API Route: Validate payload (image format, size, prompt)
   └─> API Route: Extract base64 data
   └─> API Route: Construct Gemini API request
   └─> API Route: POST to Gemini with API key from env
   └─> API Route: Wait for Gemini response

4. GEMINI PROCESSES IMAGE
   └─> Gemini: Receives image + prompt
   └─> Gemini: Generates mystical cosmic portrait
   └─> Gemini: Returns base64-encoded result with SynthID watermark
   └─> Gemini: ~2-5 seconds processing time

5. SERVER RETURNS RESULT
   └─> API Route: Extract transformed image from Gemini response
   └─> API Route: Return JSON: {"image": "data:image/jpeg;base64,..."}
   └─> API Route: Handle errors (timeout, invalid response, etc.)

6. CLIENT DISPLAYS RESULT
   └─> Client: Receive transformed image
   └─> Client: Display in <img> tag
   └─> Client: Enable download button
   └─> Client: Download via <a> tag with data URL
```

### Data Format at Each Stage

| Stage | Format | Size Concern | Notes |
|-------|--------|--------------|-------|
| User selection | File object | <5MB recommended | Browser memory limit |
| Client → Server | Base64 in JSON | ~33% larger than file | Vercel max: 4.5MB body |
| Server → Gemini | Base64 in JSON | Gemini handles large images | No explicit limit found |
| Gemini → Server | Base64 in JSON | Variable size | Depends on output resolution |
| Server → Client | Base64 in JSON | ~33% larger than image | Browser can handle large base64 |
| Client download | Blob/File | Original image size | Data URL → downloadable file |

## API Design

### Frontend to Backend

**Endpoint:** `POST /api/transform`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "prompt": "Transform this into a mystical cosmic portrait"
}
```

**Response (Success - 200):**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "model": "gemini-2.5-flash-image",
  "timestamp": "2026-01-21T18:00:00Z"
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid image format. Supported: JPEG, PNG, WebP",
  "code": "INVALID_FORMAT"
}
```

**Response (Error - 413):**
```json
{
  "error": "Image too large. Maximum size: 5MB",
  "code": "FILE_TOO_LARGE"
}
```

**Response (Error - 500):**
```json
{
  "error": "Transformation failed. Please try again.",
  "code": "AI_SERVICE_ERROR"
}
```

### Backend to Gemini

**Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`

**Request Headers:**
```
Content-Type: application/json
x-goog-api-key: <API_KEY_FROM_ENV>
```

**Request Body:**
```json
{
  "contents": [{
    "parts": [
      {
        "text": "Transform this photo into a mystical cosmic portrait. Create a dreamy, ethereal atmosphere with celestial elements, cosmic colors, and magical lighting."
      },
      {
        "inline_data": {
          "mime_type": "image/jpeg",
          "data": "/9j/4AAQSkZJRg..."
        }
      }
    ]
  }],
  "generationConfig": {
    "aspectRatio": "1:1",
    "numberOfImages": 1
  }
}
```

**Response (Success):**
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "inline_data": {
          "mime_type": "image/jpeg",
          "data": "/9j/4AAQSkZJRg..."
        }
      }],
      "role": "model"
    },
    "finishReason": "STOP"
  }],
  "usageMetadata": {
    "promptTokenCount": 25,
    "candidatesTokenCount": 0,
    "totalTokenCount": 25
  }
}
```

## File/Image Handling

### Upload Strategy: Client-Side Conversion

**Why Not Traditional Multipart Upload:**
- Vercel serverless functions have 4.5MB body size limit
- Traditional multipart requires body parser configuration
- API Routes would need external storage (S3, Vercel Blob) for files >4.5MB

**Recommended Approach: Base64 JSON Payload**
1. User selects file in browser
2. Client reads file using FileReader API
3. Convert to base64 data URL
4. Send as JSON string in POST body
5. Server extracts base64, forwards to Gemini
6. Gemini returns base64, server forwards to client
7. Client converts base64 to downloadable blob

**Advantages:**
- No multipart parsing needed
- No temporary file storage needed
- Works within Vercel constraints
- Simpler error handling
- No cleanup required

**Implementation Pattern:**

```typescript
// Client-side
const handleUpload = async (file: File) => {
  // Validate
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large');
  }

  // Convert to base64
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  // Send to API
  const response = await fetch('/api/transform', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64, prompt: 'mystical cosmic portrait' })
  });

  const result = await response.json();
  return result.image; // base64 string
};

// Server-side API route
export async function POST(request: Request) {
  const { image, prompt } = await request.json();

  // Extract base64 data
  const base64Data = image.split(',')[1];
  const mimeType = image.match(/data:([^;]+)/)?.[1] || 'image/jpeg';

  // Call Gemini
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY!
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: base64Data } }
          ]
        }]
      })
    }
  );

  const result = await geminiResponse.json();
  const transformedBase64 = result.candidates[0].content.parts[0].inline_data.data;

  return Response.json({
    image: `data:image/jpeg;base64,${transformedBase64}`
  });
}
```

### Download Strategy

**Simple Data URL Download:**
```typescript
const handleDownload = (base64Image: string) => {
  const link = document.createElement('a');
  link.href = base64Image;
  link.download = `beautify-${Date.now()}.jpg`;
  link.click();
};
```

### Temporary Storage: None Required

**MVP Architecture (No Storage):**
- Images exist only in browser memory and API request/response cycle
- No persistent storage needed
- No cleanup required
- No storage costs
- Simplified architecture

**Post-MVP Considerations (If History Feature Added):**
- Use Vercel Blob for user image history
- Store original + transformed image pairs
- Add user authentication
- Implement gallery view

## Security Considerations

### 1. API Key Protection (CRITICAL)

**Pattern: Server-Side Only, Never Exposed to Client**

**DO:**
```typescript
// .env.local (development)
GEMINI_API_KEY=AIzaSy...

// Vercel environment variables (production)
// Set via dashboard or vercel env add

// API Route access
const apiKey = process.env.GEMINI_API_KEY;
```

**DON'T:**
```typescript
// NEVER prefix with NEXT_PUBLIC_
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy... // ❌ EXPOSED TO CLIENT!

// NEVER hardcode
const apiKey = "AIzaSy..."; // ❌ COMMITTED TO GIT!

// NEVER send to client
return Response.json({ apiKey }); // ❌ LEAKED!
```

**Verification:**
- Check bundled JavaScript in browser DevTools
- API key should never appear in _app.js or page bundles
- Only server-side code can access non-NEXT_PUBLIC_ env vars

### 2. File Upload Validation

**Client-Side (UX Only):**
```typescript
// Type validation
const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!validTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

// Size validation
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
if (file.size > MAX_SIZE) {
  throw new Error('File too large');
}
```

**Server-Side (Security):**
```typescript
// Never trust client-side validation
// Re-validate in API route

// Check base64 format
if (!image.startsWith('data:image/')) {
  return Response.json({ error: 'Invalid format' }, { status: 400 });
}

// Check MIME type
const mimeType = image.match(/data:([^;]+)/)?.[1];
if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
  return Response.json({ error: 'Invalid MIME type' }, { status: 400 });
}

// Check size (base64 is ~33% larger than file)
const base64Data = image.split(',')[1];
const sizeInBytes = (base64Data.length * 3) / 4;
if (sizeInBytes > 5 * 1024 * 1024) {
  return Response.json({ error: 'File too large' }, { status: 413 });
}
```

### 3. Rate Limiting (Post-MVP)

**Considerations:**
- Gemini API has rate limits (unspecified in docs, likely per-key)
- Vercel serverless functions have execution time limits (10s Hobby, 60s Pro)
- Consider implementing:
  - Per-IP rate limiting (e.g., 10 requests/minute)
  - Request queuing if Gemini is slow
  - Timeout handling (abort after 30s)

**Basic Implementation (Post-MVP):**
```typescript
// Use Vercel Edge Config or Upstash Redis for rate limit tracking
import { ratelimit } from '@/lib/ratelimit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // ... rest of handler
}
```

### 4. Content Security

**Considerations:**
- Gemini includes SynthID watermark on all generated images
- Prompt injection: User could theoretically manipulate prompt
- Malicious file upload: Server validates MIME type and size

**Prompt Handling:**
```typescript
// Fixed prompt (recommended for MVP)
const prompt = "Transform this photo into a mystical cosmic portrait";

// If user prompt customization added later
const sanitizePrompt = (userPrompt: string) => {
  // Remove potentially harmful instructions
  const cleaned = userPrompt
    .replace(/ignore previous instructions/gi, '')
    .replace(/system:/gi, '')
    .slice(0, 500); // Limit length

  return cleaned;
};
```

### 5. Error Information Disclosure

**DO:**
```typescript
// Generic user-facing messages
return Response.json({
  error: 'Transformation failed. Please try again.',
  code: 'AI_SERVICE_ERROR'
}, { status: 500 });
```

**DON'T:**
```typescript
// Exposing internal details
return Response.json({
  error: geminiError.message, // ❌ May leak API details
  stack: error.stack // ❌ Exposes server internals
}, { status: 500 });
```

**Logging:**
```typescript
// Log detailed errors server-side only
console.error('Gemini API Error:', {
  status: geminiResponse.status,
  body: await geminiResponse.text(),
  timestamp: new Date().toISOString()
});

// Return generic error to client
return Response.json({ error: 'Service unavailable' }, { status: 500 });
```

## Suggested Build Order

### Phase 1: Basic Upload/Display (No AI)
**Goal:** Prove file handling works

1. Create Next.js project with App Router
2. Build upload component with file selection
3. Implement client-side validation (type, size)
4. Display uploaded image preview
5. Implement download functionality (download original)

**Why First:**
- De-risk file handling complexity
- No external dependencies yet
- Verifiable locally without API key
- Establishes UI patterns

**Deliverables:**
- User can select image
- Image preview displays
- Download button works
- Client-side validation prevents bad files

### Phase 2: API Route Structure (Mock Response)
**Goal:** Prove client-server communication works

1. Create `/api/transform/route.ts`
2. Receive base64 image from client
3. Server-side validation (re-validate type, size)
4. Return mock transformed image (same image with text overlay)
5. Error handling (400, 413, 500)

**Why Second:**
- De-risk API Route implementation
- Test base64 payload size limits on Vercel
- Establish error handling patterns
- No Gemini API key needed yet

**Deliverables:**
- Client successfully POSTs to API route
- Server receives and validates image
- Client displays "transformed" (mock) image
- Error messages display correctly

### Phase 3: Gemini Integration
**Goal:** Connect to real AI service

1. Obtain Gemini API key
2. Store in environment variables (.env.local, Vercel dashboard)
3. Implement Gemini API call in `/api/transform`
4. Parse Gemini response and extract image
5. Handle Gemini-specific errors (rate limit, timeout, invalid response)

**Why Third:**
- All infrastructure proven to work
- Only adding external API call
- Can test with real transformations
- Clear success criteria (AI-generated image appears)

**Deliverables:**
- Real AI transformations work
- Loading state during processing (2-5s)
- Gemini errors handled gracefully
- API key never exposed to client

### Phase 4: Polish & Error Handling
**Goal:** Production-ready experience

1. Improve loading states (progress indicator)
2. Add detailed error messages
3. Handle edge cases (timeout, network error, invalid image)
4. Optimize base64 encoding/decoding
5. Add basic analytics (optional)

**Why Fourth:**
- Core functionality already working
- Can prioritize based on testing
- User feedback informs priorities
- Launch-blocking bugs already caught

**Deliverables:**
- Smooth user experience
- Clear error messages
- Handles network issues gracefully
- Ready for production deployment

### Phase Dependencies

```
Phase 1 (Upload/Display)
    ↓ (requires working UI)
Phase 2 (API Route)
    ↓ (requires working API structure)
Phase 3 (Gemini Integration)
    ↓ (requires working transformation)
Phase 4 (Polish)
```

**Critical Path:**
- Cannot test API route without upload UI
- Cannot integrate Gemini without API route
- Cannot polish without core functionality

**Parallel Work Opportunities:**
- Design/styling can happen alongside Phase 1-2
- Error message copy can be drafted early
- Gemini API key can be obtained during Phase 2

## Alternative Architectures Considered

### Alternative 1: Server Actions Instead of API Routes

**What:**
Use Next.js Server Actions for form submission instead of API Routes

**Why Not:**
- Server Actions better for form-heavy apps with database mutations
- API Routes provide clearer separation for external API integration
- Easier to add rate limiting to API routes
- Better error handling for external service calls
- More explicit request/response structure

**When to Reconsider:**
- If adding user authentication and database
- If form validation becomes complex
- If type safety becomes critical

### Alternative 2: Direct Client-to-Gemini (No Backend)

**What:**
Call Gemini API directly from client using API key

**Why Not:**
- Exposes API key to client (major security risk)
- Cannot implement rate limiting
- Gemini API key appears in browser DevTools
- Anyone can extract key and use your quota
- Violates security best practices

**When to Reconsider:**
- Never. Always use backend proxy for API keys.

### Alternative 3: External Storage (S3/Vercel Blob)

**What:**
Upload image to S3/Vercel Blob, pass URL to Gemini, store result

**Why Not:**
- Adds complexity (storage service, signed URLs, cleanup)
- Adds cost (storage, bandwidth)
- Adds latency (upload → storage → Gemini → storage → download)
- Requires cleanup logic (delete after X time)
- Overkill for one-time transformations

**When to Reconsider:**
- If adding image history/gallery feature
- If files exceed 5MB regularly
- If implementing user accounts
- If need to show "recent transformations"

### Alternative 4: WebSocket/Streaming Response

**What:**
Stream transformation progress from Gemini to client in real-time

**Why Not:**
- Gemini API doesn't support streaming for image generation
- Adds complexity (WebSocket server, state management)
- Minimal UX benefit (transformation takes 2-5s)
- Harder to deploy on Vercel (serverless constraints)

**When to Reconsider:**
- If transformation time exceeds 10s regularly
- If adding real-time progress updates
- If implementing batch processing

## Architecture Patterns to Follow

### Pattern 1: Secure Proxy Pattern

**What:**
Backend acts as secure intermediary between client and external service

**When:**
Any time external service requires API key or secrets

**Implementation:**
```
Client → API Route (with API key) → External Service
  ↓                                        ↓
  ← ───────────────── Response ─────────────
```

**Benefits:**
- API key never exposed
- Can add rate limiting
- Can transform requests/responses
- Can implement caching

### Pattern 2: Optimistic UI Updates

**What:**
Show immediate feedback while waiting for server response

**When:**
Operations take >1 second

**Implementation:**
```typescript
const [isLoading, setIsLoading] = useState(false);
const [transformedImage, setTransformedImage] = useState<string | null>(null);

const handleTransform = async (image: string) => {
  setIsLoading(true); // Immediate feedback
  try {
    const result = await fetch('/api/transform', { ... });
    setTransformedImage(result.image);
  } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false);
  }
};
```

### Pattern 3: Progressive Enhancement

**What:**
Build core functionality first, add enhancements later

**When:**
MVP development

**Implementation:**
```
MVP:
- Upload image
- Transform
- Download

Post-MVP:
- Drag-and-drop upload
- Image history
- Batch processing
- Custom prompts
```

## Architecture Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side API Key Exposure

**What:**
Calling external APIs directly from client with API key

**Why Bad:**
- API key visible in browser
- Anyone can steal and use your quota
- Cannot revoke without redeploying

**Prevention:**
- Always use API Routes as proxy
- Never use NEXT_PUBLIC_ prefix for secrets
- Store API keys in environment variables only

### Anti-Pattern 2: Synchronous File Processing in Serverless

**What:**
Uploading large files to serverless function and processing synchronously

**Why Bad:**
- Serverless functions have body size limits (4.5MB Vercel)
- Timeout limits (10s Hobby, 60s Pro)
- Cold starts add latency
- No progress feedback

**Prevention:**
- Use client-side base64 conversion for small files
- Use presigned URLs + client-to-storage upload for large files
- Use background jobs for batch processing

### Anti-Pattern 3: Storing Secrets in Code

**What:**
Hardcoding API keys, putting them in .env committed to git

**Why Bad:**
- Keys exposed in git history forever
- Cannot rotate without changing code
- Leaked to anyone with repo access

**Prevention:**
- Use .env.local (gitignored)
- Use hosting platform environment variables
- Use secret management services for production

### Anti-Pattern 4: Trusting Client-Side Validation

**What:**
Only validating file type/size on client, skipping server validation

**Why Bad:**
- Anyone can bypass client-side validation
- Malicious users can send invalid data
- Opens security vulnerabilities

**Prevention:**
- Always re-validate on server
- Treat all client input as untrusted
- Implement proper error handling for invalid input

### Anti-Pattern 5: No Error Handling for External APIs

**What:**
Calling external API without timeout, retry logic, or error handling

**Why Bad:**
- External service outages break your app
- Long timeouts lead to poor UX
- No feedback when things fail

**Prevention:**
- Implement timeouts (30s for AI APIs)
- Handle specific error codes (400, 429, 500)
- Return user-friendly error messages
- Log detailed errors server-side only

## Scalability Considerations

### At 100 Users
**Concerns:**
- None. Vercel serverless scales automatically
- Gemini API should handle easily

**Approach:**
- Standard Next.js on Vercel
- No optimizations needed

### At 10K Users
**Concerns:**
- Gemini API rate limits may be hit
- Vercel function invocation costs
- Concurrent transformation requests

**Approach:**
- Monitor Gemini API usage
- Implement basic rate limiting (per-IP)
- Add request queuing if rate limits hit
- Consider caching common transformations (if prompts are fixed)

**Cost Estimate:**
- Vercel: ~$20-50/month (Pro plan)
- Gemini API: Variable based on image resolution/count

### At 1M Users
**Concerns:**
- Gemini API rate limits definitely a bottleneck
- Need to request quota increase from Google
- Vercel function costs significant
- Need proper rate limiting and abuse prevention

**Approach:**
- Batch API for background processing (up to 24h turnaround)
- User authentication + per-user rate limits
- CDN caching for static assets
- Consider self-hosted image processing for common transformations
- Implement paid tier for priority processing
- Monitor costs closely (may need dedicated Vertex AI contract)

**Architecture Changes:**
- Add database for user accounts, usage tracking
- Add job queue (BullMQ, etc.) for request queuing
- Add Redis for rate limiting
- Consider multi-region deployment
- Implement proper observability (Datadog, etc.)

## Future Architecture Considerations

### Adding User Accounts
**Changes Required:**
- Add authentication (NextAuth.js, Clerk, etc.)
- Add database (PostgreSQL via Vercel Postgres)
- Store user ID with each transformation
- Implement per-user rate limits

### Adding Image History
**Changes Required:**
- Add Vercel Blob storage
- Store original + transformed image pairs
- Add database table for image metadata
- Implement gallery view
- Add cleanup logic (delete after 30 days)

### Adding Batch Processing
**Changes Required:**
- Add job queue (Vercel Cron, BullMQ, etc.)
- Use Gemini Batch API (24h turnaround)
- Add email notifications when complete
- Store processing status in database

### Adding Custom Prompts
**Changes Required:**
- Add prompt input field
- Implement prompt sanitization
- Add prompt validation (length, content)
- Consider prompt templates for common styles

### Multi-Model Support
**Changes Required:**
- Parameterize model selection
- Add UI for model choice
- Handle model-specific configuration
- Compare costs/quality across models

## Sources

**Next.js Architecture & File Upload:**
- [Next.js File Uploads: Server-Side Solutions](https://www.pronextjs.dev/next-js-file-uploads-server-side-solutions)
- [Handling file uploads in Next.js using UploadThing](https://blog.logrocket.com/handling-file-uploads-next-js-using-uploadthing/)
- [Vercel File Upload Guide](https://vercel.com/kb/guide/how-to-upload-and-store-files-with-vercel)
- [Next.js API Routes vs Server Actions Discussion](https://github.com/vercel/next.js/discussions/72919)

**Security Best Practices:**
- [Keeping Your Next.js API Key Secure](https://nextnative.dev/blog/api-key-secure)
- [How To Protect Your API Key In Production With Next.js](https://www.smashingmagazine.com/2021/12/protect-api-key-production-nextjs-api-route/)
- [Next.js Data Security Guide](https://nextjs.org/docs/app/guides/data-security)

**File Upload Security:**
- [Handling File Uploads in Next.js Best Practices](https://moldstud.com/articles/p-handling-file-uploads-in-nextjs-best-practices-and-security-considerations)
- [Build a Custom File Upload Component in Next.js](https://medium.com/@willchesson/build-a-custom-file-upload-component-in-next-js-managing-file-sizes-formats-and-upload-limits-602e6793d0a1)

**Gemini API Documentation:**
- [Nano Banana Image Generation - Official Docs](https://ai.google.dev/gemini-api/docs/image-generation)
- [Gemini API Reference](https://ai.google.dev/api)

**Architecture Patterns:**
- [Exploring Modern Web App Architectures 2026](https://tech-stack.com/blog/modern-application-development/)
- [Web Application Architecture Guide 2026](https://www.clickittech.com/software-development/web-application-architecture/)

**Confidence Level:** HIGH - All architectural decisions verified with official Next.js docs, Gemini API documentation, and multiple authoritative sources on security best practices.
