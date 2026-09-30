# Task B08: Deliver F2L case and slot practice

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
- `docs/issues/FR-008.md`
- `package.json`

Read PLAN sections 4.3, 3, 5. Coverage: FR-008, FR-012, FR-013. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Build isolated F2L recognition/execution drills across slots using the verified 41-case inventory.

## Scope

- Generate the target pair case while preserving solved cross and all other pairs; apply tested slot/frame transforms rather than random-cube pair parking.
- Implement family/case subsets, FR or random slots, shown/hidden rotation hints, personal algorithms, execution/recognition modes and post-attempt 3D review.
- Save per-case/slot/hint/mode statistics and helpful setup/goal explanations, without claiming an observed physical rotation.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `b07`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- All 41 cases in all supported slot mappings preserve the isolated context and validate their algorithms.
- Recognition mode hides the case/algorithm until review; all-level explanations and personal override/reset work.
- Offline practice, compatible history and export/import survive restart.

## Expected artifacts

- F2L trainer and slot generation integration
- F2L context/slot/browser tests
- docs/features/F2L_Trainer.md

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Run full case/slot invariants, recognition/override tests and complete offline phone/keyboard flows.

## Review checkpoint and handoff

Do not add the deferred scrambled-other-pairs mode or a lesson course without a new scope decision.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
