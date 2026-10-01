# Case libraries verification

B07 implementer handoff. Verdict: PASS for the source-only library slice, pending parent review. This is not B08 F2L delivery, B09 Time Attack delivery or Q03 acceptance.

## Delivered contract

- 41 F2L, 57 OLL and 21 PLL entries in `src/data/`, with exact-ID coverage manifests, separate dataset/identity-policy versions, source labels/aliases, families, legal representatives, canonical setups, defaults and angle rules.
- F2L display numbering maps the complete 1..41 standard inventory in Tomas Lieberkind's MIT source to independently generated defaults in Frederic Abraham's MIT source. Every source number maps once. Neither convention is called universal. Full mapping and pinned URLs/hashes/permissions are in [case sources](../data/Case_Sources.md).
- Pure identity, presentation, intended-case guidance and whole-list override validators in `src/cases/`. Reset filters out the specified override; it does not replace the canonical default. No B07 function opens personal storage.
- `CubeEngine.stickerPermutation` supplies center-normalized source-sticker indices for permutation-invariance proofs. Existing engine operations, versions, wire format and notation limits are unchanged.
- Both MIT notices are retained in source documentation and static offline assets. No dependency, optional solver, search/scramble API or GPL dataset was introduced.

The [feature contract](../features/Case_Libraries.md) was written before code/data-flow changes. Existing trainer validation still accepts only actual Cross/Cross+1 attempts. Case attempts, sets, runs, ZBLL and Cross+2 remain fail-closed until compatible integration exists. Production UI does not import the new case arrays.

## Independent proof conditions

The oracle uses Cartesian sticker positions/turns from the architecture. It does not import production case identity or goal helpers to derive expected classes or replay states.

### F2L

The oracle constructs 150 legal target corner/edge placements with Cross and the other three pairs solved. LL pieces repair orientation sums and parity without changing the target projection. Four pre-U turns produce 42 classes, including solved. Removing solved leaves exactly 41. Production keys have the same one-to-one equivalence partition, and library keys equal the whole independently enumerated non-solved set.

Numbering tests replay each pinned source setup independently, restore centers, identify its sole unsolved slot and map it to canonical FR using proper yaw. Their 41 keys equal the enumerated inventory and the source-to-default fixture. Solved and angle duplicates are excluded.

All 656 default presentations, 41 × four slots × four pre-U turns, replay to the independently transformed target. They preserve initial Cross/other pairs and solve all lower pieces at the end. Every enumerated pair placement, including different LL fillers, is independently aligned by target position/sticker orientation and solved by its mapped default.

For all defaults and every accepted personal algorithm, the symbolic proof requires each final lower sticker to originate from a specified non-LL piece with the correct identity. No final lower sticker can depend on an unspecified LL piece. Thus LL arrangement cannot change the F2L result. Independent Cartesian permutations verify those source indices.

### OLL

The oracle enumerates all 216 legal LL orientation assignments and verifies their legality in the engine. It obtains 58 pre-U/proper-yaw classes, including oriented; removing oriented leaves exactly 57. Masks use the frozen ascending 20-index wire list and ignore permutation.

The oracle also enumerates all 288 oriented LL permutations. There are 24 corner and 24 edge permutations; only equal parities are allowed, giving 24 × 24 / 2 = 288. Engine legality checks confirm every base. For every one of the 57 cases, every pre-U/proper-yaw presentation and every permitted base, independent setup/solution permutations check solved F2L, the intended U occupancy and final LL orientation. This is 262,656 complete setup/default checks, not one solved representative per case.

Production validation uses a permutation-invariance proof. Every allowed base has identical lower stickers and identical U occupancy. A fixed legal move sequence is a sticker permutation, so setup U occupancy is independent of which LL cubie carries a U sticker. The setup must preserve fixed lower stickers. An accepted OLL override must preserve lower pieces independently of LL identities and return the representative's U occupancy to oriented. The same permutation then orients every permitted permutation of that orientation case. The proof accepts net regrips through center normalization.

A correct override appends the sourced T permutation after OLL. All 288 bases remain F2L-solved and LL-oriented, while all 288 final permutations differ from their bases. Both notation and import validators accept it. Wrong OLL cases are rejected. PLL completion is never the OLL acceptance predicate.

### PLL and transforms

All 288 parity-compatible oriented LL permutations yield 22 pre-U/proper-yaw classes, including solved modulo AUF. The 21 library keys equal the full non-solved set. No mirror, inverse or tilt operation enters the quotient. Distinct Ua/Ub, Aa/Ab and G inverse labels remain distinct.

All 336 presentations, 21 × four pre-U turns × four proper yaws, begin from solved/aligned and independently finish solved after the recorded final AUF. Canonical defaults have AUF 0. A correct override ending in U returns final AUF 3, and applying it physically reaches aligned solved. This turn must complete before the next physical PLL setup.

All 119 identities survive each of 24 proper center regrips. Existing cube fixtures verify all six physical color frames and four slot permutations. New symbolic-permutation checks cover all 18 supported move families at quarter/inverse/half amounts, including wide/slice moves and net regrips. Guidance with a final proper regrip is accepted for representative F2L/OLL/PLL cases.

### Overrides and source integrity

All 119 defaults pass whole-list import validation. All 164 F2L slot-specific defaults map back to canonical FR and pass. Malformed notation, wrong-case algorithms, invalid move amounts, duplicate keys, unknown cases/slots/fields and mismatched identity/dataset/engine versions reject without mutating the old list. Reset deletes only the chosen override. Validation and reset leave canonical identity/setup/default data unchanged.

