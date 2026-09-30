# Task Q02: Review Cross plus one correctness and interactions

## Agent setup

### Workflow to follow

vibe-build. Role: reviewer. Suggested route at session creation: `openai-codex/gpt-6-sol`, medium thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/audits/Cross_One_Feasibility.md`
- `docs/features/Cross_One_Trainer.md`
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

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

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

Replay sampled witnesses with the full cube model and exercise slot/configuration/error flows.

## Review checkpoint and handoff

Resolve confirmed blockers using the original implementer conversation before advancing.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
