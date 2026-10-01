# Task B04: Deliver the complete Cross training loop

## Agent setup

### Workflow to follow

vibe-build. Role: coder. Current route: `openai-codex/gpt-6.1-sol`, high thinking. The owner tested the earlier app and asked to continue. The parent accepted B03 at `dd93527` and authorizes B04, followed by Q01 review. Other trainers, research and deployment remain separately gated.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/issues/FR-006.md`
- `docs/features/Trainer_Foundation.md`
- `docs/design/Training_Experience.md`
- `docs/architecture/Core_Architecture.md`
- `package.json`
- `README.md`
- `docs/audits/Timer_Statistics_Integration.md`
- `docs/audits/Cube_Tools_Integration.md`
- `docs/architecture/Cube_Tools_Decision.md`
- `docs/design/Design_System.md`
- `src/app/App.tsx`, `src/app/TimerPractice.tsx`, `src/timer/controller.ts`
- `src/cube/`, `src/workers/`, `src/store/`, `src/pwa/`, `vite.config.ts`
- Existing timer/history/cube/worker/offline tests

Read PLAN sections 4.1, 3, 5, 7, 11. Coverage: FR-006 plus shared FR-001 through FR-005 and FR-013. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Deliver a usable Cross-only physical practice increment with verified difficulty and optimal 3D review.

## Scope

- Generate legal nontrivial cross states with optimal HTM depth from 1 through selected ceiling K, K in 1..8, for every supported cross color. Record actual depth and disposable cache versions.
- Use a proven distance table/equivalent solver and verify final states. Randomize unrelated pieces without falsely claiming uniform competition scrambles.
- Integrate scramble presentation, timing, configuration statistics, history/backup and post-attempt optimal notation/3D review. The path used to reach a target is not automatically its reveal solution.
- Handle settings changes, stale worker responses, timeouts/cancellation and offline restart without changing requested difficulty.

## Context

B01/B02/B03 are actual implemented predecessors. Current clean HEAD `dd93527` has the entered-move player, persistent settings/sessions, PWA and tested production timer/history/statistics components. B03 does not enable practice without verified challenges. Read its audit for the exact integration API. Parent lint/typecheck/90 unit/build and final 10 Chrome timer tests passed. B03's primary effective-result and elapsed-overtime display findings were fixed before acceptance.

PLAN 4.1 explicitly permits solving a random legal state's cross, then applying a solved-cross-to-target path and independently finding the target-to-solved reveal. Randomize unrelated pieces without claiming uniform competition scrambles. A project-owned projected Cross search/table is the planned route; B02's optional GPL solver paths must not be imported under its MPL review verdict.

Give the owner a clear primary Cross action instead of another unavailable clock. Require the declared physical starting base, show holding colors and solve-only-cross goal, and explain any representative non-cross arrangement in review. Stopping is self-reported physical completion, not camera-based verification. Retain the existing entered-move tool and clearly unavailable other trainer views. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `b03`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- Fixtures/reference checks prove reported depths and optimal reveals across supported colors and ceilings.
- The complete phone/desktop physical-practice loop works without network after setup, including never-opened player and saved history.
- Warm/cold timing, table/cache footprint and UI responsiveness are measured rather than copied from old budgets.

## Expected artifacts

- Cross worker/generator and trainer UI
- cross/color/optimality fixtures and benchmarks
- docs/features/Cross_Trainer.md

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Keep pnpm and the selected A-desktop/B-mobile layout. No visual proposal round or unrelated package upgrades.
- Build bounded/chunked Cross initialization/search in the module worker, not long synchronous UI work. Verify disposable table versions, lengths and a trusted checksum; corruption/mismatch repairs solver data without touching personal history.
- Validate full challenge correspondence and proof before DOM presentation, including instance/request/epoch/version/options/frame/session. Do not adopt hidden-tab, editing, update-locked or stop-guard results into a rejected timer mount. Reconfiguration never changes an active snapshot.
- A compatible Cross-only semantic validator must cover real save/read/import/edit/undo and fail closed for missing case/set/combined-goal prerequisites. Preserve unrounded penalty decisions around rounded 15/17-second edges; manual corrections cannot erase raw timing.
- Keep the saved result truthful after history penalty edits/deletion/restore. No stale 'saved' card for deleted data.
- The parent owns Git integration, board and master-plan state. Do not commit, push, change branches or mark tasks complete.
- Write actual implementation, independent proof checks, benchmark conditions, commands/results and remaining gaps to `docs/audits/Cross_Trainer_Integration.md` and the feature blueprint before reporting.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Run cross reference/property checks, focused timing/storage/offline flows, actual scripts and production build. Record benchmark conditions.

Parent recovery after the missing final agent response found a complete implementation audit. Parent lint/typecheck/103 unit/build checks passed, but the full browser suite passed 30 of 31. The Cross update test exhausted its 45-second overall budget at the post-reload history check. Trace shows 35.774 seconds spent in its synchronous release rebuild and only 1.29 seconds available for the final retention assertion. Do not assume data loss or a transient PASS. Prepare the real alternate release outside the timed browser exercise and activate those actual bytes while execution is active, without raising the test timeout or weakening any retention/update assertion. Resolve this check and rerun the full suite before B04 acceptance.

## Review checkpoint and handoff

Q01 must return a passing scoped verdict before advancing to Cross+1 work.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
