# Task Q02: Review Cross plus one correctness and interactions

## Agent setup

### Workflow to follow

vibe-build. Role: reviewer. Current dispatch uses `openai-codex/gpt-6.1-sol`, high thinking, in fresh read-only context. The owner authorized the next trainer step; parent accepted B05 caps and B06 checks.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/audits/Cross_One_Feasibility.md`
- `docs/features/Cross_One_Trainer.md`
- `docs/audits/Cross_One_Integration.md`
- `docs/audits/cross-one-integration-assets.json`
- `docs/audits/Timer_Statistics_Integration.md`, including the post-Q01 input repair
- `src/cross-one/model.ts`, `src/cross-one/search.ts`, `src/cross-one/generate.ts`, `src/cross-one/client.ts`, `src/cross-one/one.worker.ts`, `src/cross-one/validation.ts`
- `src/app/App.tsx`, `src/app/CrossPractice.tsx`, `src/app/TimerPractice.tsx`, `src/app/AttemptHistory.tsx`, `src/app/MoveReview.tsx`
- `src/store/attempt-timing.ts`, `src/store/trainer-validator.ts`, `src/store/validation.ts`, `src/store/repository.ts`
- `src/pwa/client.ts`, `src/pwa/manifest.ts`, `vite.config.ts`
- `tests/unit/cross-one-storage.test.ts`, `tests/unit/cross-one.test.ts`, `tests/browser/cross-one.spec.ts`
- `package.json`

Read PLAN sections 4.2, 6.2, 11. Coverage: FR-007. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Accept or reject the Cross+1 difficulty, slot and review contract through focused read-only checks.

## Scope

- Check K versus L meaning, all full-state witness goals, any-pair/slot alignment, false-optimality labels and recognition/witness leaks.
- Inspect stale request handling, timeout honesty, compatible statistics and active timer/player responsiveness.
- Verify measured ranges against evidence and record unavailable device checks without broad stylistic review.

## Context

Q01 accepted Cross. Input repair and prior Cross commits are pushed through `973a879`; B05 proof is local `716fec5`. B06 integrates the provisional K1..8/L1..12 any/target range with fully solved base and found-solution review. Parent independently passed lint/typecheck/full 152 unit/build/full 37 Chrome/final rebuild/whitespace on the final B06 snapshot. Implementer independently reported those checks plus Node/Vite smoke and source/41-asset proof. No independent B06 verdict has been claimed yet. Parent owns Git and documents. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `b06`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- A read-only PASS/FAIL/BLOCKED response cites actual evidence and narrow checks.
- Confirmed blockers are actionable and future/speculative suggestions are not treated as required work.

## Expected artifacts

- Read-only verdict in the subagent response; the parent records it.

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Replay witnesses with independent Cartesian helpers as appropriate and exercise slot/configuration/error/offline flows. Confirm the stronger fully solved base before every scramble, hidden any-pair witness/ARIA, self-reported completion versus generated slots, true independent Cross cap and simultaneous final Cross+pair witness. Inspect semantic read/save/history/confirmed atomic backup restore and unsupported-field/group rejection, shared unrounded 15/17-second timing, background Space/native/pointer focus ownership, cancellation/settings/session/restore/update/worker-ID races and separate validation/generation workers. Verify readiness includes a never-opened Cross+1 worker/model/player and does not delete personal data. Parent's actual 152/37 results are reported evidence unless you rerun them. Use proportionate checks, not a new testing campaign. No source/document/task/Git changes. Ignored build/test artifacts are permitted. Physical-phone/PWA/assistive/audio/GPU/leak conditions remain unrun; desktop/emulation is provisional.

## Review checkpoint and handoff

Resolve confirmed blockers using the original implementer conversation before advancing.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
