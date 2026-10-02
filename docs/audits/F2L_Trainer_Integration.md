# F2L trainer integration

B08 implementer handoff. Verdict: PASS for the implemented desktop/phone-viewport-emulated contracts, pending parent review before B09. No confirmed blocking defect remains. This is not Q03 acceptance or physical-phone certification.

## Enabled contracts

- All 41 accepted F2L identities, Lieberkind display numbers and Speeden families/defaults. Selection supports all cases, a family/search filter and manual subsets, FR-only or random FR/FL/BR/BL, fixed/random pre-U, requested view hint and execution/recognition.
- Every setup starts from Cross and all four pairs solved and aligned. LL may vary. Each request requires confirmation; Next returns to reset/confirmation. The generated state/net/player has a representative LL, not observed physical unrelated pieces. The final goal restores Cross and all four pairs, with unconstrained LL.
- Generation uses the pinned canonical setup, proper slot conjugation and pre-U, independent of overrides. Actual legality, start/setup/scramble, frame, identity, isolated context and presented-state guidance are validated. Symbolic source-sticker checks require lower-piece completion to be independent of unspecified LL pieces.
- Canonical and slot-specific personal guidance support explicit pre-AUF. Slot override wins, then transformed canonical fallback, then sourced default. Save/reset validates the whole proposed list before a revision-checked transaction and acknowledges only its completion. Wrong case, extra fields, unknown IDs/slots and incompatible versions reject without replacing old data. Setup and old review do not change.
- Recognition renders no generated identity/family/guidance in visible or accessible output before intended stop. Interrupted recognition keeps that information absent until deliberate review. Execution can show it before execution, then hides guidance while running. Requested hint is not an observed rotation, an extra setup move or a claim that the user followed the algorithm.
- Shared TimerController/TimerPractice provides background Space, native control ownership, pointer focus/selection repair, hold/release, strict inspection, visibility interruption, save-pending/failure/retry/emergency export, penalty/delete/Undo and saved-record reconciliation. Saved history can reopen frozen review after restart.
- Real F2L semantic validation is registered before App constructs Repository. Validation has its own serialized worker, separate from cancellable generation. Session references and strict timing decoders remain. Settings add only optional precisely decoded F2L preferences. Database/export versions remain 1; actual generated slot is not a user rotation preference.
- Request ID, epoch, worker instance, options, pre-U setup, frame and versions must correspond. Presentation repeats settings/session/restore/activity/update checks after repository reads. Generation suspends before timer/player work. Rejected/stale presentations do not start preparation.
- Offline readiness checks real library/model initialization before first F2L use, plus all emitted worker/model/player bytes and both MIT notices. Repair preserves history. Real waiting-release activation remains blocked by active attempts and preserves acknowledged history.

OLL/PLL/ZBLL/Cross+2 attempts, OLL/PLL personal algorithms and nonempty practice sets/runs remain closed. No fake attempts, saved demos, manual timing record, solver dependency, new catalog framework, account, deployment or research work was added.

The [feature blueprint](../features/F2L_Trainer.md) was written before implementation. README and Trainer foundation now state the delivered boundaries. Parent orchestration files, Git/index/branches and accepted source/license bytes were not written by this worker.

## Independent proof and regression coverage

`tests/unit/f2l.test.ts` checks actual generated presentations with the Cartesian oracle, not production identity/goal helpers as its expected result.

- 3,936 default presentations, 41 cases × four slots × four pre-U turns × six frames. Each actual setup/start is independently replayed; target identity, preserved Cross/other pairs and final lower pieces are checked. Strict production decoding is then exercised on the same real result.
- 7,872 accepted canonical/slot-specific transformed override presentations across that same product. Explicit override pre-AUF is honored, precedence is checked and independent final replay solves the actual presented state. Canonical setup, identity and library bytes stay unchanged.
- 656 presentations from legal bases with varied LL permutation and orientation. The oracle combines independent LL fixtures, verifies legality, then checks the isolated identity and complete lower-piece goal. The symbolic validator covers arbitrary LL arrangements beyond these sampled bases.
- Precise old/new settings, frozen attempts, atomic algorithm rejection/reset/restore, 20 forged attempt variants, invalid algorithm fields/versions, closed future groups, compatible statistics and four unrounded 15/17-second boundaries.

