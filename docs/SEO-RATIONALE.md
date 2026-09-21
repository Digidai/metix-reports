# SEO rationale — GitHub catalog + Pages

**Verdict: BUILD-LIGHT**

## What it can help

- Extra crawl/discovery paths to canonical `metix.ai` URLs
- Public citation surface (README, `catalog.json`, Pages directory)
- Brand/entity consistency for Metix reports
- Operational freshness when synced from sitemaps

## What it will not do

- Pass strong link equity by itself (GitHub-rendered outbound links are commonly `rel="nofollow"`; still usable as discovery hints)
- Replace Google Search Console indexing work, internal linking, or unique citeable claims on-site
- Magically raise rankings without continuous useful content on the canonical host

## Risks (avoided by this design)

- Full-body mirrors on Pages → duplicate / competing URLs
- Missing `rel=canonical` to metix.ai
- Spammy mass directory submissions

## Relative leverage (higher → lower)

1. Unique, citeable claims + dual CTAs on metix.ai
2. Hub internal links + sitemaps + GSC inspection
3. Real third-party mentions (newsletters, posts, curated lists)
4. This public catalog / github.io thin index
5. Low-quality directory blasts (skip)
