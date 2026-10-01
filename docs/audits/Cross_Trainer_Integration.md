# Cross trainer integration

B04 implementation, starting from the accepted B03 contracts at `dd93527`. PLAN 4.1 controls behavior. `docs/features/Cross_Trainer.md` was written before the flow changes. No dependency upgrades, deployment, Git mutation, branch/task/board/master-plan edits or other trainer families were added. Q01 remains the acceptance gate.

## Delivered loop

Start Cross practice creates/selects a real Cross session, generates a verified challenge and presents it only when visible, idle, outside a dialog/update lock and past the timer stop guard. Settings expose maximum depth 1 through 8, all six colors, untimed/15-second inspection and audible warnings. Maximum depth is a ceiling, not exact depth. Only Cross is enabled. Entered-move review and unavailable other-trainer views remain.

A solved, aligned Cross is the required physical base. Fully solved also works. The scramble randomizes a legal state with 16 outer turns, restores its Cross, then applies a sampled solved-Cross-to-target path. Since only the four labeled edges determine that target, the same scramble maps every Cross-solved base to it. Other pieces in review are representative unless the user's base was fully solved. Stop is self-reported completion, not camera/smart-cube observation. These are not uniform competition scrambles or full-cube optimal solutions.

The target-to-solved reveal is found separately from the actual final coordinate. Challenge validation checks legal full state, canonical centers, scramble equality, exact table distance, depth 1..K, optimal solution length and the final Cross goal. Review uses the saved challenge/frame, not current color settings.

One TimerController survives successive presentations. TimerPractice commits its immutable snapshot in a layout effect after the real DOM commit. The existing 300 ms hold/release, separate first inspection action, 8/12 warnings, unrounded 15/17 penalties, preparation/execution/inspection separation, interruption, stop guard, save retry and emergency export remain. Deferred generation never counts as preparation. A commit-time rejection removes the timer and offers an honest retry instead of leaving a permanently rejected mount.

Saved cards reconcile with repository records after history edits, deletion and undo. Deleted records do not retain a Saved card or Review button. History stays mounted but hidden across dialog closure, preserving latest Undo. Confirmed restore invalidates the previous presentation and requires a fresh Start. Primary results use effective time/DNF/interruption; raw execution is separately labeled.

## Table, metric and cache identity

- Coordinate is four labeled D edges, each with one of 12 locations and two orientations, with distinct locations. Reachable count is 190,080.
- Search uses only 18 outer turns in HTM. Half turns count once. No rotations/wides/slices enter the Cross proof metric.
- Identity is `cross-four-labeled-edges-v1-HTM18-frame-v1`, contract 1, `cubing@0.63.8`, dataset null.
- Trusted table SHA-256 is `28cf7e33c5fbe83584dfaf30afbe633141e76df91c14ea647f81f3fb802c853a`.
- Cache metadata pins engine, contract, table, HTM18, frame-v1, byte length and checksum. Actual bytes are hashed against the trusted constant, not merely a checksum supplied by the cache.

Coordinates initialize in 24 yielded batches. Breadth-first table construction processes at most 1,024 dequeued coordinates per batch, then yields/checks cancellation and deadline. Target sampling yields every 8,192 scanned coordinates. All table construction, generation and semantic validation run in a module worker. The main thread uses shared static frame-v1 maps without initializing a Cross model. Existing model/player initialization for review remains the approved cubing path.

Generation has a 5-second search deadline and a 200,000-node allowance. Initialization/validation RPC watchdogs terminate an unresponsive worker; cancelled/stale replies cannot be adopted. Metadata checks cover worker instance, request ID, epoch, versions, options and full frame. App also checks current session/settings against the repository before presentation, then checks current UI session/epoch and the still-current worker instance while waiting for adoption. Settings/session/restore changes cancel/invalidate outstanding jobs. No cap is silently reduced.

The solver cache remains in `cube-trainer-solver`, separate from personal history. Missing/corrupt/incompatible entries rebuild only solver data. Cache-only readiness fails rather than quietly rebuilding. Setup may rebuild from cached code while disconnected. A cache write failure permits memory-only generation but cannot claim complete offline readiness.

## Independent proof

`tests/unit/cross.test.ts` uses the independent integer Cartesian sticker helper in `tests/helpers/cube-geometry.ts`, not cubing or production orbit transforms, to establish every oriented-edge transition. It constructs a separate reference graph in packed Cartesian coordinates and independently breadth-first labels that graph.

For all 190,080 production coordinates it checks bijection, all 18 transitions, equality with independent reference distance, every Bellman edge inequality, a descending neighbor for every non-goal and exactly one zero-distance goal. Independently projected reference bytes hash to the trusted constant. Expected distances are not generated by the production BFS.

