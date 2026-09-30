# Task B09: Deliver OLL and PLL Time Attack

## Agent setup

### Workflow to follow

vibe-build. Role: coder. Suggested route at session creation: `openai-codex/gpt-6-sol`, high thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/data/Case_Sources.md`
- `docs/design/Training_Experience.md`
- `docs/issues/FR-009.md`
- `package.json`

Read PLAN sections 4.4, 3, 6.4. Coverage: FR-009, FR-012. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Deliver reliable per-case timed runs with custom sets and truthful results for both last-layer trainers.

## Scope

- Build separate OLL and PLL set workflows with full-list defaults, subsets, shuffle, optional AUF, personal algorithms and execution/recognition modes.
- OLL reps begin/end with F2L solved and LL oriented, not necessarily permuted solved. PLL reps require a solved aligned base after final AUF. Explain/reset failed or uncertain reps.
- Persist interrupted runs and per-rep status; report completed/skipped/DNF counts, explicit set-mean policy and compatible membership/settings PB comparisons.
- Use canonical/representative player labels and avoid claiming an unobserved physical permutation.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `b08`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- Full OLL/PLL runs, subsets and overrides work offline with correct setup and reset semantics.
- Interrupted sets recover without duplicate reps or misleading successful run PBs.
- Set membership/configuration comparisons and backup/restore preserve meaningful results.

## Expected artifacts

- Time Attack set/run UI and persistence
- run reset/status/statistics fixtures
- docs/features/Time_Attack.md

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Test OLL setups across admissible LL permutations, PLL final AUF/reset, interrupted runs, DNF/set stats and export/reload.

## Review checkpoint and handoff

Q03 reviews F2L and Time Attack as one related case-based increment.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