Every retained source artifact has a pinned revision, raw URL, byte length and SHA-256. Tests recompute hashes, compare exact MIT text copies and compare every default algorithm/family to its pinned source field. The ordinary tests are hermetic. Explicit generation first checks all six source/license artifacts against fixed pinned SHA-256 values, then checks source numbering and independent inventory equality before writing library files. It never opens a personal database.

## Actual commands and results

| Command | Actual result |
| --- | --- |
| `CURATE_CASE_LIBRARIES=1 pnpm exec vitest run tests/unit/curate-case-libraries.test.ts` | Passed, one explicit curation check. Repeated after adding exact artifact URLs and fixed pre-write source/license hash checks; passed. Last run took 5.36 seconds. Generated all 119 entries and mapping/source manifests. |
| `pnpm exec vitest run tests/unit/case-libraries.test.ts --reporter=verbose` | Passed, 15 checks in 34.66 seconds before the final symbolic-permutation check was added. |
| `pnpm exec vitest run tests/unit/case-libraries.test.ts tests/unit/cube.test.ts --reporter=verbose` | Final focused check passed, 44 tests across two files in 21.94 seconds. Includes all 16 new library checks and 28 existing cube checks. |
| Relevant regression command below | Passed, 133 tests across nine files in 75.58 seconds. This ran before adding the final symbolic-permutation test; the final focused command covers that addition. |
| `pnpm lint` | Passed. |
| `pnpm typecheck` | Passed. Both main and service-worker strict TypeScript configurations. |
| `pnpm lint && pnpm typecheck` | Final sequential rerun passed. |
| `pnpm build` | Passed client and service-worker builds. |
| `node tests/helpers/bundle-evidence.mjs test-results/b07-bundle-evidence.json` | Passed rebuild and final-byte inspection, 43 assets, 13 chunks and no emitted source-rights conflict. Both added MIT notice assets are in the existing release manifest. |

Relevant regression command:

```sh
pnpm exec vitest run tests/unit/case-libraries.test.ts tests/unit/cube.test.ts tests/unit/cross.test.ts tests/unit/cross-client.test.ts tests/unit/cross-one.test.ts tests/unit/cross-one-client.test.ts tests/unit/cross-one-storage.test.ts tests/unit/storage.test.ts tests/unit/pwa.test.ts
```

### Failures encountered and fixed

- The first explicit curation command pointed at `tests/tools/`, outside the repository's Vitest include. It found no tests. The tool moved to `tests/unit/` and remains skipped unless explicitly enabled. Its rerun passed.
- The first aggregate focused command exceeded its 180-second tool timeout. Isolated runs exposed a test-oracle error: its F2L pre-U alignment included sticker orientation but omitted target location. The oracle now compares both position and orientation. The resulting full checks pass.
- Repeated oracle-key computation and hundreds of thousands of individual matcher allocations exceeded a default test timeout. Keys are now indexed once, and each exhaustive OLL check throws with case/angle/base evidence on a mismatch. The same 262,656 combinations still run. Finite inventory tests have an explicit 15-second limit; heavier regrip/permutation tests retain 60-second limits.
- Initial TypeScript validation rejected an unchecked vertical-coordinate array access. Lower-piece selection now explicitly matches the two permitted coordinates, 0 and -1. Typecheck passed after that correction.
- A parallel lint/typecheck/regression/build batch timed out the combined lint/typecheck tool at 100 seconds. The unit and build jobs passed. Isolated typecheck and the final sequential lint/typecheck command both passed. No check was removed to excuse a failure.

## Boundaries and next action

No trainer screen, physical rep, run recovery, statistics integration, case backup support or case-trainer offline session is claimed. No browser test was rerun for B07; the existing input/timer code was not changed. Physical phones, OS-installed PWA, Firefox/Safari, accessibility, GPU and thermal checks remain unrun. The bundle inspection is an asset/rights check, not an installed-device test.

Changed paths are confined to the feature/source/audit documents, `src/data/`, `src/cases/`, the engine's symbolic-permutation method, focused test/helper/fixture artifacts and retained MIT notice files. No task/master/index/summary, Git state, deployment or external service was changed.

Parent should review this packet and code before B08. After acceptance, B08 may integrate F2L practice using the frozen library/override contracts; B09 follows with the distinct OLL/PLL reset rules. Q03 remains the trainer acceptance gate. No source-rights or inventory blocker remains in this slice.

## Parent acceptance

Parent inspected the symbolic engine change, case identity, presentation and override validation, and read both retained MIT grants. Independent bounded requests to the six pinned raw upstream artifacts matched every recorded SHA-256 and byte length, including both licenses.

Parent independently ran lint, strict typecheck, the full unit suite, build, all eight production Cross/Cross+1 browser cases, a final rebuild after updates and whitespace checks. All passed. The unit suite reported 168 passed and one intentionally skipped explicit curation generator. That generator is not an unfinished assertion; ordinary tests must not regenerate source data. Existing Cross/Cross+1 behavior and its semantic gates remain intact.

B07 is accepted as complete verified library data and pure validators, not as F2L or Time Attack UI delivery. B08 may integrate F2L next. Source and data notices must remain in the distributed offline assets. Physical-device and installed-PWA limits remain unchanged. No push occurred.