Distance distribution for depths 0 through 8 is `1, 15, 158, 1394, 9809, 46381, 97254, 34966, 102`. The sum is 190,080. Diameter is 8.

Full-state generation checks cover 144 deterministic samples across all six colors and every ceiling 1..8. Cartesian replay checks actual scramble/state equality, exact reference distance, solution length and final Cross. Corner permutations vary across more than 100 samples. A separate non-solved full-cube base with solved Cross reaches the same target projection. Existing independent six-frame/proper-rotation and actual player-color tests still pass.

Client fixtures test stale request ID/epoch/versions/options/frame, wrong instance, cancellation/late reply, dead-worker watchdog and crash without cap changes. They are explicit test-only worker mocks, not production solver evidence.

## Semantic storage gate

The Cross-only validator facade exists before App's one-shot Repository construction. Its heavy work runs in the worker. Repository save/read/edit/delete/undo and backup/restore retain the B01 semantic gate and transactional/revision checks.

The validator checks all Cross challenge, timing, settings-snapshot and attempt fields, dates/durations, supported engine/table/frame/metric, full legality, scramble equality, exact distance and optimal reveal. Unsupported combined/case/run/review/algorithm/set fields or nonempty future record groups fail closed. Settings/sessions retain their existing runtime decoders and reference checks.

Rounded inspection values preserve boundary ambiguity. Saved 15,000 ms can correctly have no penalty or +2; saved 17,000 ms can correctly have +2 or DNF. These are rounded storage fields, not a reason to reinterpret the unrounded release decision. Away from those boundaries, automatic penalties must agree with duration. Explicit manual corrections, including removing a penalty, retain source `manual`; raw timing is unchanged. History labels that correction. Removing an automatic late penalty therefore no longer masquerades as an automatic no-penalty decision or fails semantic validation.

Real attempts survive reload, export and confirmed transactional restore. Stale previews, rollback/quota failures and unsupported file retention remain tested. Unsaved emergency files remain a separate envelope, not normal backups.

## Offline and browser evidence

The release manifest scope is now `cross-practice`, with actual table identity/readiness and all emitted Cross/model/player/worker dependencies. Initial setup builds/verifies the table before the control reload. It never opens a renderer to warm review.

New installed-Chrome production flows prove:

1. Fresh context setup without opening a player.
2. Closing the online page, disconnecting and cold navigation to a new route.
3. Real Cross generation, focused desktop Space timing, touch-emulated timing at a 390×844 mobile viewport, acknowledged save/history/mobile shelf and exported backup.
4. Post-attempt never-opened 3D review matching independent Cartesian start/final states.
5. Penalty edit/deletion/Undo result reconciliation and confirmed restore followed by fresh practice.
6. Cancel/settings epochs, dialog-deferred presentation, physical frame instructions and timer fit at 320/390/1440 widths.
7. Corrupt and absent Cross table cache failure, disconnected repair and retained real attempt.
8. A real Cross execution blocking another tab's update, followed by acknowledged save, safe activation/reload and retained history.

The full existing foundation/player/timer/update suite remains meaningful. No timer/cube assertions were removed. The PWA manifest fixture was updated for the delivered Cross identity; one history assertion now requires explicit manual-source metadata when removing a penalty.

## Measurements

Final retained sample is `review-1790811323526`, installed Chrome 154.0.8037.59, Windows `win32`, Node 24.16.0, headless localhost production preview. `tests/helpers/cross-benchmark.mjs` records the raw samples and final asset hashes/lengths in `docs/audits/cross-runtime-evidence.json`. It separately opens the real Node/Vite development app and verifies Cross worker generation, timer/save and actual 3D forward-state agreement with no page errors.

| Observation | Final sample |
| --- | ---: |
| Cold worker initialization including load, table build and cache write | 3,593.4 ms |
| Warm cache verification/reinitialization | 228.4 ms |
| Warm generation p50 / p95, 32 requests cycling K1..8 | 106.0 / 135.3 ms |
| Largest main-thread 16 ms interval during worker work | 50.6 ms |
| Raw table/cache byte payload | 190,080 bytes |
| Live coordinate/distance/transition typed arrays | 2,277,936 bytes |
| Temporary BFS queue, additional during construction | 760,320 bytes |
| Sampled worker V8 heap maximum | 2,717,208 bytes |
| Sampled worker backing-storage maximum | 4,829,831 bytes |
| Sampled paired heap + backing-storage maximum | 7,546,463 bytes |
| Sampled main-thread V8 heap maximum | 2,875,432 bytes |
| Manifest asset count | 39 |
| All required assets raw / gzip / Brotli | 8,721,027 / 7,498,029 / 7,428,995 bytes |
| JavaScript raw / gzip / Brotli | 1,622,018 / 428,819 / 363,902 bytes |

