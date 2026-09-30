# Project requirements index

`docs/imports/PLAN.md` is the product source of truth. This page maps its approved scope to reserved requirement packets; it does not replace or restate the plan. Issue packets describe testable coverage and link back to the relevant plan sections.

## Requirement map

| ID | Requirement | Plan | Delivery / gate |
| --- | --- | --- | --- |
| [FR-001](issues/FR-001.md) | Offline installable app, setup readiness and safe updates | §§2, 7 | B01, B02, trainer increments, Q06 |
| [FR-002](issues/FR-002.md) | Shared cube/notation contract and interactive 3D review | §§5, 6 | G02, B02, Q01 |
| [FR-003](issues/FR-003.md) | Timer, inspection and honest preparation records | §§3.2–3.3 | D01, B03, Q01 |
| [FR-004](issues/FR-004.md) | Local sessions, statistics and progress views | §3.4 | B01, B03, trainer increments |
| [FR-005](issues/FR-005.md) | Backup, restore, migrations and storage errors | §§6.4, 7 | G02, B01, Q01, Q06 |
| [FR-006](issues/FR-006.md) | Cross difficulty ceilings and optimal review | §4.1 | B04, Q01 |
| [FR-007](issues/FR-007.md) | Cross+1 verified combined bounds and slot modes | §4.2 | B05, B06, Q02 |
| [FR-008](issues/FR-008.md) | Isolated F2L case and slot practice | §4.3 | B07, B08, Q03 |
| [FR-009](issues/FR-009.md) | OLL/PLL Time Attack and set results | §4.4 | B07, B09, Q03 |
| [FR-010](issues/FR-010.md) | Full ZBLL family/subset practice | §4.5 | B10, B11, Q04 |
| [FR-011](issues/FR-011.md) | Cross+2 two-pair challenges behind feasibility gate | §4.6 | B12 feasibility; B13 only after owner go; Q05 |
| [FR-012](issues/FR-012.md) | Verified case identity and personal algorithms | §§6.3, trainers | G02, B07, B10, trainer checks |
| [FR-013](issues/FR-013.md) | All-level guidance, accessible phone/desktop controls | §§2, 3.1 | D01, all screens, Q06 |
| [FR-014](issues/FR-014.md) | Local video reconstruction research and conditional integration | §8 | R01, R02; later integration only after go |
| [FR-015](issues/FR-015.md) | Sourced, owner-reviewed teaching modules | §9.1 | T01, editorial gate; later expansion conditional |
| [FR-016](issues/FR-016.md) | Later account and cross-device synchronization | §9.2 | S01, architecture approval; later build conditional |

## Delivery boundaries

Cross and Cross+1 with interactive review lead. F2L and OLL/PLL follow. ZBLL and Cross+2 remain committed roadmap trainers; Cross+2 cannot be presented as delivered unless its separate feasibility evidence passes and the owner authorizes integration. Video is a prominent independent research track and does not block trainer delivery. Teaching and sync are later tracks with their own approval gates.

The plan's gates, data semantics, timing rules and exclusions remain authoritative. `TECHNICAL.md` and imported `AGENTS.md` are historical and conflicting statements in them are superseded by the revised plan. No application implementation, test suite, dataset, benchmark, browser verification or historical milestone is evidenced by this requirements index.

## Current handoff

G01 requirements, G02 architecture and D01 Design are complete and reviewed. Open the [visual mockup](mockups/Training_Review.html) and [Design handoff](audits/Design_Handoff.md) for owner feedback. The [delivery master plan](tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md) and [task index](tasks/orchestrator-sessions/orch-20260930-021158/task_index.md) record the remaining work. Build and research are still pending.
