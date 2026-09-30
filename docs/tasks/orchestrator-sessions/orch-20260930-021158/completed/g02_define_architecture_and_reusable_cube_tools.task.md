# Task G02: Define architecture and reusable cube tools

## Agent setup

### Workflow to follow

vibe-genesis. Role: architect. Suggested route at session creation: `openai-codex/gpt-6-sol`, medium thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/Coding_Guidelines.md`
- `docs/Builder_Prompt.md`
- `docs/issues/FR-001.md`
- `docs/issues/FR-012.md`
- `docs/issues/FR-014.md`

Read PLAN sections 3, 5, 6, 7, 8. Coverage: FR-001 through FR-005, FR-012, FR-014. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Define implementable shared contracts and evaluate reusable cube/player tools before a custom-engine commitment.

## Scope

- Compare established cube models, notation parsers, solver interfaces, and 3D players, including cubing.js. Record package identity, documented support, license, and offline dependencies. Mark vendor performance claims as unmeasured.
- Define frame/color/slot conventions, canonical case identity and trainer-specific goal equivalence, typed worker requests/results/cancellation, and a versioned reconstruction interchange contract.
- Define minimal local stores, IndexedDB/export versioning, safe restore semantics, and offline asset/update readiness. Document the client components, worker flow, data flow, and schema in a feature blueprint.
- Record legitimate candidate case-data sources and coverage conventions. Do not copy restricted content or solve missing datasets by memory transcription.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `g01`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- A reasoned reuse decision and provisional package choice identify what B02 must prove empirically.
- Cube, worker, persistence, case and reconstruction contracts are precise enough for independent implementers.
- The feature blueprint covers client/server boundaries, data flow and local schema; no backend or speculative future stores are introduced.

## Expected artifacts

- docs/architecture/Core_Architecture.md
- docs/architecture/Cube_Tools_Decision.md
- docs/features/Trainer_Foundation.md

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Cross-check all contracts against PLAN, source/license evidence, and OLL versus PLL/ZBLL goal differences. List empirical uncertainties for B02/B05 rather than guessing benchmarks.

## Review checkpoint and handoff

Parent accepts the contracts before D01; substantial changes to agreed behavior go back to the owner.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
