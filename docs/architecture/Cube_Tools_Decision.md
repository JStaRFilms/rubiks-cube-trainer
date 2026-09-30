# Cube tools decision

Status: G02 architecture proposal for session `orch-20260930-021158`. No package has been installed or tested. [PLAN](../imports/PLAN.md) remains authoritative. Read alongside [Core architecture](Core_Architecture.md) and [Trainer foundation](../features/Trainer_Foundation.md).

## Recommendation

Provisionally use the npm package `cubing` for notation, the 3×3 KPuzzle model, and TwistyPlayer. Import local package modules, not the CDN examples. Keep trainer goal predicates and bounded search in our worker. A general full-cube solver is not evidence of optimal Cross or bounded Cross+1/+2 support.

This choice avoids writing a renderer and a second notation parser. It also keeps playback and validation on the same model. The cost is an experimental setup interface, dynamic loading, a Three.js dependency, and version-sensitive browser/build behavior. B02 must prove those costs are acceptable before the choice becomes final. Use the MPL route provisionally, retain notices and provide access to the distributed covered source. Audit the pinned artifact and its included third-party licenses before redistribution. This is not approval to copy every dataset in the repository.

Do not switch to custom rendering if an integration check fails. First record the failure, evaluate a narrower adapter or the fallback below, and bring any significant requirement or licensing change to the owner.

## Evidence and alternatives

Read-only source/documentation requests were made during G02 on 2026-09-30. Branch URLs can change. The cubing.js tree returned commit `7b72d195abd825fe2571efb52ad218bd8f0aa125`; csTimer returned `2547d82e32a347dd1b1c6943e8d03389d03eb64c`. B02 must select an actual released package version and record its integrity and matching source revision. Current branch version strings below are observations, not release selections.

