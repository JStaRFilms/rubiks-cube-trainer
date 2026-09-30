# Task R02: Review video reconstruction evidence

## Agent setup

### Workflow to follow

vibe-build. Role: reviewer. Suggested route at session creation: `openai-codex/gpt-6-sol`, medium thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/research/Video_Feasibility.md in the approved R01 worktree`
- `R01 annotated fixtures and interchange results`
- `docs/architecture/Core_Architecture.md`

Read PLAN sections 8, 11. Coverage: FR-014. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Assess whether assisted reconstruction evidence supports an integration decision without mistaking a demo for reliability.

## Scope

- Review ground-truth provenance, sample conditions, alignment conventions, move/timing error calculations, abstention and correction effort.
- Check uncertainty labels, corrected versus detected provenance, full-state replay and any false confidence/accuracy claims.
- Review runtime/download/privacy evidence and missing browser/mobile experiments; do not upload or republish recordings.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `r01`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- Read-only verdict explains demonstrated capability, unsupported conditions and required next measurements.
- The response recommends go/no-go/research continuation and clearly leaves integration approval to the owner.

## Expected artifacts

- Read-only evidence verdict in the subagent response; the parent records it.

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Review the stable R01 snapshot in its approved isolated worktree without writing to it. Set that worktree's exact absolute cwd explicitly at launch. Main-checkout writing remains single-threaded; this review must not mutate either checkout.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Independently recompute representative metrics and compare selected corrections to annotations where access is authorized.

## Review checkpoint and handoff

Expand video UI/integration only after the owner accepts evidence and supported runtime. Core delivery remains independent.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
