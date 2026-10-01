# Cross+1 generation prototype

B05 only. PLAN 4.2 and 6.2 and FR-007 control the contract. Cross+1 remains disabled in the application until B06 and parent acceptance of the measured ranges. This prototype is not an offline-delivered trainer.

## Goal and physical base

The starting state's independent optimal Cross depth must be at most requested K. A retained outer-turn HTM witness must end with the Cross and a permitted F2L pair solved within requested L. These are ceilings, not exact depths or global combined optimality. Intermediate moves may disturb the Cross. Any-pair permits FR, FL, BR and BL; targeting permits only the requested slot.

This prototype requires a fully solved cube before every scramble. Hold the selected color at D and the frame-v1 front color forward. A solved Cross alone does not fix pair pieces or unrelated pieces and is not a supported physical base here. The canonical 54-facelet state matches the physical cube only from that fully solved base. Camera orbit does not change the training frame or slot.

Reject a candidate that already satisfies the permitted complete goal. In any-pair mode, a solved Cross plus any solved pair is already complete even if the generator had a different slot in mind. The witness slot records what the generator proves, not what a user executes. This prototype records no user execution.

## Components and experiment

New project-owned modules live in `src/cross-one/`, with no import into the production app, Cross validator or PWA readiness path.

- Reuse pinned cubing 0.63.8 for legal full-state parsing/replay and move transforms. Do not import cubing search, scramble or optional GPL modules.
- Reuse the independently proven 190,080-state Cross table and its trusted checksum/cache. That cache remains disposable in the separate solver database, never personal storage.
- Build only a small 576-coordinate corner/edge distance table per slot in memory. These distances ignore the Cross and are lower bounds only. Search uses `max(cross distance, permitted pair distance)`, with the minimum pair distance across all four slots for any-pair. Never sum unproven subgoal bounds.
- Bounded iterative-deepening search tracks the Cross and all four pairs and checks their simultaneous final goal. This projection is sufficient for the goal, but every retained solution is replayed on the legal full state before return.
- Compare random full-state filtering/search with targeted construction/filtering. Targeted construction first creates a legal goal state, then appends a bounded random tail and retains its inverse as a concrete witness. Filter the actual resulting Cross depth and complete goal. Search exhaustion cannot invalidate a correct retained construction witness, but cancellation or an elapsed request deadline still prevents return.
- Each request has immutable options/frame/versions, a seed, request ID, epoch, worker instance, deadline and node budget. Search and filtering yield in bounded chunks. The worker serializes jobs; the prototype client has no speculative next queue and terminates pending work when suspended for active timing/player work. B06 must connect that suspension before integration.
- A dedicated worker validates requests and returned full-state proofs. The client rejects stale request/epoch/options/frame/version/instance correspondence and guards deadlines/crashes. Nothing is presented by this prototype.

## Data flow and schema boundary

Test or benchmark caller -> immutable generate request -> isolated worker initialization -> candidate construction/search -> full-state legality, scramble equality, independent Cross distance and complete witness validation -> metadata-correlated client result. Cartesian test helpers independently replay scrambles/witnesses and check piece stickers and frame rotations.

The existing `Challenge` and `combined-bound` wire shapes are reused. `cap` equals requested L; `crossDepth` is the actual starting distance; `witness` is a found solution; `solvedSlots` lists actual final solved pairs, and the prototype result also names one permitted `witnessSlot`. Generator and small-table policy versions are separate from the unchanged Cross table version. Seed reproduction requires those exact versions.

Prototype versions are contract 1, engine `cubing@0.63.8`, dataset null and table policy `cross-four-labeled-edges-v1-HTM18-frame-v1+cross1-construction-search-v1-pair576-max-v1`. The reused persistent Cross bytes still pin SHA-256 `28cf7e33c5fbe83584dfaf30afbe633141e76df91c14ea647f81f3fb802c853a` independently of the memory-only pair arrays.

Personal database, backup format and application readiness stay at their accepted versions. The Cross-only semantic gate still rejects combined proofs. Pair tables are small disposable memory arrays, with no new persistent schema. No personal attempts, settings, sessions or self-reports are written by prototype tools.

## Selected strategy and provisional support

The measured strategy is targeted construction/filtering, not random-state search. Attempt eight U or side/U/inverse-side triggers and keep only those preserving the selected complete goal, then append a random tail of length 1..requested L. Retain its inverse. Filter the actual starting Cross depth and reject every already-complete permitted goal. Sampling is deliberately nonuniform after filtering. It does not silently clamp K, L or tail length to an easier tier.

The provisional desktop/touch-emulation range is K1..8 and L1..12 for all colors and any/targeted goals, with 5,000 ms and 10,000 charged construction nodes. Each candidate charges nine nodes, including its eight background attempts. Search charges visits and yields every 256 visits; construction yields each candidate and before return. Reject unsupported L rather than changing it. Do not freeze phone tiers without physical measurements.

The prototype initializes model/table work separately with a 60-second watchdog. Its client has one pending job, immutable request snapshots, real worker-instance binding and immediate terminate-on-cancel/suspend. There is no background queue. A cancelled partial initialization is not retained as a ready model.

## Failure and evidence gate

Unsupported ranges are explicit, not clamped. Node/time exhaustion returns an error without a partial or easier challenge. Cancellation immediately invalidates pending results; stale replies cannot be adopted. Initialization is separately bounded and reports actual progress. Hard requests and cancellation belong in the benchmark, not only successful warm samples.

`docs/audits/Cross_One_Feasibility.md` records the selected strategy, tested caps, hit rates, cold/warm percentiles, initialization, byte costs, sampled memory and responsiveness. Physical iPhone/Android metrics are unavailable. Desktop Chrome and touch/CPU emulation can support only provisional recommendations. Parent acceptance precedes B06 UI, storage and offline integration.
