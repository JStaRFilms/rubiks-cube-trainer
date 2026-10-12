# B11 ZBLL practice integration

## Current verdict

PASS after the owner's requested parent follow-up on 2026-10-12. Parent extended the existing byte-keyed identity cache to OLL/PLL with separate trainer keys and reviewed the narrow change. No case, guidance, source, inventory, readiness or storage proof was removed. F2L remains uncached. The measured LL proof dropped from 6,951 to 3,409 state decodes and from 1,030 to 646 ms. The exact conditions behind the historical sporadic timeout remain unproven; isolated startup passed before and after the repair.

Actual final checks passed: lint, typecheck, one full unit aggregate with 351 passing tests and two existing intentional skips, and one unchanged full browser aggregate with 58/58 passing in 13.6 minutes. Five added tests cover cache reuse, mutation, trainer/engine separation and warm invalid-state rejection. Normal dist was rebuilt after update exercises; the source/asset inspector refreshed `ZBLL_Trainer_Bundle_Evidence.json` for release `review-1791822200916`, with 55 assets. The large-main-chunk warning remains.

The focused parent review and exact commands are in `Q04_ZBLL_Acceptance.md`; logs are under `.pi/takomi/oll-fix-*`. Prior failed aggregates and the blocked diagnostic are retained below as historical evidence, not the current gate. No new delegate, commit, push or deployment occurred. Physical-device and Pages-subpath verification remain unrun for this increment.

Checkout remained at `334716f`, branch `build/foundation`. No commit, push, deployment, network source retrieval, dependency change, migration, subagent or orchestration-record write was made. The task/ledger/master-plan changes already present at dispatch belong to the parent and were left alone.

## Historical blocked readiness diagnosis after Q04

This pass inspected the complete B11 packet, Q04 audit, this report, `.pi/takomi/q04-full-browser.log`, the retained OLL trace and all three original traces in `.pi/takomi/q04-retained/` before launching a browser. It also inspected actual readiness, worker/client/library initialization, cube engine, Repository reads and strict backup validation.

### Retained failure evidence

The Q04 OLL trace starts the setup click at monotonic time 453909.212 ms and its readiness assertion at 454000.282 ms. The final readiness LL worker asset request starts at 456934.831 ms and takes 41.15 ms. The error snapshot remains at `Validating the actual 57 OLL and 21 PLL libraries and cube model…`. The assertion exhausts 30005.1 ms inside the browser. Thus asset arrival alone does not account for the remaining wait.

The original F2L update trace retains 27123.0 ms waiting for challenge presentation. Its final saved-status assertion has only 134.5 ms before the whole-test deadline cuts it off. The cold F2L trace retains a 12648.1 ms Save settings click and 3753.1 ms clearing selection. The foundation trace retains a 5091.3 ms failed session-summary assertion while local data is still being checked. These are observed waits, not proof of data loss or a common cause.

None of those retained traces records worker request/reply timing, worker CPU samples, Repository transaction timing or host scheduling. The readiness status is the last published stage in one branch of `Promise.allSettled`; it does not identify which branch ultimately prevented completion. I cannot assign the Q04 failure to LL computation, ZBLL contention, host load or storage from this evidence.

### One production diagnostic startup

Command, run once against the existing normal `dist`:

```sh
node .pi/takomi/b11-readiness-diagnosis.mjs > .pi/takomi/b11-startup-diagnosis.log 2>&1
```

The ignored script owns and closes its preview process and Chrome instance. It uses a fresh context, records real `performance.now()` values around native Worker requests/replies and IndexedDB `getAll`, and samples the main thread with CDP. It does not alter production bytes, clocks, deadlines or retained tests. The setup wait uses the original 30000 ms budget. This is a diagnostic startup, not a browser acceptance test or cold disconnected exercise.

| Observed operation | Real elapsed time |
| --- | --- |
| Six initial IndexedDB store reads, all empty | 12.7 to 14.1 ms each |
| Repository-triggered LL `training` request to reply | 3042.7 ms |
| Initial model generation-worker request, explicit initialization-failed reply before existing Cross fallback | 41.9 ms |
| Cross readiness request to ready | 1303.3 ms |
| Cross+1 readiness request to ready | 161.0 ms |
| F2L readiness request to ready | 388.7 ms |
| LL readiness request to ready | 1443.7 ms |
| Complete ZBLL readiness request to ready, overlapping existing sequence | 3423.5 ms |
| Downloading-status publication to reload-ready message | 6875.4 ms |

