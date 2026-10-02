# F2L trainer

B08 implementation blueprint. PLAN 4.3 and 6.3 and FR-008/012/013 control this slice. The accepted B07 library supplies all 41 identities. OLL/PLL attempts, sets, runs, ZBLL and Cross+2 remain closed.

## Physical base and goal

Before every setup, confirm Cross and all four F2L pairs solved and aligned to their centers. LL orientation and permutation may vary. A fully solved cube works but is not required. Hold the displayed frame's down/front colors. Next returns to this confirmation, never directly to another scramble.

Setup isolates one target pair, preserving Cross and the other three pairs. Guidance must restore all four pairs and Cross. LL is unconstrained. The view and player use a representative LL from a solved base, not observed physical stickers. Timer completion is self-reported.

## Components and data flow

- F2LPractice owns a cancellable F2L worker, request ID, worker instance and epoch. It snapshots preferences, frame, session and restore epoch; checks them again after repository reads; suspends generation before timing or player work.
- The focused F2L runtime initializes the actual model and validates the 41-entry library and manifest. It constructs canonical sourced setup at a selected slot and pre-U, without search or a general catalog framework.
- F2L validation checks exact fields, versions, legal state, setup/scramble equality, canonical identity, preserved isolated context and guidance against the actual presented state. A symbolic sticker proof rejects solutions dependent on unspecified LL pieces.
- App registers genuine F2L semantics in trainerValidator before constructing Repository. A separate validation worker survives generation cancellation. Existing strict timing and session-reference checks remain.
- TimerPractice retains the shared input, inspection, visibility, save-failure and history behavior. Execution may show identity and guidance before execution. Recognition renders neither identity, family, guidance nor identifying explanation until intended stop or explicit post-interruption review. It does not preload hidden accessible review content.
- MoveReview plays the frozen presented setup and solution. Editing or resetting a personal algorithm affects future challenges only.

Confirmed base -> frozen request -> initialized library -> canonical slot/pre-U setup -> actual presented-state guidance proof -> request-correlated result -> post-read ownership checks -> frozen DOM presentation -> TimerController -> semantic validation -> acknowledged transaction -> history and post-attempt review.

## Source, angles and personal algorithms

Stable IDs remain `f2l:lieberkind-v1:001` through `041`, with Lieberkind numbering and Speeden defaults/families. Dataset `cfop-libraries-v1` and identity policy `f2l-fr-pre-u-v1` remain unchanged. Both MIT notices and retained pinned bytes remain distributed. Personal algorithms never change canonical setup or identity.

FR/FL/BR/BL use B07 proper yaw conjugations. Pre-U 0..3 is explicit in preferences or randomly selected. The saved setup identifies its exact pre-U without adding a new challenge field. Slot-specific guidance wins over canonical guidance, then sourced default. Apply the override's explicit pre-AUF in its authored slot, undo the presentation's pre-U first, and conjugate canonical fallback into the actual slot. Validate the resulting complete solution against the actual presented state.

The editor selects case and canonical/slot scope outside active practice. Validate before Save; Repository validates the complete proposed list before opening a revision-checked transaction. Reset deletes one key. Invalid notation, fields, identity, case, slot or versions leave prior data untouched. Save acknowledgement follows transaction completion, not validation.

A requested hint names the rotation/view that brings the slot to a familiar FR view. It never records an observed physical turn. Slot is frame-relative; camera orbit does not change it.

## Schema and comparison compatibility

Database and export versions remain 1. Existing case proof fields store canonical identity, actual setup, frozen complete solution, final AUF 0 and representative=true. No separate manual timing record or demo attempt exists.

Settings gain an optional, precisely decoded `f2lPractice` object with nonempty unique accepted case IDs, FR/random slot policy, requested hint, mode and fixed/random pre-U. Old settings without it use the full library defaults. `GoalOptions.f2l.slot` remains the actual generated slot, not the user's random-slot preference or an observed rotation.

PersonalAlgorithmRecord retains its existing key and version fields. Only accepted F2L cases pass the training-data gate. Nonempty sets/runs and all unsupported trainer attempts still reject. Old valid Cross/Cross+1 version-1 backups remain valid.

Comparison keys include case, actual slot, requested hint, execution/recognition, inspection, physical frame, dataset/identity policy and frozen setup/guidance. Mixed configurations show counts without pooled rankings. Users can select cases manually using compatible history results; no automatic coaching is claimed.

## Offline and verification gate

Release scope adds F2L and pins the case dataset. All emitted F2L worker/library/model bytes and both MIT notices join initial offline setup. Readiness initializes the real 41 cases before any F2L screen is opened. Cache-only recheck, repair and all-tab update isolation retain personal history.

Verification uses independent Cartesian replay for every case/slot/pre-U/six-frame presentation and transformed override. Storage checks cover forged records, closed future groups, atomic rejection/reset and immutable old review. Production browser checks cover recognition accessible output, phone viewport keyboard/pointer, real saves/history/restore, stale ownership, cold offline first use/player, repair and real update/history retention. Shared timer/repository/PWA regressions are relevant because these components are reused.

Actual commands, counts, hashes, failures and device limits belong in `docs/audits/F2L_Trainer_Integration.md`. Parent reviews B08 before B09. No physical-phone, installed-PWA, screen-reader, audio or GPU certification follows from emulation.
