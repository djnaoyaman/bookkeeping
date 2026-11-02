# Industrial chapter 07 — independent content and calculation review

Reviewed 2026-11-02 at 09:44 UTC by `/root/advance_remaining_site_backlogs/job_order_independent_review`, a separate reviewer from the chapter author `/root/advance_remaining_site_backlogs`.

## Finding

**PASS for the exact chapter lesson/question objects identified in `review-record.json`; no blocking content or calculation correction found.** This is independent editorial/computation evidence, not a GitHub approval, an integration/UI/CI result, publication, proof of full examination coverage, or an official marking-equivalence claim.

Reviewed input: `industrial-job-order-draft/industrial-07-draft.json`, file SHA256 `f94e07850adf6b108ec511e7539b40188036cb8abb8e2e15d2eeee452c8dc6a4`. The author file is unchanged, still a draft with source verification pending and no embedded review records. An owner may incorporate this genuine record and update release metadata after applicable integration checks. Changes to lesson or question objects invalidate the associated hashes and require re-review.

## Independence and method

1. Read only the key-stripped prompt packet for the calculation pass. Its SHA256 was `84e54f325c8002baba8351cb510cfaaf4646d9b236bfe00248922aa404447795`.
2. Wrote and executed `derive-independent.cjs`, producing `independent-computations.json`, **before** opening the full draft. The derivation file expresses the arithmetic and semantic journal answers independently. Did not read, reuse, or execute the author's test script, author-derived answers, or author result file.
3. Read the complete lesson (10 sections, 8 objectives, all 6 worked examples and chapter pitfalls), then all 14 questions: prompts, exhibits, choices and option labels, rubric values, units, explanations, checks, and misconceptions. Compared each keyed result with the previously saved computations. All 51 scoring components agree.
4. Independently visited official applicability and source PDF URLs, and inspected the actual page 1 image pixels, including the Grade 2 / Grade 1 divider rather than assigning columns from OCR order.
5. Wrote an independent test harness, using the existing assessment engine and schema validator without modifying either. No author-file, source-file, candidate, GitHub, browser, CI, or deployment mutation was performed.

## Official scope verification