`f2l-client.test.ts` has 12 request/worker tests using an actual generated legal case, not a solved fake result. They cover request ID, epoch, frame, versions, case, slot, hint, mode, pre-U, caller mutation, old worker replies, cancellation, watchdog and crash.

The additional Cross+1 storage check creates real Cross, Cross+1 and F2L records, restores a mixed version-1 backup with the integrated validator, and verifies future trainer attempts fail closed. Old Cross+1-only backup validation remains unchanged. All B07 coverage/source tests remain in the full suite.

Six production F2L browser flows exercise cold disconnected first use and never-opened 3D; visible/ARIA recognition checks; real keyboard/touch saves; phone viewports; confirmation on Next; canonical/slot editor with pre-AUF, wrong-case and quota rejection; frozen history after edits/reset/restart; actual history edits/delete/Undo/restore; delayed real request dispatch, cancellation/dialog deferral/restore and cross-tab settings adoption; strict first-inspection action, Enter isolation and interrupted recognition; corrupt actual F2L worker cache/reconnection repair; and an actual active-attempt update with retained history. Only dispatch timing is delayed in the ownership test; replies still come from the real worker.

Full shared regressions are justified because B08 integrates TimerPractice, MoveReview, Repository, statistics, settings and PWA readiness. No retained update assertion was skipped or extended. The update fixture builds alternate actual release bytes outside the timed exercise. Final dist was rebuilt afterward.

## Actual commands and results

| Command | Actual result |
| --- | --- |
| `pnpm exec vitest run tests/unit/f2l.test.ts --reporter=verbose` | 31 passed in 83.81 s. Includes the full default/override products and variable-LL checks. |
| `pnpm exec vitest run tests/unit/f2l-client.test.ts tests/unit/cross-one-storage.test.ts tests/unit/pwa.test.ts` | 49 passed in 5.85 s after correcting a new test's record-order assumption. This run preceded the final pre-U client mismatch check. |
| `pnpm lint && pnpm typecheck && pnpm test` | Passed lint and both strict TypeScript configurations. Full suite: 212 passed, one intentional curation-generator skip, 15 passing files in 86.77 s. |
| `pnpm build` | Passed client and service-worker builds during focused verification. |
| `pnpm exec playwright test --reporter=list` | All 43 passed in 6.3 min, including six F2L and all retained Cross/Cross+1/timer/review/foundation/update cases. Chrome 154.0.8037.59, Windows. |
| `pnpm exec playwright test tests/browser/f2l.spec.ts --reporter=list` | Final six F2L flows passed in 1.5 min after default/alternate guidance labeling was clarified. Actual alternate-release preparation took 12,600 ms outside the update exercise. |
| `pnpm lint && pnpm typecheck && pnpm exec vitest run tests/unit/f2l-client.test.ts tests/unit/pwa.test.ts` | Final rerun passed, 23 tests across two files, after deleting an unused challenge-validation RPC branch. |
| `node tests/helpers/bundle-evidence.mjs docs/audits/F2L_Bundle_Evidence.json` | Final rebuild and final-byte inspection passed: 46 required assets, 13 inspected app chunks, all reachable emitted dependencies cached, four covered cubing source matches, no source-rights conflict. |
| `pnpm exec playwright test tests/browser/f2l.spec.ts --grep 'never-opened\|canonical/slot' --reporter=list` | Final two flows passed in 34.8 s against the simplified worker and final build. They do not publish an alternate release, so dist still matches the retained evidence. |
| Read-only Node final-manifest/source assertions | Passed scope/dataset/actual initialization, worker/notices, manifest/evidence release equality and no test modules in emitted app chunks. Six pinned local artifact SHA-256/lengths and four exact MIT copies matched. |
| `git diff --check` | Passed. Windows line-ending warnings only. All 36 B08 files passed UTF-8/whitespace checks, and 14 local Markdown links resolved. |

## Failures found and corrected

- Initial editor loading triggered the repository's effect lint rule. Initial asynchronous loading now occurs through the async callback; unused suppression/ref warnings were removed. Lint/typecheck passed afterward.
- Typecheck rejected captured possibly-undefined test cases and a union alias that lost narrowing. Narrowed constants/local guards fixed those tests without casts.
- A new mixed-backup unit assertion assumed write order. IndexedDB returns key order. It now compares all unchanged records in key order; the test passes.
- The first six-flow browser run had five passes and one editor-test failure. That test also assumed array index meant newest attempt. It now identifies the second real rep by its distinct ID. The focused rerun and later full/final runs pass, including the unchanged override-precedence assertion.
- Focused review found that client correlation should verify requested pre-U as well as GoalOptions. It now compares the exact requested canonical slot/pre-U setup, with a retained mismatch test.
- Review clarified the difference between source-default attribution and frozen alternate guidance, and that a view hint is not an extra setup move. The final six flows pass after that copy correction.

