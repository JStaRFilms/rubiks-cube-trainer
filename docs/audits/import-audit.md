# Audit of inherited project material

Status: audit and scope interview complete. Findings describe the imports as received. The consolidated original plan is ready for owner review.

## Evidence reviewed

- `docs/imports/convo.txt`
- `docs/imports/PLAN.md`
- `docs/imports/TECHNICAL.md`
- `docs/imports/AGENTS.md`
- Repository file inventory, initial commit, project notes, and existing documentation stubs.

The imports were unchanged during the initial audit. The owner subsequently requested updates to the original `docs/imports/PLAN.md`; it now records confirmed takeover decisions. The original claims and "locked" decisions describe the previous effort, not decisions confirmed by the new owner. The imported AGENTS file is also evidence of that effort, rather than a reason to close the interview.

## What exists here

This checkout contains imported documents and project placeholders. `src/` has no application files. There is no package manifest, runnable app, test suite, solver, case dataset, or referenced milestone audit.

The imported AGENTS file claims M0 and M1 are complete, with 48 passing tests, a roughly 110 KB compressed route, and verified offline behavior. None of that can be verified in this checkout. It may accurately describe another repository. Do not count it as delivered work here, and do not decide on a rebuild before locating that repository.

No application checks were run because the implementation and toolchain are absent.

## What the conversation supports

The repeated product idea is a personal speedcubing trainer, available offline and installable as a PWA. Cross difficulty from 1 to 8 moves, Cross+1, Cross+2, ZBLL, and F2L views across slots are named directly.

Video-based solve reconstruction is proposed as a potential standout feature. The participants acknowledge camera quality and fast-turn recognition problems. Smart cubes are mentioned as a more reliable source of moves, but affordability is a concern.

3D visualization appears both as a requested feature and as something unnecessary for the offline goal. Those statements do not settle whether to include it. Offline use itself does not prevent local 3D rendering.

The thread mixes project discussion, model selection, jokes, and unrelated conversation. It does not reliably label speakers. The initial mention of John is not enough to attribute later statements. Product statements can be extracted; ownership of individual statements remains uncertain.

## Scope added or hardened by the inherited plan

The plan makes six trainers, shared timing and statistics, full case libraries, user algorithms, custom practice sets, 3D playback, export/import, and offline persistence part of the proposed product.

Some of these may be wanted, but the conversation does not establish all of them as agreed requirements. In particular, full OLL/PLL Time Attack, desktop-first design, exact technology choices, and the detailed timer/statistics contract need confirmation. "Locked" labels are not evidence of the new owner's consent.

## Confirmed document problems

1. **Progress is not verifiable here.** The imported milestone claims have no accompanying implementation or test evidence in this repository.
2. **The offline promise contradicts the cache strategy.** The plan promises everything offline after first load, but the 3D player is excluded from precaching and cached only after first use. Either download it before declaring offline readiness, or state the narrower guarantee.
3. **Timer requirements conflict.** The plan stores integer milliseconds; the technical timer section says full floating-point milliseconds. Input defaults differ too: hold-to-start versus a later option, and a roughly 50 ms versus 250 ms guard. These need one agreed behavior.
4. **Difficulty is not actually settled.** The plan discusses shortest combined Cross+1/+2 solutions. The technical document initially proposes sequential cross and pair measures. Those are different training metrics. Tier boundaries remain unspecified despite "locked" language.
5. **The cross reveal description is wrong as written.** A path from a random cross coordinate to a chosen depth-K coordinate produces the target state. That path does not also solve that final state. The reveal needs a separate path from the final coordinate to the solved cross.
6. **The F2L generation guarantee is incomplete.** Parking one corner and edge after a random scramble proves their positions, not that the cross and other slots form the intended F2L practice context. An unconstrained 576-state pair table also does not establish shortest insertion while preserving the cross. The desired preserved pieces must be specified before selecting the solver.
7. **Case coverage conflicts with seed coverage.** The plan describes full libraries and full default OLL/PLL sets; the imported progress note reports 12 OLL, 18 PLL, and 2 ZBLL seeds. A valid algorithm also needs validation against its intended case identity. Library sourcing, coverage, and redistribution permission are unresolved.
8. **The sequence follows coding convenience more than confirmed user value.** ZBLL and Time Attack come before Cross, without evidence that they address the owner's main training problem. 3D playback also precedes Cross. That may be the wrong release order.
9. **Performance numbers are targets, not evidence.** No benchmark results or fixed reference device accompany the stated budgets. Solver estimates and rejection-sampling latency require prototypes and measurements, especially for Cross+1/+2.
10. **The quality process has no practical stopping point.** "Loop until perfect" invites repeated scope expansion. Use a bounded correctness review and explicit release criteria instead.

