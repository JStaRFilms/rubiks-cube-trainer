# Case sources

B07 uses two pinned MIT artifacts. Public availability alone was not the rights basis. Both repositories grant copying, modification and redistribution of the software and associated documentation, subject to retaining the copyright/permission notice. No inspected data file has a conflicting license or third-party exclusion. No GPL solver, cubing search/scramble import, site scraping, diagram or lesson transcription is used.

## Accepted artifacts

### Speeden & Cuben

- Author/attribution: Copyright (c) 2026 Frederic Abraham.
- Repository: https://github.com/Blaxzter/speeden-and-cuben
- Revision: `3aaf127b0013cbbfd16d12b397d8c0ff8c912c65`.
- License: [pinned MIT grant](https://raw.githubusercontent.com/Blaxzter/speeden-and-cuben/3aaf127b0013cbbfd16d12b397d8c0ff8c912c65/LICENSE), retained verbatim in [Speeden_MIT.txt](licenses/Speeden_MIT.txt) and `public/licenses/cases-Speeden-MIT.txt`.
- Exact algorithm files: `src/data/f2l.ts`, `src/data/oll.ts`, `src/data/pll.ts` at that revision. `src/data/sources.json` records each full raw URL, SHA-256 and byte length. Exact bytes are retained under `tests/fixtures/case-sources/`.
- Reused fields: first algorithm, source label and family. No instructional hints, names, diagrams or UI code are bundled as trainer content.
- The source README describes its F2L enumeration/search and independent class counts. Those claims were not accepted as our verification. The local Cartesian oracle proves coverage and mapping separately.

### F2L trainer

- Author/attribution: Copyright (c) 2020 Tomas Lieberkind.
- Repository: https://github.com/lieberkind/f2l-trainer
- Revision: `76fcfccf522f12822db8699209a6a934c4d28421`.
- License: [pinned MIT grant](https://raw.githubusercontent.com/lieberkind/f2l-trainer/76fcfccf522f12822db8699209a6a934c4d28421/LICENSE.md), retained verbatim in [Lieberkind_MIT.txt](licenses/Lieberkind_MIT.txt) and `public/licenses/cases-Lieberkind-MIT.txt`.
- Numbering artifact: [src/algs.ts](https://raw.githubusercontent.com/lieberkind/f2l-trainer/76fcfccf522f12822db8699209a6a934c4d28421/src/algs.ts). Its `all-algs` set explicitly selects 1..41; later entries 42+ are excluded. We use the numbered setup states to map the standard 41-case inventory, not its alternate algorithms marked for empty-slot contexts.
- Source setups sometimes target FL or end in a regrip. Independent replay first restores centers, identifies the sole unsolved slot, and maps it to FR by proper yaw conjugation. The resulting 41 distinct keys equal the independently enumerated non-solved inventory exactly.

Rights verdict: accepted for this bounded reuse under MIT, with both notices retained. These grants do not impose GPL or another whole-project license. They do not establish rights for unrelated collections. Source attribution and exact license copies must remain with distributed derivatives. Static notice assets already join the existing offline asset manifest; the case arrays themselves are not imported by production UI yet.

## Artifact integrity

| Retained artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| speeden-LICENSE.txt | 1073 | d914d96c915513f9e6b33d8d77de314730286a264bf1de55ba057d12c37b13ff |
| speeden-f2l.ts.txt | 14764 | aa6ba2d806acc4b8d0f43b5c1b94eaf42703080afd200663fd7824317af69863 |
| speeden-oll.ts.txt | 9071 | 751e5c803655b7858f2d90093123aed9688aa7e770484655a121e87f74c4fdac |
| speeden-pll.ts.txt | 4129 | 386e41d9d913da5718980c7edfac0cd722db6c4ea77fa375b27e941c6c8a6376 |
| lieberkind-LICENSE.md.txt | 1060 | 91a5d1c8d45907d3f7037573ef3a69cd4d6d6445248e4086c79f50ba91ba7890 |
| lieberkind-algs.ts.txt | 9162 | 4c3165dd8127377ad2e914c869b4def8e41b6ef24e6e46834187e554a0d82625 |

## Numbering and equivalence

Dataset `cfop-libraries-v1` freezes these source conventions. Numbering is not claimed to be universal across websites. Stable IDs identify source-qualified cases, never personal algorithm strings.

F2L display numbers use Lieberkind 1..41. Defaults use the corresponding Speeden generated case below. `tests/fixtures/case-numbering.json` retains the source setup, selected source slot, normalized FR state, independent key and canonical ID for every mapping. The test replays the pinned numbered artifact independently rather than trusting that generated fixture.

| F2L display/source number | Speeden default source number | Canonical ID |
| ---: | ---: | --- |
| 1 | 10 | f2l:lieberkind-v1:001 |
| 2 | 14 | f2l:lieberkind-v1:002 |
| 3 | 24 | f2l:lieberkind-v1:003 |
| 4 | 11 | f2l:lieberkind-v1:004 |
| 5 | 16 | f2l:lieberkind-v1:005 |
| 6 | 15 | f2l:lieberkind-v1:006 |
| 7 | 21 | f2l:lieberkind-v1:007 |
| 8 | 7 | f2l:lieberkind-v1:008 |
| 9 | 2 | f2l:lieberkind-v1:009 |
| 10 | 22 | f2l:lieberkind-v1:010 |
| 11 | 12 | f2l:lieberkind-v1:011 |
| 12 | 23 | f2l:lieberkind-v1:012 |
| 13 | 1 | f2l:lieberkind-v1:013 |
| 14 | 19 | f2l:lieberkind-v1:014 |
| 15 | 5 | f2l:lieberkind-v1:015 |
| 16 | 17 | f2l:lieberkind-v1:016 |
| 17 | 3 | f2l:lieberkind-v1:017 |
| 18 | 13 | f2l:lieberkind-v1:018 |
| 19 | 20 | f2l:lieberkind-v1:019 |
| 20 | 6 | f2l:lieberkind-v1:020 |
| 21 | 4 | f2l:lieberkind-v1:021 |
| 22 | 8 | f2l:lieberkind-v1:022 |
| 23 | 18 | f2l:lieberkind-v1:023 |
| 24 | 9 | f2l:lieberkind-v1:024 |
| 25 | 34 | f2l:lieberkind-v1:025 |
| 26 | 35 | f2l:lieberkind-v1:026 |
| 27 | 32 | f2l:lieberkind-v1:027 |
| 28 | 33 | f2l:lieberkind-v1:028 |
| 29 | 36 | f2l:lieberkind-v1:029 |
| 30 | 31 | f2l:lieberkind-v1:030 |
| 31 | 27 | f2l:lieberkind-v1:031 |
| 32 | 28 | f2l:lieberkind-v1:032 |
| 33 | 26 | f2l:lieberkind-v1:033 |
| 34 | 29 | f2l:lieberkind-v1:034 |
| 35 | 25 | f2l:lieberkind-v1:035 |
| 36 | 30 | f2l:lieberkind-v1:036 |
| 37 | 40 | f2l:lieberkind-v1:037 |
| 38 | 41 | f2l:lieberkind-v1:038 |
| 39 | 39 | f2l:lieberkind-v1:039 |
| 40 | 38 | f2l:lieberkind-v1:040 |
| 41 | 37 | f2l:lieberkind-v1:041 |

OLL source number N maps directly to `oll:speeden-v1:NNN`, for 1..57. PLL source letters map directly to lower-case padded IDs. The 21 labels are Aa, Ab, E, F, Ga, Gb, Gc, Gd, H, Ja, Jb, Na, Nb, Ra, Rb, T, Ua, Ub, V, Y, Z. For example T is `pll:speeden-v1:00t`. Manifests list exact IDs, not a range inferred at runtime.

The identity policies are `f2l-fr-pre-u-v1`, `oll-u20-pre-u-yaw-v1` and `pll-ll-pre-u-yaw-v1`. F2L minimizes target-piece projection over four pre-U turns after selected-slot normalization. OLL minimizes the frozen ascending 20-bit U-occupancy mask over pre-U and proper yaw. PLL minimizes the oriented LL sticker permutation over those same explicit transforms. Solved and angle duplicates do not contribute coverage. Mirrors, inverse cases and tilts are not extra equivalences. Each canonical setup is the inverse of the pinned default algorithm, independent of overrides; canonical defaults finish with recorded final AUF 0. Validators can return another final AUF for correct personal guidance.

## Inspection limits and reproducibility

Bounded GitHub metadata/source inspection also considered Darguima/FridrichTrainer at `2aebe3c80eaab87ed02726b7b1388dd97222a1fc`, whose MIT grant was read. Its alternate numbering was not selected. Requests for `lieberkind/.../LICENSE` and `Speeden/.../scripts/gen-f2l.ts` helped locate the actual license and understand the source claim; the first returned 404 because the license filename is `LICENSE.md`. No artifact from the rejected candidate enters the dataset.

No SpeedCubeDB, csTimer or other unlicensed/copyleft collection was transcribed. No author permission is invented or external mutation performed.

To reproduce from the retained pinned bytes, run `CURATE_CASE_LIBRARIES=1 pnpm exec vitest run tests/unit/curate-case-libraries.test.ts` in a POSIX shell. This explicitly writes only the three library files, manifests, source-integrity JSON and numbering fixture. The ordinary test suite skips this generator and performs no source or personal-database writes. Generation rejects a missing or hash-mismatched source/license artifact and a missing/duplicate numbering match before writing any library. Follow with the focused library tests described in [verification](../audits/Case_Libraries_Verification.md).