The main-thread profile spans 7.700 seconds and attributes 7.053 seconds to idle samples. It does not profile worker CPU. The initial Repository path calls `decodeBackup`, which always calls the supplied training validator, even for empty training arrays. That starts the independent LL validation worker, whose first message loads the engine and proves all 57 OLL and 21 PLL cases before validating the empty arrays. This explains the measured record-independent Repository validation cost, but does not establish why Q04's separate readiness worker missed 30 seconds. No bypass or cache was added.

Raw evidence remains in `.pi/takomi/b11-startup-timing.json`, `b11-startup-profile.json` and `b11-startup-diagnosis.log`. The diagnostic completed within the original budget. That isolated result does not clear Q04 or the original failures.

### Stop decision and unchanged build

Root cause remains uncertain, so this pass stops BLOCKED without a repair, further browser retries or a new aggregate. No units, lint or typecheck were rerun because production code and retained tests are unchanged. `git diff --check` passed. No build/update exercise ran; normal `dist` remains Q04 release `review-1791818559100`, with 55 manifest assets. Existing bundle evidence is historical and was not regenerated. A read-only Python check verified all 55 current manifest lengths and SHA-256 hashes with zero mismatches. All 67 protected tracked files under `src/data`, `docs/data`, `tests/fixtures`, `public/licenses` and `.gitattributes` matched `HEAD` byte-for-byte. History semantics, schema, complete readiness proofs and all assertions/deadlines remain unchanged.

This pass changes only this integration audit and ignored diagnostic artifacts. No parent task records, Git state, deployment or external data were written. Parent owns the next decision and any targeted repair review.

## Delivered behavior

- Actual navigation, all 493 canonical controls, eight families and 43 sourced COLL groups. Selection comes from manifest membership, including PLL groups `0D`, `00`, `0F`, not guessed universal numbering.
- Manual nonempty pools, ordered cycles or transient shuffled cycles without repetition within a cycle. Fixed/random pre-U and yaw, physical frame, execution/recognition and shared inspection preferences persist in version-1 settings. These are individual drills, not ZBLL sets or runs.
- Every setup requires a fully solved cube aligned to its centers in the displayed down/front frame. Next, retries and interruption recovery return to confirmation. No arbitrary oriented LL permutation is accepted as the physical base. Completion remains self-reported.
- Worker-backed source setup and immutable guidance with request/instance/epoch correspondence, selected membership, actual angles/frame, collection and canonical-entry metadata, actual identity/context/goal and physical return/final-AUF checks. Generation suspends before DOM timing/player work. Post-read adoption checks the full global algorithm list, session, settings, restore epoch and ownership.
- Recognition omits generated identity, family, subset, source labels, algorithm and identifying explanation from visible and accessible output before stop. Interrupted recognition remains hidden until deliberate Review. Running hides preparation guidance. The cube net and scramble are the practice stimulus, not a generated textual answer.
- Shared TimerController, acknowledged Repository writes, save retry/emergency export, interruption, sessions, penalties, delete/latest Undo, frozen historical player and strict backups. No fabricated history or fallback challenge.
- Canonical personal guidance validates before save/reset. The global whole-list gate includes F2L, OLL and the actual 493 ZBLL membership with shared PLL objects once. Generation payloads filter to each trainer's real inventory, while stale comparisons retain the full list. Saving/resetting one key preserves unrelated guidance and historical snapshots.
- Case/family/subset counts, failures and actual attempted coverage. Coverage includes saved interrupted/DNF attempts and uses canonical IDs once. Time/preparation summaries group by compatible case, mode, inspection, frame, declared pool/policies, actual angle, canonical metadata and frozen guidance. There is no pooled family ranking or mastery claim.
- Real 493-case initialization in offline readiness, required local worker/library/model/player bytes and exact notices, cold disconnected first use, cache repair and actual alternate-release updates. Normal root `dist` was rebuilt after the last browser/update command.

