# Automation backlog (SEO / GEO / citations)

Ranked by leverage × effort. No invented traffic numbers.

| # | Idea | Rec | Notes |
|---|---|---|---|
| 1 | Claim-level citation pack (BibTeX / quote cards from `#oj-claims`) | BUILD | Makes off-site citation easy |
| 2 | Sitemap → catalog sync Action | DONE | Daily `17 6 * * *`, weekday `7 1 * * 1-5`, `workflow_dispatch`, and `repository_dispatch` type `metix-catalog-sync` |
| 3 | RSS/Atom “new reports” feed | BUILD | Watchers + secondary discovery |
| 4 | Curated awesome-list / directory queue | BUILD | Manual editorial gate only |
| 5 | GSC API monitoring + anomaly alerts | BUILD | Index coverage, not vanity rank |
| 6 | Mention / unlinked citation capture | BUILD | Outreach to convert mentions → links |
| 7 | LLM-facing index (`llms.txt` + manifests) sync | DONE | Pages `docs/llms.txt` points at canonical `https://metix.ai/reports/llms.txt`, `https://metix.ai/reports/series/llms.txt`, and hubs. Title+URL lines only; no report bodies |
| 8 | Broad automated cross-post blasts | SKIP | Spam / reputation risk |

## Will not move the needle much

- Expecting the GitHub repo alone to rank reports
- Duplicating full articles on Pages
- Mass low-quality directory submissions
- Stale catalogs with no refresh
