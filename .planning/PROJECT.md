# Beautify

## What This Is

A simple web application that transforms uploaded photos into mystical cosmic portraits using Google's Nano Banana image generation model. Users upload an image, click "Create," and receive a transformed version with rich golden highlights against a deep cosmic nebula background. Clean, single-purpose UI focused on the transformation workflow.

## Core Value

One-click image transformation — upload, create, download. No friction, no complexity.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can upload an image (drag-and-drop or file picker)
- [ ] User can click "Create" to transform the image
- [ ] App sends image + mystical prompt to Nano Banana API
- [ ] User sees the transformed image after processing
- [ ] User can download the transformed image
- [ ] User can upload a new image to start over
- [ ] Clean, intuitive interface with minimal UI elements
- [ ] Loading state while transformation is processing
- [ ] Error handling for failed API calls or invalid images

### Out of Scope

- User accounts / authentication — single-session, no persistence
- Image history / gallery — one image at a time
- Custom prompts — fixed mystical transformation prompt
- Multiple output variations — one result per transformation
- Social sharing — download only, share externally

## Context

**The transformation prompt:**
> "A high-contrast, mystical photograph effect, where the central subject—whether an animal, person, or object from a user-uploaded image—is brilliantly illuminated with rich, warm golden and copper highlights and deep shadow details, making it pop. The background is transformed into a deep cosmic night sky with swirling nebulae of indigo, violet, and teal, scattered glowing stars, and a soft, ethereal moonlight glow from above, creating a dramatic, magical atmosphere."

**Target model:** Nano Banana (`gemini-2.5-flash-image`) via Gemini API — can upgrade to Pro (`gemini-3-pro-image-preview`) if quality needs improvement.

**Deployment:** Vercel with environment variable for API key.

## Constraints

- **Hosting**: Vercel — influences architecture (API routes, serverless functions)
- **API**: Gemini API with Nano Banana model — requires valid API key
- **Security**: API key must stay server-side (never exposed to client)
- **Tech Stack**: Next.js — confirmed by user preference

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js over plain HTML | Better Vercel integration, API routes for secure key handling | — Pending |
| Nano Banana Flash over Pro | Cost-effective for fixed prompt, sufficient quality for effect | — Pending |
| No user accounts | Keep it simple, single-purpose tool | — Pending |

---
*Last updated: 2026-01-21 after initialization*
