# Checkpoint 04A: Mobile Playability & Adaptive Performance

**Status:** Implemented, verified, committed, and pushed to the Project Aster GitHub repository. Vercel deployment status verification is pending refreshed Project team authorization.

## Delivered
- Added a virtual analog joystick with a dead zone and normalized diagonal movement.
- Added hold-to-run and contextual action controls for interaction, entering/exiting vehicles, and entering/exiting the café.
- Added a right-side drag-look zone that rotates the third-person follow camera.
- Added pointer capture, pointer cancellation, lost-capture handling, and window blur cleanup to prevent stuck movement/run states.
- Preserved WASD, Shift, and E keyboard behavior.
- Added a coarse-pointer starting DPR of 0.78 and an adaptive DPR guard that reduces to 0.65 when rolling average frame time exceeds 25 ms, restoring to 0.85 after sustained sub-18 ms performance.
- Added safe-area aware mobile control layout and a landscape-specific compact layout.
- No new runtime dependencies, API keys, backend, or hosted AI.

## Files changed
- `src/app/App.tsx`
- `src/rendering/scene/WorldScene.tsx`
- `src/gameplay/player/touch-input.ts`
- `src/styles.css`
- `tests/unit/touch-input.test.ts`
- `tests/e2e/solara-bay.spec.ts`
- `playwright.config.ts`
- `scripts/verify-checkpoint-04A.mjs`

## Verification evidence
- TypeScript typecheck: passed.
- Unit tests: 30 passed across 9 files.
- Production build: passed. Vite still reports the existing large JS bundle warning (~1.18 MB minified); bundle splitting is not part of this milestone.
- Mobile Playwright test: passed. Joystick movement changed the player map marker; camera drag changed camera yaw; run control entered and exited the active state; no page errors were reported (pre-existing favicon 404 excluded).
- Local Chrome visual inspection at 390x844: WebGL canvas present, joystick/run/action visible, DPR ~0.78, no horizontal overflow, no page/console errors.
- Captured viewport screenshots: `artifacts/checkpoint-04A-mobile.png`, `artifacts/checkpoint-04A-landscape.png`, `artifacts/checkpoint-04A-desktop.png`.

## Known caveats
- The desktop Playwright test initially exposed a forced-SwiftShader timeout. Playwright was changed to allow the available WebGL renderer; both desktop and mobile E2E tests now pass. The test ignores the browser's pre-existing favicon 404, while still failing on page errors and other console errors.
- The user has not yet tested the controls on the physical phone. The online browser viewport is not a substitute for device-specific touch latency/performance.
- No sustained FPS claim is made. Adaptive DPR is a guardrail, not a performance certification.

## Scope lock
Checkpoint 04A only. Do not begin character realism (B) or environment realism (C) until the user approves this milestone and asks to continue.
