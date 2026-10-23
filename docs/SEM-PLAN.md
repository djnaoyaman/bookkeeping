# SEM preparation

No campaigns have been created or launched. Budget, target region, account and conversion settings remain to be selected.

## Landing-page and intent map

| Theme | Search intent | Landing page | Proposed ad messaging |
| --- | --- | --- | --- |
| 日商簿記 | 仕訳 練習 / 簿記 計算問題 / 簿記 間違い 復習 | `/exams/nissho.html` | 仕訳を入力して反復演習 / 解説を読んで、誤答を解き直す |
| 全経簿記 | 全経 簿記 練習 / 全経 工業簿記 問題 | `/exams/zenkei.html` | 全経簿記の収録問題を練習 / 基礎から科目を選んで解く |
| USCPA | USCPA 英語 問題 日本語 解説 / FAR 練習 | `/exams/uscpa.html` | 英語の問題、日本語の解説 / 科目別に解いて理解を確かめる |

Exclude or separately review queries implying unrelated services, official affiliation, guaranteed passing, job placement, CPA licensing application services or fully comprehensive courses. Do not advertise 56 original exercises as an all-inclusive qualification course. Avoid broad matching until search-term quality and conversion data can be reviewed.

## Campaign URL convention

Use consistent source/medium/campaign names, for example:

`/exams/nissho.html?utm_source=google&utm_medium=cpc&utm_campaign=nissho_practice&utm_content=journal_v1`

Production tests must preserve real click IDs/UTM values through landing-page to exercise navigation. Canonical and shared question URLs omit these values. Never put a learner's answer, memo or personal information into a URL or analytics event.

## Measurement

- Landing-page engagement alone is insufficient to claim learning.
- `practice_start`: the first accepted answer of an exercise session.
- `practice_complete`: a session with recorded answers reaches its end.
- `mistake_retry_start`: selecting the mistake-review mode.
- `share`: a successful native share or clipboard copy.

These are currently local event-queue entries only. Configure the selected analytics service and verify data transmission before reporting conversions. Reconcile a practice-completion conversion to the actual question count: a two-question unit must not be reported as a five-question completion.

## Launch prerequisites

Confirm ad account, daily/monthly spend ceiling, geography, schedule and target course; connect the chosen analytics/advertising account; review ad and landing-page claims; validate real conversions and attribution; then obtain the budget-specific go-ahead before starting paid delivery.

No fabricated traffic forecasts, cost-per-click, acquisition cost, click-through rate, or expected pass-rate uplift are supplied.
