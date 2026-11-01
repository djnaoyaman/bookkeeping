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

There are 56 legacy original exercises. Explicit topic links identify related practice, not complete coverage of each requirement. Topics without related exercises remain visible and searchable. Curriculum-level self-assessment is never inferred from those exercises. Full lessons, varied application exercises and comprehensive simulations for every requirement have not been completed.

## Validation

The execution check covers nonempty curriculum for all offered units, unique requirement IDs, per-item source metadata, question migration and track separation, related exercise scope, search, missing-exercise filtering, self-assessment separation, memo escaping, persistence, and the 2026 addition. Browser rendering has not been verified in this environment.


## 2026-11-01 learning expansion checkpoint

Five foundational Nissho grade 3 lessons, 10 worked examples and 35 newly authored questions (32 author-managed families) have independent mathematical/accounting review. This is a foundational tranche, not completion of grade 3 or any other qualification. The source's 14 basic-principle rows map to 26 declared atomic objectives; tags are not proof of learning or a pass prediction.

The first 14 rows only were cross-checked against the official 2022 original's table-preserving text, the current commercial accounting table and the 2026 applicability notice. Complete 62-row visual column verification remains pending, recorded separately in the content's sourceAudit. Do not import the higher-grade additions about the relationship between net assets and capital or the extra aggregation of subsidiary-book entries as fresh grade 3 scope.

- Original table: https://www.kentei.ne.jp/wp/wp-content/uploads/2021/12/2022_shokai1-3.pdf
- Current table: https://www.kentei.ne.jp/wp/wp-content/uploads/2024/12/shogyouboki_kubun.pdf
- 2026 applicability: https://www.kentei.ne.jp/bookkeeping/35697-2/2022-2026
- Official sample use notice: https://www.kentei.ne.jp/bookkeeping/sample (copyright retained by JCCI; no unauthorized republication or commercial use). New problems use original scenarios, data, wording and solutions, not copied/number-swapped sample papers.
- CBT input rules: https://www.kentei.ne.jp/33013 (one use of each account per side within a journal task). Study-mode aggregation warns that CBT rejects duplicates; the CBT grader rejects them.
- 2027 marking change: https://www.kentei.ne.jp/51504 (all grade 3 exam modes from 2027-04-01: 45/25/30, total100, pass70). Keep this distinct from 2026 scope/marking; no complete mock is currently released.

Four simplified-scope annotations were restored for grade 3: security deposits, corporate/resident/business tax, monthly-closing portion of adjustments, and dividends. The lesson/data provenance and review hashes are preserved in `content/learning-course.json`.