The [official applicability page](https://www.kentei.ne.jp/bookkeeping/35697-2), visited on 2026-11-02, says the 2022 table remains applicable for FY2026 examinations through 2027-03-31. It distinguishes FY2027 applicability from the current examination period. This review therefore uses the [actual 2022 industrial bookkeeping/cost-accounting table](https://www.kentei.ne.jp/wp/wp-content/uploads/2021/12/2022_kogen.pdf), not a future commercial-bookkeeping revision.

Visual evidence inspected: `industrial-departments-draft/scope-page1.png`; official PDF page 1 was also opened and its screenshot requested. On the right-hand table, **the left column is Grade 2**. Section X contains the following five mapped requirements in that column:

- `nissho-8f82b6d44a80`: purpose of individual job costing.
- `nissho-518843dbb4d4`: manufacturing orders and cost sheets.
- `nissho-f1d12ed9ccbe`: calculation methods and bookkeeping.
- `nissho-ae5b20dac83f`: spoilage-cost calculation using a separately issued repair order.
- `nissho-be1b1e861f67`: charge to the specific original job order.

Replacement orders, methods without repair/replacement orders, departmental-indirect spoilage treatment, and scrap treatment appear in the **Grade 1 column**, and are expressly excluded from this chapter. The lesson does not incorrectly promote them into Grade 2 coverage. Its limited normal-repair scenario, fixed good-output count, absence of salvage/scrap, and one-time charge to the original order are explicit. The chapter does not claim that its 14 questions establish whole-course or examination completeness.

## Independent calculations

Amounts below are yen unless a unit cost or semantic answer is identified. Full formulas and field identities are in `independent-computations.json`.

| Question suffix | Independent result |
|---|---|
| purpose | `job`, `record`, `separate` |
| documents | `order`, `sheet`, `time` |
| cost-sheet | overhead 18,000; job 120,000; 1,200 per good unit |
| two-jobs | overhead A/B 24,000/36,000; job A/B 80,000/120,000; total 200,000 |
| job-status | A/B/C 72,000/56,000/44,000; completed 116,000; ending WIP 56,000; ending FG 72,000; COGS 44,000 |
| missing-current | current 144,000; available 190,000; reconciliation 0 |
| completion-journal | debit 製品 126,000 / credit 仕掛品 126,000 |
| sale-cost-journal | debit 売上原価 84,000 / credit 製品 84,000 |
| unsold-completed | FG available 132,000; COGS 108,000; gross profit 72,000 |
| repair-specific-job | repair overhead 2,400; repair total 8,400; final job 104,400; 1,740 per good unit |
| repair-not-double | completed 95,000; duplicate excess 7,000; remaining repair-order balance 0 |
| multi-month-order | opening 60,000; current 48,000; completed 108,000; ending WIP 0 |
| manufacturing-flow | current 126,000; WIP available 160,000; completed 114,000; COGS 108,000; gross profit 72,000; WIP check 0 |
| completion-vs-sale-choice | unfinished 仕掛品; completed unsold 製品; sold 売上原価 |

All six worked examples were independently computed before the full lesson was read, then manually compared against every displayed step and final answer:

1. Order M: overhead 16,000; total 100,000; unit 1,250.
2. Orders D/E/F: cumulative 60,000/50,000/40,000; completed 100,000; ending WIP 50,000; total 150,000.
3. Finished goods: available 125,000; COGS 90,000; gross profit 60,000.
4. Order N: first debit 製品 / credit 仕掛品 75,000, then debit 売上原価 / credit 製品 75,000. Two transfers do not double the cost.
5. Order V repair: overhead 5,000; repair total 12,000; final original job 94,000; unit 1,880.
6. Integrated balances: current 104,000; available WIP 130,000; completed 100,000; COGS 94,000; gross profit 66,000.

## Full-text / pedagogical review

- The first two conceptual questions have unique correct choices under their expressly stated document system. Company names and industries are not treated as determinative of costing method.
- Direct costs and allocated overhead are distinguished; fixed rates multiply actual hours, not quantity or price. Tables and prose carry identical amounts and job labels.
- Opening WIP is retained, current additions are not mistaken for cumulative costs, and completion is distinct from sale. All-or-nothing completion/sale assumptions exclude partial-output ambiguities.
- Completion and sale journals request cost transfers only. Revenue entries, tax, and previously accumulated direct costs must not be added again.
- Both repair problems state whether the repair transfer has already happened. The answer never counts a repair order as additional output or repeats its cost after transfer. Units use the specified good output, with no invented salvage or abnormal-spoilage adjustment.
- Zero is a real answer for balance checks and cleared repair/WIP balances, not an empty-field default.
- The lesson's eight objectives each have relevant practice; the methods and recordkeeping objective appropriately connects cost sheets, job status, and the two inventory transfer stages. Explanations and pitfalls are consistent with the problems' limited assumptions. No false calculation or source-boundary claim was found.

## Reproducible assessment checks

From the shared workspace:

```sh
node remaining-backlogs-20261102/industrial-job-order-review/derive-independent.cjs
node remaining-backlogs-20261102/industrial-job-order-review/independent-tests.cjs
node remaining-backlogs-20261102/industrial-job-order-review/build-and-check-record.cjs
```

`independent-results.json` records **14/14 independently derived whole-question responses**, **122 formatting/mode positive cases**, and **916 negative cases**, all passing; **1,075 assertions with zero failures**. The 916 negatives include 18 explicitly constructed conceptual errors, not merely random numeric perturbations.

Coverage includes every numeric/choice field; every incorrect offered choice; absent/blank/null/whitespace input; zero versus absent input; ±1 and wrong sign; malformed grouping, appended units, unsupported fractional precision, scientific notation, non-numeric/overflow values; each journal account/side/amount, missing rows, extra balanced and unbalanced rows, zero/empty rows, and reverse entries. Conceptual negatives cover opening-cost loss/double counting, completed-equals-sold, wrong overhead base, whole-factory double allocation, ending-FG omission, repair duplication, and a doubled good-output denominator.

The unchanged engine intentionally aggregates split same-side/account rows in **learning** mode and emits a warning; these are counted as documented positive variants, not falsely described as rejected errors. The same split response is rejected in **CBT** mode. Added duplicate full-value rows and unrelated extra entries do not obtain full credit.

Original engine SHA256: `5bcdda63e164f0d7b2ee0d3626cb350aa09ee29e53ae76c0dcc335ac70fb60a5`.
Original validator SHA256: `421df13f57621d37806d28549a3256d6739bbdd0655c4ec1ab50f30dcc86f091`.

The unchanged validator passes the draft's schema/mapping check and **correctly rejects publication of the untouched draft**, because reviewed status, completed source-verification metadata, and matching review records have not yet been integrated. A reviewer-only in-memory fixture with this actual review record passes the chapter publication gate; deliberate question/lesson changes invalidate that record and are rejected. This gate test is not a change to release files and is not whole-site validation.

## Handoff limits

The hash-bound review covers only these exact lesson and question objects and the specified official scope. No local browser was launched; no live UI behavior, production state, build, or remote CI was reviewed here. Cross-chapter aggregation, actual metadata integration, deployment conflict checks, and any authorized publication remain the parent's responsibility. No outreach, form, email, YouTube, credential, or other external action was attempted.
