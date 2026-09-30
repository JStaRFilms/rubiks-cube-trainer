# Task G01: Map requirements and refresh build guidance

## Agent setup

### Workflow to follow

vibe-genesis. Role: worker. Suggested route at session creation: `openai-codex/gpt-6-luna`, medium thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/Coding_Guidelines.md`
- `docs/Builder_Prompt.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`

Read PLAN sections 1, 2, 10, 11, 12. Coverage: FR-001 through FR-016. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Turn the approved plan into traceable issue packets and current implementation guidance without reopening settled scope.

## Scope

- Use the reserved FR identifiers in the master plan. Author all sixteen issue files, distinguishing early MUS, later committed trainers, and research/future gates.
- Keep PLAN.md authoritative. Update Project_Requirements.md as an index/coverage table, not a competing specification. Refresh the existing Coding_Guidelines.md and Builder_Prompt.md stubs with current constraints and verification expectations.
- Make the old TECHNICAL/AGENTS supersession explicit in guidance. Do not claim the missing app, tests, datasets, or prior milestones exist.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

None. This is the first executable foundation task.

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- Every reserved FR has a self-contained issue with user story, proposed flow, technical considerations, dependencies, and testable acceptance criteria.
- Issue coverage matches the approved trainer/research scope and timer/offline/data decisions without additions.
- Guidelines name the next architecture/design gates and do not authorize implementation or deployments.

## Expected artifacts

- docs/Project_Requirements.md
- docs/Coding_Guidelines.md
- docs/Builder_Prompt.md
- docs/issues/FR-001.md through docs/issues/FR-016.md

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Check issue IDs, links, coverage, and consistency with the approved plan. No application checks are possible before scaffolding.

## Review checkpoint and handoff

Parent reviews coverage and confirms that the original plan remains the source of truth.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
