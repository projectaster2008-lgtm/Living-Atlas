# Living Atlas Checkpoint 02: Motion and Render Diagnostics

**Date:** 2026-11-17  
**Status:** Implemented locally; verification passed; checkpoint ready for review  
**Preview:** http://localhost:4173

## Scope completed

- Replaced direct NPC transform snapping with exponential, frame-delta-based position smoothing.
- Added lightweight procedural arm swing, leg stride, body bob, and facing direction for existing placeholder humanoids.
- Reused the player movement vector and camera target objects to avoid per-frame object allocation.
- Added a reusable-output option to the movement vector helper.
- Added development-only renderer diagnostics exposed as `window.__livingAtlasRenderStats` and `window.__livingAtlasFrameSamples`.
- Corrected Vitest discovery so Playwright end-to-end specs under `tests/e2e` are not treated as unit suites.
- Added unit coverage for resident smoothing and reusable movement-vector output.

## Verification evidence

- `npm run verify`: exit code 0.
- TypeScript typecheck: passed.
- Vitest: 7 files, 22 tests passed.
- Production Vite build: passed.
- `git diff --check`: passed.
- Localhost Playwright visual inspection: passed.
- WebGL2 initialized on Intel HD Graphics 520 through ANGLE / Direct3D 11.
- Weather control: passed.
- World map open/close: passed.
- Keyboard movement input: W and A captured; player marker moved.
- Nearby resident interaction: prompt displayed for Mara.
- Resident dialogue panel: opened successfully.
- Browser console/page errors: none reported by the visual inspection script.

## Renderer sample

Collected after the scene had settled, using the in-scene R3F diagnostics rather than an external requestAnimationFrame probe:

- Renderer frame counter advanced from 240 to 326 over a 2-second observation, approximately 43 counted frames/second during that interval.
- Median recorded frame delta: 16.7 ms.
- 95th percentile frame delta: 79.9 ms.
- Draw calls: 194.
- Triangles: 7,024.
- Geometries: 205.
- Textures: 8.
- Shader programs: 7.

The median frame delta is consistent with a 60 Hz cadence for much of the sample, but the frame-counter delta and p95 indicate intermittent scheduling/render stalls. Treat this as a diagnostic sample, not a stable FPS certification. Repeat across multiple warmed-up samples under controlled conditions before claiming a sustained target.

## Visual assessment

The localhost screenshot confirms the interface, weather/map overlays, player, plaza, and resident interaction are functional. The world still uses blockout architecture and primitive capsule/sphere characters. It remains materially below the approved photorealistic visual target. The procedural gait improves motion readability but does not replace rigged character models, authored animation clips, high-quality materials, detailed architecture, or environmental art.

## Explicit non-decisions

- No C++ or WebAssembly module added. Current evidence does not isolate simulation CPU as the bottleneck; the scene is currently modest at 7,024 triangles. A native/Wasm port is not justified without profiling simulation CPU time separately from render/GPU frame time.
- No API keys, hosted LLMs, provider SDKs, or cloud runtime services introduced.
- No external assets added, so no new asset-license dependencies.
- No remote push or deployment performed.
- No Git commit created. The repository is initialized on branch `main` but has no commits yet; project files are currently untracked. This should be addressed deliberately at a future checkpoint after reviewing repository contents.

## Known follow-up work

1. Profile sustained frame pacing across at least three warmed-up samples; separate CPU simulation update time, render submission time, and GPU timing where available.
2. Investigate p95 frame spikes and the current 194 draw calls.
3. Replace placeholder humanoids with properly rigged, optimized characters and authored walk/idle/talk animations.
4. Replace blockout buildings and primitive props with modular detailed architecture, PBR materials, decals, foliage, and environmental storytelling.
5. Add asset provenance/license tracking before introducing external models, textures, or animation packs.
6. Keep the first playable region compact and preserve low-end adaptive quality.

## Files changed in this checkpoint

- `src/rendering/scene/WorldScene.tsx`
- `src/rendering/characters/motion.ts` (new)
- `src/gameplay/player/movement.ts`
- `tests/unit/resident-motion.test.ts` (new)
- `tests/unit/movement.test.ts`
- `vite.config.ts`
- `scripts/diagnose-motion.mjs` (diagnostic script)

## Checkpoint boundary

Checkpoint 02 is limited to movement smoothing, placeholder gait, allocation cleanup, renderer diagnostics, and test-runner separation. The next milestone should be a dedicated character-and-world visual upgrade, not a broad rewrite or premature C++/Wasm migration.
