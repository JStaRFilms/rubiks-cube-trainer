# Cross+1 integration

B06 PASS for the accepted provisional desktop/touch-emulated range. Q02 is the next permitted review, not authorization for another trainer. Starting HEAD was `716fec5`. Parent-owned orchestration edits were present and remain untouched by this implementation. No branch, commit, push, dependency, dataset, deployment or external-service changes were made.

## Delivered loop

App enables Cross+1 with initial K3/L8 and any pair, plus K1..8, L1..12 and FR/FL/BR/BL settings. Construction gets 5,000 ms and 10,000 charged nodes after separately bounded model initialization. It uses the accepted B05 implementation unchanged. K and L remain requested ceilings; actual depth and found length can be smaller. Exhaustion never returns an easier challenge.

Before each scramble, the user confirms a fully solved physical cube and the displayed down/front frame. Next returns to reset/confirmation. Cross-only retains its solved, aligned Cross base. Any-pair practice does not render the witness, solved slots or player in visible/accessibility output before stopping. Results and review name a found solution and generator solved slots, not a global optimum. The executed pair is explicitly not recorded. No manual/demo attempts or physical-move observations were added.

CrossPractice reuses one TimerController lifecycle and the existing TimerPractice, History, MoveReview, player and styles. Preparation starts after DOM commit. Background Space, native controls, dialogs, player isolation, pointer feedback, 300 ms arming, separate first inspection action, unrounded 15/17-second penalties, interruptions, the stop guard, acknowledged saves and exact retry/export remain. Saved result cards follow actual edit/delete/Undo/restore history.

One real trainerValidator facade exists before App constructs its Repository. Cross and Cross+1 use their full semantic worker validators and a shared strict timing decoder. Cross+1 attempt validation has a separate worker from generation, so cancelling generation cannot cancel a history write. Backup batches serialize validation RPCs. Legal state/scramble equality, frame, versions, K/L, actual independent Cross depth, simultaneous final goal, witness/slot metadata, exact fields, timings and dates are checked. Cross+2/case attempts and nonempty algorithms/sets/runs remain rejected. Database and backup versions stay 1; repository transaction, revision and reference logic is unchanged.

Generation checks request/options/frame/version/worker correspondence and revalidates the full challenge in the cancellable generation worker. Adoption checks settings/session/restore epoch, visibility, dialogs, update locks and timer eligibility, then repeats checks after repository reads. Pending generation is suspended before player/timing work. Deliberate suspension happens after accepting a verified snapshot, with no subsequent worker-ID invalidation of that snapshot. There is no next-challenge queue.

Offline setup verifies all emitted assets and initializes the actual Cross+1 model and memory-only pair tables even when that trainer has never been opened. Ready names both trainers. The disposable solver database still stores only the separately checksummed 190,080-byte Cross payload. Cache-only checks cannot rebuild it; disconnected repair works only while executable assets remain cached. Update activation still requires the all-tab idle handshake.

## Changed paths

Application and contracts:

- `src/app/App.tsx`, `CrossPractice.tsx`, `TimerPractice.tsx`, `AttemptHistory.tsx`, `MoveReview.tsx`, `styles.css`.
- `src/cross-one/client.ts`, `one.worker.ts`, `protocol.ts`, `validation.ts`.
- `src/cross/validation.ts`, sharing the existing timing semantics rather than duplicating them.
- New `src/store/attempt-timing.ts` and `trainer-validator.ts`; `src/store/records.ts` and `validation.ts`.
- `src/cube/version.ts`, `src/pwa/client.ts`, `manifest.ts`, `vite.config.ts`.

Verification and documentation:

- New `tests/unit/cross-one-storage.test.ts`, `tests/browser/cross-one.spec.ts`, `tests/helpers/cross-one-smoke.mjs` and `update-release.ts`.
- `tests/unit/pwa.test.ts`, `tests/browser/cross-update.spec.ts`, `foundation.spec.ts`, `tests/helpers/bundle-evidence.mjs`.
- `docs/features/Cross_One_Trainer.md`, updated before significant integration, then aligned with the implemented flow.
- This audit and `docs/audits/cross-one-integration-assets.json`. B05 runtime evidence was not overwritten.

The shared update fixture prepares a fresh real alternate release before the timed browser exercise. Its independent 120-second preparation timeout does not change the 45-second browser-test limit. Each exercise gets distinct emitted bytes; publication is a local copy into ignored dist.

## Commands and final results

Windows, Node 24.16.0, pnpm 10.33.2, installed headless Chrome 154.0.8037.59. Touch checks use Chrome/CDP emulation, not a physical phone. Browser runs use the actual optimized App and real workers; test fault injection does not replace successful generation with mock challenges.

