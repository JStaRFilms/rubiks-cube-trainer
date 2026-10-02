# B10 ZBLL library source gate

## Current implementation status

PASS for the isolated B10 library and pure validators, accepted after parent math/code review and independent repetition of the new proofs. The accepted publisher MIT inputs now produce verified 493-case coverage and defaults. ZBLL UI, workers, storage, attempts, sets and statistics remain unsupported. The source-only BLOCKED verdicts below are historical; the final appendix records the accepted-input implementation and actual checks.

## Initial source verdict

BLOCKED. The approved 493-case convention is unchanged. No complete ZBLL library, canonical numbering/default mapping, pure ZBLL validator or trainer was delivered. Do not begin B11 on this evidence.

The existing pinned MIT sources have no ZBLL artifact. A bounded lookup found a licensed 493-label/state-definition candidate without defaults and a numbered-default candidate with unresolved third-party collection provenance. The task requires stopping for an owner decision when permission or standard defaults cannot be established. It does not authorize replacing the requested inventory with generated multi-stage guidance.

This is a source acceptance block, not a claim that Stig115's MIT license is invalid or that no legitimate complete source exists elsewhere. No explicit file-specific license exclusion was found in the inspected candidate headers/readmes. Stig115 nevertheless names an external algorithm collection, and its repository notice alone does not independently establish permission for that collection.

## Inspection and retained evidence

All network operations were bounded public read-only GETs. Eighteen requests completed successfully, each with a 30-second curl cap. No site scraping, broad crawl, dependency, solver, search/scramble API, author contact, account or external mutation was used.

1. Read the retained Speeden and Lieberkind MIT grants and existing source manifests. Retrieved complete pinned repository trees. Speeden has 60 entries and Lieberkind 126; neither has a ZBLL path.
2. Retrieved the complete tree at the previously inspected MIT Darguima revision `2aebe3c80eaab87ed02726b7b1388dd97222a1fc`. Its 55 entries have no ZBLL path.
3. One metadata query, `https://api.github.com/search/repositories?q=zbll+license%3Amit&per_page=10`, returned four repositories. Inspected only AlphaSheep/Another-ZBLL-Trainer and Stig115/zbll. Stig115/zbll_brief and loltreeman/ZBTrain were not inspected or accepted. Search metadata is discovery, not a grant.
4. Resolved and pinned the two inspected candidates before retrieving their grants, readmes and relevant files. AlphaSheep's tree has 48 entries; Stig115's has 282. Both tree responses have `truncated=false`.
5. Read AlphaSheep's inventory, family/subset naming controller, sticker definitions and timer. Also inspected its main controller in the local cache. None of these supplies a default algorithm corpus. The inventory contains labels, not solution strings.
6. Read Stig115's MIT grant and readme before retrieving `algs.js` for local inspection. Seven ZBLL family declarations explicitly set `source: "http://algdb.net/puzzle/333/zbll"`. No grant from that attributed collection was established, and no algorithms were imported.

The frozen evidence is under [zbll-source-evidence](../data/zbll-source-evidence/manifest.json). The manifest records all 13 retained artifacts' exact URLs, SHA-256 hashes and byte lengths. It is separate from `src/data/sources.json`; old B07 curation cannot overwrite it.

| Candidate | Pinned revision | Inspected MIT attribution | Grant bytes / SHA-256 |
| --- | --- | --- | --- |
| AlphaSheep/Another-ZBLL-Trainer | `9cddec702c52e8d6521f8cf7e884f5738f0223a1` | Copyright (c) 2017 Brendan James Gray | 1075 / `d06848139d759d73cfa894f768807d160be341079d562ab5cf95f711641c6b30` |
| Stig115/zbll | `35797fa0e64038df2ac234a2f511bac65bccca67` | Copyright (c) 2018 Ashley Nathan Feniello | 1079 / `334cb6207a09c070907519584becb781a55e2050e8f4f1ab7200b3895803fcfe` |

Both actual grants are retained verbatim. Their copying/modification/redistribution permission requires retaining copyright and permission notices. This is not a different whole-project license obligation. AlphaSheep taxonomy/definition files are retained as inspection evidence with the grant, not imported into production. Byte attributes disable newline conversion only for the new evidence directory.

The unaccepted Stig115 `algs.js` is 562,242 bytes with SHA-256 `741e485c67e84231e9e02ce9b3fe4efe6367744e92181a12ce9caf6364d0816a`. Exact inspected bytes remain in ignored `node_modules/.cache/b10-stig-algs.js` for the parent's local review, not distributable fixtures. Its pinned raw URL/hash/length are in the evidence manifest. That cache is disposable, so the algorithm file is not a durable accepted reproduction input.

