# Validation — 2026-10-20

- `node --check` passed for main.js, paper.js, qr.js.
- `npm run build` passed. Production JavaScript ~40KB and CSS ~27KB before gzip.
- Production preview loaded successfully with no console errors/warnings and zero external runtime resource requests.
- Desktop 1440×900 and mobile 390×844 / 375×667 checked visually. No document overflow at these sizes. Mobile exposes only the selected ticket to keyboard/accessibility navigation.
- Real mouse drag: partial tear advanced to 44%, moving back stayed at 44%, releasing stayed at 44%, re-grabbing the opposite side preserved the existing tear.
- Full tear copied the expected GitHub value. A real ⌘V paste into a temporary test field matched the exact link. Test browser used its headless clipboard; the application uses navigator.clipboard with a fallback for user browsers.
- Edited name, website, repository and WeChat ID persisted after reload. Keyboard Enter tear copied the edited value.
- Reset during the keyboard tear prevented later separation/copy. Reset during fall preserved the newly printed stub.
- Reset also clears the numerical perforation readout back to 0%.
- Partial-tear visual check after seam repair passed: no red diagonal/vertical holes between Canvas triangles.
- QR encoder independently decoded normal URLs, edited links, UTF-8/emoji payloads, long values and cyan-on-black rendering, with exact text matches.

Reference limit: no ticket tear video was available in the referenced download chat. The hanging reference was analyzed; ticket-source frame alignment is pending the correct video. See alignment-report.md.
