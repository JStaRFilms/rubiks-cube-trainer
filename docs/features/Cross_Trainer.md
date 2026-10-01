# Cross trainer

B04 blueprint. PLAN 4.1 controls scope. Only Cross is enabled; other trainers stay unavailable.

## Goal and physical base

Practice only the four Cross edges. Maximum depth K is 1 through 8 outer-turn HTM, not exact K. Half turns count once. Hold the chosen color down and the declared front color forward. Start each scramble with that Cross solved and aligned to its side centers. A fully solved cube also works. If unsure after stopping, restore the Cross before Next. Timer stops are self-reported, not observed completion.

The scramble first randomizes a legal full cube with outer turns, solves its Cross, then applies a sampled solved-Cross-to-target path. This maps any Cross-solved physical base to the same four-edge target. Other pieces in review are representative unless the physical base was fully solved. This is not a uniform competition scramble or a full-cube solver.

## Components and flow

- Project-owned four-labeled-edge coordinates and a breadth-first distance table cover 190,080 states. Only 18 outer turns participate. The selected color is a physical frame mapping with Cross at D.
- A module worker loads the pinned model, builds coordinates/table in bounded chunks, yields between chunks, checks cancellation/deadlines, and validates every challenge and stored attempt. No cubing search/scramble imports.
- The disposable solver database retains one-byte distances with pinned engine, contract, frame, table and metric identity plus a trusted SHA-256. Invalid or absent data is rebuilt without touching personal stores.
- A client validates worker instance/request/epoch/version/options/frame and cancels stale jobs. App creates its semantic-validator facade before its one-shot Repository. Initialization and validation are worker RPC operations.
- Start creates/selects a real Cross session, generates and validates a challenge, then waits for visible/idle/no-dialog/no-update/stop-guard conditions before mounting TimerPractice. One TimerController survives successive challenges. Preparation begins in TimerPractice's post-commit layout effect.
- Settings and session changes cancel pending work. Active timing/save recovery remains locked; explicit Cancel attempt records interruption. New presentations never rewrite an active snapshot.
- Saved results are reconciled with current repository records after history edits, deletion/undo and restore. Review uses the immutable saved scramble/start/frame and optimal target-to-solved solution. Entered-move review remains separate.
- Offline setup verifies all emitted Cross/model/player/worker assets and validated table readiness without opening a renderer.

## Persistence

Personal database and backup remain version 1. Existing Challenge, AttemptRecord, SettingsRecord and SessionRecord shapes are reused. Cross options retain K, proof retains actual depth/optimal outer-turn solution, and versions.tables identifies the HTM/frame/coordinate policy. No manual records, cases, runs, catalogs or new trainer families.

The Cross-only SemanticValidator rejects unsupported proof/version/frame/fields and recomputes legal state, scramble equality, exact distance and solution goal/length. It validates all timing/settings fields, allowing rounded 15,000/17,000 ms boundary ambiguity without re-deciding the controller's unrounded penalty. Manual corrections preserve raw timing. Nonempty algorithm/set/run data fails closed. Repository revision checks and transactional confirmed restore remain unchanged.

## Verification

Independent Cartesian sticker moves establish all edge transitions. Exhaustive coordinate bijection, full-graph Bellman conditions and descending paths prove the distance table independently of production BFS. Representative full cube/color fixtures and all K/color generations verify actual state/reveal. Browser evidence, measured bytes/memory/cold/warm timings and unrun physical-device checks belong in docs/audits/Cross_Trainer_Integration.md.
