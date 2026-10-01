# Cross+1 feasibility

B05 PASS for a bounded prototype, subject to parent acceptance before B06. This does not deliver a Cross+1 screen, backup support or offline readiness. The accepted Cross application remains unchanged.

## Recommendation

Use targeted construction/filtering with retained concrete witnesses. Provisionally support K1..8 and L1..12, any-pair or FR/FL/BR/BL, under a 5,000 ms request deadline and 10,000 charged construction nodes. Keep the whole requested range available; do not silently clamp low-K/high-L requests. Return explicit exhaustion and offer retry with the same options. Reject L outside 1..12 rather than guessing a higher supported cap.

For an initial desktop preview, K3/L8 is a useful moderate preset; K8/L12 allows longer witnessed solutions. K1/L1 is a valid introductory boundary. These presets are examples, not difficulty classes or promised exact depths. K1/L12 is supported but filters much harder and needs an honest loading/retry state. Keep this same ceiling contract in touch emulation. Do not freeze final phone tiers or a mobile deadline from these desktop samples.

Require a fully solved physical cube before each scramble, with the selected color down and the declared frame-v1 front color forward. A solved Cross alone is insufficient. B06 must explain this stronger base before enabling practice, keep witness slot separate from unobserved user execution, wire suspension during active timing/player work, and integrate storage/offline validation only after parent acceptance.

## Strategy and proof

The selected generator starts from solved, applies eight attempted project-authored U or side/U/inverse-side triggers, and retains only triggers whose resulting full state preserves the Cross and a chosen permitted pair. It appends a random outer-turn tail with length sampled uniformly from 1..requested L before filtering. Adjacent turns never share a face. It retains the inverse tail as the construction witness.

Filtering checks the actual starting Cross distance against K and rejects an already-complete permitted goal. Any-pair filtering checks all four pairs, not just the chosen construction target. The returned full-state witness determines actual solved slots and a permitted witness slot. Accepted tail lengths are not uniform after filtering. Low K biases them toward shorter tails. There is no hidden cap reduction, exact-K promise, uniform competition-scramble claim, or claim of optimal combined length.

This witness returns to a state with the Cross and the constructed permitted pair solved. It need not solve the whole cube. Full-state validation recomputes legal scramble/start equality, canonical centers, frame, actual independent Cross depth, witness length <=L, and the final simultaneous Cross-plus-pair goal. `cap` remains requested L. It rejects false slot metadata and candidates already satisfying the requested goal.

The comparison strategy randomizes from solved with 16 outer turns, filters the actual Cross depth and searches the simultaneous goal. Project-owned iterative-deepening search tracks the four Cross edges and all four pairs. Its admissible bound is `max(cross distance, pair distance)` for targeting and `max(cross distance, min(all four pair distances))` for any-pair. A pair table ignores the Cross and is only a lower bound. No distances are summed. Same-face combination and one ordering of commuting opposite faces prune redundant paths. Every found witness is replayed on the full legal state. Search may disturb the Cross between start and goal; no optimal-prefix or cross-preserving insertion claim is made.

The four pair tables contain only 576 corner/edge coordinates each. They do not masquerade as a combined completion table. Search yields every 256 charged visits and after each depth; construction yields after each candidate and before return. Cancellation/deadline checks occur during work and after the final yield. A correct construction witness does not trigger unnecessary search, but it cannot survive cancellation or an expired deadline. Node exhaustion is explicit and does not return a partial challenge.

## Measured conditions

Retained raw samples are in `cross-one-runtime-evidence.json`, captured at `2026-10-01T20:31:01.234Z`. The executable helper is `tests/helpers/cross-one-benchmark.mjs`.

