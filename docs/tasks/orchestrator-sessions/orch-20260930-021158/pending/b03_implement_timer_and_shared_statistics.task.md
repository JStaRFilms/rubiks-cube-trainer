# Task B03: Implement timer and shared statistics

## Agent setup

### Workflow to follow

vibe-build. Role: coder. Suggested route at session creation: `openai-codex/gpt-6-sol`, high thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/design/Training_Experience.md`
- `docs/architecture/Core_Architecture.md`
- `docs/issues/FR-003.md`
- `docs/issues/FR-004.md`
- `package.json`

Read PLAN sections 3.2, 3.3, 3.4, 11. Coverage: FR-003, FR-004, FR-013. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Implement the exact physical-practice timer flow and compatible statistics without inventing planning measurements.

## Scope

- Build untimed and strict inspection state machines: first tap begins inspection, subsequent 300 ms hold arms, release begins execution, next press stops. Add 8/12-second warnings and exact 15/17-second penalty boundaries.
- Measure preparation from displayed challenge to execution start, keep its running clock hidden, and persist rounded raw integer milliseconds separately from inspection and penalties.
- Handle repeats, cancelled pointer/keyboard inputs, foreground loss, post-stop guard, and persistence failure. Connect history/edits/undo to real records.
- Implement successful best/mean/median/spread and trimmed ao5/ao12 with explicit DNF rules and configuration-compatible progress views.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `b02`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- Fake-clock tests cover arming/release ordering, exact penalty edges, guard, cancellation and interruption.
- Raw time, preparation, inspection and penalties remain independent throughout save/edit/export/reload.
- Statistics correctly handle DNF/+2 and distinguish preparation from pure planning and case reps from set runs.

## Expected artifacts

- shared timer controls and state machine
- shared history/statistics components
- timer and statistics fixtures

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Run focused fake-clock/statistics tests, persistence round-trips and touch/Space browser flows, then lint/typecheck/build.

## Review checkpoint and handoff

Do not add acoustic detection, inferred scrambling subtraction, or automatic physical completion detection.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