Percentiles use nearest rank. Cold initialization is not total PWA download/setup time. Warm generation is worker RPC round-trip with full generation validation, not the later UI presentation/save/review loop. Memory uses CDP Runtime.getHeapUsage with 50 ms sampling and a final snapshot, 128 worker samples. Backing storage is reported separately because typed-array bytes are not all in the V8 object heap. The paired maximum is one observed snapshot, not the sum of independent maxima.

These are samples, not enforced device budgets or true peak process/GPU memory. IndexedDB physical disk/quota overhead, cache filesystem overhead, forced-GC retained memory, renderer peak, thermal/battery and long-session leakage were not measured. The 190,080-byte cache number is the actual ArrayBuffer payload, not total database storage. Compressed sizes are summed Node zlib measurements per asset, not network-transfer guarantees. The retained source archive is already compressed and dominates offline size.

Earlier samples varied: cold initialization ranged about 1.16 to 3.59 seconds; one run had warm p50/p95 about 297/302 ms. Its maximum UI interval was 32.3 ms; another observed interval was 50.8 ms. The cause was not isolated. The final sample above is retained rather than claiming a stable mobile percentile. No physical-mobile claim is made.

## Commands and results

All package commands used pnpm 10.33.2, confirmed with `pnpm --version`.

- Focused independent Cross/model/timer/storage/PWA runs passed. After client/history integration, a focused six-file run passed 80 tests.
- `pnpm test`: 103 tests in nine files passed. This includes existing cube, timer, history, statistics, storage, reconstruction and PWA regressions.
- `pnpm lint`: passed, including the benchmark/test helpers.
- `pnpm typecheck`: passed for application/tests and service worker.
- `pnpm build`: passed. No test-only fixture/harness sentinel is emitted in application JS; benchmark also verifies all 39 final manifest asset lengths/hashes.
- Earlier implementation `pnpm test:browser`: all 31 installed-Chrome tests passed in 3.0 minutes. The parent acceptance rerun and final follow-up appear below.
- Final focused `pnpm exec playwright test tests/browser/cross.spec.ts tests/browser/cross-update.spec.ts --reporter=list`: all four passed after adding the post-repository-read epoch guard.
- Final `pnpm exec playwright test tests/browser/cross.spec.ts --reporter=list`: all three passed after isolating saved-record refresh from settings drafts. The later mobile-viewport/deleted-status fit assertions also passed all three, plus an isolated cold-offline loop rerun.
- Final `node tests/helpers/cross-benchmark.mjs`: production measurements and Node/Vite development worker/timer/save/player checks passed with no page errors.

The earlier 31-browser run preceded the final post-read epoch guard, saved-record refresh isolation and compact deleted-status sizing. The guard received lint/typecheck/build and all four Cross production-flow tests. The later UI changes received lint/typecheck/build, all three Cross flows and production/development benchmark checks. Solver/storage unit source did not change after the 103-test run.

### Parent acceptance follow-up

The parent reran lint, typecheck, all 103 unit tests and build successfully. Its browser run passed 30 of 31. `cross-update.spec.ts` reached the unchanged 45-second test deadline at the final retained-history assertion. The reload snapshot briefly showed No session yet and zero attempts. That snapshot alone did not prove data loss.

The parent's trace showed the Tap-to-stop expectation ending at 67,281 ms and the next action at 103,055 ms. The synchronous `pnpm build` between them consumed 35,774 ms of the test budget. The final retention assertion started at 105,433 ms; the test ended at 106,723 ms. Only 1,290 ms remained for its normal five-second assertion allowance.

The fix changes only the update test. A worker-scoped fixture now builds a real alternate release with pnpm into a unique, ignored `test-results/cross-update-release-*` directory. Fixture setup has a separate 120-second limit; the build subprocess has a 110-second limit. The fixture checks the generated release identity. During the live Cross execution, the test copies that complete artifact into preview-served `dist` before checking for an update. Old assets remain available. The waiting service worker downloads and activates the actual new release. No service worker, acknowledgement or personal record is fabricated.

The 45-second test timeout, existing assertion allowances, update-blocking assertion, acknowledged save, both-tab readiness, retained history and fresh Start assertion are unchanged. No application code, global timeout, dependency, Git, task or board changed in this follow-up.

| Run | Alternate build outside test budget | Publication during execution | Cross update test | Overall result |
| --- | ---: | ---: | ---: | --- |
| Isolated Cross update | 10,694 ms | 126 ms | 8.6 s | 1 passed, 29.6 s total |
| Final full browser suite | 17,247 ms | 441 ms | 10.6 s | 31 passed, 4.1 min total |

`pnpm lint` and `pnpm typecheck` passed after the fixture change. `pnpm exec playwright test tests/browser/cross-update.spec.ts --reporter=list` passed. The final `pnpm test:browser` passed all 31 against the final source in Chrome 154.0.8037.59 on Windows. `test-results/.last-run.json` reports `passed` with no failed tests. History retention completed with the normal assertion budget; no application retention defect was confirmed.