| Command | Actual result |
| --- | --- |
| `pnpm exec vitest run tests/unit/cross-one-client.test.ts tests/unit/timer.test.ts tests/unit/history.test.ts tests/unit/pwa.test.ts tests/unit/cross-client.test.ts` | 55 passed. |
| `pnpm exec vitest run tests/unit/cross-one-storage.test.ts` | Initially 22 passed. |
| `pnpm exec vitest run tests/unit/cross-one-storage.test.ts tests/unit/storage.test.ts` | 43 passed after adding four real Cross+1 controller boundary tests. |
| `pnpm lint` | Final pass. |
| `pnpm typecheck` | Final application/tests and service-worker pass. |
| `pnpm test` | Final 152 passed in 12 files, 71.55 seconds. |
| `pnpm build` | Passed repeatedly, including the build before the final browser run. Final asset inspection rebuilt successfully after update tests. |
| `pnpm exec playwright test tests/browser/cross-one.spec.ts --grep 'confirmed restore' --reporter=list` | One passed after fixing the confirmed settings race. |
| `pnpm test:browser --reporter=list` | Final 37 passed in 3.9 minutes. All 32 baseline browser cases remain and pass, plus five Cross+1 cases. |
| `node tests/helpers/cross-one-smoke.mjs` | Final pass. 30 real Node challenges independently replayed across six colors and any/all four targets. Actual Vite development App any/BR generation, background Space, acknowledged saves and 3D final goals passed. |
| `node tests/helpers/bundle-evidence.mjs docs/audits/cross-one-integration-assets.json` | Passed final production rebuild, 41 asset hash/length checks, emitted dependency coverage and four artifact/source matches. No source-rights conflicts. |
| Read-only manifest inspection through `node -e` | Scope, Cross+1 initialization task, worker hashes/lengths and absence of harness/benchmark/fixture/smoke assets confirmed. |
| `git diff --check` | Passed. Windows line-ending warnings only. No Git mutation. |

The full unit run includes the unchanged independent B05 Cartesian Cross graph, pair lower-bound transitions, full legal scramble/witness replay, six-color/slot/cap fixtures, already-complete rejection and cancellation/deadline tests. Synthetic OneClient replies test only correspondence/error handling, not solver correctness.

The new storage tests use actual generated legal challenges. They reject forged states, frames, versions, K/L, witnesses, slots, dates, timing, unsupported fields and Cross+2 records/backups. They preserve frozen input through real repository save/restore, reject unsupported record groups, verify comparison scopes and exercise unrounded releases at 14,999.6, 15,000, 16,999.6 and 17,000 ms with immutable Cross+1 options/settings.

The five production Cross+1 browser cases cover:

1. Fresh setup without opening Cross+1 or 3D, closing the online page, cold disconnected navigation, any-pair background Space save, independent witness replay, never-opened 3D, edit/delete/Undo, confirmed restore, targeted BL/red-frame touch save and mandatory Next reset. No failed offline requests.
2. Cancellation, changed configuration, verified-result dialog deferral and player-triggered suspension.
3. Actual worker node exhaustion with unchanged K1/L12/BR, then real successful generation. A one-shot browser IndexedDB quota fault retains the exact stopped record for emergency export and acknowledged retry.
4. Confirmed restore while a verified challenge waits behind a dialog, followed by cross-tab settings rejection at adoption. No stale timer mounts; history remains.
5. Real Cross+1 execution blocking another tab's update; acknowledged stop/save permits activation and retained Cross+1 history.

The baseline native-input, no-click Space, strict inspection, pointer cancellation/selection, reduced-motion/player, cache-repair, storage/restore, Cross generation and update-handshake tests remain meaningful and passed unchanged apart from real update-release preparation.

## Failures encountered

No assertion or browser deadline was weakened.

- Initial typecheck found a missing JSX brace and a test alias that lost proof narrowing. Fixed. Lint found an unused loop variable in a new test. Fixed.
- The first focused four-case browser command reached its outer 240-second limit after three tests timed out on an exact implicit-label selector. The controls were present; the fixture now selects their actual combobox roles and names.
- The next focused run passed three of four. The remaining fixture expected red down/white front, but frame-v1 requires red down/green front. The test now checks the correct frame.
- The first complete browser run passed 34 of 36. One new fixture assumed random-ID IndexedDB records were chronological. It now identifies the second real attempt by its distinct ID. Another reused the same prepared release after a preceding update exercise, so no update existed. Distinct release preparation now runs per exercise outside its browser clock.
- A later 37-case command was terminated by its outer 600-second command limit after 20 reported cases. Its new cross-tab test had also caught a real Settings race: opening Settings during the trainer-selection write allowed the subsequent refresh to replace the draft K. App now refuses panel opening while busy and disables Settings/Help until that write/refresh finishes. The focused stale/restore test passed, then the complete unchanged 37-case run passed.
- The first Node/Vite smoke independently passed all 30 Node challenges but inspected a transient player step before it reached the end. The final script computes the independently replayed expected final state and waits for the exact final step, logical state and player state. It passed with stricter end-state assertions.

