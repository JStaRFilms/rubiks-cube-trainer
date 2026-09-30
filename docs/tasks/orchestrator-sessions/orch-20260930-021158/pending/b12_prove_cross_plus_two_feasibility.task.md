# Task B12: Prove Cross plus two feasibility

## Agent setup

### Workflow to follow

vibe-build. Role: coder. Suggested route at session creation: `openai-codex/gpt-6-sol`, high thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/audits/Cross_One_Feasibility.md`
- `docs/features/Cross_One_Trainer.md`
- `docs/issues/FR-011.md`
- `package.json`

Read PLAN sections 4.6, 6.2, 11. Coverage: FR-011. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Determine whether verified cross-plus-two-pair generation can meet practical bounded mobile behavior.

## Scope

- Prototype bounded search/constructive generation with independent cross ceiling K and complete two-distinct-pair witness <= L.
- Use proven lower bounds and full-state goal checks. Measure several cap/depth configurations, cold costs, hit rates, memory/cache footprint, long-tail runtime and cancellation.
- Document supported ranges and an explicit go/no-go recommendation. Do not extrapolate one-pair latency or ship assumed huge combined tables.
- If unsuccessful, retain findings and stop; a sequential substitute is a new product decision.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `q06`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- All returned witnesses satisfy the declared cross/two-pair constraints and test fixtures identify distinct solved slots.
- Benchmark conditions and failures support the recommendation without hiding unsupported configurations.
- Owner review is requested before integration; experiment completion alone does not authorize B13.

## Expected artifacts

- Cross+2 feasibility harness/tests/benchmarks
- docs/audits/Cross_Two_Feasibility.md

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Replay full-state witnesses and report p50/p95/worst tails, cold initialization, memory and cancellation for tested conditions.

## Review checkpoint and handoff

Explicit owner go required. Failure must not block already accepted core sharing.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
