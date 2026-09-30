# Task B07: Curate verified F2L OLL and PLL libraries

## Agent setup

### Workflow to follow

vibe-build. Role: worker. Suggested route at session creation: `openai-codex/gpt-6-luna`, high thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/architecture/Core_Architecture.md`
- `docs/architecture/Cube_Tools_Decision.md`
- `docs/issues/FR-008.md`
- `docs/issues/FR-009.md`
- `docs/issues/FR-012.md`
- `package.json`

Read PLAN sections 4.3, 4.4, 6.3, 11. Coverage: FR-008, FR-009, FR-012. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Supply full legitimate case inventories with verified identities and trainer-specific validation rules.

## Scope

- Curate sourced 41 F2L, 57 OLL and 21 PLL inventories with stable IDs, canonical cases, default algorithms, source/license records, setup/AUF conventions and coverage manifests.
- Use engine fixtures to verify identities and required preserved pieces. OLL equivalence concerns orientation with F2L preserved, not a requirement that every correct override solves PLL.
- Implement/import focused case validation and personal-override checks without changing canonical identity when an algorithm changes. Do not transcribe missing algorithms from memory.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `q02`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- Manifests account for all requested canonical cases without counting solved/angle duplicates as coverage.
- Every setup/default/override rule passes intended-case and preserved-context fixtures, including OLL under permissible LL permutations.
- Source rights and attribution are recorded; unavailable legitimate data is a reported blocker, not fabricated content.

## Expected artifacts

- src/data/ F2L OLL PLL libraries and manifests
- case identity and override fixtures
- docs/data/Case_Sources.md

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Run full inventory/identity/setup/override validation and source/license checks before a complete-library claim.

## Review checkpoint and handoff

B08/B09 consume verified coverage. Clearly marked previews may be partial, completed trainers may not.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