An intervening full-suite command reached its 300-second tool deadline after printing 30 passing tests. It did not produce a completed result and is not counted as a pass. The unchanged full suite then completed with a 600-second tool allowance. No Playwright timeout changed. The retained Cross performance sample above predates this test-only fixture change; no new performance claim follows from these update-test timings.

## Failures found and corrected

- Initial table hash was deliberately unpinned until the independent graph/reference-byte proof ran. The first proof/cache tests failed on that placeholder. After the independent match, the checksum was pinned and the tests passed.
- Strict TypeScript rejected unchecked indexed access in the coordinate/reference loops. Values now narrow through checked bounds, with no broad casts or non-null assertions.
- The first setup returned before table initialization when no controlling worker existed. Reload correctly failed readiness. Initialization now completes before requesting that reload; unchanged foundation offline checks pass.
- Initial browser test selectors used wrong native label/button names. Correct selectors now exercise the real controls; no production assertion was weakened.
- Closing the history drawer unmounted its latest Undo token. The component now remains mounted/hidden and refreshes on reopening. Delete/close/reopen/Undo is tested.
- A development check waited for visible sticker output inside a closed details element. It now waits for attachment and actual state agreement; the real renderer was already initialized.
- One final combined lint/typecheck/three-browser command reached its 90-second tool deadline after printing the test-start header, without an assertion result. Ports were released afterward. The unchanged isolated offline loop passed in 40.0 seconds including startup, then all three passed in 57.4 seconds. No test timeout/assertion was changed; the stalled run's cause was not isolated. A later combined build/browser/benchmark command also reached its tool deadline after all three browser tests had passed. The standalone unchanged benchmark then passed and supplies the final retained measurements.
- Final source review removed an unused reverse-code typed array and added an epoch check after asynchronous repository validation, avoiding cancelled jobs overwriting progress text. Saved-record refresh now updates repository data without resetting settings drafts that a user may have opened after save acknowledgement. The new Removed primary status uses the existing compact clock sizing, with a 320-pixel no-clipping regression.

## Changed paths

Created `src/cross/table.ts`, `cache.ts`, `generate.ts`, `validation.ts`, `protocol.ts`, `cross.worker.ts`, `client.ts`; `src/cube/frame.ts`; `src/app/CrossPractice.tsx`; `tests/unit/cross.test.ts`, `cross-client.test.ts`; `tests/browser/cross.spec.ts`, `cross-update.spec.ts`; `tests/helpers/cross-benchmark.mjs`; `docs/features/Cross_Trainer.md`; this audit and `docs/audits/cross-runtime-evidence.json`.

Modified `src/app/App.tsx`, `TimerPractice.tsx`, `AttemptHistory.tsx`, `MoveReview.tsx`, `styles.css`; `src/cube/engine.ts`, `version.ts`; `src/store/repository.ts`, `validation.ts`; `src/pwa/client.ts`, `manifest.ts`; `vite.config.ts`; `tests/unit/pwa.test.ts`, `history.test.ts`; `README.md`; `docs/features/Trainer_Foundation.md`.

The existing generation scaffold/protocol and entered-move tool remain compatible. No cubing search/scramble or optional GPL solver paths are imported. No package/lockfile change.

## Remaining limits and handoff

No confirmed blocking defect remains from this implementation pass and focused source review. FR-006 and shared FR-001 through FR-005/FR-013 have working tested desktop coverage. Physical iPhone Safari, Android Chrome, Firefox, desktop Safari, assistive technology, actual audio audibility, OS-installed PWA restart, real storage eviction/pressure and abrupt OS kill remain unrun. Chrome touch emulation is not physical-phone evidence.

The worker is deliberately serialized, without speculative background pre-generation. Very large backups use the existing bounded file/record limits but have not been benchmarked on phones. Emergency unsaved-file import remains undelivered, as in B03. Other trainers/case data/manual attempts/full-cube solving are outside this increment.

The parent inspected the final fixture and independently reran lint, typecheck, the isolated Cross update test and `git diff --check`; all passed. That run prepared the alternate release in 24,120 ms and published it in 139 ms. Its unchanged saved-history assertion passed after the actual reload. The implementer's completed 31-test full-suite result is recorded above, not relabeled as a parent full-suite run. The parent's 103-unit-test pass precedes this test-only fixture change; application source did not change during the repair.

Q01 returned PASS with no confirmed blocker. Its actual read-only checks, two combined-run timeout failures followed by unchanged isolated passes, and manual-device limits are in `docs/audits/Q01_First_Usable_Increment.md`. Parent accepts this first Cross checkpoint and owns the scoped local Git/task handoff. Stop for the owner's hands-on review; do not launch Cross+1 automatically.
