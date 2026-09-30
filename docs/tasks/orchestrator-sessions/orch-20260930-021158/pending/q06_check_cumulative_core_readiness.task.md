# Task Q06: Check cumulative core readiness

## Agent setup

### Workflow to follow

vibe-build. Role: reviewer. Suggested route at session creation: `openai-codex/gpt-6-sol`, medium thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/features/Trainer_Foundation.md`
- `docs/features/Cross_Trainer.md`
- `docs/features/Cross_One_Trainer.md`
- `docs/features/F2L_Trainer.md`
- `docs/features/Time_Attack.md`
- `docs/features/ZBLL_Trainer.md`
- `package.json`

Read PLAN sections 7, 10, 11, 12. Coverage: FR-001 through FR-010, FR-012, FR-013. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Provide a release-readiness verdict for the accumulated prioritized core without waiting for research or conditional Cross+2.

## Scope

- Check production build, cache completeness, never-opened trainer/player offline startup, active-attempt update safety, migrations/restore and visible storage failure across integrated modules.
- Review input isolation and shared timer/statistics regressions caused by later trainers, not every previously accepted line again.
- List actual automated and manual browser evidence, remaining blockers and honest roadmap gaps. No production deploy or host mutation.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `q04`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- Response distinguishes ready core, confirmed blockers, unavailable manual checks and still-undelivered roadmap features.
- Actual lint/typecheck/tests/build and cross-feature offline/restore evidence are reported without inheriting old claims.

## Expected artifacts

- Read-only readiness verdict in the subagent response; the parent records it.

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Run justified broader integration checks once; do not recursively reopen accepted work for stylistic suggestions.

## Review checkpoint and handoff

Owner decides when to share or deploy. An undelivered Cross+2 remains visible even if the prioritized core is usable.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