## Observed labels, not verified physical coverage

AlphaSheep's inventory has 493 distinct source labels. The label file is 9,262 bytes with SHA-256 `fd3849f130be1d3dc894c1bad15f79e5f557b1cc8f364d29ec4da78a45c8df79`.

| Source family | Intended display alias | Observed subset label counts | Total labels |
| --- | --- | --- | ---: |
| T | T | TD/TL/TB/TF/TR/T0, each 12 | 72 |
| U | U | U0/UB/UD/UR/UL/UF, each 12 | 72 |
| L | L | LD/LF/LB/LR/LL/L0, each 12 | 72 |
| P | Pi | PR/P0/PF/PL/PD/PB, each 12 | 72 |
| S | S | SB/SF/S0/SR/SD/SL, each 12 | 72 |
| A | AS | AB/AF/AD/A0/AL/AR, each 12 | 72 |
| H | H | H0 8, HD 8, HF 12, HR 12 | 40 |
| 0 | PLL | 0D 5, 00 4, 0F 12 | 21 |

The naming controller explicitly defines these OCLL names and the COLL subset names. The second character uses 0 for corners solved, D for diagonal swap and F/R/B/L for adjacent swap front/right/back/left. Sticker definitions declare corner orientation/permutation and edge permutation orders. These are useful source facts, but the independent Cartesian state/label proof has not run. No Stig115 source number has been mapped to an AlphaSheep label or existing PLL ID. Algorithm inversion alone would not prove such a mapping.

## Contract decisions and incomplete criteria

[ZBLL blueprint](../features/ZBLL_Library.md) was authored before any substantial library/code change. There was no production change after the source block.

- Coverage remains 493 non-solved identities including 21 PLL, with solved-modulo-AUF excluded. Required equivalence is four pre-U and four proper yaw transforms, using full LL piece/sticker identity. No mirror/inverse/tilt equivalence.
- The required independent universe is 27 legal corner orientation assignments times 288 parity-compatible LL permutations, 7,776 states. The 494/493 quotient and all family/state proofs remain unverified here. Label counting is not that proof.
- Proposed membership reuses existing `pll:speeden-v1:*` IDs/defaults/policies. Aliases resolve to one canonical override key, with no parallel alias-keyed override. This is a blueprint policy, not implemented ZBLL membership.
- Proposed separate `zbll-library-v1` / `zbll-ll-pre-u-yaw-v1` strings are not active versions. Non-PLL source-qualified IDs and source-number/alias mappings await source selection. Old 41/57/21 arrays, IDs, `cfop-libraries-v1`, identity policies and attempt/database/export contracts are untouched.
- Canonical setup must remain independent of personal guidance. ZBLL physical base must be fully solved/aligned, unlike OLL's arbitrary oriented LL permutation. Actual moves must return a net regrip to the held frame before final AUF. The accepted B09 implementation is unchanged.
- No ZBLL identity/presentation/override/import/reset implementation was added. The required 47,328 default case/angle/six-frame presentations, all-case valid/wrong-case overrides and physical return/AUF proof remain unrun.
- Production ZBLL UI, attempts, sets, runs and backup semantics remain unsupported. No schema bypass, seed inventory/history, generalized catalog or weaker derived trainer was introduced. F2L's filtered generation payload and full global algorithm ownership comparisons are unchanged.

## Actual checks

No failing command was hidden or assertion/timeout changed. The existing `maxWorkers: 1` unit policy remains intact. The checks below verify evidence and preserved supported behavior; they do not turn the B10 verdict into PASS.

| Command | Result |
| --- | --- |
| `node node_modules/.cache/b10-check-evidence.mjs` | PASS. All 13 retained hashes/lengths, both actual MIT notices, complete accepted-source trees, 493 distinct labels, subset counts and seven AlgDB source attributions match. Local scratch check only; it also reads the unaccepted cached candidate. |
| Hermetic retained-only Node command below | PASS. All 13 retained hashes/lengths and 493 distinct labels match, without network/database access. |
| `pnpm lint && pnpm typecheck` | PASS. ESLint and both strict TypeScript configurations. |
| `pnpm exec vitest run tests/unit/case-libraries.test.ts tests/unit/f2l-client.test.ts tests/unit/ll-boundaries.test.ts tests/unit/cross-one-storage.test.ts --reporter=verbose` | PASS, 80 tests across four files in 21.45 s. Retained complete 41/57/21 Cartesian coverage/source/default/override checks, client stale ownership, LL forgery/future rejection and storage regressions. |
| `pnpm exec vitest run tests/unit/f2l.test.ts tests/unit/ll.test.ts -t 'accepts and restores\|rejects forged\|keeps future\|returns regripped' --reporter=verbose` | PASS, 23 selected tests in 14.92 s; 18 outside selection. Includes atomic F2L restore/reset/rejection and the retained 2,304 PLL ending-regrip/angle/frame proof. |
| `pnpm build` | PASS, client 7.16 s and service-worker compile 54 ms. Existing main-chunk warning remains, 546,851 bytes. These are reported compile timings, not phone latency. |
| `node node_modules/.cache/b10-check-release.mjs` | PASS. Release `review-1790925852958`, all 49 emitted byte lengths/hashes, supported-only scope, six old pinned source hashes and both public/dist/docs MIT copies match. Candidate evidence is not included in production assets. No production import paths changed, so the broader cube-tool source inspector was not rerun. |
| Read-only diff/attribute checks with optional Git locks disabled | PASS, no whitespace errors; new frozen paths have `text: unset`. No production source, tests, dependencies or existing licenses have a diff. Parent tracking edits remain outside implementer changes. |