- Windows, Node 24.16.0, installed headless Chrome 154.0.8037.59.
- AMD Ryzen 5 4600H, 12 logical CPUs, 33,685,835,776 bytes reported RAM.
- Localhost port 4185. Vite builds an optimized standalone prototype into ignored `test-results/cross-one-benchmark`; it does not change the application build or manifest. No personal database is opened. Each cold sample uses a fresh disposable browser context and solver cache.
- Five cold worker initializations and five replacement-worker warm-cache initializations. Cold generation below means first request after cold initialization, not initialization plus download.
- Six Chrome warm construction groups, 32 deterministic requests per group. Each request has 5,000 ms and 10,000 nodes. Nearest-rank percentiles are wall-clock worker RPC times through the client guard and full generator validation, not only transition time.
- Node uses Vite's SSR TypeScript loader, not the optimized browser bundle. Five table/pair builds and 16 requests per strategy/configuration, alternating any-pair and FR. Construction gets 5,000 ms/10,000 nodes; comparison search gets 300 ms/20,000 nodes. Different budgets are explicit. Search's lower hit rate is evidence against that short-budget strategy, not proof that deeper search can never work.
- Chrome hard comparison gets 300 ms/20,000 nodes. Eight separate zero-node construction requests force exhaustion. Five cancellations post a real worker cancel after 10 ms of hard search.
- Touch emulation is 390x844 with 4x CPU throttling on the page CDP target. Worker throttling was not independently established. There are no physical-phone measurements.

## Chrome results

| Operation | Samples | p50 ms | p95 ms |
| --- | ---: | ---: | ---: |
| Cold worker load, Cross build/cache write, pair initialization | 5 | 1,219.7 | 1,268.5 |
| Replacement worker with verified warm Cross cache | 5 | 145.3 | 154.1 |
| First K8/L12 any-pair request after cold initialization | 5 | 23.9 | 26.5 |

Pair initialization alone took 4.9..7.0 ms in the cold samples and 4.7..6.6 ms in warm replacements.

| K / L / permitted goal | Requests returned | p50 ms | p95 ms | Accepted candidates / tried |
| --- | ---: | ---: | ---: | ---: |
| 1 / 1 / any | 32/32 | 12.5 | 27.7 | 84.2% |
| 1 / 12 / any | 32/32 | 73.7 | 271.3 | 10.0% |
| 1 / 12 / FR | 32/32 | 85.1 | 346.0 | 7.9% |
| 3 / 8 / FL | 32/32 | 17.9 | 52.0 | 48.5% |
| 8 / 12 / BR | 32/32 | 7.5 | 10.8 | 94.1% |
| 8 / 12 / BL | 32/32 | 7.0 | 8.5 | 100.0% |

The 192/192 request hit rate is the observed sample, not a universal guarantee. K1/L12 any-pair returned actual Cross depths 0 or 1 and witnesses of lengths 1, 2, 3, 6 or 7. Cross depth 0 is allowed when no permitted complete pair goal is already true. K3/L8 returned depths 1..3 and witness lengths 1..8. K8/L12 groups returned depths 1..7 and lengths up to 12. Selecting K8 does not require actual depth 8.

All eight zero-node requests returned `budget-exhausted` in 0.2..1.1 ms. Of eight hard random-search requests, six returned verified witnesses and two exhausted the 300 ms deadline. Their failure round trips were 304.2 and 305.8 ms, including message/watchdog overhead. These requests are separate from successful construction percentiles. Failed requests never returned weaker challenges.

Cooperative cancellation reply latency after posting cancel was 4.7, 5.4, 4.1, 6.2 and 1.9 ms. All five replies were `cancelled`. Main-thread 16 ms interval sampling across initialization, generation, hard requests, cancellation and wire rejection captured 812 intervals: p50 16.1 ms, p95 17.2 ms, maximum 18.0 ms. This standalone harness has no active renderer/timer. It proves worker responsiveness under this workload, not concurrent player performance. The client terminates work on suspension; B06 must call that before timing/player activity rather than run a background queue.

Touch/CPU emulation returned 32/32 mixed K1/8, L12, any/FR requests, p50 12.7 ms and p95 180.5 ms. Its initial worker setup was 1,169.3 ms. The mixed workload and uncertain worker throttling make this provisional desktop-emulation evidence, not an Android/iPhone percentile.

## Node comparison

