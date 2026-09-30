# Task B05: Prove Cross plus one generation bounds

## Agent setup

### Workflow to follow

vibe-build. Role: coder. Suggested route at session creation: `openai-codex/gpt-6-sol`, high thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/issues/FR-007.md`
- `docs/architecture/Core_Architecture.md`
- `docs/features/Cross_Trainer.md`
- `package.json`

Read PLAN sections 4.2, 6.2, 11. Coverage: FR-007. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Produce measured supported Cross+1 caps and a generator that returns verified cross-plus-pair witnesses.

## Scope

- Prototype bounded search/targeted construction for cross depth <= K and a combined solution <= L, using admissible lower bounds and explicit full-state goals.
- Support any-pair and selected-slot goals consistently; record witness slot/length separately from unobserved user execution.
- Benchmark hit rate, warm/cold latency, cache/memory cost, difficult requests and cancellation on declared conditions. Never label an upper bound globally optimal.
- Document supported UI ranges and budget exhaustion behavior. Do not substitute an unconstrained pair BFS or silently easier tier.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `q01`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- Every returned witness solves the requested full-state goal within its cap and the starting cross satisfies its independent bound.
- Tests cover all slots, any-pair goal choice, stale requests, cancellation and exhausted budgets.
- A measured recommendation defines useful caps/tiers and unsupported requests; uncertainties are explicit.

## Expected artifacts

- Cross+1 solver/generation tests and benchmarks
- docs/audits/Cross_One_Feasibility.md
- docs/features/Cross_One_Trainer.md

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Apply witnesses to full cube states, check independent cross depths, and report measured p50/p95/init/memory results.

## Review checkpoint and handoff

Parent accepts supported ranges before B06. If the strategy fails, stop for an owner decision rather than changing metric.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
