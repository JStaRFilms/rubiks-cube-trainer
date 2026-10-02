# B10 source acceptance review

## Objective

Review the source-only block before asking the owner to change the product. Decide whether the inspected publisher licenses establish a usable source under this project's rules, whether concrete conflicting restrictions exist, or whether a source decision remains unresolved. Do not invent ownership or an upstream grant. Do not require an unlimited chain-of-title audit without identifying which approved source rule requires it.

## Setup and scope

Use reviewer, `openai-codex/gpt-6.1-sol`, medium effort, fresh context, read-only capabilities and unslop. No network requests remain in this source round. Coder used eighteen and parent used two publisher policy lookups. No author contact, executable source evaluation, writes, Git operations, source import or product changes.

Read these files:

- `docs/imports/PLAN.md` section 4.5, `docs/issues/FR-010.md`
- `docs/data/Case_Sources.md`, `docs/audits/Case_Libraries_Verification.md`
- `docs/features/ZBLL_Library.md`, `docs/audits/ZBLL_Library_Verification.md`
- `docs/data/zbll-source-evidence/manifest.json`
- Exact new MIT grants/readmes and AlgDB project-policy README in that evidence directory
- Inspect the already downloaded `node_modules/.cache/b10-stig-algs.js`, `b10-r2-zbtrain-algorithms` and `b10-r2-brief-algs` only as static text if needed. Do not execute or copy defaults into a report.
- Existing pinned case-source artifacts/licenses and `src/data/sources.json` if needed to compare the accepted baseline policy

## Known facts

The owner requested ZBLL and then chose continued sourcing, not a weaker generated/two-stage fallback. AlphaSheep's MIT data has 493 labels/definitions without inspected defaults. ZBTrain's MIT repository has 472 non-PLL labels with nonempty first default strings and credits Roman Strakhov's algorithm/scramble casemap. Existing verified 21 PLL entries can provide the remaining membership only after independent physical mapping. Stig115 has a MIT grant and attributes defaults to AlgDB. Inspected MIT grants have no file-specific exclusion in the examined headers/readmes. No upstream permission document has been found.

AlgDB's inspected current project README says its code is GPL version 3 or later. It does not establish the license of the historical submitted-algorithm collection. No GPL project code has been imported, nor has any algorithm dataset been declared GPL.

The prior coder treated the missing independent upstream grant as a source blocker. Parent needs an independent assessment of this decision, not automatic promotion of every uncertainty into a confirmed defect. Likewise, do not call attribution alone proof of ownership or dismiss a concrete exclusion. Root MIT grant, provenance, functional move strings versus copied implementation/diagrams/lessons, and any distinct collection obligations need separate analysis. Avoid legal guarantees and distinguish evidence from assumptions.

## Definition of done and return artifact

Return a short read-only markdown report with PASS, FAIL or BLOCKED for source acceptance. Cite exact filenames/lines and relevant notices. State what is actually licensed, what is not established, any confirmed conflicting restriction, and whether publisher MIT permission plus preserved attribution supports accepting move-string data under the approved policy. If BLOCKED, identify the missing decision precisely. If acceptable, give the narrow allowed import and required notices without asserting unverified upstream permission.

No mathematical coverage/default correctness is certified here. All 7,776-state/493-class/source-label/setup/angle/frame/regrip/override proofs remain after source selection, and B11 remains closed. Full Q04 review follows actual integration. Parent owns source acceptance, writes this report if needed and controls task state/Git.