| Strategy | K / L | Returned / 16 | p50 ms | p95 ms |
| --- | --- | ---: | ---: | ---: |
| Construction | 1 / 12 | 16 | 158.0 | 410.6 |
| Construction | 3 / 8 | 16 | 45.7 | 91.7 |
| Construction | 8 / 6 | 16 | 30.8 | 32.4 |
| Construction | 8 / 12 | 16 | 30.0 | 31.7 |
| Random filtering/search | 1 / 12 | 0 | 309.9 | 313.3 |
| Random filtering/search | 3 / 8 | 1 | 310.3 | 314.3 |
| Random filtering/search | 8 / 6 | 6 | 305.0 | 313.6 |
| Random filtering/search | 8 / 12 | 9 | 270.0 | 316.4 |

Comparison percentiles include failures, which remain explicit in the raw sample. Candidate hit rates for comparison search are conditional on successful requests because failed exceptions do not retain candidate counters; they are not reported as whole-run candidate hit rates. Request hit rates above include every request.

Node model load took 32.8 ms. Five fresh Cross/pair builds had p50/p95 3,163.1/3,253.3 ms, with pair initialization p50/p95 56.5/60.3 ms. Node timer scheduling and SSR overhead differ from optimized Chrome. These results select construction/filtering, not a speculative large combined table or a weaker sequential metric.

## Bytes and sampled memory

| Item | Bytes |
| --- | ---: |
| Existing persistent Cross distance payload | 190,080 |
| Cross live coordinate/transition/distance arrays | 2,277,936 |
| New four pair distance arrays | 2,304 |
| New pair transitions and corner transitions | 21,168 |
| Total live typed-array payload | 2,301,408 |
| Temporary Cross BFS queue while building | 760,320 |
| Standalone harness and emitted assets, raw / gzip / Brotli | 361,756 / 96,970 / 84,785 |

Standalone assets include duplicate model chunks and test harness code. These are actual experiment bytes, not an estimated incremental B06 download or the existing application's offline size. Pair BFS uses a small temporary JavaScript queue, not a giant unconstrained pair BFS. Pair arrays are memory-only, disposable, and carry the prototype policy version. The only persistent solver entry remains the existing separately checksummed Cross cache. No personal schema/version changes occur.

CDP sampled V8 memory every 50 ms through construction and hard/exhausted requests, rediscovering workers after watchdog replacement. It captured 218 worker and 219 main-thread snapshots. Observed worker maxima were 7,168,484 bytes of V8 used heap, 22,317,280 bytes of backing storage and 27,673,560 bytes for heap plus backing in the same snapshot. Main-thread used heap maximum was 4,101,292 bytes. Repeated explicit worker reinitializations in the hard benchmark can retain old disposable arrays until GC; this is not the 2.3 MB live-array payload. The final worker snapshot was unavailable after secondary-worker termination, not zero memory. Cancellation sampling may see the idle primary worker rather than the short-lived secondary search worker.

Node samples include the whole Vite SSR loader process. Observed maxima were RSS 222,212,096 bytes, heap used 85,897,480 bytes and ArrayBuffers 8,518,219 bytes. Do not label them isolated solver memory.

These are sampled observations, not true process/GPU peaks, forced-GC retained memory, storage quota cost, thermal/battery or long-session leak measurements. Compression is per emitted asset using Node zlib, not a network-transfer guarantee.

## Verification

`tests/unit/cross-one.test.ts` independently builds the Cartesian Cross reference graph and checks actual generated depths. It independently derives every corner/pair transition and all four 576-state lower-bound tables, then verifies full legal scrambles and witnesses across 216 construction samples: every color, every slot and any-pair at K/L boundaries, plus all K1..8/L1..12 combinations. Legality follows from independent Cartesian replay from solved as well as the approved model's legality parser.

Additional fixtures prove an actual depth-eight Cross with a complete eight-turn witness and rejection under K7, all four any-pair search choices, rejection of a wrong targeted goal, Cross-depth-zero practice, a combined witness that temporarily disturbs the Cross, actual random-filter/search output, proper six-color physical rotations, already-complete rejection, malformed state/proof/version/frame/slot metadata, unsupported bounds, finite budgets, node/time exhaustion and cancellation after a candidate yield. A correct concrete construction witness returns without unnecessary search even with only one candidate's node allowance.

