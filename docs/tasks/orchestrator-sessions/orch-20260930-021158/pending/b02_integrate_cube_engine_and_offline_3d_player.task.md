# Task B02: Integrate cube engine and offline 3D player

## Agent setup

### Workflow to follow

vibe-build. Role: coder. Suggested route at session creation: `openai-codex/gpt-6-sol`, high thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/architecture/Cube_Tools_Decision.md`
- `docs/architecture/Core_Architecture.md`
- `docs/design/Training_Experience.md`
- `docs/features/Trainer_Foundation.md`
- `package.json`

Read PLAN sections 4, 5, 6, 7, 8. Coverage: FR-001, FR-002, FR-012, FR-014. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Prove the selected reusable cube tools and expose one tested logical contract for generators, data, playback and later video research.

## Scope

- Integrate the chosen engine/parser and player with minimal adapters justified by actual API differences. Test face/wide/slice/rotation notation, inversion, color frames and slot conjugation.
- Implement touch orbit/zoom, play/pause, stepping, speed, replay, textual fallback and reduced-motion/error handling without timer input collisions.
- Precache required player code/assets during setup even if rendering imports lazily. Add worker request/result/cancellation scaffolding and the reconstruction interchange type/fixtures from G02.
- Measure real bundle/offline dependency behavior and basic runtime; update the reuse decision if an empirical requirement fails. No default custom renderer rebuild.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `b01`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- Player end states agree with logical moves and independent fixtures, including frames and slot mappings.
- A never-opened player works after disconnecting following setup; all player gestures are isolated from timer control.
- Shared contracts and reconstruction fixtures are usable by an isolated R01 experiment; measured results and license constraints are documented.

## Expected artifacts

- src/cube/
- cube player integration
- src/workers/ generation contract
- reconstruction interchange fixtures
- docs/audits/Cube_Tools_Integration.md

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Run notation/state/player fixtures, production build/bundle inspection, and first-use-offline browser tests. Report manual iOS/Android gaps honestly.

## Review checkpoint and handoff

R01 becomes dependency-eligible here, but still needs its separate owner authorization, samples and explicit worktree cwd.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
