# Domain Pitfalls: Image Transformation Web App

**Domain:** AI-powered image transformation web application
**Project:** Beautify (Next.js + Gemini Nano Banana)
**Researched:** 2026-01-21
**Overall confidence:** HIGH

## Critical Pitfalls

Mistakes that cause rewrites, security breaches, or catastrophic failures.

### Pitfall 1: API Keys Exposed to Client

**What goes wrong:** Developers prefix the Gemini API key with `NEXT_PUBLIC_` to make it work quickly, or pass it to client components, exposing it directly in the browser bundle where anyone can extract it.

**Why it happens:**
- Misunderstanding of Next.js environment variable scoping
- Confusion between server components and client components
- Quick fixes during development that make it to production

**Consequences:**
- API key publicly visible in JavaScript bundle
- Unauthorized usage draining your quota/budget
- Potential account suspension by Google
- Security breach requiring immediate key rotation

**Prevention:**
1. NEVER use `NEXT_PUBLIC_` prefix for secret API keys
2. Keep Gemini API calls exclusively in Server Components or API routes
3. Use `process.env.GEMINI_API_KEY` only in server-side code
4. Add `.env` and `.env.local` to `.gitignore`
5. Use different API keys for development, staging, and production

**Detection:**
- Search your codebase for `NEXT_PUBLIC_` + API key names
- Check browser DevTools Network tab for API keys in headers
- Run `grep -r "NEXT_PUBLIC_.*API" .` to find violations
- Inspect production JavaScript bundles for exposed keys

**Phase to address:** Phase 1 (Environment Setup) - Must be correct from day one

