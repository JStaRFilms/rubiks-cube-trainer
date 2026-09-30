# Coding guidelines

These guidelines apply when implementation is authorized. The current product contract is [the revised plan](imports/PLAN.md); this file translates it into working constraints, not a second specification. The inherited [`TECHNICAL.md`](imports/TECHNICAL.md) and [`AGENTS.md`](imports/AGENTS.md) are historical. Their exact-K default, desktop-first layout, earlier F2L placement method, first-use-only 3D caching, timer precision/input conflicts and completed-milestone claims do not apply.

## Current implementation direction

Use pnpm, pinned by package.json, and commit pnpm-lock.yaml. Install with `pnpm install --frozen-lockfile` for reproducible checks. Do not add npm or Yarn lockfiles. Run project scripts through pnpm.

Use Vite, React and strict TypeScript for a static PWA. Retain Tailwind, Zustand, `idb` and `vite-plugin-pwa` only where they serve the implementation. Evaluate existing cube models, notation, solvers and players before writing replacements. Record package identity, license, notation support, offline dependencies, accessibility limits and measured bundle/performance evidence. Review source and redistribution rights before reusing datasets or algorithms.

Keep cube state and notation consistent across generation, validation, 2D views and the 3D player. Generation belongs in a Web Worker where bounded search could block interaction. Requests need identity and cancellation; stale responses cannot replace a challenge made under newer settings. Timeouts and search failure must be visible, never silently return a weaker challenge.

Persist local sessions and attempts in IndexedDB. Store raw integer-millisecond durations and applicable configuration/verified generation metadata. Keep disposable, versioned solver caches separate from history. Validate complete imports before mutation; retain existing data on invalid input. Offer backup, explain browser-storage limits, and report write failures instead of claiming a record saved.

## Product rules that code must preserve

- Support all cubing levels, modern iPhone/Android browsers and desktop keyboard use. Standard touch controls cannot depend on one phone model.
- Cross K is a maximum optimal HTM depth from 1–8, not exact K. Record actual optimal depth and verify generated states and optimal reveals.
- Cross+1's L is an upper bound backed by a valid combined witness. Do not call it optimal unless proven. Keep any-pair and specifically targeted-slot goals distinct; retain witness metadata.
- Cross+2 needs measured feasibility for real two-pair goals, bounded behavior and an explicit owner go decision before implementation. No sequential substitute is implied.
- F2L uses the isolated target-pair context with cross and other pairs solved. Verify all 41 canonical cases and supported slot mappings.
- OLL and PLL are separate set types. OLL begins with F2L solved and oriented LL; successful OLL need not solve LL permutation. PLL begins solved/aligned and applies AUF before the next setup. Verify full 57/21 coverage.
- ZBLL targets the sourced, frozen 493-case convention. Do not claim completion before identity conventions, inventory and entries are verified.
- Record preparation from actual scramble presentation. It includes scrambling and is not pure planning time. Do not subtract a guess. Keep inspection duration separate; keep raw execution separate from penalties. Apply the 15/17-second thresholds and interruption rules in PLAN.
- All included assets, including 3D dependencies, must be ready offline after setup. Never auto-reload during an attempt. No initial backend, account, cloud sync or smart-cube dependency.
- Do not claim automatic observation of a physical solution, actual pair choice, or coaching insight. These inputs are self-reported or generator metadata, as specified in PLAN.

## Verification and release evidence

Start with focused Vitest logic tests, then relevant typecheck/lint/build and Playwright browser flows as those scripts exist. Test cube move/frame consistency, trainer goals, witnesses and case fixtures; timer boundaries/input cancellation/interruption; DNF and compatible statistics; import/export and migrations; storage errors; cold offline access including never-opened features; and update behavior during attempts.

For browser verification, record actual browser/device versions. The intended matrix is current iOS Safari, Android Chrome and desktop Chromium/Firefox, with desktop Safari where available. Do not claim broad device support from desktop-only checks. Measure warm/cold generation, p50/p95, memory and cache/download costs on representative devices before setting performance tiers. Cross+2 and video need independent feasibility evidence. No inherited test counts, milestones, datasets or benchmarks count as current evidence.

Use one focused correctness/interaction review per increment and repair confirmed blockers. Do not keep expanding scope to satisfy speculative review suggestions. Check [the requirements index](Project_Requirements.md) and [FR issue packets](issues/) for traceability; these index the plan rather than override it.

## Stage commits

The parent makes a scoped local commit after each reviewed stage or usable increment. Commit the stage's actual artifacts and updated handoff records, with a message that describes what was completed. A proposed Design commit does not authorize Build.

Inspect staged and unstaged changes first. Preserve unrelated staged work; do not sweep the entire index into a commit. Implementers leave Git integration to the parent unless explicitly assigned. No automatic push, amend, rebase or history rewrite is authorized. Record the resulting commit in the handoff when useful, without creating an endless loop of metadata-only commits.

## Next gates

G02 owns architecture, reusable-tool decisions, cube/notation and local-data/worker contracts. D01 owns phone-first interactions and screen states. Do not use this guidance to skip either gate. Coding tasks begin only when their explicit dependencies and approvals are met. B12 is a feasibility experiment; B13 additionally requires owner go. R01 requires its own authorized isolated worktree, consented samples and bounded experiment packet. Teaching and sync require their separately defined editorial/provider decisions. No deployment, account configuration, research launch or external data collection is authorized by these guidelines.