No production defect was hidden by changing a retained assertion, extending a timed update, clamping options or enabling a missing semantic gate.

## Final assets and source integrity

The implementer's final release was `review-1790902725397`, scope `cross-cross1-f2l-practice`, dataset `cfop-libraries-v1`, including `f2l-library-41-v1` initialization. Full per-asset hashes, dependencies and package source checks are retained in [bundle evidence](F2L_Bundle_Evidence.json).

| Required asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `/assets/f2l.worker-DLj-7GSw.js` | 117,936 | `4143502be3bca1d5492266e6edd9aad171c5baaffe59a5c7985e1cd6e0719364` |
| `/licenses/cases-Lieberkind-MIT.txt` | 1,060 | `91a5d1c8d45907d3f7037573ef3a69cd4d6d6445248e4086c79f50ba91ba7890` |
| `/licenses/cases-Speeden-MIT.txt` | 1,073 | `d914d96c915513f9e6b33d8d77de314730286a264bf1de55ba057d12c37b13ff` |

Final executable assets total 2,042,210 raw bytes, 541,405 gzip bytes. Required application assets excluding the covered source archive total 2,091,702 raw bytes, 558,481 gzip bytes. All required assets including that archive total 9,144,421 raw bytes. These are asset sums, not a phone memory or transfer-performance claim.

The six retained source artifact hashes still equal [Case sources](../data/Case_Sources.md): both MIT grants, Speeden F2L/OLL/PLL files and Lieberkind numbering. A direct local check recomputed each SHA-256/length and compared both documentation and public MIT copies byte-for-byte. B08 did not repeat the parent's six live upstream requests, scrape content or regenerate source data. `.gitattributes` and all accepted artifacts/notices remain unchanged.

## Files and handoff

New runtime/UI files are `src/f2l/{model,validation,protocol,client,f2l.worker}.ts` and `src/app/F2L{Practice,Settings,Algorithms,CaseView}.tsx`. Narrow integrations touch App, TimerPractice, MoveReview, AttemptHistory, styles, case guidance/override validation, settings/records/repository/trainer validator, comparison keys, PWA manifest/client/initialization and Vite manifest generation. Tests add F2L unit/client/browser coverage and update the actual PWA contract plus one backward-compatible storage check. Documentation consists of the F2L blueprint/audit/evidence, README and foundation status.

No remaining blocker is known. Parent should review B08 before B09. Only Cross, Cross+1, actual F2L attempts and accepted F2L personal algorithms are enabled. Future sets/runs/trainers remain refused.

Physical iPhone/Android, Safari/Firefox, OS-installed PWA lifecycle, screen readers, actual audio audibility, GPU/process peaks, thermal/battery and long-session leaks are unverified. Phone viewports and desktop touch emulation do not certify them. No deployment, external data mutation or Git/task/orchestration write occurred.

## Parent review and acceptance

Parent inspected generation/presentation ownership, exact F2L decoding, guidance/override selection, semantic registration, recognition rendering, comparison keys and revision-checked algorithm transactions. No confirmed blocker was found.

Parent independently passed lint, strict typecheck, all 212 unit tests with the intentional curation-generator skip, build, all fourteen F2L/Cross/Cross+1 production Chrome flows and four additional background-Space/inspection/pointer/cache regressions. Parent refreshed `F2L_Bundle_Evidence.json` with an actual final rebuild and 46-asset/source inspection after update exercises. Whitespace checks passed. The implementer's 43-case full browser run above remains implementer evidence; parent did not claim to repeat all 43.

The first parent input-regression invocation failed in the Windows command wrapper because POSIX single quotes did not protect `|` in the grep expression. The identical expression rerun with Windows-compatible double quotes passed all four tests. This was a launcher error, not a timer defect; no test/assertion or source behavior changed.

B08 is accepted for actual F2L practice with existing device limits. B09 may integrate OLL/PLL next; Q03 remains the independent case-trainer acceptance gate. Nothing was pushed or deployed.