The interrupted commands remain failures in this ledger, not fabricated passes or hidden evidence. The final successful runs above replace them for the delivered snapshot.

## Final assets and source evidence

The retained asset report describes release `review-1790891585827`, scope `cross-cross1-practice`, the combined policy version and the Cross+1 initialization task. All 41 listed files match their SHA-256 and byte length. Required emitted worker/model/player files are present, and every emitted asset is included. The prototype and test helpers are not production entries.

- Total required files: 8,892,325 raw bytes, 7,549,985 summed gzip bytes, 7,474,508 summed Brotli bytes.
- Excluding the covered source archive: 1,839,606 raw / 496,177 gzip / 421,765 Brotli bytes.
- Executable assets: 1,793,141 raw / 480,752 gzip / 409,383 Brotli bytes.
- Cross+1 worker: 88,597 bytes, SHA-256 `4df96aee139dfdf4e96f3ff29b1f4eb279adf8faf508e8c1c2fdc0e8e69a1113`.
- Cross worker: 83,692 bytes, SHA-256 `9bac4ea32738236285267a2d6318574fc3b024d297a1caeb6cf260bb758734b5`.
- Persistent Cross cache remains 190,080 bytes with pinned SHA-256 `28cf7e33c5fbe83584dfaf30afbe633141e76df91c14ea647f81f3fb802c853a`. Pair arrays remain memory-only.

The bundle helper matched covered source-archive bytes against pinned cubing artifact source maps for `parseAlg.ts`, `Alg.ts`, `3x3x3.kpuzzle.json.ts` and `Cube3D.ts`. It found no reachable cubing search/scramble or excluded-vendor sources in inspected artifact modules. The integration adds no external solver/renderer. The exact source hashes and module/dependency evidence are retained in the asset report. Compression sums are file-by-file measurements, not promised network-transfer size or browser storage quota cost.

## Runtime observations and limits

B05's optimized standalone Chrome prototype generation percentiles remain the accepted range evidence. B06 does not replace them with UI automation or synthetic-client timings. No new production Cross+1 cold/warm solver percentile, responsiveness benchmark or worker/process/GPU peak is claimed.

The final real Node/Vite smoke observed 3,254.4 ms for model/Cross/pair initialization and 31.8..199.5 ms for its 30 Node construction requests. Live typed-array payload was 2,301,408 bytes. One end-of-loop whole Node/Vite SSR process sample was RSS 221,364,224, heap used 82,681,224 and ArrayBuffers 2,742,285 bytes. These are smoke observations, not isolated solver memory, optimized production latency, percentiles or peaks.

The existing production review test printed one cold offline shell observation of 1,089 ms, cold player 646 ms and warm player retry 262 ms. Its main-page CDP heap observations were 5,130,244 bytes before renderer initialization and 10,011,264 afterward. These belong to that entered-move review exercise, not Cross+1 generation or total app/worker/GPU memory. No long-session responsiveness, retained-memory or physical-mobile benchmark was added.

Physical iPhone Safari/Android Chrome, Firefox/desktop Safari, OS-installed PWA restart, assistive technology, audible-output quality, physical-cube ergonomics/completion, true process/GPU peaks, battery/thermal behavior and long-session leaks remain unrun. Chrome touchscreen emulation and independent logical replay do not certify those conditions. Successful physical execution is still the user's report.

## Handoff

FR-007's any/target witnessed-cap loop is integrated with FR-001/002/003/004/005 offline/player/timing/history/backup behavior. No confirmed blocking defect remains from the implementation and focused self-check. Parent independently reran lint, strict typecheck, all 152 unit tests, build, the complete 37-test installed-Chrome suite, a final rebuild after update tests and project whitespace checks. All passed against this snapshot. These are parent runs, separate from the implementer ledger above. Q02 independently returned PASS with no confirmed blocker. Its actual source/60-unit/9-browser/41-asset checks and manual limits are in `docs/audits/Q02_Cross_One_Acceptance.md`. Parent owns task-state and Git integration. No next trainer, research, deployment or automatic push follows.
