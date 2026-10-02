# B09 Time Attack integration

## Accepted checkpoint

Q03 returned PASS/APPROVE after the narrow mixed-guidance dispatch repair and targeted independent recheck. The original FAIL, repro and correction remain recorded in [Q03 acceptance](Q03_Case_Trainers_Acceptance.md). Parent final bundle evidence is release `review-1790923520554`, matching normal rebuilt dist and all 49 assets. This does not claim a clean aggregate 51-browser run or physical-device certification. Earlier sections are chronological checkpoint evidence.

Implementation evidence for the separate 57 OLL and 21 PLL trainers. This is not parent acceptance or Q03. The blueprint is [Time Attack](../features/Time_Attack.md).

## Current status

Implementation and local coverage PASS, pending parent review and Q03. Final lint/typecheck pass, all 260 unit tests pass with the retained intentional skip, all 43 retained browser tests pass in the latest full-suite run, and the final separate seven-test LL run passes. The latest aggregate browser command was 49/50, not a clean 50/50; its new LL update-test synchronization failure was corrected and included in the final seven passes. Prior startup/readiness timeouts remain disclosed below. The final normal rebuild, 49-asset/source check and pinned-byte checks pass.

No dependencies, source datasets, migrations, deployments or further trainers were added. Database/export versions remain 1. Source-qualified identities and earlier trainer versions remain unchanged. Parent-owned orchestration files were not written by this implementer. Final read-only Git checks with optional locks disabled showed HEAD `c1c6c47751a157dad84aa48342a5db27f872f95f` and origin/main `973a8796cb522e2626d86b334e7f9f01733f7a6b`; no Git mutation was performed.

## Delivered behavior

- Separate full OLL/PLL defaults, unique nonempty custom sets, sourced family/case selection, manual weak-case selection, optional shuffle and fixed/random pre-U/yaw. There is no automatic coaching.
- Start saves the complete actual plan, settings, frame, versions and canonical guidance before displaying a setup. Set or algorithm changes cannot rewrite a historical run.
- OLL accepts solved/aligned F2L with oriented LL and any legal LL permutation. Its model is representative. A valid algorithm may change permutation; consecutive reps need no PLL.
- PLL starts fully solved/aligned. Frozen guidance returns to the held frame if a personal algorithm ends in a regrip, then applies its recorded final AUF. The player includes both. Users who follow another unobserved algorithm must align the physical cube, not blindly apply the displayed AUF.
- Every rep requires base confirmation. Durable presentation precedes the timer DOM. Stopped attempt, matching outcome and cursor commit in one revision-checked transaction. Identical retries are idempotent; stale or competing writes reject.
- Reload/restore closes presented work as interrupted without an invented attempt or completed duration. Skip and abandon are explicit. Resuming never resumes an old running clock.
- Recognition omits current identity, family, guidance and identifying explanation before a completed stop or deliberate interrupted review, including the accessibility tree. Execution guidance follows the shared running-timer hiding policy.
- The shared controller retains hold/release, strict inspection, pointer ownership, native input/dialog/player isolation, visibility interruption, acknowledged saving, exact-record retry and emergency export.
- History penalty changes recompute results. Deletion atomically nulls the linked outcome and retains interruption evidence. Latest Undo restores the attempt and prior run snapshot.
- Results show outcome counts, raw/effective time, penalty, preparation, inspection and angles per case, plus successful-rep best/worst/spread. Any DNF makes the set mean DNF. Incomplete, abandoned, skipped or interrupted runs cannot earn a successful set mean/PB. A successful-rep mean is separately labeled.
- Comparison keys derive from validated membership, trainer, settings, frame, versions, canonical guidance and angle/order policies. Labels and actual shuffled order do not define a class; full/subset, OLL/PLL and incompatible policies cannot share PBs.
- Genuine LL semantics register before Repository construction. Unknown fields/IDs/versions, wrong contexts, forged guidance/keys/angles, duplicate memberships/links, inconsistent chronology/cursors and dangling attempts reject before replacement. Old valid Cross/Cross+1/F2L backups and F2L slot overrides remain supported. ZBLL/Cross+2 remain closed.

Generic `RunRecord` retains optional LL extensions for the existing common record interface. The genuine LL validator requires `snapshot`, `presented` and `interruptions`, validates their contents, and returns `LLRunRecord` with mandatory fields and narrowed LL challenges/trainers. Missing extensions do not receive import defaults. Production factories and plan replies use the narrowed type. Negative import tests delete each extension and confirm rejection.

