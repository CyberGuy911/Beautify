# Phase 4: Gemini Integration - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect to Gemini API to transform uploaded photos into mystical cosmic portraits. Users click "Create", see progress during processing, and view the AI-transformed result. Error handling for API errors, safety filters, and rate limits. Exponential backoff for rate limit handling.

</domain>

<decisions>
## Implementation Decisions

### Progress experience
- Overlay on the preview image during processing (not on button or separate area)
- Dark semi-transparent backdrop with white text
- Message: "Making with love..."
- Spinner accompanies the message
- "Create" button disabled (grayed out) during processing — stays visible but unclickable

### Result reveal
- Fade transition: original fades out, transformed fades in
- Sparkle particle effect around the image on reveal (cosmic/celebratory moment)
- Available actions after transform: Download + New image (upload fresh)
- No "retry same image" option — user uploads new image to try again

### Claude's Discretion
- Transformation style / prompt engineering (what "mystical cosmic portrait" means to Gemini)
- Error message copy and presentation
- Sparkle particle implementation details (count, duration, colors)
- Fade transition timing
- Spinner style

</decisions>

<specifics>
## Specific Ideas

- "Making with love..." message — friendly, human touch during AI processing
- Sparkle particles fit the cosmic/mystical theme
- Dark overlay matches the dark-mode-first design

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-gemini-integration*
*Context gathered: 2026-01-21*
