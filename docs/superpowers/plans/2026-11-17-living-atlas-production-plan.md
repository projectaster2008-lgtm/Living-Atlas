# Living Atlas Production Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver the approved Living Atlas first release as an offline-capable, single-player open-world simulation with four connected compact regions and deterministic hardcoded NPC intelligence.

**Architecture:** React and TypeScript own the application shell and UI. Three.js/React Three Fiber render the active region. A plain TypeScript simulation core owns player/world/NPC/gameplay state and is independent of React. IndexedDB owns local persistence. Regions and content are data-driven and streamed one at a time.

**Tech Stack:** React 19, TypeScript, Vite, Three.js, React Three Fiber, GSAP only where useful, Vitest, Playwright, IndexedDB. Exact compatible versions checked before installation.

**Spec:** https://app.notion.com/p/41b5e668d0c28129bce0d6e038a04fa2?pvs=204

## Global Constraints
- No API keys, hosted AI, LLMs, generative AI, secrets, or provider SDKs.
- NPC AI is deterministic hardcoded logic and authored dialogue.
- No required backend, cloud DB, auth, analytics, or network runtime dependency.
- Local saves use IndexedDB with versioning and export/import.
- One compact region is rendered at a time.
- Preserve original project and assets; maintain asset license provenance.
- Target Intel i5-6200U, Intel HD Graphics 520, 8.47 GB RAM.
- Localhost visual QA is mandatory.
- Research workflow: RAG Atlas + Context7; Exa for discovery; Firecrawl for scraping/crawling/structured extraction; TinyFish for JS-rendered and interactive browser verification. Parallel is not used.
- No remote push, deploy, or destructive deletion without separate approval.

## Review Focus
- Invalid/corrupt/old save data must recover without destroying the last good save.
- NPCs with blocked destinations must recover, choose an alternate action, or wait without infinite loops.
- Region transitions with missing assets must restore the player to a safe state.
- Long frame stalls and tab visibility changes must not cause huge simulation time jumps.
- Low-end WebGL contexts must gracefully reduce quality or show a clear compatibility state.

---

## Workstream A — Foundation and guardrails

### Task 1: Establish project identity and app shell
Files: package manifest, lockfile, Vite/TypeScript config, index.html, README, .gitignore, AGENTS.md, NON-NEGOTIABLES.md.
- [ ] Verify new project path is empty and not an existing repository.
- [ ] Initialize independent Git repository.
- [ ] Add React/TypeScript/Vite and 3D runtime dependencies with compatible pinned versions.
- [ ] Add lint, typecheck, unit test, build, and local preview scripts.
- [ ] Verify dependency tree contains no LLM/provider SDK or cloud backend packages.
- [ ] Record exact package versions and Node/npm versions.

### Task 2: Deterministic simulation contracts (TDD)
Files: src/simulation/core, src/simulation/world, src/simulation/characters, tests/unit.
- [ ] Define seeded random source and fixed-step clock.
- [ ] Define world clock, weather, region, entity, NPC, behavior, relationship, and event contracts.
- [ ] Test deterministic seed reproducibility and bounded delta handling.
- [ ] Test schedule selection and utility scoring tie-breaks.
- [ ] Test NPC behavior transitions and destination failure recovery.
- [ ] Test event eligibility, cooldown, and completion transitions.
- [ ] Implement only after observing expected test failures.

### Task 3: Player control and interaction
Files: src/gameplay/player, src/gameplay/interactions, src/rendering.
- [ ] Test movement vector normalization, acceleration, and interaction range logic.
- [ ] Implement camera-relative third-person movement.
- [ ] Implement collision and safe spawn bounds.
- [ ] Implement contextual interaction with resident, door, vehicle, and activity targets.
- [ ] Verify keyboard/mouse controls and document touch limitations.

