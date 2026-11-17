# Living Atlas Checkpoint 03A: Solara Bay Facade Material Pass

**Date:** 2026-11-17  
**Status:** Partial milestone delivered; awaiting review before character-art selection  
**Preview:** http://localhost:4173

## Delivered

- Added a locally bundled Poly Haven Plastered Wall CC0 PBR material at 1K resolution (diffuse, OpenGL normal, roughness).
- Applied the material to Solara Bay building facades.
- Added real-world facade UV scaling based on the material's approximately 2m × 2m tile size.
- Added facade corner pilasters, a stone base/plinth, window frames, and a balcony ledge.
- Converted repeated facade window panes and frames to InstancedMesh objects to reduce draw-call overhead.
- Added a pure facade UV repeat helper with three unit tests.
- Updated `docs/assets/CREDITS.md` with source, license, downloaded file paths, and verified MD5 hashes.
- Added the research and art-direction evidence note:
  `docs/checkpoints/2026-11-17-checkpoint-03-evidence-and-art-direction.md`.

## Changed files

- `src/rendering/scene/WorldScene.tsx`
- `src/rendering/environment/facade-tiling.ts` (new)
- `tests/unit/facade-tiling.test.ts` (new)
- `tests/e2e/solara-bay.spec.ts` (removed headless screenshot calls; screenshot capture is handled by the hardware-browser visual inspection script)
- `docs/assets/CREDITS.md`
- `docs/checkpoints/2026-11-17-checkpoint-03-evidence-and-art-direction.md`
- `public/assets/materials/plaster/plastered_wall_diff_1k.jpg`
- `public/assets/materials/plaster/plastered_wall_nor_gl_1k.jpg`
- `public/assets/materials/plaster/plastered_wall_rough_1k.jpg`

## Verification

### Passed

- `npm run verify`: exit code 0.
- TypeScript typecheck: passed.
- Vitest: 8 files, 25 tests passed.
- Production build: passed.
- Focused facade tiling tests: 3/3 passed.
- `git diff --check`: passed.
- Local preview responds at `http://localhost:4173`.
- Hardware-accelerated Chrome visual inspection: passed.
- WebGL2 initialized on Intel HD Graphics 520 through ANGLE / Direct3D 11.
- Weather control, world map, WASD movement, nearby interaction, and resident dialogue: passed in the hardware-browser visual inspection.
- Browser console/page errors in that inspection: none.

### Not passed / unresolved

- `npx playwright test` using headless Chrome + SwiftShader failed. The first attempt timed out while taking a full-page screenshot. After removing screenshot calls from the headless E2E test (the hardware visual-inspection script owns screenshot capture), the second attempt failed to observe the expected weather label and browser teardown stalled at the 45-second timeout.
- The equivalent weather/map/movement/dialogue interactions passed in the separate hardware-accelerated Chrome visual-inspection script. The headless SwiftShader test discrepancy remains unresolved and must not be reported as an E2E pass.

## Renderer diagnostic

Measured with the in-scene R3F counters after the facade pass:

- Average sampled throughput: 30.1 FPS.
- Median frame interval: 16.7 ms.
- p95 frame interval: 82.4 ms.
- Worst sampled frame interval: 377.9 ms.
- Draw calls: 161 (Checkpoint 02 sample: 194).
- Triangles: 9,208 (Checkpoint 02 sample: 7,024).
- Geometries: 167.
- Textures: 11 (Checkpoint 02 sample: 8).
- Shader programs: 9.

Draw calls decreased by approximately 17%, while triangles and texture count increased. Frame pacing is still inconsistent; p95 and worst-frame spikes remain too high. This is a short diagnostic sample, not a sustained FPS benchmark or acceptance of the performance target.

CPU reached approximately 72% during the headless Playwright attempt, below the 85% stop threshold. Further stress testing was paused to let the device recover.

## Visual assessment

The street now has real PBR plaster response and additional facade structure, and repeated windows are instanced. However, the current environment remains a greybox/procedural blockout. It is **not photorealistic yet**. The human residents are still primitive placeholder characters with procedural gait. This checkpoint is a material and facade-quality improvement, not completion of the approved visual direction.

## Character asset decision

No third-party human model was integrated in this sub-checkpoint.

- Grab3D's free CC0 rigged model has a stylized animated-film appearance and a very high polygon count (498,580 triangles; light variant 249,289; rigged GLB reported at 12 MB), so it does not meet the visual/performance target.
- Renderpeople's terms allow real-time game use but prohibit making source model data individually accessible or extractable. A plain public GLB bundle would not meet that condition.
- DevallAssets' CC0 nine-character pack requires a minimum $4.99 purchase and is 156 MB, so it does not meet the current no-cost constraint.
- Sketchfab's Human Models Set is CC BY, but its 81k-triangle set viewer reported the model too heavy for this device.
- Sketchfab's Black Boy Student model is CC BY and 18.4k triangles, but is visibly low-poly/cartoon-styled and no animation clips were confirmed.

No asset was selected rather than quietly substituting a cartoon model for the photorealistic character target. Any future CC BY model must include its exact creator attribution in the credits file.

## Evidence files

- `artifacts/checkpoint-03-solara-bay-street.png`
- `artifacts/checkpoint-03-solara-bay-interaction.png`
- `artifacts/checkpoint-03-render-diagnostic.png`

## Non-negotiables preserved

- No API keys, hosted AI, generative AI, or provider SDKs added.
- No runtime asset fetch; the plaster maps are bundled locally.
- No backend or cloud runtime service added.
- No C++/Wasm migration.
- No changes to Ating Universe, RAG Atlas, or AI_Skills.
- No remote push or deployment.
- Git remains uncommitted. Repository files are still untracked; no commit was created.

## Next sub-milestone: Checkpoint 03B

1. Resolve the headless E2E/WebGL mismatch or formally use the hardware-browser E2E route for this Intel HD 520 target.
2. Find a free, distributable, realistic human GLB with a verified rig and manageable polygon/texture budget.
3. Integrate one character, verify scale/orientation/materials, and add a real animation clip or a verified rig-driven locomotion layer.
4. Replace the most visible Solara Bay blockout facade with a more authored modular building kit.
5. Repeat the same fixed-view screenshot and performance capture. Keep one region and a small NPC count.

**Checkpoint boundary:** 03A is complete as a limited facade-material pass. The approved photorealistic character and environment target is still open. Do not mark the whole Checkpoint 03 visual upgrade complete.