## Important omissions

Video reconstruction is prominent in the conversation but absent from the plan's goals, exclusions, and risk decisions. It needs an explicit decision, not silent omission.

Knowing the scramble constrains reconstruction, but does not remove hand occlusion, motion blur, cube rotations, or ambiguity between visible frames. Frames per second alone cannot guarantee recoverable turns. If selected, this needs a separate feasibility experiment with representative videos, accuracy measures, and a way to expose or correct uncertain moves before promising a trainer built around it.

Offline browser storage also needs a backup and recovery policy. IndexedDB is useful local persistence, but it is not a guarantee against user deletion, storage eviction, or device loss. Export/import should not automatically be left until final polish if personal history matters.

## Provisional recommendation

Locate the old implementation before deciding whether to reuse or rebuild. Choose the first release around one concrete training session the owner wants to use. Keep video reconstruction as a separately evaluated decision. Do not commit to six trainers, a custom cube renderer, or combined optimal solvers just because the inherited plan already lists them.

The replacement plan should distinguish confirmed requirements, hypotheses requiring measurement, later features, and explicit exclusions. Its release criteria should prove the selected training loop works on the agreed devices and satisfies the agreed offline contract.

## First interview decisions

- First audience: the owner and friends.
- First training priority: Cross and first-pair planning.
- Video reconstruction: a prominent parallel research track, not a trainer release dependency. The owner intends to use a separate worktree and agent later, while core development continues. No research agent or worktree is authorized to start now.
- Earlier implementation: the owner says it is no longer available. Locating and auditing it is no longer a prerequisite.
- Planning document: update `docs/imports/PLAN.md` itself at the owner's request rather than creating a competing replacement plan.

The recommendation to locate the earlier implementation is superseded by its unavailability.

## Interview conclusion

The consolidated requirements and detailed delivery gates are in `../imports/PLAN.md`. All six trainers remain in the roadmap, with Cross/Cross+1 and interactive 3D early, F2L/OLL/PLL next, then ZBLL and feasibility-gated Cross+2. The app supports all skill levels, modern iPhone/Android browsers, and desktop.

Cross uses a maximum optimal HTM depth, not an exact-K default. Cross+1 uses verified combined upper bounds, any-pair and optional slot goals. F2L isolates the target pair with cross/other pairs solved. Finished F2L/OLL/PLL trainers require complete verified standard coverage.

Untimed and strict 15-second inspection use roughly 300 ms hold/release execution starts. Total preparation is measured from scramble presentation, hidden during preparation, and visible in results. It includes scrambling; no guessed subtraction is authorized. OLL drills must not assume that a successful OLL algorithm also solves LL permutation.

All included trainer assets, including 3D, must be available offline after setup. Local data and backups come first; sync and sourced, owner-reviewed teaching have later tracks. Video aims for locally processed uploaded footage plus known scramble, timed moves, uncertainty, and correction through a separately authorized worktree experiment.

Both collaborators can contribute; the owner integrates. Working increments have correctness gates rather than a fixed date. Library choice, measured solver caps, video thresholds, and later providers/content are explicitly assigned to evaluation stages. No application or research agent was started.

## Initial interview questions

- Who is the first release for, and what makes it worth building instead of using an existing tool?
- Which training problem should the first release solve?
- Is video reconstruction a release requirement, a research track, or deferred?
- Where is the earlier implementation, and should it be audited before a reuse decision?

These questions and their dependent rounds have been answered or assigned to explicit later evaluation stages in the consolidated plan.