## Independent mathematical and unit evidence

The existing independent sticker-coordinate replay, identity projections and legal-base enumerator in `tests/helpers/case-oracle.ts` check actual production-generated output. They do not call the production goal checker to decide the following results.

| Coverage in the final full unit run | Count and result |
| --- | --- |
| Actual default LL generation, all 78 cases, 16 pre-U/yaw combinations, six physical frames | 7,488 PASS |
| Actual OLL setup and permutation-changing personal guidance, 57 cases, 16 angles, six frames, all 288 legal oriented LL bases | 1,575,936 PASS |
| Personal PLL pre-AUF and final AUF, all 21 cases, 16 angles, six frames; setup unchanged from default | 2,016 PASS |
| Regripped personal PLL, one real sourced PLL, all 24 proper ending orientations, 16 angles, six frames; return and final AUF replay to exactly solved/aligned | 2,304 PASS |
| Full plans saved and every rep timed through the actual TimerController with injected monotonic/wall clocks | OLL 57 and PLL 21 PASS |
| Actual start and stopped-save quota rollback, unchanged revision, exact retry/idempotence and stale/competing cursor writes | PASS |
| Recovery/restore, skip/abandon, linked deletion/Undo, DNF eligibility and immutable set/guidance snapshots | PASS |
| Strict actual run/attempt forgeries, malformed sets/overrides, missing LL extensions, unsupported future trainers and interruption evidence | PASS |
| Fractional strict inspection through the actual controller and linked outcome | 14999.6, 15000, 16999.6, 17000 ms PASS |
| Worker instance/ID/epoch/frame/version/case/trainer/angle/mode/setup/guidance correspondence, caller mutation, personal regrip, cancellation, timeout and crash | PASS |

These are mathematical and software timing checks, not physical solves. Small generated records in negative storage fixtures are not claimed as genuine full-run execution. Full-run unit tests obtain their records from the actual controller.

The 48 B09 unit tests join all 212 retained passing tests and the existing intentional generator skip. The earlier assertions and timeout values remain unchanged.

## Commands and observed results

Commands run from the project root. A shell redirect saved the latest full-suite output under ignored `node_modules/.cache/` as well as returning it through the tool.

| Command | Observed result |
| --- | --- |
| `pnpm lint && pnpm typecheck` after the final client/type changes | PASS, both TypeScript projects checked |
| `pnpm exec vitest run tests/unit/ll-client.test.ts tests/unit/ll-boundaries.test.ts tests/unit/ll.test.ts -t "returns regripped\|rolls back\|actual last-layer\|instances\|watchdog\|malformed\|regrip forgery" --reporter=verbose` | PASS, 17 passed, 31 filtered out, 14.03 s |
| `pnpm build && pnpm exec playwright test tests/browser/ll.spec.ts --grep "subset" --reporter=list` after shared return-regrip and client/type fixes | PASS, production build and one browser test, 30.6 s for browser command |
| `pnpm test` after final code/test changes | PASS, 260 passed, one intentional skip, 18 files passed and one skipped, 362.96 s |
| First post-fix `pnpm exec playwright test --reporter=list` | FAIL, 48 passed, two retained foundation startup timeouts, 14.3 min; all seven LL tests passed |
| `pnpm exec playwright test tests/browser/foundation.spec.ts --grep "real replacement\|downloaded update" --reporter=list` | PASS, both unchanged failing tests, 37.7 s |
| Second post-fix `pnpm exec playwright test --reporter=list` | FAIL, 49 passed, one new LL update-test navigation race, 10.9 min; all 43 retained tests passed |
| Subsequent `pnpm exec playwright test tests/browser/ll.spec.ts --reporter=list` | FAIL, five passed, PLL history hydration and cache-repair readiness timed out at new-test five-second waits, 5.6 min; corrected update test passed |
| Final `pnpm lint && pnpm typecheck && pnpm exec playwright test tests/browser/ll.spec.ts --reporter=list` | PASS, lint/typecheck and all seven LL tests, browser 4.1 min |
| Final `node tests/helpers/bundle-evidence.mjs docs/audits/Time_Attack_Bundle_Evidence.json` after all update tests | PASS, normal production/SW rebuild, 49 emitted assets, 13 inspected chunks, no source-rights conflicts |
| Final `node --input-type=module -e` pinned byte comparison described below | PASS, all six raw artifacts, both public/dist MIT copies and docs notices |
| `GIT_OPTIONAL_LOCKS=0` read-only `git diff --check`, protected-path `git diff --name-only`, `git rev-parse HEAD origin/main`, `git status --short` | PASS, no whitespace errors or protected-path diff; unchanged HEAD/remote and expected parent-owned task changes |

