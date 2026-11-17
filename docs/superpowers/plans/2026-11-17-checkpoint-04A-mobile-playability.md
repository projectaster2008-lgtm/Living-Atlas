# Checkpoint 04A: Mobile Playability and Adaptive Performance

**Goal:** Make Solara Bay comfortably playable on touch devices while preserving desktop keyboard input and the existing no-key/no-backend simulation architecture.

**Architecture:** Add a small DOM touch-control layer above the WebGL canvas. A normalized movement vector, run state, and camera yaw are passed into the existing player controller. Use React Three Fiber's PerformanceMonitor to adapt DPR within a conservative mobile-first range.

**Tech Stack:** Existing React 19, TypeScript, @react-three/fiber 9.8.2, Three.js 0.186.0, Vitest, Playwright.

## Scope
- Add analog virtual joystick, run action, context interaction, and right-side swipe camera look.
- Keep WASD/Shift/E controls unchanged.
- Use pointer capture and cancel handling so controls do not stick after interrupted gestures.
- Adapt DPR with conservative bounds and keep quality stable on slow devices.
- Add unit and Playwright coverage for touch movement, run, camera input, interaction, and desktop regressions.
- Inspect desktop/mobile layouts at 390x844, 667x375, and 1440x900.
- Do not change character assets, NPC logic, environment art, or add dependencies.

## Files
- Modify `src/app/App.tsx`: touch control state, overlay, props.
- Modify `src/rendering/scene/WorldScene.tsx`: merge touch/keyboard input, camera yaw, adaptive DPR.
- Create `src/gameplay/player/touch-input.ts`: pure normalization helpers if needed.
- Modify `src/styles.css`: mobile control visuals, safe-area positioning, pointer behavior.
- Modify `tests/e2e/solara-bay.spec.ts`: mobile input checks.
- Create `docs/checkpoints/2026-11-17-checkpoint-04A-mobile-playability.md`: evidence and limitations.

## Acceptance
- Virtual joystick drives the existing player with normalized diagonals.
- Releasing, cancelling, or leaving the joystick clears movement.
- Run button affects player speed only while held.
- Right-side drag rotates the follow camera and does not scroll the page.
- Context action works for resident, café, vehicle, and exit prompts.
- Desktop keyboard input still works.
- No console errors; typecheck, unit tests, build, and browser tests pass.
- No public deploy until local verification passes.