| Tool and identity | Source-backed capability | License evidence | Fit and limits |
| --- | --- | --- | --- |
| cubing.js, npm `cubing`, branch package `0.63.9-dev` | `alg`, `kpuzzle`, `puzzles`, `search`, `scramble`, and `twisty` module exports. Alg parsing/inversion/expansion, 3×3 transformations and a web-component player. Definition includes outer, wide, slice and rotation moves. | [Manifest](https://github.com/cubing/cubing.js/blob/7b72d195abd825fe2571efb52ad218bd8f0aa125/package.json) states `MPL-2.0 OR GPL-3.0-or-later`; [MPL text](https://github.com/cubing/cubing.js/blob/7b72d195abd825fe2571efb52ad218bd8f0aa125/LICENSE-MPL.md), [GPL text](https://github.com/cubing/cubing.js/blob/7b72d195abd825fe2571efb52ad218bd8f0aa125/LICENSE-GPL.md), and [README fine print](https://github.com/cubing/cubing.js/blob/7b72d195abd825fe2571efb52ad218bd8f0aa125/README.md) describe vendored MIT/Apache and font licenses. | Best provisional combined model/parser/player choice. No established trainer-specific optimal solver contract. Setup/player APIs and artifact loading need testing. |
| cube.js, npm `cubejs`, branch manifest `1.3.2` | Documented `Cube.fromString`, `move`, `toJSON`, two-phase `solve`, initialization and worker helpers. Numeric moves document the 18 outer-face turns. | [Manifest](https://github.com/ldez/cubejs/blob/master/package.json) and [LICENSE](https://github.com/ldez/cubejs/blob/master/LICENSE) state MIT, retain copyright/license. | Useful independent outer-turn/full-cube reference or fallback model. [README](https://github.com/ldez/cubejs/blob/master/README.md) does not establish the required wide/slice/rotation parser or player. Another model adds adapter tests. The manifest declares a runtime `npm` dependency; inspect the selected artifact before browser use. |
| csTimer, repository `cs0x7f/cstimer`, optional npm `cstimer_module` named by its README | Source has cubie/goal utilities, case scramblers and a full timer application. [README](https://github.com/cs0x7f/cstimer/blob/2547d82e32a347dd1b1c6943e8d03389d03eb64c/README.md) documents the module and PWA. | Repository [LICENSE](https://github.com/cs0x7f/cstimer/blob/2547d82e32a347dd1b1c6943e8d03389d03eb64c/LICENSE) is GPL v3. Package artifact terms and per-file provenance are not established here. | Read-only comparison/reference candidate, not selected code or data. Copying GPL material may change distribution obligations. Do not infer cancellation, typed APIs or our offline promise from the existing application. |
| Roofpig, repository `larspetrus/Roofpig`, manifest name `roofpig`, version `1.0.0` | [README](https://github.com/larspetrus/Roofpig/blob/master/README.md) documents outer/wide/slice/rotation notation, setup moves, colors, speed and playback, WebGL/Canvas through Three.js. | Repository [LICENSE](https://github.com/larspetrus/Roofpig/blob/master/LICENSE) is MIT, but [package.json](https://github.com/larspetrus/Roofpig/blob/master/package.json) says ISC. Artifact/license conflict remains unresolved. | Fallback player candidate only. CoffeeScript, jQuery 3.1.1 example, bundled Three.js and a different color/frame convention add integration work. No solver contract. Confirm actual artifact licensing and dependencies before selection. |
| Custom model/parser/player | Could implement missing behavior exactly. No current source exists here. | New project code plus all chosen dependencies would need notices. | Highest correctness and maintenance risk. Reject as default. A custom bounded trainer search can still be needed without replacing model/parser/player. |

Primary capability evidence:

- [Alg documentation](https://js.cubing.net/cubing/alg/) documents canonical strings, inversion, concatenation and expansion including commutators. Our persisted move list is the restricted expanded form in Core architecture, not every accepted library syntax.
- [KPuzzle documentation](https://js.cubing.net/cubing/kpuzzle/) documents puzzle transformations. [Pinned 3×3 definition](https://github.com/cubing/cubing.js/blob/7b72d195abd825fe2571efb52ad218bd8f0aa125/src/cubing/puzzles/implementations/dynamic/3x3x3/3x3x3.kpuzzle.json.ts) contains edges, corners, centers and the required move families. Its indexing is not our wire format.
- [Twisty documentation](https://js.cubing.net/cubing/twisty/) documents the player and marks `experimental-setup-alg` as experimental. Play/step/speed, touch orbit/zoom, arbitrary starts, color orientation, keyboard focus and reduced-motion behavior still require B02 tests. Documentation is not a tested accessibility guarantee.
- [Search exports](https://github.com/cubing/cubing.js/blob/7b72d195abd825fe2571efb52ad218bd8f0aa125/src/cubing/search/index.ts) include `experimentalSolve3x3x3IgnoringCenters` and experimental generic search. Neither establishes our partial-goal optimality, node/time budget or cancellation semantics.
- [csTimer goal utilities](https://github.com/cs0x7f/cstimer/blob/2547d82e32a347dd1b1c6943e8d03389d03eb64c/src/js/lib/cubeutil.js) and [case scrambler source](https://github.com/cs0x7f/cstimer/blob/2547d82e32a347dd1b1c6943e8d03389d03eb64c/src/js/scramble/scramble_333_edit.js) establish that relevant masks/maps exist. They do not verify our inventories or transfer rights in third-party case material.

## Offline and measurement limits

The cubing manifest declares Three.js and other dependencies; its README requires ES2022 modules and its observed branch manifest lists Node >=22.3.0 for tooling. These observations do not select the future project runtime. B02 must verify a released version against Vite and the supported browsers.

Bundle all reachable runtime chunks, workers, puzzle definitions and assets locally. Determine the emitted dependency graph from the production build and network trace. No CDN, embedded remote player, font fetch or API may be needed for normal practice. Roofpig's documentation uses a remote jQuery script; any fallback must bundle its dependencies instead. Do not copy that example unchanged.

All download, compressed bundle, initialization, memory and generation speed claims are unmeasured in this checkout. In particular, cubejs's README claims 4–5 second initialization and typical 0.01–0.4 second solves on a "modern computer". These are vendor claims, not budgets or mobile evidence. Roofpig's broad browser claim is also unverified here. PLAN's 190,080 cross coordinates and approximately 190 KB one-byte distance data describe one table, not total app/cache size.

## Case-data candidates and rights gate

No case collection has been copied, selected for redistribution or verified. Public availability is not a grant. Source code licensing alone does not establish the origin and rights of every embedded collection.

| Candidate | What the source establishes | Remaining gate |
| --- | --- | --- |
| csTimer pinned case scrambler above | F2L/OLL/PLL maps and generated ZBLL map exist in GPL repository source. | B07/B10 inspect file provenance and applicable terms, decide whether GPL reuse fits distribution, verify exact canonical coverage and mapping. If unsuitable, do not extract/transcribe the arrays. |
| [SpeedCubeDB OLL reference](https://www.speedcubedb.com/a/3x3/OLL), its corresponding case categories can be evaluated later | The public reference page exists. | No redistribution grant established. Obtain explicit applicable permission/license before copying algorithms, notes, diagrams or collection structure. Case identity must be independently checked. |
| Independently authored/generated canonical inventory | Legal cube states and tests can be generated without importing a restricted collection. | B07/B10 must still source the standard numbering/families, document original authorship and verify 41/57/21/493 coverage against a legitimate reference. This is an evaluation option, not a claim that a completed dataset exists. |

For each accepted collection record source URL/revision, author, exact license or permission evidence, allowed redistribution/modification, required attribution, source numbering, internal identity mapping, and a rights verdict. A missing rights verdict blocks bundling. A missing identity/coverage verdict blocks a completed trainer claim. Small verified previews must state their actual inventory. Never fill gaps with remembered transcription of a restricted collection.

The 493 ZBLL target is fixed by PLAN, but its exact family, AUF, PLL-inclusion and solved-state convention still needs a sourced B10 manifest. Do not substitute a convenient count or silently change the target. Reuse verified PLL states through explicit aliases if that frozen convention includes them.

## Empirical acceptance gates

B02, after separate Build authorization:

1. Pin a released package/version/integrity and source revision. Audit licenses of the emitted artifact, notices and source availability. Resolve any artifact/source discrepancy.
2. Compile with strict TypeScript without broad casts. Exercise our restricted notation and all frame/slot transforms. Apply move/inverse, four quarter turns and known reference fixtures.
3. Initialize playback from the actual generated start via setup scramble or tested pattern API. Player states at every step must agree with the shared model, including rotations/wides/slices and backward stepping.
4. Verify phone touch orbit/zoom, gesture isolation, play/pause/step/speed, text fallback, focus and reduced motion. Record browser/device versions and limitations.
5. Inspect production chunks and workers, remove runtime remote fetches, precache all required assets. Cold offline start and a never-opened player must work after setup.
6. Measure download/compressed sizes, cold/warm initialization and peak memory. Record limitations rather than claiming vendor estimates passed.

B04 proves optimal Cross tables/reveals independently. B05 compares bounded search with constructive generation/filtering for Cross+1, including any-pair versus target slot, hit rates, p50/p95, cancellation and budget exhaustion on representative phones. An admissible maximum of subgoal distances is allowed; an unproved sum is not. Freeze useful caps from evidence. B12 has its own two-pair feasibility and owner-go gate.

## Handoff

D01 can use the contracts now, subject to parent acceptance. Design explicit initialization, failure, representative OLL view and text-only review states. No missing product decision currently blocks Design. A source-rights failure, incompatible player requirement, or proposed metric change must return to the owner rather than becoming an undocumented fallback. Build, datasets and reconstruction research remain unauthorized by this document.