Retained-only integrity reproduction:

```sh
node --input-type=module -e "import{readFileSync as read}from'node:fs';import{createHash}from'node:crypto';import assert from'node:assert/strict';const root='docs/data/zbll-source-evidence/',m=JSON.parse(read(root+'manifest.json'));for(const a of m.artifacts){const b=read(root+a.file);assert.equal(b.length,a.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);}const z=JSON.parse(read(root+'alpha-zblls.json'));const labels=Object.values(z).flatMap(s=>Object.values(s).flat());assert.equal(labels.length,493);assert.equal(new Set(labels).size,493);console.log('PASS: 13 retained hashes/lengths and 493 distinct labels, not physical coverage.');"
```

This writes nothing and does not regenerate either old or new libraries. The explicit B07 generator was not run. Repository regression tests use isolated fake IndexedDB, not the owner's personal database. No browser suite, physical solve, installed PWA, physical-phone, Firefox/Safari, audio, screen-reader, GPU/thermal or long-session leak verification was run. Existing intermittent readiness/hydration latency is unchanged and not diagnosed by these checks.

## Changed files and owner decision

Implementer changes are `.gitattributes`, `docs/data/Case_Sources.md`, `docs/features/ZBLL_Library.md`, this audit and `docs/data/zbll-source-evidence/`. Scratch retrieval/check scripts and downloads are ignored under `node_modules/.cache/`. No task/master/index/summary/board, Git index/commit/branch/push, production code/data, dependency or schema write was made.

Parent should review the candidate grants and explicit AlgDB attribution. The owner must decide whether documented permission is sufficient to accept the attributed default artifact, obtain clarification that covers the dataset, provide another licensed complete default corpus, or authorize a further bounded source inspection. Do not infer permission from public availability or quietly change the requested trainer. AlphaSheep's labels could be a useful independently decoded numbering source after that gate, but are not a substitute for verified defaults.

Resume B10 only after that source decision. Then prove the full state/label/default mapping and remaining setup/guidance/override criteria before parent review and B11. Q04 remains after actual B11 integration.

## Owner-authorized source round two

### Scope and verdict

The owner answered Continue sourcing. This authorized one bounded source-only round, not acceptance of Stig115's unclear defaults, a license-risk waiver, generated/two-stage guidance, production library work or B11. The initial BLOCKED verdict and evidence above remain historical facts.

Round-two verdict: BLOCKED again. No inspected candidate establishes reusable complete defaults under the approved source policy. ZBTrain has the expected non-PLL label/default structure, but an explicit upstream casemap credit remains unresolved. AlgDB project licensing supplies software-policy evidence, not a permissive grant for the historical submitted-algorithm collection.

This does not prove that a reusable corpus or permission is absent elsewhere. Parent must inspect the new evidence before another source decision or B10 math/data work.

### Actual requests and pins

Used 18 of the maximum 20 public read-only GETs. Each curl invocation had `--max-time 30`, an explicit GET and no redirect following. Every response was HTTP 200 with curl exit 0. Measured request wall time totaled 22,081 ms, maximum 4,662 ms. No timeout, HTTP failure, login, author contact, website asset crawl or external mutation occurred. Two requests remained unused.

The complete request ledger is `sourceRounds[0].requests` in [manifest.json](../data/zbll-source-evidence/manifest.json). Every row records the exact URL, response status, elapsed milliseconds, byte length, SHA-256 and retained filename or ignored cache path. Requests 1/2/6 resolved branch tips; all subsequent repository content was fetched at those exact revisions.

