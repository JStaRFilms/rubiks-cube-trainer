# ZBLL library

B10 for PLAN 4.5 and 6.3 and FR-010/012. Status: complete pure library, accepted by parent after code/math review, lint/typecheck, 45 tests including the full new proofs, and normal build/source inspection. The [source acceptance review](../audits/ZBLL_Source_Acceptance_Review.md) accepted bounded ZBTrain move-string/necessary-label extraction under the publisher MIT grant. The [verification audit](../audits/ZBLL_Library_Verification.md) records independent coverage, source mapping, presentation and override checks, with both historical BLOCKED source rounds preserved. ZBLL UI, workers, storage, sets, attempts and statistics remain closed until B11 and parent approval.

## Approved coverage and identity

The target is 493 non-solved identities, including the existing 21 PLL cases exactly once. T, U, L, Pi, S and AS each have 72 cases; H has 40; PLL has 21. Exclude solved modulo AUF. Independent Cartesian geometry and published AlphaSheep sticker definitions verify these counts.

Start with solved F2L and all four LL edges oriented. Identity uses every LL piece identity and corner sticker orientation. An OLL occupancy mask is insufficient. Center-normalize, then minimize over four pre-U turns and four proper yaw conjugations. Yaw transforms positions and sticker identities together. Do not quotient by mirror, inverse or x/z tilt.

The independent universe must construct 27 legal corner orientation assignments and 288 matched-parity corner/edge permutations, giving 7,776 legal states. Prove 494 classes including solved modulo AUF, then remove solved to obtain 493. OLL's 216 orientation assignments are not this universe. Expected states, keys and families must come from independent Cartesian geometry, not production helpers or algorithm inversion alone.

## Source and taxonomy gate

The existing pinned MIT Speeden and Lieberkind sources have no ZBLL file in their complete repository trees. The previously inspected Darguima revision also has no ZBLL artifact.

A bounded GitHub repository metadata query found AlphaSheep/Another-ZBLL-Trainer and Stig115/zbll. Neither is accepted as the default source in B10:

- AlphaSheep revision `9cddec702c52e8d6521f8cf7e884f5738f0223a1` has an MIT grant, explicit 493 case labels and corner/edge sticker definitions. Its inspected files supply no default algorithm corpus.
- Stig115 revision `35797fa0e64038df2ac234a2f511bac65bccca67` has an MIT grant and numbered algorithms, but each ZBLL family explicitly names `http://algdb.net/puzzle/333/zbll` as its source. Permission for that attributed collection has not been established. The repository notice is not independent evidence of the upstream collection's permission.

AlphaSheep's source family aliases are `0` = PLL, `A` = AS and `P` = Pi. L, U, S, T and H retain their names. The source's second character names a COLL subset: `0` corners solved, `D` diagonal swap, and `F/R/B/L` adjacent swap front/right/back/left. These names are source conventions, not a universal numbering claim. Each of T/U/L/P/S/A has six 12-label subsets. H has `H0/HD/HF/HR` with 8/8/12/12 labels. PLL has `0D/00/0F` with 5/4/12 labels. The four digits after the hyphen encode edge permutation in the source's declared order.

Label counts alone do not prove physical coverage. The delivered map compares every selected ZBTrain default to independently constructed legal classes and published AlphaSheep full-sticker definitions. `tests/fixtures/zbll-numbering.json` records each source label, source line, raw algorithm, physical return, AlphaSheep reference state/label and independent key. `src/data/zbll-manifest.ts` freezes exact membership and all 40 source-subset-to-published-COLL mappings. Source recognition codes remain verbatim source labels, not universally standardized mnemonics. No Stig115 data is accepted.

## Accepted implementation inputs

Use exact cached ZBTrain `scripts/algorithms.js`, revision `bd5b605d3a5bdc61ebf9925f348de62c406ecd1c`, 196,120 bytes, SHA-256 `0fd439dccfa05a42316dcfad69b74a848378b78c08a3ee0b5b361ce94bc87bdb`. Retain its actual Christian Naguio MIT notice and publisher-reported Roman Strakhov casemap credit. This is not an assertion of original ownership or an independent upstream sublicense. AlphaSheep numbering/sticker definitions, if used, require its actual Brendan James Gray MIT notice. Existing PLL notices remain unchanged.

Extract move strings and necessary family/subset/case labels only. Do not reuse trainer implementation, lessons, diagrams, screenshots or AlgDB GPL code. The source-request budget is exhausted, so reproduction uses retained pinned inputs after hash checks, never network. Missing/corrupt input is a blocker.

Freeze new IDs from source family/subset/case labels, not array position or personal guidance. Keep source subset names `2GLL`, `Diag`, `3` through `6` and source recognition labels explicit; map Sune to S and Antisune to AS without claiming universal numbering. Independently compare all defaults to complete Cartesian classes and separate published AlphaSheep state definitions. A wrong source label/default or coverage mismatch must be reported, not reclassified silently.

## Delivered implementation

`src/data/zbll-cases.ts` contains 472 new immutable-by-type entries using the unchanged CaseEntry shape. `src/data/zbll.ts` adds references to the existing 21 PLL entries. The membership manifest and separate `zbll-sources.json` retain exact IDs, source maps, hashes, grants and credits without changing the old catalog or reproduction metadata.

`src/cases/identity.ts` adds only the ZBLL trainer/policy and oriented-edge predicate. Shared pure validation enforces solved F2L at start and a fully solved final cube. `src/cases/zbll.ts` provides isolated initialization, alias lookup and actual-angle/frame presentation. It reuses B09's physical-return guidance logic. No general catalog framework or database path is added.

