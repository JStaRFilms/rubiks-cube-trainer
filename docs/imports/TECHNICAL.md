# Cube Trainer — Technical Document

Implementation-level design for the app described in [`PLAN.md`](./PLAN.md). Decisions in PLAN.md §8 are treated as fixed inputs here.

---

## 1. Project layout

```
src/
  app/          # shell, tab routing, settings UI, PWA update prompt
  trainers/     # one module per trainer: cross, cross1, cross2, zbll, f2l, timeattack
    shared/     # Timer, StatsPanel, CaseCard, PlanPhase, ScrambleView
  cube/         # cube model, move engine, notation parser, SVG net renderer
  solver/       # coordinate tables, cross solver, pair solvers, tier logic
  workers/      # generation worker + typed message protocol
  data/         # case libraries (JSON) + schema validation
  p3d/          # 3D alg player (lazy-loaded chunk, §7)
  store/        # Zustand stores + idb persistence + export/import
  pwa/          # service-worker config, update flow, install UX
tests/          # unit + solver fixtures + e2e offline checks
```

Build tooling: Vite + TypeScript (strict), Vitest for unit/solver tests, Playwright for offline/e2e smoke tests, ESLint + Prettier. Static hosting: **GitHub Pages** (default; any static host works — no backend, no API).

---

## 2. Cube model & move engine

### 2.1 Representation

- **Cubie model is the source of truth**: two arrays each for corners (8) and edges (12): permutation (`perm[i] = which piece sits at position i`) and orientation (`ori[i] ∈ 0..2` corners, `0..1` edges).
- **Facelet model is derived** for the SVG net renderer and 3D player (bidirectional conversion, round-trip tested).
- All state as `Uint8Array`; state hash for dedupe = raw byte string of the arrays.

### 2.2 Moves