## Earlier failures and their resolution

1. The first full LL storage run rejected a valid run because raw object property ordering differed after normalization. The factory now returns the validated normalized run. The next exhaustive full-run test exposed repeated unchanged cube proofs exceeding 240 seconds. Bounded per-engine caches now reuse only successful proofs keyed by actual input content. Returned values are copied; supplied comparison strings are never cache authorities. The final controller runs and strict mutation tests pass.
2. The first six-test LL browser run had four passes and two failures. One test expected Resume after resetting an override, although the frozen run was still selected. Another installed a new fake clock after presentation and broke its own timing continuity. Corrected tests passed, and later complete LL runs passed. No production timer rule was weakened.
3. The initial default parallel `pnpm test` had 256 passes, two timeouts and one intentional skip. The retained F2L override Cartesian test took 136.507 seconds against its unchanged 120-second limit; the new LL default Cartesian test took 199.801 seconds against its 180-second limit. `pnpm exec vitest run --maxWorkers=1` then passed all 258 tests present at that checkpoint, plus the intentional skip, in 463.99 seconds. `vitest.config.ts` now sets `maxWorkers: 1` so the exhaustive suites do not contend for CPU. Default `pnpm test` subsequently passed in 327.30 and 423.55 seconds, and the latest 260-test run passed in 362.96 seconds. This serializes complete coverage; it does not skip tests or extend retained timeouts.
4. The implementation-focused review found that changing a saved set's membership created a new set instead of editing the selected set. The editor retains its editing target independently of unsaved practice selection. The production subset browser test proves editing/deleting that set leaves the old frozen run unchanged.
5. The same focused review reproduced a real PLL defect with a personal algorithm ending in a regrip and needing nonzero final AUF. The new independent replay test failed before the fix. Computing AUF after implicit center normalization had not made that normalization a physical move. Shared `presentLLGuidance` now appends the known return regrip before computing AUF, and strict presented guidance requires the held frame. The 2,304-case test passed after the fix. A subsequent browser run correctly rejected the plan because the frozen-run matcher still expected the old move list. Run matching now uses the same proved transformation. The latest production subset/editor/retry/player/restore test passes with entered `U'`, the sourced algorithm, `U x`, and authored pre-AUF 1. Player and logical replay reach exactly solved/aligned after recorded final AUF.
6. A typecheck during narrowing rejected the decoded generic option object because its type still included ZBLL. The builder now explicitly retains the trainer after its runtime OLL/PLL guard. Lint and both TypeScript checks then passed. There is no broad cast.
7. One long tool call returned `No result provided`. It has no usable PASS evidence. The relevant focused checks and final unit suite were rerun after continuation. Earlier missing reports are not inferred from artifacts.
8. An earlier read-only `git rev-parse origin/master` failed because that remote ref does not exist. A subsequent ref listing showed origin/main and origin/HEAD at the unchanged `973a879` checkpoint. No remote operation was performed.

9. The first post-fix full browser run passed 48/50 but timed out two retained foundation checks at their unchanged five-second waits. Captured UI still showed `Checking local data`, with no assertion proving data loss. Both passed unchanged on a focused rerun. A second complete run passed all 43 retained tests. Alternate-release preparation varied from about 10 seconds to 59 seconds across these runs. This is observed timing variance, not a certified diagnosis of host CPU load. No retained assertion or timeout was changed to hide it.
10. The second complete run's new LL update test opened Help on the old document because an already-visible ready badge did not prove the automatic update reload had finished. Reload then removed that dialog. The test now awaits the real `load` event before checking readiness, hydrated trainer and retained backup. It passed afterward. A later seven-test run completed and independently checked all PLL reps/player moves but timed out when asserting history on the initial placeholder after reload. Its cache-repair test also used a five-second default for real model readiness, unlike initial setup's explicit 30-second bound. New LL tests now wait for actual hydrated trainer state before the unchanged history assertion and use the same 30-second library readiness bound for repair as initial setup. Their overall 180/45-second budgets remain unchanged. Final seven-test LL coverage passes; no timed rep, failure, preservation or byte-integrity assertion was removed.

## Production-browser conditions and prior checkpoints

An earlier `pnpm exec playwright test --reporter=list` passed all 50 tests in 9.9 minutes. A later `pnpm exec playwright test tests/browser/ll.spec.ts --reporter=list` passed all seven LL tests in 3.6 minutes. Both preceded the final regrip fix and are retained as checkpoint evidence only.