See the pre-implementation blueprint in [ZBLL practice](../features/ZBLL_Trainer.md).

## Identity and schema decisions

Collection `zbll-library-v1` remains separate from canonical entry versions. Non-PLL IDs and policy remain `zbll:zbtrain-v1:<family>:<subset>:<recognition-code>` and `zbll-ll-pre-u-yaw-v1`. Shared PLL uses existing `pll:speeden-v1:*`, `cfop-libraries-v1` and `pll-ll-pre-u-yaw-v1`. A shared PLL attempt records trainer ZBLL and the ZBLL collection while retaining canonical PLL proof metadata. Stored override aliases reject; one PLL key serves both trainers.

Database/export remain version 1. Optional `zbllPractice` settings decode exact nonempty unique canonical membership and angle/order/mode policies. ZBLL options require the frozen selection. Its case proof requires actual manifest family/subset/source/reference labels and canonical dataset/policy. Unknown fields, altered versions/membership/context/goals/timing/comparison fields reject before replacement. Old strict gates remain intact. ZBLL practice sets/runs and Cross+2 attempts remain closed.

The settings decoder needs IDs only, so it imports the immutable manifest rather than the entire algorithm corpus. This final simplification removed 2,364,873 raw emitted executable bytes compared with the preceding inspector build. It did not change selection semantics or source bytes.

## Readiness and proof reuse

The first browser attempt spent 10,102 ms reaching a timer because it initialized all 493 unrelated cases on every practice worker. Practice now proves its actual requested challenge. The separate readiness operation still initializes the complete library.

Successful ZBLL identity calculations have an engine-local, 512-entry cache keyed by actual format/facelet bytes. Structural, legal-state, canonical membership and guidance/goal checks remain mandatory. No imported identity/version string authorizes a cache hit. Old trainer identity behavior is unchanged.

Readiness overlaps the complete ZBLL proof with the existing model/Cross/Cross+1/F2L/LL initialization sequence, then awaits both outcomes before declaring ready. Workers suspend after their work. Within one PwaController, a successful ZBLL initialization can be reused only after all asset bytes again pass verification for that same compiled release. Cache repair restores those exact bytes. New cold tabs still create and initialize the actual ZBLL worker.

The cold test observes one ZBLL worker before the trainer has ever opened. Actual practice and its separate semantic validator add two more workers. Same-release cache repair does not create another initialization worker. Reload creates fresh readiness and semantic-validation workers for the real saved attempt. The test checks all five observed workers, actual saved data, final player states and disconnected requests.

## Commands and actual results

Commands ran serially. Browser clocks are real for the seven new ZBLL flows. The retained full OLL/PLL set loops disclose their accelerated production-timer clocks; they are not physical solves.

