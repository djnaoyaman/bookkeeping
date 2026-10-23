# Search, sharing and discovery

## Canonical deployment

`site.config.json` defines the one canonical origin. The verified current deployment is `https://book-keeping-practice.mossyelf3.chatgpt.site`. Before moving the primary deployment to GitHub Pages or a custom domain, change this URL and rebuild; do not publish conflicting canonical, Open Graph, sitemap and manifest origins.

The GitHub repository creation request previously failed with `403 Resource not accessible by integration`. Source prepared under `/workspace/github/bookkeeping` is not evidence that a GitHub repository or GitHub Pages deployment exists.

## Rebuild

```sh
python3 scripts/brand_assets.py     # only when changing artwork; requires Inkscape + Noto CJK fonts
python3 scripts/build_discovery.py
python3 scripts/check_discovery.py
node tests/check.cjs                # in the public-source checkout
```

`src/index.template.html` and `dist/assets/site.css` are the application shell and stylesheet sources. Edit them rather than the generated index/author/practice pages. Learning data and browser code live in the named JS files under `dist/`. The discovery generator exports those same questions, avoiding a separate divergent question catalogue.

## Implemented

- 63 static HTML URLs: application home, 56 real question pages, 3 exam indexes, author, about and privacy.
- Each URL has unique title and canonical, a description, Open Graph and X large-image metadata with absolute image URLs, alt text and dimensions.
- Human-readable problems, answers and explanations in initial HTML. The interactive application uses the same content and supports direct question links.
- Schema.org WebSite, WebApplication, WebPage, Quiz/Question/Answer, BreadcrumbList and ProfilePage/Person where relevant. No fabricated ratings, reviews, qualifications, publication dates, course accreditation, instructor rosters, or guaranteed Google rich-result eligibility.
- `robots.txt`, a sitemap of actual canonical HTML URLs, `llms.txt` and `llms-full.txt`. The latter are supplemental reading aids, not requirements for Google AI search or mechanisms to compel citation.
- SVG favicon, multiresolution ICO, 16/32/48/96px PNGs; opaque Apple 152/167/180px icons; 192/512px app icons and a safe-area maskable icon.
- New vector BK monogram and original 1200x630 Open Graph cards; a 1200x600 X card for the main brand. Japanese content uses a French editorial palette of deep blue, white and red.
- No external font fetch. Japanese system fonts are used; the sharing images have the intended typography rendered into pixels.
- Native/copy sharing for a question's canonical URL, without advertising attribution parameters.
- Whitelisted campaign parameters persist through internal links and client-side URL updates.

## Events prepared, not connected to a collector

GA4 `G-837HXKXW8Q` is loaded once on each of the 63 static pages. `gtag` forwards fixed-schema `practice_start`, `answer_submit`, `practice_complete`, `mistake_retry_start`, `share`, `learning_view`, `exam_select` and `learning_export` events. Start means the first recorded answer. Completion means reaching the result screen; question_count reflects actual answers. Initial page_view is sent explicitly with automatic initial config page_view disabled. The page_location and referrer supplied to GA omit query strings/fragments. No answer, correctness, score, memo, internal search, identity or exported file contents are supplied. Google property enhanced measurement may emit additional automatic events and should be reviewed in GA Admin.

## Remaining account-side work

- Verify domain/property ownership in Google Search Console and Bing Webmaster Tools and submit the sitemap.
- Use URL Inspection / Rich Results Test and the social platforms' own sharing inspectors against the live URLs.
- Confirm actual crawler access on the host. Native Sites deployment and access mode can be verified in this environment; an outbound request from the executor is not a substitute for Google/SNS crawler inspection.
- Verify inbound events in GA4 Realtime/DebugView with property access, register event-scoped custom dimensions and configure retention/consent settings as appropriate. Advertising conversions are not configured.
- Select ad account, countries, target learners, budget and schedule before authorizing a campaign launch. No ad spend or account-side conversion creation has occurred.
- Keep material coverage truthful: 56 questions, full exercise coverage unfinished, Zenkei final detailed-scope reconciliation pending. Search metadata does not turn this into a complete exam-preparation course.

## References

- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