The final seven-test LL pass includes full cold-offline OLL 57 and PLL 21 loops, reload, recognition/ARIA, pointer emulation, interruption/recovery/skip/abandon, strict inspection, stale ownership, cache repair and genuine safe update. The subset pass uses the actual production build, actual algorithm editor and personal pre-AUF, a frozen two-case set, real keyboard controller timing, real IndexedDB quota failure/retry, final-AUF player replay, override reset, linked DNF/delete/Undo, set membership editing/deletion and validated confirmed restore. It seeds no attempt history.

Full-set browser loops use accelerated Playwright clocks for the production timer. Each of the 57/21 reps is base-confirmed, started and stopped through actual input/controller/save paths, then checked for complete membership, unique links, frozen snapshots and acknowledged history. They are not demonstrations of someone physically solving a cube. OLL/PLL are not opened before initial offline setup; a new page loads them cold with the browser disconnected. The player is also opened cold offline. Other LL tests cover reload/visibility interruption, deliberate recognition review, skip/abandon, native input isolation, pointer/touch emulation, stale plan/dialog cancellation, cross-tab settings, confirmed restore, actual cache repair and active-timing update deferral. Alternate real release bytes are prepared before the timed update exercise.

Observed environment at the prior and latest focused checkpoints is Windows Chromium/Chrome `154.0.8037.95`. Viewports include 320x640, 390x844 and 1440x900. Retained review tests check all six physical color frames; LL unit tests use all six frames. Pointer/touch input is browser emulation, not a physical phone.

## Files and boundaries

New runtime files are `src/ll/model.ts`, `validation.ts`, `runs.ts`, `protocol.ts`, `ll.worker.ts` and `client.ts`. New UI files are `TimeAttackPractice.tsx`, `TimeAttackSettings.tsx`, `LLAlgorithms.tsx` and `RunResults.tsx`. Run statistics are in `src/statistics/runs.ts`.

Shared changes are limited to App wiring/help, case-net labels, frozen review/final AUF, TimerPractice LL presentation, existing styles, the new presented-guidance validator, actual initialization metadata, PWA manifest/client/build scope, compatible attempt comparison, record extensions and strict repository/semantic validation. TimerController itself was not rewritten. New tests are `ll.test.ts`, `ll-boundaries.test.ts`, `ll-client.test.ts` and `tests/browser/ll.spec.ts`. The retained PWA manifest fixture follows the expanded release scope.

Documentation includes the blueprint, this audit, final bundle evidence, README and the affected foundation/library/source contracts. Existing F2L documentation identifies its old closed-LL statement as the B08 checkpoint. No parent task/master/index/summary/board file was authored or updated here.

## Limits and acceptance ownership

No physical-phone, installed-PWA, audible-output, screen-reader, thermal, GPU or long-run leak certification was performed. The app does not observe physical stickers, moves, algorithm choice or completion. User timer stops and base confirmations remain self-report. An OLL net/player can only show a representative permutation.

Vite reports a main chunk above 500 kB, 546,810 bytes in the final evidence. Build succeeds; no phone performance claim follows from that success. Cold validated-history startup exceeded five-second test waits during some runs. This variability remains a real test/runtime latency limitation, even though unchanged retained checks and the final LL readiness-aware checks passed.

The implementer's pre-repair bundle checkpoint recorded release `review-1790916180145`, matching its normal dist after update exercises. The following sizes describe that checkpoint. Parent has refreshed the linked [bundle evidence](Time_Attack_Bundle_Evidence.json) for the accepted repair, as recorded at the top of this audit. It records 49 assets, actual `ll-libraries-57-21-v1` initialization, 9,534,250 raw bytes, 7,685,711 gzip bytes, 7,588,239 Brotli bytes and no source-rights conflicts. Executable payload is 2,432,001 raw bytes; the app without the required source archive is 2,481,531 raw bytes. These include actual worker/library/player dependencies and MIT notices.

The final pinned-byte command read `src/data/sources.json`, checked each of its six fixture byte lengths and SHA-256 hashes, then compared both pinned MIT buffers byte-for-byte with `public/licenses/`, rebuilt `dist/licenses/` and `docs/data/licenses/`. Protected-path read-only diff output was empty for `.gitattributes`, `src/data/`, source fixtures, docs/public license files, `package.json` and `pnpm-lock.yaml`. Exact Node command:

```sh
node --input-type=module -e "import {readFileSync} from 'node:fs'; import assert from 'node:assert/strict'; import {createHash} from 'node:crypto'; const s=JSON.parse(readFileSync('src/data/sources.json')); for(const a of s.artifacts){const b=readFileSync('tests/fixtures/case-sources/'+a.file);assert.equal(b.length,a.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);} for(const [a,b] of [['speeden-LICENSE.txt','Speeden'],['lieberkind-LICENSE.md.txt','Lieberkind']]){const p=readFileSync('tests/fixtures/case-sources/'+a);for(const root of ['public','dist'])assert.deepEqual(readFileSync(root+'/licenses/cases-'+b+'-MIT.txt'),p);assert.deepEqual(readFileSync('docs/data/licenses/'+b+'_MIT.txt'),p);} console.log('PASS: six pinned artifacts, both source/public/dist MIT copies and docs notices are byte-identical.');"
```

The implementer did not launch reviews, accept B09, change task state, commit, push or begin another trainer. Parent acceptance below supersedes the earlier pending-parent status; independent Q03 remains the next gate.

## Parent review and acceptance

Parent inspected actual LL decoding and successful-proof caches, frozen plan/guidance/key validation, presentation/outcome transitions, revision-checked attempt/run transactions and idempotent retry, linked deletion/Undo and successful-set eligibility. No confirmed semantic or storage blocker was found.

Parent independently passed lint/typecheck and all 260 units with the retained intentional generator skip, production build and all seven LL browser flows. Three input regressions passed. The fourth input/cache selection, the retained Cross repair test, timed out once at its unchanged five-second ready assertion. Its snapshot showed actual LL library initialization still working, not data loss. The failure trace and snapshot are preserved under ignored `.pi/takomi/b09-parent-cross-repair/`. Trace places repair at 32,764 ms and the failed ready wait at 37,838 ms. No test or timeout was changed.

After a normal rebuild, parent repeated that identical Cross repair test three times. All three passed, including both corrupt/absent cache recovery and retained-history assertions. This does not erase the earlier timeout or certify its cause. Intermittent readiness latency remains a limitation for Q03 and hands-on testing, not a claimed cache-loss fix.

Parent's final actual rebuild refreshed the linked bundle evidence with 49 assets and no source-rights conflict. All six pinned artifact hashes/lengths and both public/dist/documentation MIT copies matched. Protected source, licenses, `.gitattributes`, dependencies and lockfile remain unchanged. Whitespace passed.

B09 is accepted for the implemented functional contracts with the recorded timing/device limits, pending fresh independent Q03. Parent did not claim a clean aggregate 50-browser rerun. No push or deployment occurred.

## Confirmed Q03 mixed-guidance repair

Scoped repair PASS, pending parent inspection and the same independent reviewer's targeted recheck. The earlier implementation/parent sections are checkpoint evidence. Fresh Q03 returned FAIL at `335a730` for a confirmed mixed-guidance blocker; that initial verdict remains recorded in [Q03 acceptance](Q03_Case_Trainers_Acceptance.md). This appendix does not change the independent verdict or task state.

`F2LPractice` sent the complete, globally validated algorithm list into F2L-only generation. A valid saved OLL or PLL record therefore triggered the pure F2L validator's correct unknown-case rejection. The production fix changes only that call's payload to `selectedAlgorithms.filter((record) => record.caseId.startsWith('f2l:'))`, using the existing source-namespace dispatch pattern. The complete `selectedAlgorithms` list remains captured and compared after awaits. Global repository validation, algorithm-change cancellation, worker/session/settings ownership guards, the strict pure F2L validator, canonical setup, precedence, history and frame logic are unchanged. Unknown or malformed stored data still fails global validation before this dispatch; unknown F2L IDs are not made acceptable by the prefix check.

One new production browser test saves valid real OLL and PLL defaults through their editors, then saves canonical and FR-specific F2L guidance with explicit authored pre-AUF through the F2L editor. It confirms the physical base, generates the actual F2L case, starts/stops the shared timer through keyboard input and waits for durable saving. Backup comparison proves all four saved algorithm records are unchanged. The saved rep has the sourced identity/setup, uses the FR override rather than canonical guidance, independently replays to preserved/solved lower pieces, and reviews the frozen captured move list. No history is seeded, no timer clock is accelerated, and no physical solve is claimed.

### Repair commands and results

