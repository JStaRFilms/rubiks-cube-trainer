# First usable Cross increment review

Q01, session `orch-20260930-021158`. Reviewer conversation `reviewer-q01`, `openai-codex/gpt-6.1-sol`, high thinking, fresh read-only context. The parent received the review response and records it here. The reviewer made no source, document, task, branch or Git changes.

## Verdict

PASS. No confirmed correctness, security or scope blocker. This accepts the first Cross increment, not broad device certification. No repair request follows from this review. Cross+1, other trainers, research and deployment do not begin at this checkpoint.

## What the reviewer checked

The reviewer read the authoritative PLAN, requirements, Cross blueprint and integration audits, actual Cross worker/model/cache/validation code, frame mapping, App/CrossPractice/TimerPractice/AttemptHistory/MoveReview, storage, PWA/build configuration and tests.

- FR-006. `src/cross/validation.ts:21-36` checks legal scramble/start equality, depth 1 through K, exact table distance and an optimal solving reveal. `tests/unit/cross.test.ts:46-100` checks the independent full graph and 144 full-state samples across six colors and K1 through K8.
- FR-002/003. `src/timer/controller.ts:63-100` freezes presentation and decides inspection penalties before rounding. `src/cross/validation.ts:65-70` retains ambiguity at rounded 15,000 and 17,000 ms. Review uses the recorded start/frame.
- Adoption. `src/app/CrossPractice.tsx:29-74` checks epochs, session/settings, worker identity, visibility, dialog/update locks and the stop guard before presentation.
- FR-004/005. `src/store/repository.ts:93-104` acknowledges completed transactions. Browser checks covered result edits, deletion, Undo, backup, confirmed restore and retained history.
- FR-001/013. `src/cross/cache.ts:10-25` checks pinned identity and actual checksum. Rebuilds remain separate from personal data. Browser checks covered cold-offline generation and never-opened 3D review after setup.

## Commands the reviewer ran

| Command | Actual result |
| --- | --- |
| `pnpm exec vitest run tests/unit/cross.test.ts tests/unit/cross-client.test.ts tests/unit/timer.test.ts tests/unit/history.test.ts tests/unit/storage.test.ts tests/unit/pwa.test.ts` | 62 passed; one timed out at the unchanged 60-second generation-test limit. |
| `pnpm exec vitest run tests/unit/cross.test.ts` | Five passed unchanged, including that generation test. |
| `pnpm exec vitest run tests/unit/cube.test.ts tests/unit/statistics.test.ts` | 37 passed. |
| `pnpm build` | Passed three times, including final production rebuild. |
| `pnpm exec playwright test tests/browser/cross.spec.ts tests/browser/cross-update.spec.ts --reporter=list` | Three Cross flows passed; update test timed out. Trace showed a 32.7-second Start click delay. Retained history later appeared correctly. The delay's cause was not isolated. |
| `pnpm exec playwright test tests/browser/cross-update.spec.ts --reporter=list` after rebuild | Passed unchanged, including actual update activation and retained history. |
| `pnpm exec playwright test tests/browser/timer.spec.ts --reporter=list` | Ten passed. |
| `pnpm lint`, `pnpm typecheck`, `git diff --check` | Passed. Git emitted line-ending warnings only. |

Chrome 154.0.8037.59 on Windows. The reviewer did not rerun all 103 unit or 31 browser tests. Those remain the parent and implementer results recorded in `Cross_Trainer_Integration.md`, not reviewer results. Worker mocks are not the independent mathematical proof.

The two combined-run timeout failures remain verification limits. Isolated unchanged reruns passed; no assertion or test timeout was weakened. The reviewer found no reproducible implementation blocker. Do not reinterpret this as proof of stable performance on phones.

## Remaining checks

Physical iPhone Safari and Android Chrome, Firefox, OS-installed PWA restart, assistive technology, actual audible output, GPU memory and long-session leakage remain unverified. Chrome touch emulation is not physical-phone evidence. Cross completion is self-reported. The physical starting Cross must be solved and aligned; non-Cross review pieces are representative unless the starting cube was fully solved.

## Handoff

The parent also checked the final production manifest. All 39 required assets matched their SHA-256 and byte lengths, totaling 8,721,027 bytes. Scope is `cross-practice` with the pinned Cross table identity. Staged project whitespace, UTF-8 decoding and local Markdown links passed; no unstaged changes remained before the commit.

The parent accepts Q01, records task completion and makes the authorized scoped local Git commit. No push or next trainer launch follows automatically. The owner can now try an actual Cross scramble, timed attempt, saved result and optimal review.