| GET numbers | Inspected target | Results |
| --- | --- | --- |
| 1, 4, 7, 8, 12 | Stig115/zbll_brief commit/tree/license/readme/default candidate | Pin `e533adab2eaae9ce57ccbc5801e46f1c6d195006`. Complete tree, 282 entries. MIT grant read before fetching the default candidate. |
| 2, 5, 9, 10, 13 | loltreeman/ZBTrain commit/tree/license/readme/default candidate | Pin `bd5b605d3a5bdc61ebf9925f348de62c406ecd1c`. Complete tree, 1,084 entries. MIT grant and explicit casemap credit read before fetching the default candidate. |
| 3 | Bounded repository metadata search `algdb in:name`, five results | Discovered cubing/algdb and other similarly named projects. Metadata alone was not accepted as a grant. Other search results were not fetched. |
| 6, 11, 14, 15 | cubing/algdb commit/tree/license/readme | Pin `8fb041204536c122f9aed24f78425b9f5e001ed4`. Complete tree, 520 entries. Entire GPL text and project contribution/license policy read. No algorithm database retrieved. |
| 16 | `https://algdb.net` project/policy lookup | Under Construction landing document. No reusable-data or contribution grant in that response. |
| 17 | `https://bestsiteever.net/zbll/` publisher/project lookup | Trainer landing document identifies Roman Strakhov as author. No reuse grant or repository link in that response. No script, algorithm data, image or other site asset fetched. |
| 18 | Bounded GitHub repository metadata search `zbll strakhov`, five-result cap | Zero results for that query only. This does not establish that Roman has no repository or license elsewhere. |

No request to AlgDB's algorithm listing or API was made. Current landing pages are not immutable historical policy. Their observed bytes/hash/status are recorded without treating them as a grant or proof of what was licensed in 2018.

### Grants, provenance and candidate decisions

| Candidate | Actual publisher grant | Scope/provenance finding | Source-only decision |
| --- | --- | --- | --- |
| Stig115/zbll_brief | MIT, Copyright (c) 2018 Ashley Nathan Feniello. License 1,079 bytes, SHA-256 `334cb6207a09c070907519584becb781a55e2050e8f4f1ab7200b3895803fcfe`. | The inspected ZBLL set explicitly attributes content to `http://algdb.net/puzzle/333/zbll`. Eight defaults only, `h_33` through `h_40`. No separate upstream grant established. | Not complete and not accepted for reuse. |
| loltreeman/ZBTrain | MIT, Copyright (c) 2026 Christian Naguio. License 1,073 bytes, SHA-256 `0be1970364793143492241502a6b1c2403ec9f140080117c41dbef7663814b8a`. | README explicitly credits Roman Strakhov for the algorithm/scramble casemap. It separately thanks namisama for permission to use features, which is not permission for Roman's casemap. `scripts/algorithms.js` has no additional grant/provenance statement; that blank header does not supply upstream rights. | Promising 472-label non-PLL default structure, but redistribution permission remains unestablished. Not accepted. |
| cubing/algdb project | README explicitly declares GPL version 3 or later for code. Retained full license is 34,916 bytes, SHA-256 `33bc26d4498c183b703d1760ee45b8774d21d6e0178ca393dc715271840c7a21`. | Contribution section welcomes software development. No inspected separate algorithm-submission grant, data license or permission to redistribute the historical AlgDB collection under MIT. The project license cannot be assumed to cover that old external corpus. | Policy evidence only. No project code or default collection accepted/imported. |

Both MIT texts grant copying, modification and redistribution of their software/associated documentation while requiring copyright and permission notices. No new file-specific exclusion was found in the inspected license/readme/default headers. The explicit external collection credit is the unresolved provenance issue, not a claim that the MIT texts are invalid. Neither GitHub's license metadata nor public algorithm availability resolves it.

GPL covered-work reuse, if proposed later, could require GPL licensing of a derived work, preservation of notices and distribution of corresponding source under sections 4 through 6. Scope and aggregation matter; this audit does not assert that the whole existing app has acquired GPL obligations. Retaining the unmodified license and project-policy README as separate inspection evidence is not importing GPL software or accepting the historical dataset. No materially different license obligation was silently accepted.

### Observed default availability, not physical proof

Static TypeScript AST inspection of the ZBTrain file found a `zbllAlgs` object with 472 case properties. Every case array has a nonempty first string. T, U, L, Pi, Sune and Antisune each have 72 labels, H has 40. The six 72-label families each use `2GLL`, `Diag`, `3`, `4`, `5`, `6`, with 12 labels per subset. H uses `2GLL`, `Diag`, `3`, `4` with 8/8/12/12 labels. No PLL family appears in this inspected object. This structure could complement the existing 21 PLL entries only after rights and independent identity mapping are established; it is not a verified 493-case library.

