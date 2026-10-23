# Curriculum source audit

Checked 2026-10-23. This repository separates curriculum requirements, learner self-assessment, and scored exercise history. Registering a requirement does not constitute providing all instruction or exercises for it.

## Sources

- Nissho 2026 applicability: https://www.kentei.ne.jp/bookkeeping/35697-2/2022-2026
- Commercial accounting table: https://www.kentei.ne.jp/wp/wp-content/uploads/2024/12/shogyouboki_kubun.pdf
- Cost accounting table: https://www.kentei.ne.jp/wp/wp-content/uploads/2021/12/2022_kogen.pdf
- Zenkei official ability standards, April 2024 revision: https://zenkei.or.jp/wp-content/uploads/1_boki_suijyun_R6.pdf
- Zenkei official revision notice: https://zenkei.or.jp/wp-content/uploads/20240425.pdf
- Zenkei detailed scope (not retrieved; HTTP 403 / unavailable): https://www.zenkei.or.jp/wp-content/uploads/2_boki_hanni_R6.pdf
- USCPA January 2026 Blueprints: https://assets.ctfassets.net/rb9cdnjh59cm/71s84dkfo3KEsoLlz4vv6G/f4314469ec5368b5b4dd0d0184f00a71/CPA_Exam_Blueprints_2026.pdf

## Scope representation

Nissho requirements retain the source page and the grade at which a table cell appears. Higher grades include lower-grade prerequisites. Short or wrapped table cells are retained as checkable specifications, not counted as independent original questions. Grade-specific depth and the simplified topics marked in the official table still require referring to that table.

The 2026 addition for interim financial reporting is separately registered. The 2027 revision is not applied to the 2026 target.

USCPA registers Area/Group/Topic headings from the 2026 Blueprint, not the full representative task prose. Mandatory subjects and elective subjects are explained in the UI. Goodwill impairment practice was moved from FAR to BAR based on the 2026 topic placement.

Zenkei's manual outline covers basic bookkeeping, grade 3, grade 2 commercial and industrial bookkeeping, grade 1 commercial/financial accounting and cost/management accounting, and the four upper-grade areas. The detailed official scope was not accessible; its grade-by-grade completeness is pending verification. Every Zenkei requirement has `scope: pending`, surfaced in the UI. Do not assert verified full coverage of Zenkei based on this data.

## Current teaching coverage

There are 56 original exercises. Explicit topic links identify related practice, not complete coverage of each requirement. Topics without related exercises remain visible and searchable. Curriculum-level self-assessment is never inferred from those exercises. Full lessons, varied application exercises and comprehensive simulations for every requirement have not been completed.

## Validation

The execution check covers nonempty curriculum for all offered units, unique requirement IDs, per-item source metadata, question migration and track separation, related exercise scope, search, missing-exercise filtering, self-assessment separation, memo escaping, persistence, and the 2026 addition. Browser rendering has not been verified in this environment.
