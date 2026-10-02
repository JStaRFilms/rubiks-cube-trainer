# Case libraries

B07 library contract. PLAN §§4.3, 4.4 and 6.3 and Core architecture control the behavior. B07 itself added data and pure validators, not trainer UI. Parent accepted B07 and the subsequent [B08 F2L integration](F2L_Trainer.md). Genuine F2L attempts and personal algorithms now persist through strict validation. Time Attack attempts/sets/runs remain closed until B09.

## Sources and rights

Inspect pinned reusable source files before importing them. The selected candidate is Frederic Abraham's MIT-licensed Speeden & Cuben, revision `3aaf127b0013cbbfd16d12b397d8c0ff8c912c65`. Its F2L inventory is mathematically generated and has its own numbering. Map those defaults by independently checked identity to cases 1..41 in Tomas Lieberkind's MIT-licensed F2L trainer, revision `76fcfccf522f12822db8699209a6a934c4d28421`. Exclude that source's extended cases 42+. Do not describe either numbering as a universal convention. OLL uses source numbers 1..57 and PLL uses source letter labels. Exact MIT notices, artifact hashes and the verified source-to-canonical mapping are in [case sources](../data/Case_Sources.md). The independent coverage/rights checks pass for this source-only slice. Parent review remains required before trainer integration.

## Components and flow

- `src/data/` holds immutable source-derived entries, coverage manifests and source/license metadata.
- Focused pure case functions compute identity, present canonical setups at supported angles, and validate guidance. They use the approved cube engine and notation parser, not search/scramble APIs.
- Independent Cartesian fixtures enumerate legal pair placements, LL orientations and parity-compatible LL permutations. They replay setups/defaults without using production identity helpers as their expected result.
- Personal algorithms are inputs to validation only. No B07 function writes IndexedDB. A future trainer validates the whole proposed import before any transaction. Reset removes an override; it never edits canonical data.

Canonical data → engine legality/context/identity checks → immutable library entry → angle-specific setup and guidance. Overrides replace guidance only after intended-case and final-goal checks; rejection leaves caller data unchanged.

## Identity and presentation

Center-normalize before goal checks. Only proper rotations are allowed. Camera orbit is not a move.

F2L projects the canonical FR target corner DFR and edge FR as location plus sticker orientation, excluding LL arrangement. Normalize selected slots back to FR, then take the lexicographic minimum over four pre-U turns. Enumerate the 150 isolated pair placements. Their quotient must contain 42 identities including solved, hence 41 non-solved entries. A source inventory with missing or duplicate identities blocks B07. FR/FL/BR/BL use the existing proper yaw conjugations. Cross and other three pairs start solved; all four pairs and Cross finish solved. LL remains unconstrained.

OLL projects U occupancy at the frozen ascending 20 wire indices. Canonicalize over four pre-U turns and four proper yaw conjugations, ignoring LL permutation. Enumerate legal LL orientations to prove 57 non-oriented classes. Setups apply to any F2L-solved, LL-oriented legal base. Defaults and overrides must preserve F2L and orient LL for all 288 parity-compatible LL permutations. Solving PLL is not required.

PLL projects the oriented LL permutation under the same explicit pre-U/proper-yaw quotient, without mirror, inverse or tilt equivalence. Enumerate 288 parity-compatible permutations to prove 21 non-solved classes. Present every setup from solved/aligned. Guidance records its required final AUF; the physical cube must complete it before another setup.

A presented pre-U turn is undone before canonical guidance, and a yaw maps both setup and guidance by conjugation. A source algorithm is not automatically valid at every angle without that transformation.

## Schema and version boundaries

Each entry has a stable source-qualified ID, trainer, source label/alias, family, representative legal facelet state, identity policy/key, canonical setup, default guidance, angle rules and source/dataset version. Coverage manifests list expected IDs and solved exclusion. Defaults remain independent of personal algorithms.

The case dataset and identity policies have separate version strings. B07 does not change the cube wire contract, database/export versions, Cross/Cross+1 engine/dataset/table versions, or existing history validation. Unsupported trainers and case persistence remain fail-closed until their actual integrations exist.

## Verification gate

Completion requires exact inventory equality, solved exclusion, no angle duplicates, lawful source attribution, independent replays, every F2L slot/angle, OLL permutation robustness, PLL source identity/final AUF, and correct versus wrong-case/malformed guidance tests. [Verification](../audits/Case_Libraries_Verification.md) records the passing checks, proof conditions and failures corrected during implementation. No phone, install, accessibility or GPU claims follow from these library tests.