`tests/unit/cross-one-client.test.ts` checks immutable request snapshots, stale request ID/epoch/K/L/slot/mode/frame/version replies, other worker instances, cancellation, late replies, suspension, watchdog termination, crash, exhaustion and witness-slot correspondence. These fixtures are metadata/error tests, not solver evidence. Cartesian replay also independently verified all 235 returned Chrome benchmark challenges against an independently built Cross graph and simultaneous final goals. The evidence retains raw latency/metadata samples; repeated full wire snapshots were removed after this check. Ten real Chrome worker wire checks separately rejected wrong versions, K, L, slot, frame, request ID, request worker instance, initialized instance and zero node/time budgets.

Actual commands on final code:

- `pnpm exec vitest run tests/unit/cross-one.test.ts tests/unit/cross-one-client.test.ts tests/unit/cross-client.test.ts tests/unit/pwa.test.ts`: 42 passed in four files.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed for application/tests and service worker.
- `pnpm build`: passed, including service worker.
- `node tests/helpers/cross-one-benchmark.mjs`: passed the optimized Chrome benchmark, real worker cancellation/wire checks and Node comparison; no page errors. Measurement code ran after the final solver fixes.
- `node tests/helpers/cross-one-benchmark.mjs --verify-retained`: independently verified all 235 returned Chrome challenges and compacted repeated wire snapshots without changing measured latency/metadata. This one-time mode consumes uncompacted evidence. Normal future benchmark runs now include the same independent verification before writing evidence.
- `pnpm exec playwright test tests/browser/cross.spec.ts --reporter=list`: three production Cross regressions passed. These cover cold offline generation, Space/touch timing and save, never-opened 3D, history/restore, settings/cancel adoption, frame/phone fit and cache repair retaining a real attempt.
- Read-only inspection of the built release manifest confirmed scope `cross-practice`, unchanged Cross table identity and no Cross+1 worker/harness asset. No production UI, Cross validator, PWA/readiness, storage, input or package files were changed.

An early typecheck found a literal-only default color parameter and duplicate object fields in the new Node helper. Both were fixed; the checks above reran successfully. No runtime assertion, deadline or existing test was weakened. The first retained experiment also passed; final measurements above replace it after request snapshot/worker correspondence and budget validation fixes.

The full unrelated unit/browser suite was not rerun for extra counts. Physical iPhone Safari, Android Chrome, Firefox, installed-PWA restart, GPU/thermal/battery and sustained combined renderer/timer workloads remain unrun. No deployment, dependency, Git, branch, task, board, master plan or index edits were made.

## Changed paths and next gate

Created `src/cross-one/{model,search,validation,generate,protocol,one.worker,client}.ts`; `tests/unit/cross-one.test.ts` and `cross-one-client.test.ts`; `tests/helpers/cross-one-oracle.ts`, `cross-one-node.ts`, `cross-one-harness.html`, `cross-one-harness.ts`, `cross-one-benchmark.mjs`; `docs/features/Cross_One_Trainer.md`; this audit and raw runtime evidence.

FR-007's bounded-generation proof has useful measured support. There is no confirmed blocking defect from the focused implementation/review pass. Parent reviews the supported range and stronger physical-base requirement before B06. B06, not this prototype, owns enabled UI, attempt statistics, semantic backup acceptance, offline assets/readiness and representative physical-phone sessions.

## Parent range acceptance

The parent inspected construction/filtering, request bounds and full-state witness validation, then independently repeated the 42-test focused unit run, lint, strict typecheck, production build and project whitespace checks. All passed. The original coder's three production Cross browser checks and measured benchmark remain separately reported above; they are not relabeled as parent checks.

Parent accepts K1..8/L1..12 with any-pair and FR/FL/BR/BL goals for provisional desktop/touch-emulated B06 integration, using the measured construction route, 5,000 ms and 10,000 charged construction nodes. These are not physical-phone tiers. Require an explicit fully solved physical base before every scramble, with correct holding frame. Cross-only practice keeps its existing solved-Cross base. B06 must explain the difference, retain hidden any-pair witness metadata until post-attempt review, keep save/backup/readiness semantics strict and undergo Q02 before the next trainer. No prototype source has been pushed automatically.