| Command | Actual result |
| --- | --- |
| `pnpm exec vitest run tests/unit/zbll-practice.test.ts tests/unit/zbll-client.test.ts tests/unit/pwa.test.ts tests/unit/pwa-scope.test.ts` | Initial 87 passed / 1 failed. Valid-client reply comparison used inconsistent object field order. After normalization, 88 passed in 28.45 s. Final suite after the extra correspondence test and manifest-only lookup passed 89 tests, four files, in 15.87 s. |
| `pnpm typecheck` | Initial failures were a statistics literal-union `includes` argument and, after adding tests, a possibly undefined default fixture plus an attempted write to readonly frame colors. Corrected without casts or weakening types. Final application/test and service-worker checks PASS. |
| `pnpm lint` | PASS, including final code and test changes. |
| `pnpm test` | First aggregate had 343 passes, two failures and two intentional skips in 844.93 s. One failure was the obsolete B10 expectation that global ZBLL overrides remain closed. The other was the unchanged 60-second independent source-universe deadline, with 71.364 s observed. |
| `pnpm exec vitest run tests/unit/zbll-source-gate.test.ts` | Unchanged deadline rerun PASS, two tests, 46.88 s total and 45.50 s test time. This alone was not an aggregate pass. |
| `pnpm test` | Subsequent actual aggregate PASS, 346 tests, 23 passing files and two intentionally skipped hermetic-curation files, 720.06 s. This preceded the final readiness scheduling and manifest-only import simplification. The final focused 89-test pass and final browser commands cover those changes. |
| `pnpm build` | PASS for normal root builds and prepared alternate releases. The large-main-chunk warning remains. No warning threshold or test deadline changed. |
| `pnpm exec playwright test tests/browser/zbll.spec.ts --reporter=list` | Six-flow checkpoint PASS in 4.0 minutes, before adding the seventh shuffle/session flow and final readiness refinements. All seven new flows passed in each of the last three full browser commands. |
| `pnpm exec playwright test --reporter=list` | Initial broad command had 53 passes / 5 failures in 24.6 minutes. Old cache-repair readiness and update deadlines exposed the added sequential initialization cost. |
| Twelve-flow readiness/ZBLL regression command | First 9 passed / 3 failed in 9.5 minutes. Next 10 passed / 2 failed in 5.3 minutes. Failures and corrections are below. These are not passing aggregates. |
| `pnpm exec playwright test --reporter=list` | Complete passing checkpoint: 58 passed in 15.2 minutes, after readiness overlap and fixture corrections, before the final manifest-only ID lookup. This was one real aggregate, not stitched reruns. |
| `pnpm exec playwright test --reporter=list` | On final implementation, 57 passed / 1 failed in 17.5 minutes. Foundation's post-update session summary showed `No session yet` instead of `Update retained` within its unchanged five-second assertion. |
| `pnpm exec playwright test tests/browser/foundation.spec.ts --grep 'downloaded update waits' --reporter=list` | Same test, unmodified, PASS: 22.7-second test, 57.6-second command, with alternate release prepared outside its timed exercise. This does not establish the aggregate or explain the earlier failure. |
| `pnpm exec playwright test --reporter=list` | Latest aggregate FAIL: 55 passed / 3 failed in 21.5 minutes. All seven ZBLL flows passed. Exact unresolved failures are below. No further speculative fix or retry loop followed. |
| `node tests/helpers/bundle-evidence.mjs docs/audits/ZBLL_Trainer_Bundle_Evidence.json` | Final normal root build and source/asset inspector PASS after the last update exercise. 55 assets, 13 inspected chunks, 11 pinned source inputs, four covered-source matches and zero source-rights conflicts. |
| `git diff --check` | PASS. |

The twelve-flow command was:

```sh
pnpm exec playwright test tests/browser/cross.spec.ts tests/browser/f2l.spec.ts tests/browser/foundation.spec.ts tests/browser/ll.spec.ts tests/browser/update-contract.spec.ts tests/browser/zbll.spec.ts --grep 'corrupt and absent|corrupt F2L|cache corruption is not|active production LL|real browser activity|ZBLL|all family|non-PLL|request cancellation|shuffled individual|strict inspection, input|cold disconnected unopened' --reporter=list
```

## New proof and browser coverage

The focused model suite round-trips all 493 canonical memberships plus one representative from each of 43 actual sourced groups at every pre-U/yaw combination. That is 1,181 real challenges. Six physical frames occur in the group/angle samples. Independent replay checks exact sourced setup and fully solved/aligned completion including final AUF. This is additional integration coverage, not a replacement for B10's exhaustive 47,328 default and 47,328 personal presentations, 4,608 proper-ending-regrip presentations and 11,832 regrip identity checks retained in the full unit suite.

Warm import probes reject 26 changed challenge/attempt dimensions atomically while retaining prior revision/data. Client tests cover 13 reply mismatches, caller mutation, wrong ID/instance, cancellation, watchdog/crash, a mathematically valid substituted guide and cancellation after the reply before engine validation. Timer tests use four unrounded inspection boundaries with real immutable challenges and Repository penalty/delete/Undo. Mixed backups include genuine old LL runs; ZBLL set/run and future-trainer gates still reject.

Seven production ZBLL flows cover:

