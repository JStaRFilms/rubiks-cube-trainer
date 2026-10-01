# Task B05: Prove Cross plus one generation bounds

## Agent setup

### Workflow to follow

vibe-build. Role: coder. Current dispatch uses `openai-codex/gpt-6.1-sol`, high thinking, from the active registry and routing policy. The owner authorized moving to the next step after the Cross input repair and push.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/issues/FR-007.md`
- `docs/architecture/Core_Architecture.md`
- `docs/features/Cross_Trainer.md`
- `docs/audits/Cross_Trainer_Integration.md`
- `docs/audits/Q01_First_Usable_Increment.md`
- `src/cross/table.ts`, `src/cross/generate.ts`, `src/cross/cross.worker.ts`, `src/cross/client.ts`, `src/cross/validation.ts`
- `src/cube/engine.ts`, `src/cube/frame.ts`, `src/cube/geometry.ts`
- `tests/unit/cross.test.ts`, `tests/helpers/cube-geometry.ts`
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

- Prototype bounded search/targeted construction for cross depth <= K and a combined solution <= L, using admissible lower bounds and explicit full-state goals. Reuse the independently verified Cross table. Pair subgoal distances alone are not a combined goal proof; adding bounds needs a proof, while their maximum is admissible. Evaluate targeted construction/filtering as PLAN requests, then choose from measured results.
- Support any-pair and selected-slot goals consistently; record witness slot/length separately from unobserved user execution.
- Benchmark hit rate, warm/cold latency, cache/memory cost, difficult requests and cancellation on declared conditions. Never label an upper bound globally optimal.
- Document supported UI ranges and budget exhaustion behavior. Preserve requested K/L/options, without exact-K semantics or silent easier tiers. Do not substitute an unconstrained pair BFS. Any-pair search considers all permitted goals; a witnessed slot is not an observed user-executed slot.
- Write the Cross+1 blueprint before substantial changes. Keep production UI, Cross-only backup validation and readiness unchanged until B06. Prototype workers/helpers must not make Cross+1 look delivered.
- Declare the physical starting base and frame that construction actually supports. Do not assume a solved Cross alone determines the tracked pair. A fully solved base is acceptable for this prototype.
- Use only project-owned search and approved pinned parser/model tools. No new dependencies, optional GPL solver/search/scramble paths, external datasets or license assumptions.

## Context

The first Cross loop is implemented and Q01 returned PASS. The owner reported input problems and asked to push and continue. Parent repaired background Space and pointer feedback, verified 31 focused unit tests and the full 32-test Chrome suite, then pushed the accepted cube/timer/Cross/input commits to `origin/main` at `973a879`. This is the stable starting point. Keep input ownership/native control isolation and existing Cross semantics intact. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

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

Apply witnesses to legal full cube states, independently replay actual requested goal/slot/frame, check independent cross depths and report measured p50/p95/init/memory and hit-rate results. Cover supported boundary combinations, all slots/colors, any-pair logic, rejection, stale/cancelled requests and exhausted budgets. Disclose exact benchmark conditions. Physical-phone latency is unverified unless actually measured; recommend provisional desktop/emulation ranges instead of falsely freezing phone tiers. Benchmark scripts may write their own ignored artifacts, not personal history. Do not change Git/branch/orchestration state.

## Review checkpoint and handoff

Parent accepts supported ranges before B06. If the strategy fails, stop for an owner decision rather than changing metric.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