### Task 4: Solara Bay first playable region
Files: src/worlds/solara-bay, src/rendering/scenes, public/assets/worlds/solara-bay.
- [ ] Create a deterministic compact coastal district with plaza, streets, waterfront, café exterior, residential blocks, vegetation, and landmarks.
- [ ] Use modular architecture and shared PBR materials.
- [ ] Create stable follow and observer/photo cameras.
- [ ] Implement one explorable interior transition.
- [ ] Validate visual identity at low quality before expensive effects.
- [ ] Validate silhouette, material, lighting, camera-distance, and stress-seed views.

### Task 5: NPC society
Files: src/simulation/characters, src/gameplay/dialogue, src/rendering/characters.
- [ ] Test schedules, needs, utility selection, state machine, relationship updates, dialogue context, cooldowns, seeded variation.
- [ ] Implement nearby population with authored schedules and local navigation.
- [ ] Implement ambient NPC-to-NPC dialogue and player conversation choices.
- [ ] Add near, district, offscreen, and inactive-region simulation tiers.
- [ ] Verify residents behave autonomously and deterministically.

### Task 6: Weather, time, events, and traffic
Files: src/simulation/environment, src/simulation/events, src/simulation/traffic, src/rendering/environment.
- [ ] Test time progression, weather transition, event triggers/cooldowns, and traffic route advancement.
- [ ] Implement day/night, weather presets, surface wetness cues, wind, foliage movement.
- [ ] Implement authored public events and simple traffic.
- [ ] Ensure weather affects NPC actions and selected activities.

### Task 7: Vehicle gameplay
Files: src/gameplay/vehicles, src/simulation/traffic, tests.
- [ ] Test enter/exit state, safe player placement, acceleration/braking, steering bounds, collision, and save/restore.
- [ ] Implement one player-drivable arcade vehicle and route-driven traffic.
- [ ] Verify camera handoff, collision, and safe exit.

### Task 8: Missions, activities, and progression
Files: src/gameplay/missions, src/gameplay/activities, src/gameplay/progression.
- [ ] Test objective triggers, completion/failure, rewards, replay policy, and persistence.
- [ ] Implement errands, conversations, deliveries, travel, event attendance, landmark discovery.
- [ ] Add map, journal, discovery flags, and region unlocks.

### Task 9: Interiors and world transitions
Files: src/worlds/registry, src/worlds/streaming, src/gameplay/interiors.
- [ ] Test region manifest validation, transition success/failure, return transforms, and resource disposal.
- [ ] Implement World Gateway and four region manifests.
- [ ] Load one region at a time; inactive regions use lightweight simulation.
- [ ] Implement selected explorable interiors and transition loading/error states.

### Task 10: Persistence and offline release
Files: src/persistence, src/app/boot, tests/integration.
- [ ] Test IndexedDB schema, migrations, corrupted data recovery, import validation, export, autosave, and resume.
- [ ] Implement versioned local save slots.
- [ ] Verify offline boot after assets are installed.
- [ ] Ensure core gameplay requires no network or credentials.

### Task 11: Full QA and visual verification
Files: tests/e2e, docs/testing, scripts.
- [ ] Run unit, integration, lint, typecheck, and production build.
- [ ] Run browser journeys: boot, new game, move, interact, talk, activity, drive, interior, region travel, save, reload, resume.
- [ ] Capture localhost screenshots at fixed camera positions and deterministic seeds.
- [ ] Inspect title, plaza, conversation, vehicle, interior, weather, night, and region transition.
- [ ] Inspect console/page errors, WebGL errors, frame time, draw calls, memory, repeated region transitions.
- [ ] Profile low graphics preset on target laptop and document measured FPS.
- [ ] Audit licenses and attribution.

## Delivery gates
- First complete region is a playable end-to-end vertical slice before content expansion.
- All four regions must exist as connected, playable compact districts before claiming the approved first release complete.
- Every system has an automated or reproducible manual acceptance test.
- Visual inspection is recorded separately from code/test verification.
- Keep implementation local. Ask separately before remote push or deployment.