Stig115/zbll_brief's single inspected ZBLL set has eight H labels/default strings. Its partial count is not a complete standard inventory despite its repository name.

No source file was evaluated, imported as executable code or replayed on a cube. No notation/move parsing, algorithm selection, inverse setup generation, state quotient, 7,776-state enumeration or source-to-published-label mapping was performed. No correct-solution, all-angle/six-frame, family-state, AUF/regrip or intended-case override claim follows from these counts.

The unclear default candidates remain only in ignored inspection cache:

| Candidate file | Bytes | SHA-256 |
| --- | ---: | --- |
| `node_modules/.cache/b10-r2-brief-algs` | 549669 | `58baf1db2d4a19d2194161b2b18c650ce7dd33332e2e479685b3810a1a7e9274` |
| `node_modules/.cache/b10-r2-zbtrain-algorithms` | 196120 | `0fd439dccfa05a42316dcfad69b74a848378b78c08a3ee0b5b361ce94bc87bdb` |

Those cache files are disposable and are not durable accepted reproduction inputs. The website landing responses and all three branch-tip commit responses likewise remain cache-only. No unclear default string or unlicensed landing-page content remains in distributable source evidence or production.

### Retention and verification

Retained 11 new exact-byte metadata, grant and policy artifacts alongside the original 13, for 24 total. Original artifact records and bytes remain unchanged. The existing evidence directory's `-text` rule already covers all new frozen filenames; no attribute change was made in this follow-up. The manifest keeps its initial `blocked-source-gate` status and appends the round, request ledger and non-algorithm observations.

Actual checks:

- `node node_modules/.cache/b10-r2-inspect.mjs` passed after correcting the scratch inspector to accept numeric JavaScript property names. Static AST parsing, property counts and nonempty-string availability only. No source execution.
- `node node_modules/.cache/b10-r2-retain.mjs` passed its hash/length and original-thirteen-record checks. It initially copied 14 metadata/license/policy responses while keeping the explicit default files and website pages cache-only. The focused retention review below then removed the three commit-response copies.
- `node node_modules/.cache/b10-r2-cache-commit-metadata.mjs` passed. Complete commit responses can contain source patches; the brief commit response embeds a patch to `algs.js`. All three own round-two commit copies were removed from distributable evidence and their ledger rows changed to cache-only. Exact response hashes/pins remain recorded. Final new retained count is 11, not 14.
- `node node_modules/.cache/b10-r2-check.mjs` passed after that correction. All 24 durable artifact hashes/lengths, all 18 observed response hashes/statuses, three exact revisions, both MIT notices, GPL policy, observed 8/472 labels and authored whitespace matched. The complete response/pin check uses local cache for the seven non-retained responses.
- Retained-only integrity reproduction below passed after this appendix was added. It uses no network, personal database or source regeneration.
- Read-only diff/whitespace and attribute checks passed. Production source/data, tests, dependencies and public/old license files have no diff. The `.gitattributes` diff is the prior initial-round addition, not a follow-up write. Both checked new license paths have `text: unset`.

Two local inspection command failures are preserved. A one-line metadata print command had an unmatched shell quote and exited 2; correcting its quoting produced the complete tree listings. The first scratch AST inspector accepted only identifier/string property names and rejected ZBTrain's legal numeric subset names; adding numeric-literal handling fixed that specific inspector assumption. Both reruns passed. No upstream bytes, dataset, production assertion or timeout was changed to excuse a failure.

Retained-only reproduction:

```sh
node --input-type=module -e "import{readFileSync as r}from'node:fs';import{createHash}from'node:crypto';import assert from'node:assert/strict';const root='docs/data/zbll-source-evidence/',m=JSON.parse(r(root+'manifest.json'));for(const a of m.artifacts){const b=r(root+a.file);assert.equal(b.length,a.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);}const q=m.sourceRounds[0];assert.equal(q.requests.length,18);assert.ok(q.requests.every(x=>x.status==='200'&&x.curlExit===0));console.log('PASS:',m.artifacts.length,'retained hashes/lengths and 18 recorded successful GETs. No permission or physical proof claimed.');"
```

Unchanged unit/build/browser suites were not rerun for this document/evidence-only follow-up. Earlier 103-unit/build results are historical checks, not new round-two verification. No physical-device/PWA/browser/accessibility certification is claimed.

### Handoff boundary

Round-two writes are confined to the existing feature/source/audit documents and evidence manifest/new evidence files. No production code/data, semantic gates, IDs, versions, frames, Q03 mixed-guidance logic, old grants, attributes, parent task/master/index/summary/board or Git state was written. No dependency, deployment or contact with an author occurred.