**Sources:**
- [Keeping Your Next.js API Key Secure](https://nextnative.dev/blog/api-key-secure)
- [Next.js Security Best Practices](https://makerkit.dev/docs/next-supabase-turbo/security/nextjs-best-practices)
- [The Graph: Secure API Keys Using Next.js Server Components](https://thegraph.com/docs/en/subgraphs/guides/secure-api-keys-nextjs/)

---

### Pitfall 2: Image Upload Through Serverless Functions (4.5MB Limit)

**What goes wrong:** Attempting to upload user images through Next.js API routes hits Vercel's hard 4.5MB request body limit, causing 413 FUNCTION_PAYLOAD_TOO_LARGE errors in production.

**Why it happens:**
- Developers route all uploads through API endpoints without understanding serverless constraints
- Works fine in local development with small test images
- Users upload high-resolution photos (8-15MB) from modern cameras/phones

**Consequences:**
- Users cannot upload typical smartphone photos (often 5-12MB)
- 413 errors with no graceful fallback
- Poor user experience ("Why can't I upload my photo?")
- Complete feature breakdown for most real-world use cases

**Prevention:**
1. **DO NOT route image uploads through API routes**
2. Implement client-side direct upload to cloud storage (Cloudinary, Supabase, AWS S3)
3. Use pre-signed URLs for secure direct-to-storage uploads
4. API route only handles metadata (file URL, size) after upload completes
5. Validate file size on client-side BEFORE upload attempt

**Alternative (not recommended):**
- Base64 encode images and send in JSON (worse performance, still hits limits)
- Increase Next.js body parser limit (only helps 1-10MB range, not scalable)

**Detection:**
- Monitor 413 error rates in production logs
- Test with realistic image sizes (10-15MB JPEG from iPhone/Android)
- Check if `bodyParser` configuration exists in API routes
- Warning sign: Any code that reads `req.body` for image data

**Phase to address:** Phase 2 (Image Upload) - Critical architecture decision

**Sources:**
- [How to Bypass Vercel's 4.5MB Body Size Limit](https://medium.com/@jpnreddy25/how-to-bypass-vercels-4-5mb-body-size-limit-for-serverless-functions-using-supabase-09610d8ca387)
- [Upload Images With Vercel Serverless Functions (Cloudinary)](https://cloudinary.com/blog/upload-images-with-vercel-serverless-functions)
- [Vercel Discussion: Increase file size for multipart/form-data](https://github.com/vercel/next.js/discussions/15745)

---

### Pitfall 3: Runaway API Costs Without Limits

**What goes wrong:** No usage caps or monitoring on Gemini API calls leads to unexpected cost explosions, especially if API key is compromised or users spam generations.

**Why it happens:**
- 85% of organizations misestimate AI costs by 10%+, nearly 25% are off by 50%+
- Usage-based pricing is unpredictable (tokens, images, compute time)
- No built-in spending alerts in most AI APIs
- Developers assume low traffic won't cause issues

**Consequences:**
- Billing spikes of 40-400% without warning
- "Growth becomes a path to bankruptcy" for AI startups
- CFOs asking "Why did our bill spike 40% when usage grew 15%?"
- Potential service shutdown due to budget overruns

**Prevention:**
1. Implement rate limiting on your API routes (e.g., 5 images per user per hour)
2. Set up Google Cloud billing alerts at $50, $100, $200 thresholds
3. Use Gemini API quotas to hard-cap daily/monthly usage
4. Track usage metrics (images generated per user, per day)
5. Consider implementing credits/tokens system for users
6. Monitor API costs daily during first month of production

**Detection:**
- Set up Cloud Console budget alerts BEFORE launch
- Daily dashboard check: API calls, costs, quota usage
- Warning signs: Sudden usage spikes, bot-like traffic patterns
- No rate limiting middleware = high risk

**Phase to address:** Phase 1 (API Integration) - Before first production deployment

**Sources:**
- [How Much Does AI Image Generation Cost in 2026](https://www.imagine.art/blogs/ai-image-generation-cost)
- [AI Pricing: What's the True AI Cost for Businesses](https://zylo.com/blog/ai-cost/)
- [AI Development Mistakes That Cost Companies Millions](https://www.unosquare.com/blog/ai-development-mistakes-that-cost-companies-millions-and-how-to-avoid-them/)

---

### Pitfall 4: Gemini Rate Limits Causing User-Facing Failures

**What goes wrong:** Free tier Gemini API provides only 2 IPM (images per minute). Multiple users or rapid retries quickly hit 429 RESOURCE_EXHAUSTED errors with no graceful degradation.

**Why it happens:**
- Free tier severely limited (2 IPM vs 10 IPM on Tier 1)
- Developers don't implement exponential backoff
- No queue system for handling burst traffic
- Testing with single user masks the problem

**Consequences:**
- "Service unavailable" errors during peak usage
- Users retry, making the problem worse
- Poor impression: "This app doesn't work"
- Gemini 3 Pro Image has additional scarcity: 503 errors even within quota due to global load

**Prevention:**
1. Upgrade to Tier 1 (paid) before launch: 10 IPM for $0 initial cost
2. Implement exponential backoff with jitter for 429 responses
3. Add user-facing queue system: "Your image is #3 in queue"
4. Show estimated wait time based on current rate limits
5. Never silently retry in tight loop
6. Consider job queue (BullMQ, Inngest) for async processing

**Detection:**
- Monitor 429 error rates in logs
- Check Gemini API quota usage in Cloud Console
- Load test: 5 concurrent users uploading images
- Warning: Any synchronous API call without retry logic

**Phase to address:** Phase 3 (Error Handling & Queuing) - Before beta launch

**Sources:**
- [Gemini API Rate Limits Explained: Complete 2026 Guide](https://www.aifreeapi.com/en/posts/gemini-api-rate-limit-explained)
- [Gemini Nano Banana Pro API Error Guide](https://help.apiyi.com/en/gemini-nano-banana-pro-overloaded-error-guide-en.html)
- [Generate and edit images with Gemini (Google Cloud)](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/image-generation)

---

## Common Mistakes

Frequent errors that cause friction, poor UX, or technical debt.

### Mistake 1: No Upload Progress Indication

**What goes wrong:** Users upload a 10MB image and see nothing for 5-15 seconds, thinking the app froze. They refresh the page or abandon, canceling the upload.

**Why it happens:**
- Developers focus on functionality, forget UX during waiting periods
- Assumption that uploads are "instant enough"
- No consideration for mobile users on slow connections

**Consequences:**
- Users abandon legitimate uploads
- Increased bounce rate
- Support requests: "Is it working?"
- Poor perceived performance even when technical performance is good

**Prevention:**
1. Show progress bar during upload (0-100%)
2. Display status text: "Uploading... 2 minutes remaining"
3. Show spinner during AI generation: "Creating your cosmic portrait..."
4. Prevent multiple uploads while one is processing
5. Consider optimistic UI: show preview immediately

**Detection:**
- User testing with slow network throttling
- Analytics: high abandonment rate during upload phase
- Missing loading states in UI components

**Phase to address:** Phase 2 (Image Upload) - Core UX requirement

**Sources:**
- [UX Best Practices for Designing a File Uploader](https://uploadcare.com/blog/file-uploader-ux-best-practices/)
- [10 File Upload UX Best Practices](https://climbtheladder.com/10-file-upload-ux-best-practices/)
- [Progress Bar Indicator UX/UI Design](https://usersnap.com/blog/progress-indicators/)

---

### Mistake 2: Ignoring Image Format Optimization

**What goes wrong:** Accepting all image formats and sending them directly to Gemini API without optimization. Users upload 15MB PNGs that should be 2MB JPEGs, wasting bandwidth and slowing everything down.

**Why it happens:**
- "Just make it work" mentality during MVP
- Assuming users understand optimal formats
- Not considering mobile data usage

**Consequences:**
- Slower uploads, especially on mobile
- Higher cloud storage costs
- Wasted Gemini API processing time
- Poor performance on slower connections

**Prevention:**
1. Auto-convert uploaded images to JPEG format (use Sharp or Canvas API)
2. Compress to quality 80-85 (no visible quality loss)
3. Resize to reasonable dimensions (e.g., max 2048px width) before sending to API
4. Consider WebP for output downloads (26-34% smaller than JPEG)
5. Validate file types: only accept JPEG, PNG, WebP on upload

**Detection:**
- Monitor average upload file size in analytics
- Check if any image processing pipeline exists
- Warning: Direct file upload to API without transformation

**Phase to address:** Phase 2 (Image Upload) - Before handling production traffic

**Sources:**
- [7 Image Conversion Mistakes Killing Your App Performance](https://dev.to/hardik_b2d8f0bca/7-image-conversion-mistakes-that-are-killing-your-app-performance-and-how-to-fix-them-1lgd)
- [JPG Vs PNG Vs WEBP: Best Web Image Format for 2026](https://www.thecssagency.com/blog/best-web-image-format)
- [Top 10 Mistakes in Handling Website Images](https://cloudinary.com/blog/top_10_mistakes_in_handling_website_images_and_how_to_solve_them)

---

### Mistake 3: Poor Error Messages for Safety Filter Violations

**What goes wrong:** Gemini API returns `IMAGE_SAFETY` or `IMAGE_PROHIBITED_CONTENT` finish reasons, but app shows generic "Error generating image" message, leaving users confused.

**Why it happens:**
- Developers don't check for specific error types
- Assumption that all failures are technical errors
- Avoiding explanation of content policy

**Consequences:**
- Users think the app is broken
- Repeated attempts with same problematic content
- Frustration and abandonment
- Support burden explaining content policies

**Prevention:**
1. Check response `FinishReason` enum values
2. Show specific messages:
   - `IMAGE_SAFETY`: "This image couldn't be generated due to content guidelines. Please try a different photo."
   - `RESOURCE_EXHAUSTED`: "We're experiencing high demand. Please try again in a moment."
   - `IMAGE_PROHIBITED_CONTENT`: "This content violates our usage policy."
3. Link to content policy documentation
4. Log these events for monitoring abuse patterns

**Detection:**
- Check if error handling distinguishes between error types
- Test with potentially problematic images
- Review error handling code for generic catch-all messages

**Phase to address:** Phase 3 (Error Handling) - Before beta testing

**Sources:**
- [Responsible AI and Usage Guidelines for Imagen](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/responsible-ai-imagen)
- [Is AI Image Generator Safe? 2026 Guide](https://pxz.ai/blog/is-ai-image-generator-safe)
- [How to Fix ChatGPT Image Policy Violations](https://merlio.app/blog/fix-chatgpt-image-policy-violations)

---

### Mistake 4: Browser-Side Image Resizing Instead of Server-Side

**What goes wrong:** Loading full-resolution images (10-15MB) to browser, resizing with CSS or Canvas, then uploading. This wastes bandwidth and slows page load.

**Why it happens:**
- Client-side feels "simpler" - no backend image processing needed
- Works fine in development with small test images
- Overlooking mobile data constraints

**Consequences:**
- Longer load times for unnecessarily large images
- Wasted delivery bandwidth
- Poor mobile experience (data usage)
- Browser memory issues with very large images

**Prevention:**
1. Use client-side resizing BEFORE upload (browser-image-compression library)
2. Or implement server-side resizing after upload (Sharp on Node.js)
3. Generate multiple sizes (thumbnail, display, original)
4. Serve optimized versions for preview
5. Consider image CDN (Cloudinary) for automatic optimization

**Detection:**
- Check Network tab: are full-size images loading?
- Monitor bandwidth usage
- Test on throttled mobile connection
- No image processing library in package.json = likely missing this

**Phase to address:** Phase 2 (Image Upload) - During upload pipeline implementation

**Sources:**
- [Top 10 Mistakes in Handling Website Images](https://cloudinary.com/blog/top_10_mistakes_in_handling_website_images_and_how_to_solve_them)
- [Upload Images With Vercel Serverless Functions](https://cloudinary.com/blog/upload-images-with-vercel-serverless-functions)

---

### Mistake 5: Keyword-Listing Prompts Instead of Descriptive Narratives

**What goes wrong:** When implementing the transformation to "cosmic portrait," developers create prompts like "cosmic, space, stars, mystical, portrait" instead of descriptive narratives, producing incoherent, low-quality results.

**Why it happens:**
- Mimicking older AI models that worked with keywords
- Not reading Gemini documentation on best practices
- Assumption that more keywords = better results

**Consequences:**
- Incoherent, low-quality generated images
- Inconsistent styling across generations
- Users disappointed with output quality
- Higher regeneration rate (wasting API quota)

**Prevention:**
1. Use narrative prompts: "Transform this portrait into a mystical cosmic scene where the person is surrounded by swirling galaxies and nebulae, with stars twinkling in their eyes and cosmic energy radiating from their form."
2. Include scene description, composition, style, and mood
3. Test prompts extensively before launch
4. Consider A/B testing different prompt structures
5. Keep prompt engineering as a configurable constant for easy iteration

**Detection:**
- Review current prompt construction code
- Generate test images and evaluate quality
- Check if prompts are comma-separated keywords vs sentences

**Phase to address:** Phase 3 (Prompt Engineering) - During AI integration refinement

**Sources:**
- [Nano Banana Image Generation Documentation](https://ai.google.dev/gemini-api/docs/image-generation)
- [Tips for Getting the Best Image Generation in Gemini](https://blog.google/products-and-platforms/products/gemini/image-generation-prompting-tips/)

---

## API-Specific Gotchas

Gemini/Nano Banana API specific issues to watch for.

### Gotcha 1: Thought Signatures in Multi-Turn Conversations

**What it is:** Gemini 3 Pro Image requires preserving "thought signatures" when using multi-turn conversations, or requests fail with 400 errors.

**Impact:** If you implement "edit previous generation" or "make it more X" features, you must preserve thought signatures from previous responses.

**Mitigation:**
- Use official Google AI SDK which handles this automatically
- If building custom implementation, store and pass thought signatures
- Document this requirement for future developers
- Test multi-turn scenarios thoroughly

**Phase to address:** Only if implementing multi-turn features (post-MVP)

**Sources:**
- [Nano Banana Image Generation Documentation](https://ai.google.dev/gemini-api/docs/image-generation)

---

### Gotcha 2: Resolution Parameter Case Sensitivity

**What it is:** Resolution specs must use uppercase 'K' (1K, 2K, 4K). Lowercase "1k" will be rejected with 400 error.

**Impact:** Silent failures if using lowercase or variable casing.

**Mitigation:**
1. Use constants: `const RESOLUTION = "2K"`
2. Add validation before API call
3. Include in test suite

**Phase to address:** Phase 1 (API Integration) - During initial implementation

**Sources:**
- [Nano Banana Image Generation Documentation](https://ai.google.dev/gemini-api/docs/image-generation)

---

### Gotcha 3: Automatic SynthID Watermarking

**What it is:** All Gemini-generated images include invisible SynthID watermarks. You cannot opt out.

**Impact:**
- Watermarks persist through some transformations
- May affect certain image analysis tools
- Important for transparency (users should know image is AI-generated)

**Mitigation:**
1. Include in terms of service that images contain watermarks
2. Don't attempt to remove watermarks (violates terms)
3. Inform users in download flow

**Phase to address:** Phase 4 (Legal/Compliance) - Before public launch

**Sources:**
- [Nano Banana Image Generation Documentation](https://ai.google.dev/gemini-api/docs/image-generation)

---

### Gotcha 4: Response Always Includes Both Text and Images

**What it is:** Gemini image generation models always return both text and images. You must include `responseModalities: ["TEXT", "IMAGE"]` in configuration.

**Impact:** API calls fail with 400 error if configuration is wrong.

**Mitigation:**
1. Include correct `responseModalities` in all image generation calls
2. Handle text response even if you don't display it (can be useful for debugging)
3. Add to integration tests

**Phase to address:** Phase 1 (API Integration) - During initial setup

**Sources:**
- [Nano Banana Image Generation Documentation](https://ai.google.dev/gemini-api/docs/image-generation)

---

## Vercel/Deployment Pitfalls

Issues specific to serverless deployment on Vercel.

### Pitfall 1: Serverless Function Timeout (10s Default)

**What goes wrong:** Gemini API calls can take 8-15 seconds for image generation. With network overhead, this approaches or exceeds Vercel's 10-second default timeout on free plans.

**Why it happens:**
- Image generation is computationally expensive
- Network latency adds 1-3 seconds
- Free tier has 10s limit, paid tier has 60s
- Default timeout not extended

**Consequences:**
- 504 Gateway Timeout errors
- Partial generations lost
- User sees "Request timed out" after waiting
- Inconsistent behavior (sometimes works, sometimes times out)

**Prevention:**
1. Set `maxDuration: 60` in route config for paid plans
2. For free tier: implement async job queue (BullMQ, Inngest)
3. Return immediately with job ID, poll for results
4. Show progress: "Generating image... this may take 30 seconds"
5. Consider upgrading to Pro plan for 60s timeout

**Detection:**
- Monitor 504 errors in Vercel logs
- Test with real API calls (not mocked)
- Load test: concurrent users generating images
- Check route configurations for timeout settings

**Phase to address:** Phase 1 (Infrastructure) - Before first deployment

**Sources:**
- [How to Solve Next.js Timeouts](https://www.inngest.com/blog/how-to-solve-nextjs-timeouts)
- [Vercel Function Limits](https://vercel.com/kb/guide/troubleshooting-function-250mb-limit)

---

### Pitfall 2: Environment Variables Not Set in Vercel Dashboard

**What goes wrong:** API key works locally (`.env.local`) but fails in production because environment variables weren't added to Vercel project settings.

**Why it happens:**
- Developers forget to sync local .env to Vercel dashboard
- Different environment names (development, preview, production)
- No validation that required variables exist

**Consequences:**
- Production deployment succeeds but app fails at runtime
- "API key not found" errors
- Confusing: "It works locally!"
- Emergency hotfix required

**Prevention:**
1. Document required environment variables in README
2. Add validation at app startup: check for required env vars
3. Set variables in Vercel dashboard for all environments
4. Use Vercel CLI to pull production env for testing: `vercel env pull`
5. Add environment variable checklist to deployment runbook

**Detection:**
- Test preview deployments before production
- Add health check endpoint that validates configuration
- Warning: No startup validation of required variables

**Phase to address:** Phase 1 (Deployment) - During first Vercel deployment

**Sources:**
- [Next.js Security Best Practices](https://makerkit.dev/docs/next-supabase-turbo/security/nextjs-best-practices)
- [Vercel Environment Variables Documentation](https://vercel.com/docs/environment-variables)

---

### Pitfall 3: Cold Starts Causing Slow First Request

**What goes wrong:** After period of inactivity, first request to serverless function takes 3-5 seconds extra due to cold start. Combined with 15s image generation, total wait exceeds user patience.

**Why it happens:**
- Serverless functions spin down after inactivity
- Cold start initializes runtime, loads dependencies
- Vercel free tier has more aggressive cold starts

**Consequences:**
- First user each hour has terrible experience
- Amplifies timeout risk (cold start + generation time)
- Inconsistent performance (fast then slow then fast)

**Prevention:**
1. Minimize function size (reduce dependencies)
2. Use Vercel Pro for better cold start performance
3. Consider warming function with scheduled cron
4. Show appropriate loading message: "Warming up... first generation may take longer"
5. Consider edge functions for faster cold starts (if Gemini API supports)

**Detection:**
- Monitor request duration distribution
- Check for bimodal distribution (fast vs slow)
- Test after 30+ minutes of inactivity
- Cloudflare Analytics or Vercel Analytics will show this pattern

**Phase to address:** Phase 4 (Optimization) - After initial launch, based on metrics

**Sources:**
- [How to Solve Next.js Timeouts](https://www.inngest.com/blog/how-to-solve-nextjs-timeouts)
- [Advanced Troubleshooting Guide for Vercel](https://www.mindfulchase.com/explore/troubleshooting-tips/cloud-platforms-and-services/advanced-troubleshooting-guide-for-vercel.html)

---

## Prevention Strategies by Phase

### Phase 1: Environment Setup & API Integration
**Critical to establish:**
- API key security (Server Components only, no NEXT_PUBLIC_)
- Environment variable validation at startup
- Billing alerts in Google Cloud Console
- Rate limiting middleware
- Error handling structure with specific error types
- Resolution parameter constants (uppercase "2K")
- Response modality configuration

**Validation:**
- [ ] API key not in client bundle (check DevTools)
- [ ] Environment variables set in Vercel dashboard
- [ ] Billing alerts configured at $50, $100, $200
- [ ] Rate limiting tested (5 requests/minute per user)
- [ ] Error responses include specific types

---

### Phase 2: Image Upload Pipeline
**Critical to establish:**
- Client-side direct upload (NOT through API routes)
- Progress indicators for upload and generation
- Client-side image resizing before upload
- Format validation and conversion (JPEG optimization)
- File size limits (reject >20MB on client)

**Validation:**
- [ ] Upload works with 15MB image
- [ ] Progress bar shows accurate progress
- [ ] Images auto-converted to JPEG quality 85
- [ ] No 413 errors in testing
- [ ] Mobile data usage reasonable

---

### Phase 3: Error Handling & UX Polish
**Critical to establish:**
- Safety filter error messages (not generic "error")
- Exponential backoff for rate limit errors
- Queue system for handling bursts
- Estimated wait times displayed
- Prompt engineering (narrative, not keywords)

**Validation:**
- [ ] Safety filter rejection shows helpful message
- [ ] 429 errors trigger retry with backoff
- [ ] 5 concurrent users don't crash system
- [ ] Generated images are high quality
- [ ] Users understand what's happening at all times

---

### Phase 4: Production Readiness
**Critical to establish:**
- Timeout configuration (60s on paid plan or async queue)
- Cold start monitoring and mitigation
- Terms of service (SynthID watermarks disclosed)
- Usage analytics and cost tracking
- Load testing results

**Validation:**
- [ ] No 504 timeout errors under load
- [ ] Cost per user understood and acceptable
- [ ] Legal compliance reviewed
- [ ] Performance acceptable at 100 concurrent users

---

## Quick Reference: Red Flags

During code review or auditing, these patterns indicate pitfalls:

**Immediate action required:**
- ⛔ `NEXT_PUBLIC_GEMINI_API_KEY` or similar
- ⛔ Image upload in `req.body` of API route
- ⛔ No billing alerts configured
- ⛔ No rate limiting on API routes
- ⛔ Generic error messages for all failures

**Address before launch:**
- ⚠️ No progress indicators during upload/generation
- ⚠️ No image optimization or format conversion
- ⚠️ Timeout not configured for long-running functions
- ⚠️ Comma-separated keyword prompts instead of narratives
- ⚠️ No exponential backoff for API retries

**Nice to have:**
- 💡 Job queue for async processing
- 💡 Multiple image sizes generated
- 💡 CDN for image delivery
- 💡 A/B testing for prompts
- 💡 Function warming strategy

---

## Summary: Top 5 Mistakes to Avoid

1. **Exposing API keys in client bundle** - Use Server Components exclusively for Gemini API calls
2. **Routing uploads through serverless functions** - Implement direct-to-storage uploads with pre-signed URLs
3. **No cost controls** - Set billing alerts and implement rate limiting before launch
4. **Missing progress indicators** - Show upload progress, generation status, and estimated wait times
5. **Ignoring rate limits** - Upgrade to Tier 1, implement exponential backoff, and add queueing for bursts

**Success criteria:**
- ✅ Can test in production without fear of runaway costs
- ✅ 15MB images upload successfully
- ✅ Users understand system state at all times
- ✅ Errors are helpful, not cryptic
- ✅ System gracefully handles traffic bursts