1. All case/family/group controls, actual representatives from every family, recognition visible/ARIA secrecy, saved coverage/statistics, penalty/delete/Undo and forged warm versus real confirmed restore.
2. Cold disconnected never-opened ZBLL and player, exact solved player/text completion, corrupt actual worker detection, repair and saved history retention, plus actual initialization-worker observation.
3. Separate strict-inspection first action, native/keyboard ownership, real IndexedDB quota failure, exact emergency record/retry and hidden interrupted recognition followed by deliberate review.
4. Real non-PLL ZBLL guidance followed by OLL, PLL and F2L practice, then the reverse direction. Shared PLL editor access and old frozen ZBLL review survive edits/reset.
5. Request cancellation, dialog deferral, confirmed restore invalidation and post-read cross-tab settings rejection.
6. Two shuffled three-case cycles with exact membership once per cycle, random angles, no run records and fresh base after creating/selecting a new session.
7. Actual prepared-release update blocked by real ZBLL execution, then successful activation retaining genuine history, settings and shared PLL guidance, with fresh base confirmation after reload.

The latest command passed those seven in 17.3, 40.2, 6.5, 36.1, 11.2, 17.2 and 42.4 seconds respectively. The last ZBLL alternate release took 24,531 ms to prepare outside the test exercise.

## Failures retained and fixes made

- The first browser command failed all six new flows. One assertion counted the underlying base-confirmation checkbox as well as the settings dialog's controls, receiving 497 instead of 496. It now scopes to the dialog. Five flows reached the unchanged five-second deadline during redundant all-library initialization. A separate local probe measured 10,102 ms to presentation. Practice now validates its requested challenge; readiness still proves all 493.
- The measurement helper's first server launch failed with connection refused and left its owned preview child. Two later browser commands correctly refused occupied port 4173. Exact owned process IDs were inspected and terminated. No reuseExistingServer bypass was introduced.
- The next six-flow run had three passes and three failures: an ambiguous two-alert locator, input sent before the old LL timer had actually committed, and the 45-second whole-update test deadline. The locator scopes to the dialog; keyboard execution first waits for and focuses the actual timer. Successful identity reuse reduced unnecessary readiness work. The six-flow rerun passed.
- The first broad 58-flow command failed three old cache-repair readiness assertions and two 45-second old LL/update-contract tests. Same-release proof reuse fixed repeat setup work, but cold reload remained slow. The complete ZBLL readiness proof now overlaps existing readiness work and waits for both outcomes. Retained assertion and whole-test deadlines are unchanged.
- New observer expectations initially omitted the separate semantic-validation worker and the fresh validator after reload. Counts now reflect those real workers. The shuffle test initially sliced IndexedDB key order, which is random UUID order, rather than chronological presentation order. It now sorts actual saved timestamps before checking each cycle. Production shuffle logic was not changed to excuse that assertion.
- The B10 global-gate assertion was intentionally updated because B11 explicitly enables genuine global ZBLL personal guidance. Unknown/alias keys, malformed fields, wrong goals and ZBLL sets/runs remain covered and closed.
- Original unit logs redirected into `test-results` were removed by Playwright's normal results-directory reset. Later logs use ignored `node_modules/.cache` and are available for this checkout. The initial browser error contexts were copied there before reset. Counts above also came from actual tool results, not inferred acceptance.

## Historical unresolved failures before the parent follow-up

Latest `pnpm exec playwright test --reporter=list`:

- `tests/browser/f2l.spec.ts:48`, never-opened cold offline F2L/3D/history/touch loop, exceeded the unchanged 45,000 ms whole-test deadline.
- `tests/browser/f2l.spec.ts:186`, actual F2L update, exceeded the unchanged 45,000 ms whole-test deadline while awaiting `Saved on this device` at line 190.
- `tests/browser/foundation.spec.ts:114`, actual all-tab update/session retention, failed line 128's unchanged 5,000 ms assertion. The summary stayed `No session yet` rather than `Update retained` within that window. The same final-code test passed unchanged in isolation. No persistent data-loss cause or timing-only cause has been established.

These failures prevent a clean final aggregate. Earlier passing checkpoints do not clear them. Parent should inspect their traces and independently reproduce before treating B11 as accepted. No assertions, deadlines, browser retries or test configuration were weakened.

## Prior bundle snapshot and protected bytes

[Bundle evidence](ZBLL_Trainer_Bundle_Evidence.json) describes normal root release `review-1791815941421`, scope `cross-cross1-f2l-oll-pll-zbll-practice`, collection `zbll-library-v1`, and includes `zbll-library-493-v1` in actual required initialization.

