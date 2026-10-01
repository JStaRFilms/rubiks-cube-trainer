# Task B06: Deliver Cross plus one any pair and slot drills

## Agent setup

### Workflow to follow

vibe-build. Role: coder. Current dispatch uses `openai-codex/gpt-6.1-sol`, high thinking. The owner authorized the next step. Parent accepted B05 and now authorizes B06 integration followed by Q02.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/audits/Cross_One_Feasibility.md`
- `docs/audits/cross-one-runtime-evidence.json`
- `docs/features/Cross_One_Trainer.md`
- `docs/audits/Q01_First_Usable_Increment.md`
- `docs/audits/Timer_Statistics_Integration.md`, including the post-Q01 input repair
- `src/cross-one/client.ts`, `src/cross-one/one.worker.ts`, `src/cross-one/validation.ts`, `src/cross-one/generate.ts`
- `src/app/App.tsx`, `src/app/CrossPractice.tsx`, `src/app/TimerPractice.tsx`, `src/app/AttemptHistory.tsx`, `src/app/MoveReview.tsx`
- `src/store/records.ts`, `src/store/repository.ts`, `src/store/validation.ts`
- `src/pwa/client.ts`, `src/pwa/manifest.ts`, `vite.config.ts`
- `docs/design/Training_Experience.md`
- `package.json`

Read PLAN sections 4.2, 3, 5, 7. Coverage: FR-007. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Integrate the accepted Cross+1 generation ranges into the real physical training loop.

## Scope

- Add Cross ceiling K1..8/combined cap L1..12, any-pair default and FR/FL/BR/BL targeting. Parent accepts the construction route with 5,000 ms and 10,000 charged nodes, provisionally for desktop/touch emulation. Preserve requested options and retry without clamping. A useful initial preset is K3/L8; these are ceilings, not guaranteed actual depth/length.
- Connect timing/preparation, per-config history, error/retry behavior and verified-solution 3D review without leaking the witness during inspection.
- Keep generated witness metadata and optional self-reported executed slot distinct. Do not invent an executed slot; it is fine to state that it was not recorded. Hide any-pair witness identity in visible/accessibility output until post-attempt review. Label a found solution, never a global optimum.
- Declare a fully solved physical cube before every scramble and reset/confirm before the next one. Show the saved frame's down/front colors. Cross-only keeps its existing solved-Cross base. Do not assume a Cross-only base determines the pair or representative full state.
- Initialize one genuine Cross/Cross+1 semantic validator facade before App's one-shot Repository creation. Validate full legality/state/scramble/versions/goal/caps/timing and reject unsupported Cross+2/cases/sets/runs/algorithms. Existing backup version/reference checks and atomic confirmed restore remain strict; no fake records or temporary validator.
- Preserve the fixed shared timer's background Space, native/dialog/player ownership, pointer/no-selection feedback, strict inspection boundaries, frozen snapshots, save acknowledgement/recovery and result/history edit/delete/Undo/restore truthfulness.
- Integrate all emitted worker/model/player assets and actual Cross+1 initialization into cache setup/readiness/repair/update handshakes. Prove cold disconnected generation and never-opened post-attempt 3D from a fresh context. Pair arrays are memory-only; separate verified solver caches from personal data.
- Connect cancellation/settings/session/restore/update epochs and worker identity. Suspend pending generation before active timing/player work; no speculative queue. Do not invalidate an already verified immutable presentation through an avoidable worker-lifecycle race.

## Context

B05 is accepted and committed locally as `716fec5`; Cross/input changes through `973a879` were explicitly pushed. Parent repeated B05's 42 focused unit tests, lint/typecheck/build/whitespace and inspected actual construction/full-state validation. Coder measured 192/192 Chrome requests and independently replayed 235 benchmark witnesses. Hardest warm group p50/p95 was 85.1/346.0 ms. These are provisional desktop results, not phone tiers. The owner authorized continuing the trainer sequence. Preserve parent orchestration changes; do not commit/push/change branches or task state. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `b05`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- A complete any-pair and targeted-slot offline drill saves compatible stats and reviews a correctly labeled found solution.
- Settings changes cannot display a challenge for the old goal, and retry never changes selected caps silently.
- Relevant feature documentation and regression tests match the actual supported ranges.

## Expected artifacts

- Cross+1 trainer integration
- Cross+1 browser/configuration fixtures
- updated docs/features/Cross_One_Trainer.md before significant flow changes
- docs/audits/Cross_One_Integration.md with actual commands, failures and offline/runtime evidence

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Run independent witness/goal/frame and strict semantic backup/timing tests, complete any-pair and targeted touch/keyboard/offline flows, cancellation/deferred presentation/update/stale races, real saved history/restore and never-opened player checks, lint/typecheck/build and relevant existing regressions. Inspect final asset hashes/lengths and development worker/player behavior. Record actual conditions and limits; physical iPhone/Android, installed-OS-PWA, assistive/audio/GPU/leak tests are unverified unless actually run. Update-test release preparation stays outside the browser exercise's unchanged time limit. Keep benchmark/test harnesses outside production assets.

## Review checkpoint and handoff

Q02 reviews the completed increment before case-library/trainer work proceeds.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
