# Task Q01: Review the first usable offline increment

## Agent setup

### Workflow to follow

vibe-build. Role: reviewer. Current dispatch uses `openai-codex/gpt-6.1-sol`, high thinking, from the active registry and routing policy. The owner authorized this first usable-increment review.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/features/Cross_Trainer.md`
- `docs/audits/Cube_Tools_Integration.md`
- `docs/audits/Timer_Statistics_Integration.md`
- `docs/audits/Cross_Trainer_Integration.md`
- `docs/audits/cross-runtime-evidence.json`
- `docs/design/Training_Experience.md`
- `package.json`

Read PLAN sections 3, 4.1, 5, 7, 11. Coverage: FR-001 through FR-006, FR-013. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Give one focused read-only acceptance review of the complete first Cross increment.

## Scope

- Inspect cross legality/depth/reveal claims, timer boundaries and interruption handling, backup durability, preparation labels, offline readiness and player input isolation.
- Run the narrow relevant existing checks where feasible and distinguish actual results from implementer claims.
- Report only confirmed correctness/security/scope violations as blocking; separate optional advice and unavailable manual browser evidence.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `b04`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- Response gives PASS, FAIL or BLOCKED with exact evidence, tested commands and missing checks.
- Each blocker identifies reproducible behavior and the requirement it violates. No source/document changes are made.

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

Check existing targeted fixtures and a complete offline attempt. Parent passed lint, typecheck, all 103 unit tests and build. Its first browser run passed 30 of 31; the Cross update case exhausted 45 seconds after a 35.774-second synchronous release build. The original coder moved real alternate-release compilation into a worker fixture, without changing the test limit or assertions, and reported a completed 31-test full-suite pass. Parent inspected that repair and repeated lint, typecheck, the real Cross update/history-retention case and whitespace checks; all passed. Dist contains the last test release, so build before browser inspection. Treat reported commands as reported, not your own results. Inspect source/proofs as well as tests. Do not invent iOS/Android coverage.

The implementation agent's final response was unavailable. Parent recovered its audit/source and ran actual checks; no independent B04 PASS has been claimed. Return a clear PASS, FAIL or BLOCKED in your response with exact source locations, actual commands, reproducible confirmed blockers and remaining manual-check limits. Keep the main checkout read-only. Tool-generated test/build files under ignored dist/test-results are permitted; do not write audits, task state or source.

## Review checkpoint and handoff

Parent sends confirmed defects to the same implementer conversation and holds the next delivery gate until resolved.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
