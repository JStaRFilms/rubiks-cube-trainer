# OLL and PLL Time Attack

B09 implementation blueprint. PLAN 4.4 and 6.3, FR-009 and FR-012 control this work. The implementation follows this blueprint. The integration audit records actual passing checks, encountered failures and remaining device limits. Parent review and Q03 remain pending.

## Physical bases

OLL begins with F2L solved and aligned, and LL oriented. Any of the 288 legal oriented LL permutations is allowed. Canonical setup must preserve lower pieces and produce the intended U occupancy from every base. Guidance restores F2L and LL orientation; it may change permutation. Consecutive OLL reps do not require PLL. The cube net and player show a representative permutation, never an observed physical state.

PLL begins fully solved and aligned in the displayed down/front frame. Guidance solves the presented permutation modulo its recorded final AUF. Review includes that AUF. Complete it before Next if following that guidance. If using a different unobserved algorithm, align the physical cube to its centers instead of blindly applying the guide's AUF.

Every rep requires explicit base confirmation, including after resume, skip, failed execution or uncertainty. Timer stop is self-report, not proof of physical completion.

## Components and frozen data

The focused LL runtime uses all 57 OLL and 21 PLL sourced entries. It validates the real model and inventories before readiness. Canonical setup, identity and dataset stay independent of personal guidance. Proper yaw conjugation transforms setup and guidance; presented pre-U is undone before authored pre-AUF and algorithm. Guidance is checked on the actual presented state. OLL uses the existing symbolic lower-sticker and orientation proof. Transformed guidance includes the known return regrip to the held frame when a personal algorithm ends in another orientation. PLL records required final AUF after that return. The frozen move list and player include both steps. Presented/imported guidance must return to the held frame before final AUF.

Time Attack practice owns the selected trainer, custom set, frozen run and base confirmation. TimerPractice and TimerController retain input ownership, hold/release, inspection, activity, visibility interruption, save failure, retry and emergency export. Recognition renders no current identity, family, guidance or identifying explanation before intended stop or deliberate interrupted review. No collapsed hidden review is preloaded.

The algorithm editor validates the complete proposed override list before saving. LL overrides use canonical scope only. F2L canonical and slot overrides remain valid. Reset removes one override. Later changes affect future runs only.

## Schema boundaries

Database and export versions remain 1. Existing IndexedDB stores already include sets and runs. Old valid Cross, Cross+1 and F2L backups remain valid. Unsupported ZBLL and Cross+2 records stay closed.

A practice set stores ID, label, trainer, unique nonempty case membership and creation/update dates. Editing or deleting it does not alter historical set snapshots.

A run retains the existing ID, session, optional set reference, immutable set snapshot, plan, cursor, outcomes, status and dates. LL runs add a required snapshot containing timing settings, frame, angle/order policies, versions and canonical per-case guidance. Each planned rep also stores its actual validated challenge. The comparison key is reconstructed from these validated snapshots, not trusted from an imported string.

Generic records keep these extensions optional, but strict LL validation requires them and returns a narrowed `LLRunRecord` with mandatory snapshot, presentation and interruption fields. The run records whether a rep was durably presented and retains interruption evidence separately from final outcomes. This prevents reload or retry from erasing an interrupted rep's effect on eligibility. No monotonic clock timestamp persists. Attempts link to exactly one run and rep index and must match the frozen challenge, session and timing settings. No duplicate membership, rep index, outcome or attempt link is allowed.

## State and transaction policy

1. Start validates and saves the complete frozen plan before showing any setup. The initial state is active, cursor zero, no outcomes and no presented rep.
2. Base confirmation atomically marks the current rep presented before DOM presentation. Presentation rechecks run cursor/snapshot, session, restore epoch, worker instance, settings and activity after awaits. Generation suspends before timing or player work.
3. Stop saves the attempt, matching outcome and cursor advance in one revision-checked transaction. Acknowledgement follows transaction completion. TimerController's outcome callback supplies the exact frozen next run; no optimistic cursor advance occurs. Retry uses the same attempt and outcome. Identical already-committed writes are idempotent; competing different writes reject.
4. Skip records a skipped outcome without a fabricated time. Interrupted timing records an interrupted outcome, available durations and evidence. Each closes one rep and advances once.
5. Recovery of a presented rep records an interrupted outcome without an invented attempt or execution time. Unpresented active work can resume at its cursor but still requires base confirmation. Restore applies the same recovery rule. Complete means every planned rep has a final outcome, not necessarily success.
6. Abandon records its end and retains prior outcomes. Restart creates a new frozen run; it never overwrites old attempts or reuses links. No active timer resumes across reload.
7. Set and run writes validate the complete resulting backup before opening a transaction, then compare the revision inside it. All writes roll back on quota/error. History deletion changes its linked outcome to interrupted with a null attempt link and invalidates success in the same transaction. Latest Undo restores the exact attempt and prior run snapshot. Penalty edits remain linked and statistics recompute from actual records.

## Statistics and comparison

Summary counts completed, DNF, skipped and interrupted outcomes separately. It shows raw/effective execution, penalty, preparation including scrambling, inspection and actual angles per case. Successful reps provide best, worst and spread. A successful-rep mean is explicitly labeled with its count and is not a set result.

The set mean is DNF when any completed rep is DNF. Incomplete, abandoned, skipped or interrupted runs have no successful set mean or PB. A successful set requires all planned reps completed, no DNF and no interruption evidence. +2 affects effective time only. History deletion or penalty correction recomputes eligibility; interrupted timing cannot become successful through penalty edits.

Compare runs only with identical trainer, sorted membership, frame, mode, inspection, angle policies, dataset/identity versions and canonical guidance snapshot. Actual shuffled order does not distinguish comparison classes, but shuffle policy does. Actual randomized angles do not distinguish classes when their policies match. Full lists and ten-case subsets never share a set PB. Per-case history can guide manual subset selection; no coaching or observed-algorithm claim is made.

## Offline and verification gate

Actual LL library/model initialization joins initial setup alongside required worker/model/player bytes and both MIT notices. Cache-only checks, repair and all-tab safe update keep prior trainers and personal data. Alternate release bytes are prepared before timed update tests, and final source/asset evidence follows the final rebuild.

Required checks include independent Cartesian actual generation for every case, angle and six frames; all 288 OLL bases; permutation-changing OLL guidance; PLL final AUF; full 57/21 plans and genuine timed runs; strict import rejection; atomic start/presentation/attempt/outcome/retry/rollback/races; recovery/restore/linked history/Undo; frozen guidance and comparison policy. Browser flows use production timers, never seeded history. Test clock acceleration must be disclosed. Phone emulation does not certify physical devices, installed PWA, audibility, screen readers or GPU behavior.