Parent should review the unresolved Roman casemap provenance and the AlgDB code-versus-data licensing distinction. Further source inspection, clarification/contact, acceptance of different license obligations or another source route needs the appropriate owner/parent decision. No risk waiver or weaker generated substitute is inferred. B10 remains incomplete and B11 remains unauthorized on this packet.

## Parent source review and acceptance

Parent used the two remaining allowed public GETs for publisher policy lookup. `https://www.speedcubedb.com/` returned HTTP 200, 52,431 response bytes in 2,240 ms. Its policy-link inspection found `/privacy`, but no reuse grant. That page returned HTTP 200, 54,117 bytes in 1,175 ms, SHA-256 `ec1063146367ca5722760886fbd2e5d8d3de6d99fe05656eddbb212f36fbfe36`; keyword inspection found no reuse grant. These are live unfrozen policy observations, not proof that permission is absent elsewhere. No algorithm listings, data or website assets were fetched. Coder's eighteen recorded requests plus these two parent lookups exhaust the twenty-request round. No further source requests are authorized in the current packet.

Parent read ZBTrain's actual MIT notice/credits and AlgDB's code-policy README, verified all twenty-four retained hashes/lengths, and confirmed no tracked or untracked changes in production source/data, tests, public assets or dependency files. An independent fresh read-only reviewer then returned source-only PASS. See [source acceptance review](ZBLL_Source_Acceptance_Review.md) for the complete report and parent decision. The reviewer found the publisher's actual MIT grant applies to embedded case data absent inspected exclusion or incompatible restriction. Attribution alone does not establish a separate upstream grant, but missing independent upstream title is not a confirmed policy violation. No GPL implementation/data-license claim or legal guarantee follows.

Parent accepts bounded ZBTrain non-PLL move-string/label extraction with Christian Naguio's complete MIT notice and publisher-reported Roman Strakhov casemap credit. Retain Brendan James Gray's complete MIT notice if AlphaSheep taxonomy/definition data is reused. Existing PLL notices still apply. Exclude trainer implementation, diagrams, screenshots, lesson prose and AlgDB GPL project code. Both historical source BLOCKED verdicts remain. This is source acceptance only, not library completeness. Resume full B10 proof/default/presentation/override work from exact hash-verified cached inputs; B11 remains closed until parent verification.

## Accepted-input library implementation

Implementer verdict: PASS for the isolated complete library and pure validation. Parent math/code acceptance is still required. No source network requests, Git mutations, task/orchestration writes, deployments or real personal-data changes were made during implementation. The source acceptance report and parent tracking remain read-only.

### Delivered data and contracts

`src/data/zbll-cases.ts` contains 472 source-qualified non-PLL cases. `src/data/zbll.ts` references the existing 21 PLL objects once, for 493 memberships. Family counts are T/U/L/Pi/S/AS 72 each, H 40 and PLL 21. The manifest lists every canonical ID, source family/subset/label, published reference label, all 40 COLL subset maps and canonical PLL alias targets. Source recognition codes remain source conventions, not a universal mnemonic or numbering claim.

The collection version is `zbll-library-v1`. New entries use `zbll-ll-pre-u-yaw-v1`; existing PLL entry data and policy stay `cfop-libraries-v1` and `pll-ll-pre-u-yaw-v1`. Pure output reports collection and canonical-entry versions separately. Existing F2L/OLL/PLL arrays, IDs, policies, defaults, notices, global dataset version, history and database/export version remain unchanged. New or old source aliases resolve to canonical entries for lookup. Stored overrides still require canonical IDs, so PLL guidance has one shared key and no alias-keyed duplicates.

`src/data/zbll-sources.json` records the accepted source revisions, full artifact URLs, exact byte lengths/hashes, copyright names, MIT scopes and publisher-reported Roman Strakhov credit. The pinned ZBTrain cache matched 196,120 bytes and SHA-256 `0fd439dccfa05a42316dcfad69b74a848378b78c08a3ee0b5b361ce94bc87bdb` before copying to the durable fixture. Complete Christian Naguio and Brendan James Gray grants are retained and distributed as exact-byte notices. The publisher credit does not assert original ownership or an independently established upstream sublicense. No trainer implementation, diagrams, lesson prose, website collection or GPL project code is reused.

The existing CaseEntry shape is unchanged. Shared pure identity/validation adds ZBLL edge-oriented initial context and full-state completion. Isolated initialization and presentation reuse B09's physical-return logic. The production catalog, LL worker protocol, UI, IndexedDB paths, settings, sets, attempts, backup acceptance and statistics do not register ZBLL. An actual new non-PLL override still fails the global LL import gate.

### Independent proof and actual presentation checks

