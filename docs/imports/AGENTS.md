# AGENTS.md

Cube Trainer — an offline-first, installable PWA for speedcubing training: Cross, Cross+1, Cross+2, ZBLL, F2L, and OLL/PLL Time Attack trainers sharing one timer/stats core. No backend, no accounts; all data is local (IndexedDB) and everything works offline after first load.

## Read these before working

- **[`PLAN.md`](./PLAN.md)** — product scope, feature spec, milestones, and **locked decisions (§8)**. Read it when scoping any task, deciding what to build next, or when a request drifts toward scope creep. The decisions there are settled: build per them, and surface conflicts instead of deviating silently.
- **[`TECHNICAL.md`](./TECHNICAL.md)** — the implementation design: cube model, solver algorithms, data schemas, worker protocol, PWA contract, performance budgets (§8), and the milestone↔module map (§10). Read the relevant section before writing or changing any module.

## Current state

- **M0 + M1 complete** (scaffold/PWA shell, cube model + move engine + notation incl. M/E/S and solver-frame rotations, SVG net, design system + component library, ZBLL trainer, OLL/PLL Time Attack, timer engine, stats incl. WCA DNF semantics, IndexedDB v3 schema, 48 unit tests). Verification: lint/typecheck clean, tests green, build green (route JS ~110 KB gz), offline contract holds, audits recorded in `docs/audits/`.
- Case libraries are **self-verified seeds** (12 OLL / 18 PLL / 2 ZBLL) — the data test proves every alg is a genuine LL case; growth happens via verified import, never memory transcription (see `docs/audits/2026-09-29-m1.md` §8.5 note).
- Next work item: **M1.5** (F2L trainer) then **M2** (3D alg player) per PLAN §5 and TECHNICAL §10.
- Keep this section current: after finishing a milestone, update it to say what exists and what's next.

## Ground rules

- **Locked means locked.** Stack (Vite + TS strict + React + Tailwind + Zustand + `idb` + `vite-plugin-pwa`), difficulty semantics, and trainer defaults are decided (PLAN §8). Proposals to change them go to the user first.
- **Scope guard.** The six trainers plus shared timer/PWA are v1. Requests landing in PLAN §1 non-goals (accounts/sync, coaching/teaching modes, lookahead analysis, other puzzle types) get flagged to the user before any build.
- **Milestone discipline.** Work within the current milestone; a milestone's completion criteria in PLAN §5 are the gate for moving on.

## Build mindset — the quality bar

- **Polished is the completion criterion.** A milestone is done only when every touched screen is visually consistent with the design system (TECHNICAL §11) and every interaction state works: hover, active, focus-visible, disabled, loading, empty, error, offline.
- **Consistency by contract, not by memory.** UI is composed from design tokens and the shared component library only; a pattern's second appearance gets promoted into the library before use.
- **Fan out, converge.** For UI-heavy milestones, dispatch one sub-agent per independent surface (each trainer screen, settings, stats), all against the same design-system contract — then run a single convergence pass that audits the whole app for visual and interaction consistency and fixes any drift.
- **Loop until perfect, then stop.** The polish loop is: change → lint/typecheck/tests/build → review (code + visual) → fix → repeat. Exit only at zero defects on all axes and a fresh-eyes pass that finds nothing. Record each convergence audit with its findings and resolutions in `docs/audits/` (one file per milestone, dated).
- **Clean code is part of the deliverable.** Deep modules per TECHNICAL §1, no duplicated logic, component APIs designed deliberately — review for reusability, not just correctness.

## Toolchain & verification

The toolchain contract is TECHNICAL §1; the repo's `package.json` scripts are the executable source of truth once M0 lands. For every change:

1. `npm run lint` and `npm run typecheck` clean.
2. Unit tests pass — updated for every modified module, including new fixtures for solver changes.
3. Solver changes additionally pass the benchmark suite (`tests/bench`) within the budgets in TECHNICAL §8.
4. `npm run build` succeeds and the PWA offline contract holds: the service-worker precache still covers the app shell, and no change may reload the page while a timer is running (TECHNICAL §6).
5. User-facing schema changes (IndexedDB stores, export format) bump `schemaVersion` and include a forward-only migration (TECHNICAL §4.2).

If the scripts don't exist yet, scaffolding them _is_ the current milestone's work — don't skip verification, create them.

## Conventions that aren't in the code (yet)

- Cube state lives in cubie arrays (`Uint8Array`); facelet rendering is derived. Rotations `x/y/z` and wide moves are move tables in the same engine as face moves (`Rw = x·L`); conjugation identities are the tool for slot/angle logic.
- Cross scrambles get exact-K difficulty from BFS depth layers — guaranteed by construction, never by rejection sampling.
- Solve times are integer milliseconds; penalties (`+2`/`DNF`) are stored beside the raw time, never baked in.
- Solver/generation code belongs in the worker; nothing over ~10 ms runs on the main thread.
- All case libraries are data (JSON, Zod-validated) with user overrides in IndexedDB — algs are never hardcoded into components.
