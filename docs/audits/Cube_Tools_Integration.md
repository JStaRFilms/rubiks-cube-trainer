# Cube tools integration

B02 implementation evidence for `orch-20260930-021158`, 2026-09-30. Starting HEAD was `3302acb`. No commit, branch, deployment, board change or master-plan edit was made by this implementation. Existing orchestrator summary/master-plan changes and task relocation remain untouched.

The delivered tool reviews entered setup and moves. It does not generate challenges, time attempts, create history, load a case dataset or recognize video. Desktop checks pass. Physical-device and installed-PWA restart checks remain open below.

## Reuse decision and source inspection

Use `cubing@0.63.8` for `Alg`, `KPuzzle`, `KPattern`, the `cube3x3x3` definition, `SimpleAlgIndexer` and `TwistyPlayer`. Review imports `cubing/alg`, `cubing/kpuzzle`, `cubing/puzzles` and `cubing/twisty`. It does not import search, scramble or solver entry points. No custom renderer was built.

| Pin | Value |
| --- | --- |
| npm artifact | `https://registry.npmjs.org/cubing/-/cubing-0.63.8.tgz` |
| package/source revision | `d02c02fc90f3410e612315141072a47af03feb97` |
| source archive origin | `https://codeload.github.com/cubing/cubing.js/tar.gz/d02c02fc90f3410e612315141072a47af03feb97` |
| local source archive | `public/licenses/cubing-0.63.8-source.tgz` |
| archive SHA-256 | `ee8148bca1811a00ab680310167c09253c401722e841f538a7fe73945fbd1617` |
| npm integrity | `sha512-suliTEg6p+PgyFcGtp3Y2NLd8gHnZFKYa5+Wd2HK7ciKuQOIuvRiM/on6HTVQuAxz2cNB/7WedgfUjQ1kR0kcA==` |
| cubing Node requirement | `>=22.3.0`, compatible with project `>=22.12.0` |
| renderer dependency | `three@0.170.0`, MIT |
| exported type dependency | `@types/three@0.169.0`, matching cubing's declared type dependency |

The released package manifest identifies the same source revision. Inspection covered exported declarations, parser/expansion behavior, KPuzzle transformations and orientation storage, `CurrentPatternProp`, indexer/timestamp behavior, Cube3D color/material construction, lazy imports, worker creation, WebGL initialization and the upstream contribution policy.

`tests/helpers/bundle-evidence.mjs` compares four released source-map contents byte for byte with that archive. These are `Alg.ts`, `parseAlg.ts`, `3x3x3.kpuzzle.json.ts` and `Cube3D.ts`. The permanent JSON records their SHA-256 values and the cubing source annotations reachable through emitted chunks.

The cubing root offers MPL-2.0 or GPL-3.0. This app selects MPL for the emitted review path. Original source access and license text stay local and offline. The emitted Three.js code and embedded stats/lazy-promise code use MIT. Existing React/React DOM/Scheduler/Zustand MIT and idb ISC notices are also retained. Local data links the notices and archive.

There is a real limitation to this rights verdict. Optional solver files such as `vendor/mit/cs0x7f/min2phase/3x3x3-min2phase.js`, `vendor/mit/cs0x7f/pyraminx.ts` and `vendor/mpl/xyzzy/master_tetraminx.js` have GPL notices despite their directory names. Inspection found no such source in the emitted review modules. The archive retains original terms. Do not assume the selected MPL route covers a future solver or dataset import. No algorithm dataset was selected or verified.

The upstream contribution documentation rejects LLM contributions. This is a downstream app, not an upstream submission. README and the local notices disclose LLM assistance.

## Cube contract and independent evidence

`src/cube/engine.ts` implements the `cube3-facelets-v1` adapter with 54 URFDLB stickers. It converts piece permutation/orientation to stickers and reconstructs patterns from legal stickers. Imported states must have valid labels/counts, unique cubies, valid orientation sums, valid parity and a proper rigid center orientation. Whole-cube rotations and center-moving slice/wide moves remain legal after center normalization. Center-arrow orientation is outside this contract.

