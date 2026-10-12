# Q04 ZBLL review

## Current gate: PASS after parent follow-up

On 2026-10-12 the owner requested another fix attempt. Parent profiled startup, extended the existing engine-scoped identity cache to OLL/PLL, and reviewed that narrow diff. The cache includes trainer, state format and actual facelets, stores only successful identity calculations, and retains its 512-entry bound. F2L remains uncached. Case legality, source setup, guidance, goal and inventory proofs still run; no worker, storage or readiness check was bypassed.

The measured LL proof fell from 6,951 state decodes to 3,409, and from 1,030 ms to 646 ms in the same diagnostic harness. Five new tests cover reuse, state mutation, engine isolation, trainer separation and warm-cache format/legality rejection. These measurements establish redundant work, not the exact cause of the previous sporadic timeout. Current isolated startup passed both before and after the change.

Actual parent checks on the repaired tree:

- `pnpm lint` and `pnpm typecheck`: PASS. The first typecheck found a readonly test-fixture assignment; the fixture was corrected without changing production behavior.
- `pnpm test`: 351 passed, two existing intentional skips, 24 passed files and two skipped files, 451.97 seconds.
- `pnpm exec playwright test --reporter=list --output=.pi/takomi/oll-fix-full-browser`: 58/58 passed in one unchanged aggregate, 13.6 minutes. This includes the complete OLL/PLL runs, all seven ZBLL flows and the earlier F2L/foundation failures. No assertion, timeout, retry setting or retained browser test changed.
- Normal rebuild and `node tests/helpers/bundle-evidence.mjs docs/audits/ZBLL_Trainer_Bundle_Evidence.json`: PASS, final release `review-1791822200916`, 55 assets. Asset/source/license checks passed.
- All 67 protected tracked source/fixture/license paths match `HEAD` byte-for-byte. All 55 final manifest asset lengths/hashes match dist. `git diff --check`: PASS.
- Focused parent review found no blocking regression in the added cache. Full mathematical and strict import checks passed in the unit aggregate.

Logs are under `.pi/takomi/oll-fix-*`; scratch measurements are under `.pi/takomi/oll-readiness-*` and `oll-startup-*`. This closes the observed acceptance gate. It does not prove the host conditions behind the earlier timeout or certify physical devices, long-session performance or Pages deployment. No new reviewer agent was launched. The original independent FAIL and its evidence follow unchanged.

## Original independent verdict: FAIL, acceptance withheld

The ZBLL implementation passed the focused mathematical, semantic, storage and production checks I ran. No confirmed ZBLL identity, guidance, import or source-integrity defect emerged.

The final browser gate remains failing. My independent complete run passed **57/58**, including all seven ZBLL flows, but failed an existing OLL initial-readiness assertion. This is not a clean aggregate pass.

Review remained read-only apart from permitted ignored scratch, traces and build output. No source, retained test, documentation, task-file or Git writes occurred. Normal `dist` was restored.

## Blocking verification finding

**Q04-01: Existing-trainer initial readiness still misses its unchanged acceptance budget.**

- Command: `pnpm exec playwright test --reporter=list --output=.pi/takomi/q04-full-browser`
- Result: **57 passed, 1 failed**, 15.6 minutes.
- Failure: `tests/browser/ll.spec.ts:33`, full OLL cold-offline flow.
- Failed assertion: `tests/browser/ll.spec.ts:13`, waiting for `Reload to finish setup` within **30,000 ms**.
- Failure snapshot shows `Validating the actual 57 OLL and 21 PLL libraries and cube model…`, with setup still busy.
- Relevant implementation paths: `src/pwa/client.ts:95–120` joins readiness operations; line 109 awaits LL initialization. `src/ll/ll.worker.ts:15` initializes the actual LL library.

This confirms a failed readiness gate, not corrupted OLL records or incorrect ZBLL mathematics. The underlying cause remains unresolved. I cannot assign it to host load, ZBLL contention, worker startup or another cause from the available evidence.

Evidence:

- `.pi/takomi/q04-full-browser.log`
- `.pi/takomi/q04-full-browser/ll-genuine-full-OLL-run-co-d335d-r-and-complete-frozen-links/trace.zip`

The 57-repetition OLL loop did **not** execute in this aggregate because setup failed first. The full 21-repetition PLL loop passed.

## Investigation of the coder's three final failures

I inspected the original logs and all three retained traces before running browsers. Copies remain under `.pi/takomi/q04-retained/`.

The unchanged targeted command passed:

```sh
pnpm exec playwright test tests/browser/f2l.spec.ts tests/browser/foundation.spec.ts --grep 'never-opened cold offline F2L|active real F2L attempt|downloaded update waits' --reporter=list --output=.pi/takomi/q04-targeted-browser
```

**3/3 passed**, 2.7 minutes:

- F2L cold offline: 27.5 seconds.
- F2L real update: 36.4 seconds.
- Foundation all-tab update: 20.1 seconds.

All three also passed in my complete aggregate. Their original causes remain unresolved:

- **F2L cold offline, `f2l.spec.ts:48`:** The original trace shows acknowledged saves for both real attempts before the final reload. Delays included 12.65 seconds clicking Save settings and 3.75 seconds clearing selection. At failure, reload showed `Checking local data`. This does not establish lost history.
- **F2L update, `f2l.spec.ts:186`:** Original challenge preparation consumed 27.12 seconds. The final saved-acknowledgment expectation was cut off by the whole-test deadline after about 134 ms, rather than exhausting its own five-second budget. The trace does not establish a failed write.
- **Foundation update, `foundation.spec.ts:114`:** The original five-second retention assertion failed while the new page showed `Checking local data`. `App.tsx:65` adopts session data after `Repository.read()` completes; `App.tsx:95` renders `No session yet` before that adoption. Persistent data loss was not demonstrated.

