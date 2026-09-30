# Task R01: Research local video reconstruction

## Agent setup

### Workflow to follow

vibe-build. Role: coder. Suggested route at session creation: `openai-codex/gpt-6-sol`, high thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/architecture/Core_Architecture.md`
- `docs/architecture/Cube_Tools_Decision.md`
- `shared reconstruction interchange fixtures from B02`

Read PLAN sections 8, 5, 6.2, 12. Coverage: FR-014. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Determine whether uploaded known-scramble video can yield useful locally processed timed moves with honest uncertainty and correction.

## Scope

- Before launch, obtain owner approval of bounded experiment criteria, consented recordings, independent ground truth and an exact isolated worktree cwd. Do not create a worktree or upload videos merely from this packet.
- Verify that the approved plan, this packet, B02 contracts and fixtures are actually present in the isolated checkout. A new Git worktree does not inherit uncommitted or untracked files. Use an approved committed snapshot or an explicitly authorized handoff before launch; do not assume paths from the main checkout exist there.
- Prototype reconstruction and video-aligned move insertion/deletion/replacement. Preserve auto versus user-corrected moves, uncertain spans and the shared versioned interchange format.
- Test framing/lighting, rotations, occlusion, fast solves and 30 fps/higher-fps recordings. A solved final state alone is not proof of exact moves.
- Report normalized move errors, whole-solve exactness, final-state correctness, timing error, abstention, correction effort versus manual reconstruction, runtime/memory/downloads and browser/mobile compatibility.
- A desktop research prototype may precede browser feasibility. Keep the main trainer unmodified and network/server fallback out of scope.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `b02`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- A bounded, reproducible experiment has independently verified ground truth and reports failures instead of inventing hidden turns.
- Timed moves/uncertainty/correction work in the prototype, with measured usefulness and a documented local browser path or explicit blocker.
- Outputs remain in the approved isolated worktree until reviewed; no core dependency or upload behavior is merged automatically.

## Expected artifacts

- isolated-worktree reconstruction prototype and fixtures
- docs/research/Video_Feasibility.md in that worktree
- versioned example reconstruction results

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Use independent annotations, explicit normalization/timing tolerances and full-state replay; separate exact reconstruction from final-state success.

## Review checkpoint and handoff

R02 reviews evidence. Owner go/no-go precedes later video Design/Build task expansion. Resolve launch cwd explicitly in the tool, never only in prose.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
