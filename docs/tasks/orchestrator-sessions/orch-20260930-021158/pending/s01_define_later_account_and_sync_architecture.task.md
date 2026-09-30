# Task S01: Define later account and sync architecture

## Agent setup

### Workflow to follow

vibe-genesis. Role: architect. Suggested route at session creation: `openai-codex/gpt-6-sol`, medium thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/architecture/Core_Architecture.md`
- `docs/features/Trainer_Foundation.md`
- `docs/features/Time_Attack.md`
- `actual local persistence types and migration tests`

Read PLAN sections 9.2, 6.4, 12. Coverage: FR-016. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Specify a safe later cross-device sync design grounded in the actual local schema and approved costs/privacy.

## Scope

- Inspect stable local settings/history/algorithms/sets, export versions and migrations before proposing providers or schema changes.
- Compare hosting/authentication options and define offline writes, stable IDs, duplicate/deleted records, domain-specific conflicts, device loss, authentication failure and account deletion/export.
- Document cost/privacy/security assumptions and explicit decisions needing owner approval. Do not assume naive last-write-wins preserves all data.
- Produce the later implementation/testing decomposition only after architectural choices are accepted; do not create live accounts or infrastructure.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `q03`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- A concrete sync proposal addresses each failure/conflict domain and preserves local-only use and backups.
- Provider, ongoing cost, data retention and external-effect decisions are clearly gated for owner approval.
- A prospective local validation and conflict-test plan exists; no backend/provider changes were executed.

## Expected artifacts

- docs/architecture/Sync_Proposal.md
- docs/features/Account_Sync.md

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Walk concurrent offline edits/deletes/restores through the proposed rules and identify data-loss cases before implementation.

## Review checkpoint and handoff

Owner approves provider/privacy/cost and target before later Build task expansion or any external mutation.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
