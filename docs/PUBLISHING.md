# Publishing

Repo: https://github.com/Digidai/metix-reports

## Enable GitHub Pages

1. Settings → Pages → Source: **GitHub Actions**
2. Workflow `.github/workflows/pages.yml` deploys `docs/`
3. Expected URL: https://digidai.github.io/metix-reports/

## Custom domain (optional later)

Add `docs/CNAME` with e.g. `reports-catalog.metix.ai` and configure DNS + Pages custom domain. Keep canonical report URLs on `metix.ai`.

## Refresh catalog

```bash
node scripts/sync-catalog.mjs
git add data/catalog.json README.md docs/index.html
git commit -m "chore: sync catalog from metix sitemaps"
git push
```