`tests/helpers/zbll-oracle.ts` constructs Cartesian states from 27 legal corner orientations and 288 parity-compatible LL permutations. All 7,776 states are unique and accepted by the real legal-state decoder. Independent 3D pre-U/proper-yaw transforms produce 494 full-sticker classes including solved. Removing solved yields 493. No OLL-mask, mirror, inverse or tilt quotient is used. Production identity equals the independent full-sticker key for every one of those 7,776 states.

The pinned AlphaSheep piece/sticker definitions independently describe exactly those 493 non-solved classes and expected families. The source extractor statically reads only the ZBTrain `zbllAlgs` move-string table and necessary family/subset/case labels. All 472 selected first defaults match unique independently published classes, their source family and a single published COLL subset per source group. Existing PLL representatives match the remaining 21 classes. No alternate algorithm, synthetic solve, two-stage guidance or fallback source is substituted. The numbering fixture freezes raw strings, exact source lines, independent published reference states/labels and physical-return transforms.

Actual pure factory and independent geometric replay verify:

- 47,328 default presentations, all 493 cases × 16 actual pre-U/yaw angles × six physical down/front frames. Every setup starts from solved/aligned, preserves F2L and oriented LL edges, has the intended full identity and finishes exactly solved/aligned with final AUF.
- 47,328 valid personal presentations over the same complete case/angle/frame product. Every case uses a real same-case override with pre-AUF, nonzero final AUF and an ending physical x regrip. Canonical setup/state stays identical to default presentation. All 493 wrong-case guidance inputs fail both direct goal proof and strict import.
- 4,608 further actual presentations for one non-PLL case and one shared PLL case over all 24 proper ending regrips × 16 angles × six frames. Centers return to the held frame before final AUF 3; geometric replay then reaches exact solved/aligned.
- 11,832 identity checks over all 493 cases × 24 proper center regrips. Canonical identity never changes.
- Invalid fields, moves, IDs, slots, duplicate/alias-keyed records and future policy/dataset/engine versions fail without mutation. Reset removes only the requested canonical override. Caller mutation of returned move objects cannot change source data. Personal notation still rejects `R3`.

### Failed probes and their correction

Early default probes failed before any production data generation. The strict personal parser rejected `R3`, and two Sune setups appeared to violate F2L/edge orientation. The probe reported 490 matched published classes and 492 projected keys. The latter included two invalid contexts and was not evidence of 492 valid cases.

The Sune diagnostic was a setup-construction defect. It inverted a raw algorithm against a held-center solved target even though that algorithm ended in a proper regrip. Normalizing after inversion cannot repair that different starting context. Appending the actual physical return before inversion fixes the probe and independently matches the published states. No source move was replaced.

| Exact source label / line | Raw first default | Compile/physical return | Independent reference |
| --- | --- | --- | --- |
| Pi/4/OsA / 2951 | `y2 R' U' R' D' R U R' D R3 U R' U R U2 R'` | Source-only `R3` = `R'`; append `y' y'` | PR-1023 |
| Sune/6/AsC / 3605 | `y F U R U' R' U R U' l U' R2 D' R U R'` | Append `y' z'` before inversion | SL-1203 |
| Sune/6/CsC / 3626 | `y x D R2 D2 R U2 R' D2 R U2 R D'` | Append `x' y'` before inversion | SL-0123 |

Three clockwise quarter turns equal one counter-clockwise quarter turn. The single pinned spelling normalization is confined to trusted source compilation; general notation parsing and imported Move amounts remain strict. The raw source bytes and first-choice selection are preserved. A total of 312 first defaults need physical ending-frame restoration. After correct construction, all 472 first defaults and 21 shared PLL classes pass. No confirmed bad source default remains from these probes.

TypeScript initially caught a scratch oracle yaw amount widened to `number`. Precise quarter-turn inference and the existing Move type fixed it. One exact-text cleanup edit also failed to match the actual helper text; reading that block and applying the smaller exact edit succeeded. Neither event altered source bytes or production acceptance assertions.

The first complete personal-presentation test exceeded its new 180-second budget, measured 189.94 seconds. Repeated canonical proof of the same valid override caused the cost. A bounded engine-local cache now stores only successful new ZBLL goal proofs keyed by actual representative, identity/policy, moves and pre-AUF. Strict import structure/version checks still run on every call, and all actual-angle geometric replays remain. No old trainer validation or timeout budget changed. The final complete personal test passed in 39.50 seconds. An ignored reproduction script emitted Node DEP0190 for invoking a fixed command through the Windows shell; switching to the direct installed Vitest Node entry removed that tooling warning on rerun.

### Actual checks