The parser accepts the contract's outer, wide, M/E/S and x/y/z families. It expands groups and commutators, normalizes `2'` to `2`, produces canonical text and inverts expanded moves. Layer prefixes, vendor-specific moves, pauses, unsupported turn amounts and malformed input fail. Limits are 65,536 UTF-8 bytes, depth 32 and 10,000 expanded moves or annotation nodes. Preflight also caps multiplied Alg-entry/node visits at 1,000,000, including containers and empty operands. Tests accept depth 32 and 10,000 moves together and reject excessive traversal before invoking vendor expansion. The focused review correction below records the empty-operand bypass found in the first implementation.

The main oracle is not an engine round trip. `tests/helpers/cube-geometry.ts` rotates sticker positions and normals in integer Cartesian coordinates. It imports neither cubing nor production geometry/engine code. Tests compare every supported family and quarter amount, composed prefixes, rotations, wide/slice equivalences and inversion with this oracle. Separate fixtures cover flipped edges, twisted corners, odd edge parity, duplicate cubies, malformed stickers and improper center swaps.

The adapter's first corner-orientation sign was wrong. Independent composed-move fixtures exposed it, and the sign was corrected before browser verification. Engine round trips alone would have missed that defect.

All 24 rigid orientations, all six physical down-color frames and exact FR/FL/BL/BR conjugation have focused checks. Slot permutations are frozen in `tests/fixtures/slot-permutations.json` from the independent Cartesian helper, then checked against production transforms. Cross and pair predicates cover target failure and preservation of the other slots. OLL projection uses exactly:

```text
[0,1,2,3,5,6,7,8,9,10,11,18,19,20,36,37,38,45,46,47]
```

Core shared records now reference `CubeStateV1`. The `TrainingFrame` color map is readonly. Nonempty trainer backups still require the existing semantic validator. The engine integration does not enable or bypass that gate.

## Entered-move review

The existing timer-unavailable area opens a move-review drawer. The desktop dock, mobile shelf, dialogs, preferences and A/B layout remain in place. Setup starts from solved; a bad setup or algorithm leaves the current review intact.

The tool has canonical setup/move text, holding-frame guidance, current step/move and sticker state, forward/back, play/pause, replay-from-start, speed, drag orbit and pinch/scroll zoom. Reduced motion starts with text-only stepping and disables playback. Loading, timeout, failure and retry messages keep text review available. Hiding/reopening 3D preserves the current logical step. Initialization reports the actual player pattern, not a copied expected state.

The contract uses different physical colors from the vendor's default U-white scheme. `src/cube/player.ts` uses the exported puzzle-object API and clones the existing Three materials. It does not replace geometry or build a renderer. Initialization checks 54 front stickers and 108 total sticker meshes. Six-frame browser checks inspect actual center-material colors against independent color fixtures.

Player notifications compare the actual pattern with the corresponding engine state. The step includes finishing/finished leaves because `CurrentPatternProp` applies them after the base index. Leaf freshness and navigation-revision checks reject stale asynchronous notifications. While initialization is pending, the player tracks requested navigation but does not publish intermediate state. Readiness waits for an actual pattern/render snapshot that matches the latest requested step. Installed-Chrome tests step both ways through outer/wide/slice/rotation moves and compare every reported player state, while unit fixtures independently establish those states.

Keyboard/pointer events stay isolated from timer input. Review uses the existing drawer/activity gate, and backgrounding pauses playback. A real cross-tab update test keeps the waiting worker blocked while review is playing and until all editing drawers close.

## Cold-offline and emitted-byte evidence

The release manifest scope is `move-review`, not trainer readiness. It pins cube contract, engine version/source/integrity and the missing dataset/table versions. Required initialization IDs are `cube-model-v1`, `player-module-v1` and `generation-scaffold-v1`.

Setup validates storage/cache contents, loads the real model, registers the player module and probes the real generation worker. The probe must report the explicit unsupported-generation initialization failure. That is a verified boundary, not a ready generator. Setup does not open a renderer to warm it.

The manifest includes every emitted application, player/model lazy dependency, module-worker chunk, shell asset and local license/source asset. SHA-256 and lengths describe final emitted bytes. `generateBundle` runs with `order: 'post'`; the earlier hook had hashed bytes before Vite rewrote imports. The source archive uses `.tgz` because preview applied `Content-Encoding: gzip` to `.tar.gz`, so browser-decoded bytes no longer matched its hash.

`docs/audits/cube-bundle-evidence.json` records release `review-1790783684101`. The inspection verifies every required file's final hash/length, every emitted chunk's coverage and every local static/dynamic import edge. It also covers the emitted worker assets. No emitted solver/source-rights conflict was found. Broad optional puzzle chunks remain in the bundle because upstream imports expose them; they are cached rather than guessed away.

| Scope | Raw bytes | gzip bytes | Brotli bytes |
| --- | ---: | ---: | ---: |
| 36 manifest assets, including source archive | 8,530,459 | 7,439,813 | 7,377,975 |
| Executable JavaScript, including worker dependencies | 1,432,760 | 370,890 | 313,129 |
| Assets without the source archive | 1,477,740 | 386,005 | 325,232 |
| Source archive alone | 7,052,719 | 7,053,808 | 7,052,743 |
| `sw.js`, outside asset sum | 5,086 | 2,119 | 1,848 |
| `release-assets.json`, outside asset sum | 5,369 | 2,479 | 2,223 |

Compression values are Node zlib measurements of individual emitted files, summed by scope. They are not a production network-transfer guarantee and exclude HTTP headers. The source archive dominates offline storage/download size and is already compressed. The JSON lists each file separately. Required-asset hashes do not include self-hashing bootstraps.

The final cold test starts a fresh browser context, completes setup without opening review, closes the online page, disconnects the context, and navigates a new page to `/never-opened-review`. It then enters setup/moves and initializes the never-used 3D renderer. There are no failed requests and no non-local origins. Actual forward steps reach solved; closing/reopening the renderer stays on the same step. `docs/audits/cube-runtime-evidence.json` retains the request trace and full CDP snapshots for this final artifact.

## Measurements and checks

Installed Google Chrome `154.0.8037.59`, Windows `win32`, Playwright headless, localhost. These are observed desktop samples, not product budgets or physical-phone results.

| Observation | Final cold-offline sample |
| --- | ---: |
| Cold navigation to offline-ready shell | 1,173 ms |
| First entered review to initialized renderer | 1,015 ms |
| Warm renderer reopen | 398 ms |
| Baseline sampled JS heap used | 4,543,796 bytes |
| Renderer-open sampled JS heap used | 10,685,212 bytes |
| Baseline sampled JS heap total | 9,760,768 bytes |
| Renderer-open sampled JS heap total | 15,790,080 bytes |
| Event listeners, before / after | 291 / 376 |
| Nodes, before / after | 271 / 529 |

The post-fix full-suite sample was 414 ms shell, 709 ms first renderer and 287 ms warm reopen. Its separate cold-online model/player review was 823 ms. The final isolated rerun above was slower; the retained JSON records that run rather than the faster sample. Earlier development samples varied more, so these numbers should not be treated as a stable percentile.

Memory comes from CDP `Performance.getMetrics`, sampled before and after renderer initialization. It is not peak allocation, forced-GC retained memory, GPU memory, process RSS, service-worker/cache storage or a leak test. The profile can include detached contexts. The observed heap increase does not establish a mobile memory budget.

Commands run successfully:

- `pnpm install --frozen-lockfile`, lockfile unchanged by resolution during the original integration. Dependencies were not changed or reinstalled for the focused fixes.
- `pnpm lint`.
- `pnpm typecheck`, application and service-worker strict TypeScript.
- `pnpm exec vitest run tests/unit/cube.test.ts`, 28 cube tests passed after the fixes.
- `pnpm test`, 59 tests in 4 files. This includes the unchanged backup semantic-gate regressions.
- `pnpm build`.
- `pnpm exec playwright test tests/browser/review.spec.ts -g 'text navigation survives' --reporter=list`, the deterministic delayed-module/readiness regression passed.
- `pnpm exec playwright test tests/browser/review.spec.ts -g 'text navigation survives|reduced motion' --reporter=list`, both focused browser tests passed after adding explicit forward/back assertions during the error fallback.
- `pnpm test:browser`, all 17 installed-Chrome tests passed in 1.6 minutes after both focused fixes.
- `node tests/helpers/bundle-evidence.mjs`, final build, manifest/import/bytes/source inspection passed.
- `pnpm exec playwright test tests/browser/review.spec.ts -g 'first-use never-opened' --reporter=list`, 1 passed against the final recorded artifact after both focused blocker fixes.

Browser coverage includes navigation during delayed player import and pending readiness, real two-way player agreement and controls, six physical frames, emulated touch orbit/pinch, text-only reduced motion, forced review/player module import failure/reload recovery, never-opened cold-offline rendering, viewport fit/focus, real playback update gating, restore rollback/quota, stale previews, cache corruption/eviction/interrupted setup, and the deferred-attempt update-lock regression.

Failed ESM imports can remain cached by Chrome. Retrying an aborted dynamic 3D import did not repair that module graph in the tested browser. The UI now tells the user to copy notation and reload if retry fails. Text remains usable, and the test proves reload recovery. Timeout also invalidates late asynchronous initialization so a delayed import cannot restart an abandoned player. The review's own lazy module has a caught error/reload fallback inside the existing drawer, so a failed entry chunk does not crash the app.

## Worker and reconstruction boundaries

`src/workers/protocol.ts` carries typed request IDs, epochs, worker-instance IDs, version snapshots, budgets, categories, progress/result/failure/cancellation shapes and runtime request/failure validation. `generation.worker.ts` and `client.ts` create a real module worker, validate version/instance data and expose the cancellation/probe boundary. The worker has no generators or tables and never emits successful generation. The client refuses success adoption. `matchesPending` is a metadata guard only, not semantic result verification. Watchdogs, bounded search, optimality proof checking and success adoption belong to later work.

`src/reconstruction/interchange.ts` validates synthetic `reconstruction-v1` artifacts against the shared engine. It checks initial state against the required scramble, physical frame, move/gap events, timing uncertainty, confidence fields and manual correction/revision links. It retains removed events and supersession links. Trusted final-state/solved claims are recomputed. A gap makes downstream state inference indeterminate.

The fixture in `src/reconstruction/fixtures/synthetic-v1.json` is deliberately synthetic and has no video source. Tests cover replay, stale validation replacement, retained manual edits, timing, initial-state mismatch and gaps. Exact-sequence recognition stays `unchecked`; no independent ground-truth matcher, persistence, video input or video recognition is delivered.

## Changed paths

- Dependencies: `package.json`, `pnpm-lock.yaml`.
- Application: `src/app/App.tsx`, `src/app/MoveReview.tsx`, `src/app/styles.css`.
- Cube contract/adapters: `src/cube/engine.ts`, `geometry.ts`, `initialize.ts`, `notation.ts`, `player.ts`, `validation.ts`, `version.ts`.
- PWA/build: `src/pwa/client.ts`, `src/pwa/manifest.ts`, `vite.config.ts`.
- Shared records: `src/store/records.ts`, `src/store/validation.ts`. The latter only exposes the existing goal-options decoder for the worker protocol; the trainer-backup semantic gate remains intact.
- Worker: `src/workers/protocol.ts`, `generation.worker.ts`, `client.ts`.
- Interchange: `src/reconstruction/interchange.ts`, `src/reconstruction/fixtures/synthetic-v1.json`.
- Tests: `tests/unit/cube.test.ts`, `interchange.test.ts`, `pwa.test.ts`; `tests/browser/review.spec.ts`, `foundation.spec.ts`, `update-contract.spec.ts`.
- Test/evidence helpers: `tests/helpers/browser-server.mjs`, `bundle-evidence.mjs`, `cube-geometry.ts`, `freeze-slots.ts`; `tests/fixtures/slot-permutations.json`.
- Local source/notices: `public/licenses/cubing-0.63.8-source.tgz`, `cubing-MPL-2.0.md`, `THIRD-PARTY-NOTICES.txt`, `three-MIT.txt`, `stats-MIT.txt`, `lazy-promise-MIT.txt`, `lazy-promise-0.1.1.ts.txt`, `foundation-MIT.txt`, `scheduler-MIT.txt`, `idb-ISC.txt`.
- Documentation/evidence: `README.md`, `docs/features/Trainer_Foundation.md`, `docs/architecture/Cube_Tools_Decision.md`, this audit, `cube-bundle-evidence.json`, `cube-runtime-evidence.json`.

Ignored `test-results` contains local debug/measurement files, not deliverable application code. No task-board status was promoted by this worker.

## Focused review correction

The read-only review found two confirmed blockers after the original 57-unit/16-browser-test handoff. This follow-up changed only `src/cube/notation.ts`, `src/cube/player.ts`, `src/app/MoveReview.tsx`, `tests/unit/cube.test.ts`, `tests/browser/review.spec.ts` and this audit's two evidence JSON files and text. No architecture, tooling or dependency changes were made. No Git mutations, task-board edits or master-plan edits were made.

The old preflight counted expanded leaves, so an empty commutator tree could have size zero while its traversal doubled at each level. The exact regression starts with `()` and wraps it as `[previous,]` 31 times. It is only 95 bytes and stays within depth 32. The fix counts an Alg entry even when empty, each node visit and repeated/grouped/commutator/conjugate operand visits before expansion. The 1,000,000-visit cap is separate from the unchanged text/depth/move limits. A depth-32 grouping of one move repeated 10,000 times costs 640,002 counted visits and still passes.

The new negative test replaces the vendor expansion entry with a throwing spy. It proves zero calls for the exact empty-commutator repro, its conjugate counterpart, a repeated mixed move/empty-container payload and a dangerous empty conjugator with a nonempty body. That keeps the regression safe even if the guard later breaks. A positive test retains basic empty notation and linear depth-32 empty conjugates. The existing move-boundary test now exercises depth 32 and 10,000 moves in the same input.

The initialization defect had two windows. The component captured a step before the module loaded, and navigation then skipped the player until it became ready. Initialization later published that captured step. The component now reads the current step at module resolution and sends navigation to an existing initializing player. The player suppresses pending initial notifications, tracks navigation revisions, and repeats its actual snapshot read if navigation changed during an await. Post-ready notifications also check the navigation revision.

The real-browser regression holds the emitted player-module request, navigates to step 1, then releases it. It holds the real player's screenshot initialization promise through a test-only instance override, with no production hook or substituted pattern/renderer. While `instance.ready` is pending it navigates forward/back/forward to step 2. After releasing readiness, both logical and actual player states remain at step 2. Subsequent real forward/back steps agree with independent Cartesian R/U/F states. Text navigation stays enabled throughout. The forced 3D-error test also verifies forward/back remain usable and produce the independent R/U states while the error is visible.

One combined lint/typecheck/browser command hit its 120-second tool deadline before browser results appeared. The standalone typecheck and focused browser pair then passed, with no code change. The cause of that stalled combined command was not established.

All new and existing tests passed. Final emitted bytes and the never-opened cold-offline run were regenerated after the full suite because the cross-tab update test rebuilds a release. Both evidence JSON files now describe the final recorded artifact. A final read-only comparison rechecked all 36 asset lengths/hashes against `dist` and confirmed every retained runtime asset URL belongs to that release. No confirmed blocker remains from this focused correction; the unrun device/memory checks below are unchanged.

## Parent verification and acceptance

The independent read-only review found two blocking defects: exponential traversal through nested empty notation, and delayed player initialization resetting text navigation. The implementer corrected both and added focused regressions. The parent inspected those changes and verified the final tree with frozen-lockfile installation, lint, strict typecheck, 59 unit tests, production build, all 17 Chrome browser tests and bundle/source inspection. All passed. Staged whitespace checks passed for project-authored files. The verbatim upstream MPL text retains its original Markdown hard-break/trailing spaces and is excluded from that formatting check. The original reviewer verdict was FAIL; the corrected implementation is accepted on the parent's source checks and actual regression/full-suite results, not a claimed second independent PASS.

A sandboxed development-browser probe timed out. The standalone `node .pi/takomi/b02/dev-check.mjs` rerun used Node/Vite and installed Chrome, initialized the actual development renderer and verified forward-step agreement with no page errors. The parent inspected its real cube and phone-viewport screenshots. They are ignored local QA artifacts, not another visual proposal or physical-device evidence.

## Remaining gaps

- Physical iOS Safari, Android Chrome and real pinch/pointer capture are untested. Chrome touch emulation is not a device result.
- OS-installed PWA restart is untested. A disconnected fresh-page navigation proves browser offline first use, not an OS lifecycle result.
- Screen-reader/manual accessibility, low-end hardware, GPU memory, long-session memory retention and real storage-pressure eviction still need device checks. Browser tests cover the listed failure simulations only.
- TwistyPlayer puzzle-object/model APIs are experimental. The exact package pin, source-backed material/count guard, state-agreement checks and fallback reduce upgrade risk, but do not remove it.
- The optional solver GPL notices require a new rights review before any solver path is bundled. Dataset rights and correctness remain unverified because none was selected.
- No trainer, timer, generated challenge, optimality table, complete nonempty trainer-backup validator, case catalog, statistics or video recognition is claimed. Worker and reconstruction work stops at the explicitly tested integration boundaries.
