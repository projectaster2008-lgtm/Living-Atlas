# Living Atlas Agent Instructions

Read this file before every project session. Approved product specification is maintained by the project owner. Do not infer or expand scope beyond the public constraints and approved project decisions in this repository.

## Non-negotiable constraints
1. No API keys, secrets, hosted AI, LLM endpoints, generative AI, or provider SDKs.
2. NPC intelligence is deterministic authored game logic: schedules, state machines, behavior trees, utility scoring, authored dialogue, relationships, and seeded variation.
3. No mandatory backend, cloud database, login, analytics, or network service.
4. Local-first, offline-capable after assets are installed. Saves use IndexedDB and export/import.
5. End-to-end playable product, not a static landing page or scene-only prototype.
6. GTA-inspired open-world freedom is a genre reference only. Maps, characters, missions, story, UI, and assets must be original.
7. Keep Living Atlas separate from Ating Universe Simulation. Never copy its code, data, env vars, secrets, or Supabase/Gemini assumptions.
8. Target a low-end laptop with integrated graphics and limited memory; profile real hardware rather than assuming desktop-class performance.
9. One compact active region at a time. Use adaptive resolution, conservative shadows, instancing, LOD, asset budgets, and explicit GPU resource disposal.
10. No destructive cleanup, deletion, remote push, or deployment without separate authorization.

## Required workflow
- Before substantial changes, inspect git status, package scripts, code, and tests.
- Read relevant AI_Skills and RAG Atlas instructions.
- Use RAG Atlas for pinned source retrieval and Context7 for current library docs.
- Web research/scraping pipeline: Exa for semantic discovery and broad source search; Firecrawl for site search, structured extraction, crawling, and targeted scraping; TinyFish for JS-rendered pages, interactive browser extraction, and independent cross-checks where needed.
- Do not use Parallel in the Living Atlas research pipeline. Exa replaces its general search role; use Firecrawl and TinyFish for complementary scraping/browser work. Avoid redundant multi-provider searches when one source already answers the question.
- Use Superpowers writing-plans, TDD, and verification-before-completion.
- Read relevant graphics skill and visual-validation protocol before significant 3D work.
- Write tests first, observe expected failure, implement the smallest change, then verify.
- Run lint/typecheck/unit tests/build/browser E2E as appropriate.
- Inspect localhost visually at fixed camera positions and capture screenshots. Code correctness does not prove visual correctness.
- Record evidence, environment, commands, outcomes, and unresolved gaps. Never claim unrun checks pass.

## Engineering boundaries
- Simulation core is plain TypeScript and independent of React.
- Rendering reads/interpolates simulation snapshots. Do not use React state as a per-frame game loop.
- All randomness is seeded and reproducible.
- Separate UI state from authoritative simulation state.
- Keep world content data-driven and region modules isolated.
- Asset provenance and license must be recorded before use.
- Do not copy RAG Atlas upstream source code or run upstream projects as dependencies.