- `CURATE_ZBLL=1 pnpm exec vitest run tests/unit/curate-zbll.test.ts --reporter=verbose`: PASS. Generation validates all expected classes, source mappings and full notices before writing only the three new generated outputs.
- `node node_modules/.cache/b10-reproduce-check.mjs`: PASS. All three outputs reproduce byte-for-byte; fourteen old/current source, metadata, store, ownership and notice paths retain their hashes. The scratch script is ignored, not an accepted reproduction dependency. The explicit generator above is the durable entry point.
- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS for application/test and service-worker TypeScript configurations.
- `pnpm exec vitest run tests/unit/zbll-source-gate.test.ts tests/unit/zbll.test.ts --reporter=verbose`: PASS, eight tests, final run 144.24 seconds. No ordinary-test regeneration or personal-storage access.
- `pnpm exec vitest run tests/unit/case-libraries.test.ts tests/unit/cube.test.ts tests/unit/ll-boundaries.test.ts tests/unit/ll-client.test.ts tests/unit/f2l-client.test.ts tests/unit/cross-one-storage.test.ts --reporter=verbose`: PASS, 121 retained tests, 25.07 seconds. These cover old 41/57/21 inventories, legal turns/frames, strict storage/client boundaries, supported history/backups and future-trainer rejection.
- `pnpm exec playwright test tests/browser/f2l.spec.ts --grep 'mixed OLL/PLL' --reporter=list`: PASS, one actual production browser flow, 10.7-second test, 37.3-second command. Mixed OLL/PLL and canonical/slot F2L guidance still generates and saves correctly. This is a retained-flow check, not ZBLL UI or device certification.
- `node tests/helpers/bundle-evidence.mjs node_modules/.cache/b10-bundle-evidence.json`: PASS. Build and service-worker build succeed; 52 release assets, 13 chunks and no source-rights conflicts. The existing main chunk warning remains at 546,909 bytes. Aggregate raw assets 9,538,544 bytes; executable raw 2,433,192 bytes; application raw without source archive 2,485,825 bytes.
- Final retained-evidence and built-asset checks verify all 24 historical artifacts and all 52 asset hashes/lengths, with exact new MIT notices. Release scope/initialization stays Cross/Cross+1/F2L/OLL/PLL only. No emitted executable contains the new non-PLL ID prefix.

### Handoff

B10 implementation is ready for parent source/math/code review. Parent task, master/index/summary/board and source acceptance report were not written. Historical source evidence and old source metadata remain intact. B11 and Q04 are not authorized by these results. No installed-PWA, physical-device, accessibility, audio, GPU or new ZBLL persistence claim is made.

## Parent recovery and acceptance

The native implementation response was unavailable. On the owner's next continuation instruction, parent found no active asynchronous run and recovered the completed code, retained tests and written implementation audit. This is not an invented native handoff or an independent mathematical reviewer PASS. Parent reviewed the focused identity/goal/cache/presentation changes, independent Cartesian and published-definition oracle, strict source-only notation normalization, canonical PLL reuse and production-gate boundary.

Parent ran `pnpm lint && pnpm typecheck && pnpm exec vitest run tests/unit/zbll-source-gate.test.ts tests/unit/zbll.test.ts tests/unit/ll-boundaries.test.ts tests/unit/f2l-client.test.ts --reporter=default`. PASS, 45 tests in four files, 144.43-second test duration and 172.5 seconds including lint/typecheck. This independently repeated all eight new complete-universe/default/override/regrip/import tests and 37 retained strict-boundary/client tests. Source/default failures and the initial personal-proof timeout above remain historical.

Parent ran `node tests/helpers/bundle-evidence.mjs docs/audits/ZBLL_Library_Bundle_Evidence.json`. PASS, normal client and service-worker build, 52 asset hashes/lengths, 13 chunks and no source-rights conflicts. Final release `review-1790943819144` keeps initialization limited to the existing trainers. All 24 historical evidence pins and five accepted ZBLL input pins match. The actual MIT copies are covered by the repeated new unit tests. Main-chunk warning and physical-device/latency limits remain.

B10 is accepted as a complete isolated library, not a delivered trainer. The existing 21 canonical PLL IDs, overrides and policies remain shared; new non-PLL entries have separate ZBLL dataset/identity versions. Proceed to B11's actual practice integration and then fresh Q04. No push, deployment or later-trainer/research authorization follows.

Final parent staging checks passed project whitespace, five accepted raw-source and two public MIT checkout hashes under `core.autocrlf=true`, UTF-8 for 57 added/modified files and 41 local Markdown links. Frozen upstream source/evidence/license bytes are excluded from project whitespace rewriting. The first staged UTF-8 probe exceeded Node's default child-output buffer when reading a 1,258,240-byte generated blob; rerunning with the measured blob size passed without changing any source or assertion.