- Face moves (HTM): `U D L R F B` × {1, 2, '} = 18 generators, encoded as precomputed permutation/orientation deltas applied to state arrays (no search at move time).
- Wide moves (`Rw`, `r`, …) expand to `face + slice` at parse time.
- **Rotations `x y z` are implemented as plain move tables** (permutation + orientation deltas, same machinery as face moves — derived geometrically and locked by order/conjugation tests). Wide moves expand at parse time to `rotation + opposite face` (e.g. `Rw = x·L`, `Lw = x'·R`). The F2L slot logic (M1.5) uses conjugation identities (`y F y' = R`, `y' F y = L`) rather than a separate remap path.

### 2.3 Notation parser

- Tokenizer for WCA notation: face moves, modifiers `'`/`2`, wide (`Rw`/`r`), rotations, and optional `[commutator]` grouping used by case libraries.
- Output: normalized move list (`{face, amount}`), with `.inverse()` and AUF normalization (`U`, `U'`, `U2` collapsing).
- Parser has zero dependencies and is unit-tested against a golden notation corpus.

---

## 3. Solver / generation engine

All solver code runs in a **Web Worker** (`workers/generation.worker.ts`). Coordinates and pruning tables are `Uint8Array`, transferable between worker and main thread where needed.

### 3.1 Cross (exact K, 1 ≤ K ≤ 8)

- **Coordinate**: position + flip of the 4 cross edges (relative to the user's cross color): `12·11·10·9 · 2⁴ = 190,080` states.
- **Full BFS table** (distance-to-solved for every state, max depth 8) = 190 KB, computed in the worker on first run (~<1 s) and cached in IndexedDB. No symmetry reduction needed at this size — simplicity over micro-optimization.
- **Exact-K generation** (guaranteed, no rejection sampling):
  1. Pick a random cross coordinate from the BFS depth-K layer (its optimal cross is exactly K by construction).
  2. Build the scramble as `S = R · T`: a random 20-move segment `R`, then `T` = short BFS path in coordinate space from `cross(S·R… )` to the chosen target coordinate (≤ 8 moves).
  3. The final position's cross coordinate has distance exactly K; the BFS path doubles as the "reveal solution".
- "≤ K" mode picks from layers 1..K. Optimal-cross check for arbitrary scrambles = table lookup, O(1).

### 3.2 F2L case placement (trainer §2.6)

- **Pair coordinate**: {corner: 8 pos × 3 ori} × {edge: 12 pos × 2 flip} = **576 states**; full BFS table trivial.
- Generation: random scramble `R`, then suffix `T` (BFS in pair-coordinate space, typically ≤ 8 moves) parks the target corner+edge into the chosen **case state in the chosen slot**. Case in slot k = rotation conjugation `y^k · alg_FR · y^-k` of the FR-canonical case.
- Exact case state guaranteed; rest of the cube stays realistically scrambled by `R`.

### 3.3 Cross+1 / Cross+2 tiers

- Combined coordinates are too large for full tables (cross+1 ≈ 190,080 × 24 × 24 ≈ **1.1 × 10⁸** states ≈ 110 MB — not shippable; cross+2 is ~6 × 10¹⁰ — hopeless). Therefore:
  - **v1 tier metric (transparent, shipped first)**: sequential measure — `cross ≤ K` (exact, from the cross table) + optimal pair insertion length `P` for the chosen slot (pair BFS with the cross held fixed). Tier = (K, P) buckets frozen after latency measurement (PLAN §8.3).
  - **M4 refinement**: continuous cross+1 search = IDA* over the combined coordinate with admissible heuristic `max(crossDist, pairDist)` (each subgoal's distance lower-bounds the full solution, so the max is admissible). Search on demand per candidate scramble; tier filtering by found solution length.
- **Generation**: rejection sampling — batch random scrambles in the worker, filter to the requested tier, return first hit with its metadata (cross length found, pair notes). Hit rates are kept reasonable by tier design; measured in the benchmark suite.
- Cross+2 v1 = same machinery, two sequential pair insertions; continuous search stays a stretch improvement.

### 3.4 Case-based trainers (ZBLL, OLL/PLL, F2L case identity)

- No search. Scramble = `U^a · alg⁻¹ · U^b` (random AUF `a,b`) applied to a solved-F2L cube, optionally conjugated by `y^k` for angle randomization (time attack AUF toggle, ZBLL angle training).
- ZBLL drills are LL-only for fast reps (full-scramble ZBLL variant is a settings option later).

### 3.5 Worker protocol

- Promise-wrapped `postMessage` API with request IDs:
  - `gen {reqId, trainer, opts}` → `case {reqId, scramble, meta}` | `error`
  - `warmup {tables…}` / `tableReady {name}` — prune/table build progress (drives a first-run loading UI)
  - tables transferred as `ArrayBuffer` (transferables, zero-copy)
- Worker keeps a warm cache of built tables; tables rehydrated from IndexedDB on boot.

---

## 4. Data: case libraries & persistence

### 4.1 Case library JSON (bundled, user-overridable)

```jsonc
{
  "id": "zbll-T-03",            // stable slug
  "trainer": "zbll",            // zbll | oll | pll | f2l
  "family": "T",                // zbll/oll family, f2l group, pll group
  "name": "T3 — headlights left",
  "alg": "R U R' U' R' F R2 U' R' U' R U R' F'",
  "recognition": { "arrows": [...], "note": "…" }   // optional render hints
}
```

- Validated with Zod at load; bundle ships curated subsets (decision §8.4: public alg sheet, curated, user-editable). User edits/algs live in IndexedDB and **override** bundled entries at read time; "reset to default" per case.

### 4.2 IndexedDB (via `idb`) — versioned schema

```
settings    { key }                        → value
sessions    { id }   idx: trainer, created
solves      { id }   idx: sessionId, trainer, caseId, date
userAlgs    { caseId }                     → { alg, notes, updatedAt }
taSets      { id }                         → { trainer, name, caseIds[] }
solverCache { name }                       → ArrayBuffer (cross table, etc.)
meta        { key }                        → schemaVersion, table versions
```

- Migrations: forward-only, switch on `schemaVersion` in `meta`; export/import always round-trips through the current version.
- **Export format** (JSON file, versioned):

```jsonc
{ "format": "cube-trainer-export", "version": 1, "exportedAt": "…",
  "settings": {…}, "sessions": […], "solves": […], "userAlgs": […], "taSets": […] }
```

- csTimer-compatible export is a stretch (M6): map solves → csTimer's terse text format.

### 4.3 State management

- Zustand stores sliced per domain (`timerStore`, `sessionStore`, `settingsStore`, `caseStore`), each with an `idb` persistence adapter (debounced writes; solves written immediately — never lose a time).
- Timer values are stored as integer milliseconds; penalties (`+2`, `DNF`) stored alongside raw time, never baked in.

---

## 5. Timer implementation

- Clock: `performance.now()` deltas only (monotonic); display via `requestAnimationFrame`; persisted precision = full float ms.
- Input state machine: `idle → armed (press) → running → stopped`, with a ~250 ms post-stop guard against accidental restarts.
- Modes: **tap/space toggle** (default) and planning-aware flows from PLAN §2.1 (untimed "Plan" phase → explicit start). Stackmat-style hold-to-start is a later option behind the same state machine.
- Penalties & deletion applied to the last solve only; every action undoable for 1 solve deep.

---

## 6. PWA & offline architecture

- `vite-plugin-pwa` (Workbox `generateSW`):
  - **Precache**: app shell, all route chunks _except_ `p3d`, bundled case-library JSONs, fonts (self-hosted, subsetted).
  - **Runtime cache**: stale-while-revalidate for same-origin assets; `p3d` chunk cached on first use so it's offline-available afterwards.
  - Navigation fallback → cached `index.html` (SPA).
- Update flow: SW registers on load; new version detected → non-blocking toast "Update available — Reload". No auto-reload mid-session (a running timer must never die).
- Installability: manifest (standalone, theme + background color = dark), icons 192/512 + maskable, iOS meta tags; install prompt surfaced from Settings and after N sessions.
- Offline contract: everything except "check for updates" works with zero network; a small `navigator.onLine` banner is informational only.

---

## 7. 3D cube & alg player (lazy chunk)

- **three.js + @react-three/fiber**, isolated in `src/p3d`, loaded via dynamic `import()` on first open; Workbox caches it after first use (never in the critical path).
- Model: 26 cubie meshes; layer turns animated by rotating a transient group, snapped to exact quaternions at move end (no drift).
- Playback engine: parse alg → move queue → per-move tween (duration = base/speed, ease-in-out); controls: play/pause, step ±1, speed 0.25×–2×, loop; drag-orbit + pinch zoom via OrbitControls.
- Notation support matches the parser (§2.3) including `y/y'/y2` views and wide moves; mirrored playback (lefty algs) = stretch.
- F2L integration: player renders the case **in its generated slot** and can overlay the `y^k` mapping that brings it to the learned position.
- `@cubing/cubing.js` evaluated at M2 as a possible parser/3D shortcut; default plan is the custom player for full playback control (PLAN §4.1).

---

## 8. Performance budgets

| Metric                            | Budget                       |
| --------------------------------- | ---------------------------- |
| Initial route JS (gz, excl. p3d)  | ≤ 180 KB                     |
| 3D player chunk (gz, lazy)        | ≤ 900 KB                     |
| ZBLL/OLL/PLL case gen             | < 20 ms (no solver)          |
| Cross exact-K gen (worker)        | ≤ 150 ms p95                 |
| F2L case gen                      | ≤ 200 ms p95                 |
| Cross+1 tier gen                  | ≤ 500 ms p95                 |
| Cross+2 tier gen                  | ≤ 1.5 s p95 (tier-dependent) |
| Timer drift                       | < 5 ms/min; display 60 fps   |
| First-run table build (cross BFS) | < 1 s, off critical path     |

Budgets enforced in the benchmark suite (`tests/bench`) run before each solver milestone merge.

---

## 9. Testing strategy

- **Cube model**: move-table round-trips (`move·move⁻¹ = id`), facelet↔cubie conversion, notation corpus.
- **Solvers**: fixture scrambles with known optimal cross lengths; BFS table spot checks; property tests ("generated exact-K case has optimal cross = K" for all K); F2L suffix lands pair in exact case state; heuristic admissibility sanity (found ≤ sequential baseline).
- **Alg player**: parser golden tests; animation end-state == cube-model state after alg (consistency check each frame step in test mode).
- **Timer**: fake-clock unit tests for the state machine; drift simulation.
- **PWA/e2e** (Playwright): cold start offline, solve → reload → history intact, SW update toast, export/import round-trip.

---

## 10. Milestone ↔ module map

| Milestone (PLAN §5) | Modules touched                                                                         |
| ------------------- | --------------------------------------------------------------------------------------- |
| M0                  | `app`, `cube`, `store`, `pwa` shell, SVG net, test scaffolding                          |
| M1                  | `trainers/zbll`, `trainers/timeattack`, `trainers/shared` (timer/stats), `data` loaders |
| M1.5                | `trainers/f2l`, `solver` (pair BFS), slot/rotation logic                                |
| M2                  | `p3d` player, notation parser hardening, `@cubing/cubing.js` evaluation                 |
| M3                  | `solver` cross BFS table, `trainers/cross`, reveal-solution playback                    |
| M4                  | `trainers/cross1`, combined-coordinate IDA*, tier freeze bench                          |
| M5                  | `trainers/cross2`                                                                       |
| M6                  | export/import polish, install UX, histogram, schema v1 freeze                           |

---

## 11. UI design system & consistency contract

Single source of truth for every screen. Sub-agents and humans build against this section; the convergence pass audits against it.

**Design tokens** (`src/app/theme.css`, wired into the Tailwind theme; dark-first):

- Spacing: 4 px base scale (`--space-1..12`); all layout aligns to it.
- Type: one scale (`--text-xs..3xl`) with fixed line-heights; numeric displays use `tabular-nums` (timer, stats).
- Color: semantic tokens only — `surface`, `surface-raised`, `border`, `text`, `text-dim`, `accent`, `success`, `warning`, `danger`. No raw hex outside the token file.
- Radius (`--radius-sm|md|lg|full`), shadow levels (`--shadow-sm|md|overlay`), motion (`--dur-fast` 150 ms, `--dur-med` 250 ms, `--ease-out-quart`; honor `prefers-reduced-motion` and the in-app "Reduce motion" setting, which sets a `reduce-motion` class on `<html>`). Touch targets reach 44 px on coarse pointers via a `pointer: coarse` media rule.

**Shared component library** (`src/components/ui/`): Button, IconButton, Card, Tabs, Toggle, Select, Slider/Stepper (difficulty), TimerDisplay, SolveList, StatsPanel, CaseCard, ScrambleText, CubeNet, Modal, Drawer, Toast, Spinner, EmptyState. Screens compose these; a pattern's second use promotes it into the library first.

**States**: every interactive component implements default / hover / active / focus-visible / disabled; every view implements loading / empty / error / offline.

**Layout & platform**: one app shell (tab bar, content area, stats drawer). Desktop is the reference platform — pointer + keyboard first-class — responsive down to phone with 44 px touch targets preserved. Every action has keyboard parity; shortcuts are documented in Settings.

**A11y**: WCAG AA contrast across all token pairs; visible focus rings; meaning never carried by color alone (penalties get icon + color).

**Review gate**: a milestone's UI work closes only after a whole-app consistency audit against this section — spacing alignment, token usage, component reuse, states, keyboard parity, motion.