Neither the targeted passes nor these observations clear the failed final gate or prove a timing-only root cause.

## Independent commands and results

All browser/build/update exercises ran serially. Retained deadlines and assertions were unchanged.

- `pnpm lint` — PASS.
- `pnpm typecheck` — PASS.
- `pnpm exec vitest run tests/unit/zbll-practice.test.ts tests/unit/zbll-client.test.ts tests/unit/pwa.test.ts tests/unit/pwa-scope.test.ts` — **89 passed**, four files, 25.20 seconds.
- `pnpm exec vitest run tests/unit/zbll.test.ts tests/unit/zbll-source-gate.test.ts tests/unit/ll-boundaries.test.ts tests/unit/f2l-client.test.ts tests/unit/ll-client.test.ts tests/unit/storage.test.ts tests/unit/statistics.test.ts tests/unit/history.test.ts tests/unit/interchange.test.ts tests/unit/timer.test.ts` — **109 passed**, ten files, 190.43 seconds.
- `pnpm exec vitest run tests/unit/case-libraries.test.ts tests/unit/cube.test.ts tests/unit/f2l.test.ts tests/unit/ll.test.ts tests/unit/cross-one-storage.test.ts` — **112 passed**, five files, 242.44 seconds.
- `pnpm exec vitest run --config .pi/takomi/q04-probes.config.ts` — **3 independent scratch probes passed**.
- Targeted browser command above — **3/3 passed**.
- Complete browser command above — **FAIL, 57/58**.
- `pnpm build` — PASS before browsers and after both update-containing commands.
- `node tests/helpers/bundle-evidence.mjs .pi/takomi/q04-bundle-evidence.json` — PASS, final normal rebuild and source/asset inspection.
- `git diff --check` — PASS.

That is **310 retained/new unit tests plus three scratch probes**, not a single full-unit aggregate.

## Verified contracts

### Library and physical correctness

Independently repeated the Cartesian **7,776-state / 494-class / 493 non-solved-case** proof and published-state/source mapping. All 472 non-PLL defaults match independent published cases, rather than merely solving their inverses.

Repeated:

- 47,328 default presentations.
- 47,328 personal-guidance presentations.
- 4,608 proper-ending-regrip presentations.
- 11,832 regrip identity checks.
- B11's 1,181 integration challenges across all memberships and 43 sourced groups.

Family counts, sourced subsets, exact aligned completion, pre-U/yaw conventions and six physical frames passed. Existing 21 PLL objects, IDs, policies and override keys remain shared once within the collection.

### Strict records and mixed guidance

The actual validators check collection/canonical versions, membership, legal state, sourced setup, identity, starting context, physical return and final AUF. See `src/zbll/validation.ts:18–27`.

Twenty-six warm-import forgery dimensions rejected atomically. Independent scratch probes additionally verified:

- Successful proofs are not reused across different engine objects.
- Returned validated snapshots are detached from their inputs.
- Warm caches do not bypass state-format, legality or extra-field rejection.

Real production mixed-guidance flows passed in both directions. Shared PLL editing worked; frozen history survived editing/reset. ZBLL generation filters to actual membership while retaining full global ownership comparisons at `src/app/ZBLLPractice.tsx:86,94–103`. The retained Q03 mixed F2L regression passed.

Version-1 backups remain supported. ZBLL sets/runs and Cross+2 attempts remain closed.

### Production UI, statistics and offline behavior

All seven ZBLL browser flows passed in the independent aggregate. They exercised real generation/timing/saves, all-family controls, recognition visible/ARIA secrecy, interruption/review, quota retry/emergency export, penalty/delete/Undo, forged and genuine restores, shuffled cycles, session changes and stale ownership.

Coverage uses saved canonical cases once, with explicit session/current-pool denominators and DNF/interruption treatment. Compatible summaries separate mode, frame, angles, inspection, selection policies and frozen guidance.

Cold disconnected first ZBLL use, actual player completion, corrupt-worker detection/repair and alternate-release retention of genuine history/settings/shared guidance passed. Alternate releases were prepared outside timed exercises. ZBLL clocks were real; retained full PLL timing used disclosed acceleration.

## Final assets and protected bytes

Final normal release: `review-1791818559100`.

- **55 assets**, 13 inspected chunks, 11 pinned inputs.
- Four covered-source matches; zero source-rights conflicts.
- All manifest hashes/lengths and four exact MIT copies passed.
- Actual required initialization includes `zbll-library-493-v1`.
- ZBLL worker: 761,056 bytes, SHA-256 `df52dca26f5221aa2b867835bb504144e2694380e380eb700c8f59c697bcaf6f`.
- All **67 protected tracked paths** under source data, retained fixtures/evidence/licenses and `.gitattributes` matched `HEAD` byte-for-byte.
- HEAD remained `334716f4ec0af3534ff35a97f6ac0027174d53e2`.

The large-main-chunk warning remains. No optional search/scramble/GPL path was found.

## Inherited evidence and limits

Parent lint/typecheck/89 tests and coder's earlier 346-pass/two-skip unit aggregate are inherited evidence. Earlier 58/58 browser results do not clear the later failures. I did not rerun `pnpm test` as one full aggregate.

Unrun: Pages-subpath browser configuration, Firefox/Safari, physical phones, OS-installed PWA, screen-reader sessions, actual audio audibility, GPU/thermal/battery and long-session certification. Browser/model tests do not prove physical cube completion.

**Parent should retain FAIL and withhold B11 acceptance.** Return the bounded readiness failure for diagnosis without weakening deadlines or making speculative repairs. No further review loop, launch, push or deployment was performed.