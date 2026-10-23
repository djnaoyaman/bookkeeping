# GA4 measurement

Property stream: `G-837HXKXW8Q`. Installed site-wide via Google tag. No GTM or Google Ads tag.

| Event | Trigger | Parameters |
| --- | --- | --- |
| page_view | Initial page load (once) | page_title, page_location, page_referrer |
| practice_start | First accepted answer per exercise set | exam, unit |
| answer_submit | Accepted answer (duplicate clicks ignored) | exam, unit, question_id, format |
| practice_complete | Result screen after one or more answers | exam, unit, question_count |
| mistake_retry_start | Wrong-only practice or retry button | exam, unit |
| share | Successful native share or clipboard copy | method, content_type |
| learning_view | In-app navigation | view_name |
| exam_select | Exam selector changed | exam |
| learning_export | Export button clicked | export_type |

`practice_start` measures engaged practice, not a rendered question. Export measures button use, not confirmed download. Completion includes skipped questions only in the displayed set, while question_count counts recorded answers. No answers, correctness, scores, memo contents, search strings, account identifiers or export contents are sent. Initial page location/referrer omit query strings and fragments. No custom persistent user ID is assigned. Google may process cookies and standard browser/device information.

In GA4 Admin, review enhanced measurement (especially history-based automatic page views), retention and regional consent requirements. Register event-scoped custom dimensions for exam, unit, format, view_name, export_type and content_type; avoid question_id as a report dimension unless needed due to cardinality. Register question_count as a custom metric if needed. Consider practice_complete as a key event after confirming the intended definition. These property settings are not changed by website code.

Verify receipt in Realtime/DebugView with authorized GA property access. Automated tests verify tag placement, event forwarding, deduplication and payload exclusions; they do not prove ingestion into GA.
