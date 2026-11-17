# Checkpoint 03: Art Direction, Asset Audit, and Facade Upgrade

**Date:** 2026-11-17  
**Scope:** Solara Bay representative street and first character-art direction  
**Status:** In progress

## Production constraints re-confirmed

- Zero API keys, hosted AI, generative AI, provider SDKs, or runtime cloud services.
- NPC logic remains deterministic and authored.
- Local-first/offline runtime; one active region at a time.
- Target Intel Core i5-6200U, Intel HD Graphics 520, 8 GB RAM.
- No destructive changes, remote push, or deployment.
- Localhost visual QA is mandatory.
- Research pipeline is Exa + Firecrawl + TinyFish; Parallel remains excluded.
- RAG Atlas and Context7 remain required references.
- Living Atlas remains isolated from Ating Universe repositories.

## Baseline inspected

- Preview responds at http://localhost:4173.
- Current renderer uses React 19, TypeScript, Three.js 0.186.0, React Three Fiber 9.8.2, Vite 8.3.8.
- Current Solara Bay is a compact greybox street with primitive box buildings and capsule NPCs.
- Existing assets: Joburg Central Sunset HDRI (1k) and Asphalt 02 PBR maps (1k).
- Baseline renderer sample from Checkpoint 02: 194 draw calls, 7,024 triangles, median 16.7 ms and p95 79.9 ms. These are diagnostics, not a sustained performance certification.
- CPU sampled during this session: 23.2% and 27.2%, below the 85% stop threshold.

## Asset research and selection

### Selected facade material

**Plastered Wall** by Amal Kumar, Poly Haven  
Source: https://polyhaven.com/a/plastered_wall  
License: CC0 1.0, commercial use permitted, no attribution required.  
Real-world dimensions: approximately 2m × 2m.  
Selected 1k JPG maps:
- Diffuse: https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/plastered_wall/plastered_wall_diff_1k.jpg
- OpenGL normal: https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/plastered_wall/plastered_wall_nor_gl_1k.jpg
- Roughness: https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/plastered_wall/plastered_wall_rough_1k.jpg

Downloaded locally to `public/assets/materials/plaster/`. MD5 verified against Poly Haven's file record:
- Diffuse: 9f64cd14ded4938e64ab6c6bb3de3c19
- Normal: e3e00c5d9a589621bf3cc541d9fb7d81
- Roughness: 5c5f8e9c43bf183b45274575a7eac318

### Character asset findings

- Grab3D Casual Man: CC0, rigged GLB with walk/run, but described as animated-film stylized and the full model is very high poly (498,580 triangles; light version 249,289; rigged GLB 12 MB). Not selected because its style and cost do not match the photorealistic target / low-end budget.
- Renderpeople: scanned realistic characters, but their terms prohibit making model files individually accessible/extractable; embedding a raw GLB in a public folder would conflict with this restriction. Not selected.
- DevallAssets nine-character pack: CC0 and rigged GLB, but requires a minimum $4.99 purchase and a 156 MB archive. Not selected because the current project budget is zero.
- Sketchfab Human Models Set: CC BY and rigged variants, but the model viewer reports the model is too heavy for the device; 81k triangles for the set. Not selected.
- Sketchfab Black Boy Rigged Ready for UE4: CC BY, 18.4k triangles, 9.5k vertices, PBR and rigged; visual style is low-poly/cartoon and no animation clips are specified. Not selected for the approved photorealistic visual target.

**Character decision:** Do not silently substitute a stylized or cartoon asset for the approved photorealistic direction. Continue the street material/architecture pass; keep the character asset gate open until a suitable low-cost, distributable, realistically proportioned rigged asset is verified. Any CC BY selection must add its exact attribution to CREDITS.md.

## Technical references used

- Local RAG Atlas query retrieved pinned Three.js asset-pipeline, loaders and animation skills (source commit 0e181866f095b5f06d005133876e926515390d95).
- Context7 current docs resolved Three.js r186 and React Three Fiber 9.8.2. GLTFLoader/AnimationMixer and useLoader caching are supported; asset reuse and animation lifecycle must be deliberate.
- AI Skills frontend-performance guidance: measure baseline, identify bottleneck, re-measure on the same route/device, report remaining risk.
- Superpowers verification-before-completion: fresh command output is required before any completion claim.
- Independent asset checks used Exa for discovery, Firecrawl for structured extraction and source pages, and TinyFish for cross-checking the Grab3D CC0 terms.

## Checkpoint 03 acceptance

- A representative street has visibly richer material response and architectural detail without expanding region size.
- Facade material maps are bundled locally; runtime has no external asset fetch.
- Draw calls and GPU texture count remain controlled for Intel HD 520.
- Unit tests, typecheck, production build and Playwright visual inspection pass.
- Capture before/after localhost screenshots at the same viewport and camera position.
- Record measured frame-time percentiles and renderer counters; do not claim stable FPS from one sample.
- No character asset is integrated until its quality, license, format, rig and budget are verified.