| Command | Actual result |
| --- | --- |
| Before fix: `pnpm exec playwright test tests/browser/f2l.spec.ts --grep "mixed OLL/PLL" --reporter=list` | FAIL as expected, one test, 42.7 s body. No timer appeared within the unchanged 30-second start wait. Captured production alert was `Unknown case ID. Existing overrides are unchanged.`; zero attempts were saved. |
| `pnpm lint && pnpm typecheck && pnpm build && pnpm exec playwright test tests/browser/f2l.spec.ts --grep "mixed OLL/PLL" --reporter=list` | Lint and both TypeScript checks PASS. Combined tool command timed out after 180 s during build, after the main build output; service-worker output was absent and browser verification did not run. Not counted as a build/browser pass. |
| Standalone `pnpm build` | PASS, main and service-worker build completed unchanged. |
| After fix: `pnpm exec playwright test tests/browser/f2l.spec.ts --grep "mixed OLL/PLL" --reporter=list` | PASS, one test, 17.8 s command and 8.0 s body. |
| `pnpm exec vitest run tests/unit/f2l.test.ts tests/unit/f2l-client.test.ts tests/unit/interchange.test.ts tests/unit/ll-boundaries.test.ts` | PASS, 71 tests in four files, 82.57 s. Includes all 3,936 F2L defaults and 7,872 canonical/slot override presentations, varied-LL bases, client stale correspondence and wrong-case/unknown-field/version/import rejection. |
| `pnpm exec playwright test tests/browser/f2l.spec.ts --reporter=list` | Six PASS, one retained update-test FAIL at its unchanged five-second saved-history wait after navigation, 1.8 min. Mixed guidance, default cold offline/player/restore/touch, canonical/slot editor, stale/cancel/cross-tab guards, strict inspection/input/quota and cache repair all passed. |
| Unchanged `pnpm exec playwright test tests/browser/f2l.spec.ts --grep "active real F2L" --reporter=list` | PASS, one retained update test, 42.3 s command and 18.4 s body. The previous failure is retained here; no assertion or timeout was changed. |
| After the last update exercise: `node tests/helpers/bundle-evidence.mjs node_modules/.cache/b09-q03-assets.json` | PASS, final normal main/SW rebuild and 49-asset byte/source/rights inspection, 13 inspected chunks, no rights conflict. |
| Pinned artifact/MIT buffer check, final release identity check and read-only protected-path diff/whitespace/status checks | PASS. All six pinned lengths/hashes and both public/docs/dist MIT copies match. Final evidence and `dist/release-assets.json` share release `review-1790921543862`. |

The retained update failure showed the initial Cross/no-session placeholder after reload, not a confirmed loss of its saved F2L record. Its unchanged focused repeat passed. This observation does not fix, diagnose or erase earlier startup/readiness latency, including the parent's Cross repair warning. No unrelated repair was made. A read-only Windows process inspection also timed out during verification; no process was killed and no cause was inferred.

Final repair bundle sizes are 9,534,291 raw bytes, 7,685,737 gzip bytes and 7,588,122 Brotli bytes. The detailed local evidence and command logs are under ignored `node_modules/.cache/b09-q03-*`. The committed `Time_Attack_Bundle_Evidence.json` remains the earlier parent checkpoint snapshot and is not the current repair `dist` identity.

Only `src/app/F2LPractice.tsx`, `tests/browser/f2l.spec.ts` and this repair appendix were changed by the coder. Read-only status confirmed HEAD remains `335a730a950cac9f2f971aeea0437275836226fb` and origin/main remains `973a8796cb522e2626d86b334e7f9f01733f7a6b`. Protected `.gitattributes`, source/data/license files, pure F2L/LL/cube/case/store/statistics/PWA modules, old unit assertions/timeouts, dependencies and lockfile have no diff. Expected parent Q03/task/master/index/summary changes were preserved, not authored here.

The engine and LL code are unchanged, so the 1,575,936 OLL combination proof and full 260-unit/LL-browser suite were not repeated for this payload-only repair. Their initial and independent Q03 results remain baseline evidence, not newly run checks. Physical-device, installed-PWA, audio/screen-reader and other certification limits remain unchanged. Parent and the same reviewer own re-acceptance. No commit, push, deployment or further trainer work occurred.

Parent inspected the one-line payload-only change and its production regression. The complete algorithm list remains compared after awaits and global/pure validation is unchanged. Parent independently passed lint/typecheck, 39 F2L-client/mixed-backup units, normal build and both new mixed-guidance and retained cross-tab/stale-presentation browser flows in 38.6 seconds. Whitespace passed. This accepts the scoped repair implementation, not the still-pending independent Q03 recheck.
