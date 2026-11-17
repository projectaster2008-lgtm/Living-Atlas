# ADR-003: Defer C++ / WebAssembly simulation core

- Date: 2026-11-17
- Status: Deferred pending measured evidence
- Scope: Living Atlas runtime architecture

## Context

Gemini suggested compiling a C++ core with Emscripten to WebAssembly for simulation loops, NPC logic, and physics. The current project is a React/TypeScript/Vite browser game. Its simulation core is intentionally plain TypeScript and independent of React.

The target laptop is an Intel Core i5-6200U (2 cores / 4 threads), 8.47 GB RAM, and Intel HD Graphics 520. The visible Solara Bay checkpoint is still an early greybox: simplified buildings, placeholder-scale residents, sparse environment detail, and large unbuilt/blank surfaces. The immediate product risk is not yet proven to be CPU throughput.

## Decision

Do not add C++, Emscripten, a Wasm binary, or an additional compiler toolchain at this checkpoint.

Keep the simulation core in plain TypeScript. First repair and profile player movement, NPC scheduling/behavior, proximity interactions, traffic, and fixed-step simulation on the actual target laptop.

## Evidence and rationale

- The existing architecture already isolates simulation logic from React, making profiling and later replacement of a hot subsystem possible without coupling the renderer.
- Emscripten's official best practices warn against frequent JS/Wasm boundary calls. Benefits depend on batching work into coarse calls over contiguous buffers, not simply translating every TypeScript function into C++.
- Emscripten also adds linear-memory management, generated loader/runtime code, compiler/build integration, and browser verification requirements.
- Browser main-thread work still blocks rendering even when written in Wasm. Heavy work must yield or move to a Worker; Wasm alone does not solve scheduling.
- No benchmark currently demonstrates that NPC logic or the simulation loop is CPU-bound. The earlier report did not establish such evidence.
- On this laptop, extra compiler and memory overhead may increase development and runtime complexity before it solves a measured bottleneck.

## Reconsideration gate

Revisit only after:
1. Correctness and functional gameplay tests pass for the TypeScript simulation.
2. A reproducible performance profile on the target laptop identifies a CPU-bound simulation workload.
3. A representative benchmark compares the existing TypeScript implementation against a coarse-grained Wasm prototype.
4. The Wasm version shows a meaningful end-to-end improvement after accounting for initialization, memory, JS/Wasm boundary costs, and browser frame time.
5. The integration remains compatible with local/offline operation and all non-negotiable constraints.

## Consequences

- No C++/Wasm implementation is included in Checkpoint 02.
- Optimization remains measurement-led: reduce simulation work, use fixed-step updates and tiered NPC simulation, then consider Workers or Wasm only if profiles justify them.
- This is a deferral, not a permanent prohibition. Any later adoption requires a new evidence-backed decision.

## Sources

- Emscripten best practices: https://emscripten.org/docs/compiling/best_practices.html
- Emscripten pthreads: https://emscripten.org/docs/porting/pthreads.html
- Chrome Developers, Compiling C and C++ to WebAssembly with Emscripten: https://developer.chrome.com/docs/modern-web-guidance/guides/wasm/cpp-on-the-web
- Emscripten memory deployment guidance: https://emscripten.org/docs/compiling/Deploying-Pages.html
