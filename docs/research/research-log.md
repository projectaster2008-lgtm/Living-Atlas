# Living Atlas Research Log

## Local RAG Atlas
- Atlas validation: 10 sources valid, 10 ingestible.
- Architecture query retrieved web3d-studio 3D web design, Three.js editor systems, and React Three Fiber implementation references.
- Graphics query retrieved Three.js shadow-system and camera/visual system references from pinned graphics skills.
- Performance query retrieved web3d-studio/R3F performance guidance and Three.js skill router.
- Workflow query retrieved Superpowers writing-plans and TDD guidance.
- Local sentence-transformer weights loaded; expected unauthenticated Hugging Face rate-limit warning appeared. No HF token added.

## Context7
- Three.js: /mrdoob/three.js
- React Three Fiber: /pmndrs/react-three-fiber
- Playwright: /microsoft/playwright
- Verified patterns: cap device pixel ratio by pixel budget; explicitly dispose textures/geometries/materials/render targets; mutate fast 3D state in useFrame rather than React setState; use instancing and adaptive quality; use Playwright page errors and screenshot assertions.

## Independent research (initial session, historical record)
- Parallel was used during the initial research session for official React Three Fiber performance scaling and performance pitfalls docs. This is historical provenance only; Parallel is now excluded from the Living Atlas research pipeline.
- Exa: open-source Overworld browser 3D RPG architecture (reference only, not adopted as dependency), Recast Navigation JS docs, local browser save patterns.

## Updated research pipeline decision (2026-11-17)
- Exa: semantic discovery and broad source search.
- Firecrawl: targeted page scraping, site crawling, structured extraction, and developer-source search.
- TinyFish: JavaScript-rendered pages, interactive browser extraction, and independent cross-checks when needed.
- Parallel: removed from future Living Atlas research workflows as redundant with Exa's general discovery role.
- RAG Atlas remains the pinned local reference corpus; Context7 remains the current library documentation source.
- Avoid calling all providers for every question. Use the smallest combination that adds distinct evidence.
- Firecrawl developer search: R3F scaling guide, Khronos glTF discussion on progressive scene streaming, and glTF progressive LOD tooling references.
- Asset research: Poly Haven and ambientCG state their libraries are CC0; validate each selected asset and its download variant before bundling.
- Primary references:
  - https://r3f.docs.pmnd.rs/advanced/scaling-performance
  - https://r3f.docs.pmnd.rs/advanced/pitfalls
  - https://threejs.org/manual/en/cleanup.html
  - https://threejs.org/manual/en/responsive.html
  - https://threejs.org/docs/pages/GLTFLoader.html
  - https://playwright.dev/docs/test-snapshots
  - https://recast-navigation-js.isaacmason.com/
  - https://polyhaven.com/en/license
  - https://ambientcg.com/

## Hardware evidence
- Windows 10.0.19045.6466
- Node 24.22.0; npm 11.19.1
- Physical memory 8,466,804,736 bytes (about 8.47 GB)
- Intel Core i5-6200U, 2 cores / 4 logical processors
- Intel HD Graphics 520, reported adapter memory 1 GB
- C: free space 127,397,679,104 bytes (about 127 GB)

## Caveats
- Exa and Firecrawl results are discovery signals; review maintenance, license, and compatibility before reuse.
- No third-party runtime project or AI service adopted.
- RAG Atlas is a pinned snapshot, not proof of upstream latest state.
