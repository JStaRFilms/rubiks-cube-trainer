# Q03 case-trainer acceptance

## Final verdict

PASS, APPROVE after the confirmed mixed-guidance defect was repaired and independently rechecked by the same `reviewer-q03` conversation. The initial FAIL below remains historical evidence. This accepts the implemented case-trainer contracts with the recorded startup and device limits, not a clean aggregate 51-browser certification.

## Initial independent verdict

FAIL, needs changes. Fresh read-only `reviewer-q03`, `openai-codex/gpt-6.1-sol` high, reviewed source checkpoint `335a730`. It did not modify source, tests, docs, configuration, Git or task state. This initial verdict must remain recorded even if the scoped correction passes later.

## Confirmed blocker

Saving a valid OLL or PLL personal algorithm prevents F2L generation. `src/app/F2LPractice.tsx:75–77` sends the complete saved algorithm list to F2L generation. `src/f2l/model.ts:30` calls the correct F2L-only validator, which rejects LL case IDs at `src/cases/overrides.ts:18–19`.

Reviewer reproduced both variants through actual production UI: save the displayed valid OLL or PLL default as personal guidance, switch to F2L, confirm its physical base, start. No challenge appears; the error is `Unknown case ID. Existing overrides are unchanged.` Removing LL guidance permits actual F2L keyboard timing and durable saving. No history was seeded. Trace/screenshots are in ignored `.pi/takomi/q03-mixed-guidance/`.

Repair only the dispatch boundary. Send genuine F2L algorithms into F2L generation, but retain complete algorithm snapshots for global semantic validation and post-await ownership comparisons. Do not broaden F2L's pure validator, discard stored LL algorithms, weaken backup validation or remove stale-result guards. Add a focused production mixed-guidance regression. Parent returns this confirmed defect to the same B09 coder conversation, then the same reviewer for targeted verification.

## Actual independent checks

- Lint, typecheck and build passed.
- Focused Vitest across 12 library/F2L/LL/client/boundary/storage/history/statistics/timer/PWA files passed 193 tests in 239.62 seconds.
- Exact 41/57/21 identities/numbering and Cartesian independence checked, including 3,936 F2L defaults, 7,872 F2L overrides, 656 varied-LL F2L presentations, 7,488 LL defaults, 1,575,936 OLL base/angle/frame combinations, 2,016 PLL AUF and 2,304 ending-regrip checks.
- Production F2L/LL browser command passed thirteen flows in 4.9 minutes, including full 57/21 runs, recognition/ARIA, offline player, inspection, recovery/restore, quota retry, linked history/Undo, cache repair and real update. Full-run clocks were accelerated, not physical solves.
- Four retained Space/inspection/pointer/Cross-repair flows passed in 32.5 seconds. The parent's earlier readiness timeout remains valid evidence; this does not identify its cause or establish a clean aggregate 50-test pass.
- Fourteen warm-cache mutation/forgery probes passed. Mixed-guidance production repro confirmed two failures and one successful F2L control.
- Final independent normal rebuild and 49-asset/source inspection passed, with four cube-tool source matches and no rights conflict. Six pinned hashes/lengths, Windows-filtered artifacts/notices and public/docs/dist MIT copies matched. Reviewer release `review-1790919962542` differs from retained parent snapshot `review-1790918572666`; docs were not rewritten by reviewer.
- HEAD stayed `335a730a950cac9f2f971aeea0437275836226fb`. Diff/index hashes matched intake; protected files remained unchanged. Only expected parent tracking edits existed.

## Limits and next step

Windows Chrome `154.0.8037.95`, viewport/touch and accelerated timer checks only. Physical phones, installed PWA, Firefox/Safari, screen-reader/audibility, GPU/thermal and long-session leaks remain unverified. Intermittent startup/readiness latency is disclosed, not fixed or assigned to host load.

The initial acceptance was blocked on mixed-guidance repair. That defect is now resolved by the targeted recheck below. Stop for hands-on feedback before ZBLL. Do not push or deploy at this checkpoint.

## Repair and targeted independent recheck

The production change is one line in `F2LPractice`: only its generation payload is filtered by the genuine `f2l:` source namespace. Complete selected/stored algorithm snapshots, global semantic validation, pure unknown-case rejection and post-await ownership checks remain unchanged. Canonical setup, frame, guidance precedence and old history are not modified. One focused production regression was added; no old assertion or timeout changed.

The same independent reviewer, `openai-codex/gpt-6.1-sol` medium, returned PASS/APPROVE. It found no new blocker within this bounded recheck. It did not repeat the unchanged exhaustive LL math just to reproduce counts.

| Actual independent command/check | Result |
| --- | --- |
| `pnpm exec vitest run tests/unit/f2l-client.test.ts tests/unit/cross-one-storage.test.ts --reporter=verbose` | 39 passed. |
| `pnpm exec vitest run tests/unit/f2l.test.ts -t "accepts and restores\|rejects forged\|keeps future" --reporter=verbose` | 22 passed, nine outside the selection. |
| `pnpm build` | Main and service worker passed. |
| `pnpm exec playwright test tests/browser/f2l.spec.ts --grep "mixed OLL/PLL\|actual F2L request\|canonical/slot algorithm editor" --reporter=list --output=.pi/takomi/q03-targeted-recheck` | Three passed in 52.7 seconds. |
| Inline genuine semantic/repository checks | Six invalid mixed-backup replacements rejected atomically; three pure F2L rejection probes passed. |
| Final assets/source/notice checks | All 49 emitted hashes, six pinned artifacts and exact MIT copies matched. |

The actual production test saves valid OLL, PLL, canonical F2L and FR-specific F2L algorithms. Generation, keyboard timing, acknowledged saving and frozen review succeed; all four algorithms remain intact and slot-specific precedence holds. There is no seeded history, accelerated clock or physical solve in this mixed-guidance test. An initial disposable inline probe assumed IndexedDB insertion order; correcting only its comparison made it pass. No source or retained test was changed for that probe.

Reviewer normal-build release `review-1790923094712` differed from the retained parent evidence snapshot, as expected from a later build. HEAD remained `335a730` with the narrow uncommitted repair and expected parent tracking edits; diff/index hashes matched recheck intake. Parent refreshed final bundle evidence for the accepted source. Its release `review-1790923520554` matches rebuilt `dist/release-assets.json`, scope `cross-cross1-f2l-oll-pll-practice`, all 49 asset hashes and no source-rights conflict. Six pinned artifacts and exact public/dist/docs MIT copies matched. Parent will commit the repair and acceptance without rewriting history.

Parent independently inspected the same one-line change and passed lint/typecheck, 39 client/mixed-backup units, normal build and two mixed-guidance/stale-cross-tab browser flows in 38.6 seconds, plus whitespace. Coder's pre-fix reproduction, 71-unit repair checks and the retained F2L update-hydration failure with unchanged passing repeat remain in the B09 repair appendix. No clean aggregate 51-test browser run is claimed.

Final staged UTF-8 and thirty local Markdown links passed. Parent's disposable final asset probe initially compared the nonexistent `bytes` field instead of the manifest's `byteLength`, producing false mismatches. After inspecting the schema, the corrected probe verified all 49 SHA-256 hashes and byte lengths with zero mismatches. No artifact, source or manifest was altered to excuse that probe error; the normal bundle inspector had also passed.

All prior physical-device and readiness-latency limits remain unchanged. Q03 is accepted; the next work requires hands-on feedback or another owner instruction, not automatic ZBLL/research/deployment.