- 55 assets with verified exact SHA-256 and lengths; 13 inspected app chunks. All emitted model/player/worker dependencies are listed for caching.
- All assets: 11,709,275 raw bytes; 7,867,068 summed gzip bytes; 7,703,039 summed Brotli bytes.
- Executable assets: 4,603,918 raw; 794,297 gzip; 635,311 Brotli.
- Application without the covered-source archive: 4,656,556 raw; 813,260 gzip; 650,296 Brotli.
- ZBLL worker `/assets/zbll.worker-Cekmcq10.js`: 761,056 bytes, SHA-256 `df52dca26f5221aa2b867835bb504144e2694380e380eb700c8f59c697bcaf6f`.
- Largest main chunk `/assets/index-Dtk_QSZu.js`: 1,226,868 bytes, SHA-256 `3559ee49d76e8947df758b1956d56a9decb1f5832615bca9b6f7b936bd777e9c`. The 500 kB warning remains visible. No code-splitting/polish track was added.
- Eleven pinned source artifacts match metadata. All four exact case MIT notices match source/docs/public/dist. Four required cubing covered-source files match the retained archive; no optional search/scramble/GPL source conflict was found.
- A byte comparison against `git show HEAD:<path>` found all 67 tracked paths under `src/data`, `docs/data`, `tests/fixtures`, `public/licenses`, plus `.gitattributes`, unchanged from `334716f`. That includes the accepted 493 inventory, old trainers, exact notices and historical source-gate evidence.

## Changed paths

New:

- `src/zbll/model.ts`, `validation.ts`, `protocol.ts`, `client.ts`, `zbll.worker.ts`
- `src/app/ZBLLPractice.tsx`, `ZBLLSettings.tsx`, `ZBLLStatistics.tsx`
- `tests/unit/zbll-practice.test.ts`, `zbll-client.test.ts`
- `tests/browser/zbll.spec.ts`
- `docs/features/ZBLL_Trainer.md`
- `docs/audits/ZBLL_Trainer_Integration.md`, `ZBLL_Trainer_Bundle_Evidence.json`

Modified:

- `README.md`
- `src/app/App.tsx`, `LLAlgorithms.tsx`, `TimerPractice.tsx`, `MoveReview.tsx`
- `src/cases/identity.ts`, only bounded successful ZBLL identity reuse
- `src/cube/version.ts`
- `src/ll/runs.ts`, only global guidance inventory validation
- `src/store/records.ts`, `validation.ts`, `trainer-validator.ts`
- `src/statistics/attempts.ts`
- `src/pwa/client.ts`, `manifest.ts`, `vite.config.ts`
- `tests/unit/pwa.test.ts`, `pwa-scope.test.ts`, `zbll.test.ts`
- `tests/helpers/bundle-evidence.mjs`, adds collection metadata to evidence

No parent orchestration paths are part of this implementation's authored changes.

## Logs and limits

Ignored local logs include `b11-full-unit.log`, `b11-full-unit-rerun.log`, `b11-source-gate-rerun.log`, `b11-browser-initial-errors.md`, `b11-browser-rerun3.log`, `b11-browser-candidate.log`, `b11-full-browser.log`, `b11-readiness-regressions.log`, `b11-readiness-regressions-final.log`, `b11-full-browser-final.log`, `b11-focused-verified.log`, `b11-browser-verified.log`, `b11-foundation-update-rerun.log`, `b11-last-full-browser.log`, `b11-bundle-verified.log`, `b11-verified-typecheck.log`, `b11-verified-lint.log` and `b11-diff-check.log` under `node_modules/.cache`. Latest failure traces remain under `test-results`.

Tested Windows desktop Google Chrome 154.0.8037.98, Node 24.16.0, isolated browser contexts, keyboard and touch/viewport emulation. Physical iPhone/Android, Safari/Firefox, OS-installed PWA behavior, screen-reader sessions, real audio audibility, GPU certification and mobile memory/latency remain unrun. The Pages-subpath browser configuration was not run for B11. No live deployment or external data was touched. Timer results do not prove physical cube completion. Parent owns any further confirmed fix, independent Q04 and acceptance.