Successful new ZBLL canonical-guidance proofs use an engine-local, 512-entry cache keyed by actual representative, identity/policy, moves and pre-AUF. Structural import checks still run every time; invalid records and failed goal proofs are never cached. Existing trainers' canonical validation is unchanged.

Reuse the accepted PLL representatives, setups, defaults and stable IDs `pll:speeden-v1:*`. ZBLL membership references those IDs rather than creating competing PLL identities. Existing PLL aliases and identity policy remain authoritative. A future ZBLL alias must resolve to the existing PLL ID before override lookup, so one canonical override key is shared. Do not accept a second alias-keyed override record. New IDs use `zbll:zbtrain-v1:<family>:<subset>:<recognition-code>` in lower case.

The isolated collection version is `zbll-library-v1`; new non-PLL entry identity uses `zbll-ll-pre-u-yaw-v1`. The manifest declares separate non-PLL and PLL identity policies. Pure presentation reports `collectionVersion` separately from each entry's canonical `datasetVersion` and policy. Existing `cfop-libraries-v1`, F2L/OLL/PLL policy strings, case arrays, IDs, saved attempts and database/export version 1 must remain unchanged. PLL membership retains the PLL entry's accepted version and policy; the ZBLL membership manifest has its own version.

Canonical source data -> independently verified representative/setup/identity -> pure actual-angle presentation -> intended-case guidance validation. Personal algorithms affect guidance only. Setups never depend on overrides. B10 functions must not open IndexedDB or enable global ZBLL semantics.

## Physical setup and guidance

Every setup starts from a fully solved, aligned cube in the displayed down/front frame. An arbitrary oriented LL permutation, allowed for OLL, is invalid here. Setup must preserve solved F2L and oriented LL edges.

Transform setup and guidance together for the actual pre-U/yaw. Validate personal input against that requested state, not some last-layer goal. Restore any net proper ending regrip to the held frame as actual moves before computing and applying final AUF. Preserve B09's physical-return correction. The final replay must be exactly solved and aligned, not merely solved after implicit center normalization.

Pure import validation rejects wrong-case guidance, malformed moves, unknown fields/IDs/slots and incompatible versions without mutating caller data. The one pinned `Pi/4/OsA` source spelling `R3` compiles to the exact equivalent `R'`. This trusted source-only transform does not change personal notation parsing. All 472 first defaults are retained; no alternative or generated solve is substituted. Ending physical regrips are restored before inversion for canonical setup construction and before final AUF for actual guidance. LL overrides use canonical scope only. Reset deletes only the requested override. Verify defaults, valid guidance and wrong-case rejection at all permitted angles and six physical frames.

## Verification and delivery boundary

A complete B10 requires independent 7,776/494/493 proof, exact family/subset/source-label equality, PLL alias equality, every canonical setup/default, all 47,328 case/angle/frame presentations, valid and wrong-case overrides, proper ending regrips and final AUF. Retained 41/57/21 inventories, old identity/version strings, mixed-guidance ownership, strict storage rejection and exact source/license bytes must remain intact.

Source reproduction must be hermetic and explicitly enabled. Ordinary tests must not regenerate sources or access personal storage. Old curation must not erase new metadata. Preserve the existing exhaustive-suite serial policy and timeout budgets.

B10 does not enable UI, attempt/run/set/backup acceptance or statistics. Existing unsupported ZBLL semantics remain fail-closed. A completed pure library would still need parent source/math review before B11 integration and fresh Q04 review. No physical-device, installed-PWA, accessibility, audio or GPU claim follows from mathematical verification.

## Historical owner-authorized source-only follow-up

The owner chose Continue sourcing after the initial BLOCKED result. The second round used 18 of the permitted 20 public GETs, with 30-second caps and no redirects followed. It did not authorize acceptance of unclear defaults, generated guidance or library/math implementation.

Stig115/zbll_brief at `e533adab2eaae9ce57ccbc5801e46f1c6d195006` has the same MIT attribution as the first Stig candidate, but its inspected ZBLL set contains only eight H defaults and still attributes them to AlgDB. It is not a complete alternative.

loltreeman/ZBTrain at `bd5b605d3a5bdc61ebf9925f348de62c406ecd1c` grants MIT rights under Copyright (c) 2026 Christian Naguio. Static inspection found 472 non-PLL labels with nonempty first algorithm strings: T/U/L/Pi/Sune/Antisune 72 each and H 40. The README credits Roman Strakhov for the algorithm/scramble casemap. An upstream redistribution grant was not established; an empty source header cannot supply it. This is a promising structure, not an accepted corpus or physical coverage proof.

The cubing/algdb project at `8fb041204536c122f9aed24f78425b9f5e001ed4` declares GPL version 3 or later for its code. Its inspected contribution/license policy does not establish separate reuse rights for the historical algorithm collection. Covered-code reuse could require copyleft licensing and corresponding-source distribution, materially different obligations that are not authorized here. No GPL code or algorithms were imported. Current AlgDB and Roman landing pages supplied no reusable-data grant.

That source round ended BLOCKED before the later parent source acceptance. Exact grants, metadata and project policy are appended to the [evidence manifest](../data/zbll-source-evidence/manifest.json); unclear defaults remain only in ignored inspection cache. Parent must inspect these findings before any further source decision or B10 math/data work. The initial verdict and all existing trainer/version contracts remain unchanged.
