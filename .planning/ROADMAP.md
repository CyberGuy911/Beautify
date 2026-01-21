# Roadmap: Beautify

## Overview

Beautify transforms uploaded photos into mystical cosmic portraits using AI. The roadmap follows a risk-reduction approach: establish security and infrastructure correctly (Phase 1), prove file handling without AI (Phase 2), establish API communication patterns (Phase 3), integrate real AI transformation (Phase 4), and polish the complete experience (Phase 5). Each phase delivers verifiable capabilities that build on proven foundations.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Environment Setup** - Establish secure infrastructure and base UI
- [x] **Phase 2: Upload Pipeline** - De-risk file handling without AI complexity
- [x] **Phase 3: API Route & Mock Transformation** - Prove client-server communication
- [ ] **Phase 4: Gemini Integration** - Connect real AI transformation
- [ ] **Phase 5: Output Features & Production Readiness** - Polish and ship

## Phase Details

### Phase 1: Foundation & Environment Setup
**Goal**: Establish secure infrastructure with API key protection and cost controls before any AI integration
**Depends on**: Nothing (first phase)
**Requirements**: UEXP-02
**Success Criteria** (what must be TRUE):
  1. Next.js project runs locally with TypeScript
  2. Environment variables configured and API key stays server-side (verified in client bundle)
  3. Google Cloud billing alerts active at $50/$100/$200 thresholds
  4. User can toggle between dark and light mode
  5. Base UI displays with Tailwind CSS styling
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Project setup with Next.js 16, Tailwind v4, and theme system foundation
- [x] 01-02-PLAN.md — UI shell with theme toggle component and page layout
- [x] 01-03-PLAN.md — Environment security with Data Access Layer and billing alerts

### Phase 2: Upload Pipeline
**Goal**: Users can upload, preview, and download images without AI (prove file handling)
**Depends on**: Phase 1
**Requirements**: UPLD-01, UPLD-02, UPLD-03, UEXP-04, UEXP-05
**Success Criteria** (what must be TRUE):
  1. User can drag-and-drop an image onto the upload area
  2. User can click to browse and select an image file
  3. App accepts JPEG, PNG, and WebP formats and rejects other formats with clear message
  4. User sees preview of uploaded image
  5. User can download the uploaded image (proof-of-concept for download flow)
  6. Interface is responsive and works on mobile devices
  7. Interface is clean and minimal with focus on the image
  8. User sees progress indicator during upload
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Upload zone with drag-drop, click-to-browse, and file validation
- [x] 02-02-PLAN.md — Preview display, download, reset, and page integration

### Phase 3: API Route & Mock Transformation
**Goal**: Prove client-server communication with mock responses before spending API quota
**Depends on**: Phase 2
**Requirements**: None (infrastructure phase)
**Success Criteria** (what must be TRUE):
  1. Frontend successfully sends base64-encoded image to API route
  2. API route validates image data server-side and returns appropriate errors for invalid inputs
  3. API route returns mock transformed image (e.g., original with overlay)
  4. Frontend displays mock transformed image
  5. Base64 payloads work within Vercel serverless constraints (<4.5MB)
  6. Rate limiting middleware prevents more than 5 requests per minute
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — API route with base64 validation and rate limiting
- [x] 03-02-PLAN.md — Frontend integration with transform button and result display

### Phase 4: Gemini Integration
**Goal**: Real AI transformation with mystical cosmic portrait effect
**Depends on**: Phase 3
**Requirements**: TRAN-01, TRAN-02, TRAN-03, TRAN-04, UEXP-01
**Success Criteria** (what must be TRUE):
  1. User can click "Create" button to start transformation
  2. User sees progress indicator while transformation is processing (2-5 seconds)
  3. App sends image + mystical prompt to Gemini Nano Banana API
  4. User sees the AI-transformed mystical cosmic portrait after processing
  5. User sees clear error messages when transformation fails (API errors, safety filters, rate limits)
  6. Gemini API upgraded to Tier 1 (10 IPM) and exponential backoff handles rate limits
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

### Phase 5: Output Features & Production Readiness
**Goal**: Complete user experience with output features and production polish
**Depends on**: Phase 4
**Requirements**: OUTP-01, OUTP-02, OUTP-03, UEXP-03
**Success Criteria** (what must be TRUE):
  1. User can download the transformed image at original resolution
  2. User can compare before/after with an interactive slider
  3. User can upload a new image to start over (reset state)
  4. UI has smooth animated transitions between states
  5. Vercel function timeout configured to 60s to handle processing delays
  6. App deployed to Vercel with environment variables configured
  7. Error handling includes retry logic with exponential backoff
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Environment Setup | 3/3 | Complete | 2026-01-21 |
| 2. Upload Pipeline | 2/2 | Complete | 2026-01-21 |
| 3. API Route & Mock Transformation | 2/2 | Complete | 2026-01-21 |
| 4. Gemini Integration | 0/3 | Not started | - |
| 5. Output Features & Production Readiness | 0/3 | Not started | - |
