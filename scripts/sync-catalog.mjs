#!/usr/bin/env node
/**
 * Refresh data/catalog.json (+ README series/mapping sections + docs/index.html
 * + docs/llms.txt) from live Metix sitemaps. No secrets required.
 * llms.txt is pointers only: canonical indexes, hubs, and title+URL lines.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const UA = 'MetixCatalogSync/1.0 (+https://github.com/Digidai/metix-reports)';
const SITEMAPS = [
  'https://metix.ai/reports/sitemap.xml',
  'https://metix.ai/reports/series/sitemap.xml',
];
const CANONICAL_LLMS = [
  'https://metix.ai/reports/llms.txt',
  'https://metix.ai/reports/series/llms.txt',
];

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

function parseSitemap(xml) {
  const locs = [...xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/g)].map((m) => m[1]);
  const lastmods = [...xml.matchAll(/<lastmod>\s*(.*?)\s*<\/lastmod>/g)].map((m) => m[1]);
  return locs.map((url, i) => ({ url, lastmod: lastmods[i] || null }));
}

function classify(url) {
  if (/\/reports\/?$/.test(url)) return { kind: 'hub', slug: null, title: 'Metix AI Reports' };
  if (/\/series\/?$/.test(url)) return { kind: 'hub', slug: null, title: 'Metix AI Series Reports' };
  if (url.includes('/series/')) {
    const slug = url.replace(/\/$/, '').split('/').pop();
    return { kind: 'series', slug, title: slug };
  }
  const slug = url.replace(/\/$/, '').split('/').pop();
  return { kind: 'mapping', slug, title: slug };
}

async function titleFor(url, fallback) {
  try {
    const html = await fetchText(url);
    const m = html.match(/<title>(.*?)<\/title>/is);
    if (!m) return fallback;
    return m[1].replace(/\s+/g, ' ').replace(/\s*\|\s*Metix AI\s*$/i, '').trim() || fallback;
  } catch {
    return fallback;
  }
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

const seen = new Set();
const entries = [];
for (const sm of SITEMAPS) {
  const rows = parseSitemap(await fetchText(sm));
  for (const row of rows) {
    if (seen.has(row.url)) continue;
    seen.add(row.url);
    const meta = classify(row.url);
    const title = meta.kind === 'hub' ? meta.title : await titleFor(row.url, meta.title);
    entries.push({
      url: row.url,
      canonical: row.url,
      kind: meta.kind,
      slug: meta.slug,
      lastmod: row.lastmod,
      title,
    });
    if (meta.kind !== 'hub') await new Promise((r) => setTimeout(r, 120));
  }
}

const catalog = {
  generated_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  canonical_host: 'https://metix.ai',
  source_sitemaps: SITEMAPS,
  counts: {
    total: entries.length,
    hubs: entries.filter((e) => e.kind === 'hub').length,
    series: entries.filter((e) => e.kind === 'series').length,
    mapping: entries.filter((e) => e.kind === 'mapping').length,
  },
  entries,
};

writeFileSync(join(ROOT, 'data/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');

const series = entries.filter((e) => e.kind === 'series').sort((a, b) => a.title.localeCompare(b.title));
const mapping = entries.filter((e) => e.kind === 'mapping').sort((a, b) => a.title.localeCompare(b.title));
const md = (list) => list.map((e) => `- [${e.title}](${e.url})${e.lastmod ? ` — lastmod \`${e.lastmod}\`` : ''}`).join('\n');

let readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
readme = readme.replace(
  /## Catalog \([\s\S]*?\n## How to cite/,
  `## Catalog (${catalog.counts.total} URLs)\n\nGenerated \`${catalog.generated_at}\` from live sitemaps (${catalog.counts.series} series · ${catalog.counts.mapping} mapping · ${catalog.counts.hubs} hubs).\n\n### Series\n\n${md(series)}\n\n### Mapping\n\n${md(mapping)}\n\n## How to cite`,
);
writeFileSync(join(ROOT, 'README.md'), readme);

const lis = entries
  .map(
    (e) =>
      `<li data-kind="${esc(e.kind)}"><a href="${esc(e.url)}" rel="noopener">${esc(e.title)}</a> <span class="kind">${esc(e.kind)}</span></li>`,
  )
  .join('\n    ');
const index = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Metix AI Reports — public catalog</title>
  <meta name="description" content="Thin public directory of Metix AI talent reports. Canonical pages live on metix.ai." />
  <link rel="canonical" href="https://metix.ai/reports/" />
  <style>
    :root { font-family: system-ui, sans-serif; color: #14201b; background: #f7faf8; }
    body { max-width: 52rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.45; }
    h1 { font-size: 1.6rem; }
    .note { background: #e8f2ec; padding: .75rem 1rem; border-radius: 8px; }
    .kind { color: #5a6b63; font-size: .85em; }
    a { color: #0b5fff; }
    li { margin: .35rem 0; }
  </style>
</head>
<body>
  <h1>Metix AI Reports — public catalog</h1>
  <p class="note">This is a <strong>thin directory</strong>. Full reports: <a href="https://metix.ai/reports/">metix.ai/reports</a>. Generated ${esc(catalog.generated_at)} · ${catalog.counts.total} URLs.</p>
  <h2>All entries</h2>
  <ul>
    ${lis}
  </ul>
  <h2>LLM indexes</h2>
  <p>Pointers only. Report bodies stay on metix.ai:</p>
  <ul>
    <li><a href="https://metix.ai/reports/llms.txt">https://metix.ai/reports/llms.txt</a></li>
    <li><a href="https://metix.ai/reports/series/llms.txt">https://metix.ai/reports/series/llms.txt</a></li>
    <li><a href="llms.txt">llms.txt</a> on this site (same pointers, regenerated with the catalog)</li>
  </ul>
  <p><a href="https://github.com/Digidai/metix-reports">Source repo</a> · <a href="https://raw.githubusercontent.com/Digidai/metix-reports/main/data/catalog.json">catalog.json</a></p>
</body>
</html>
`;
writeFileSync(join(ROOT, 'docs/index.html'), index);

const pointerLines = entries
  .map((e) => `- [${e.title.replaceAll('[', '(').replaceAll(']', ')')}](${e.url})`)
  .join('\n');
const llms = `# Metix AI Reports — public catalog

> Thin pointer index for discovery. Canonical report bodies and LLM indexes live on metix.ai. This file does not copy report prose or figures.

Generated: ${catalog.generated_at}
Counts: ${catalog.counts.total} URLs (${catalog.counts.series} series, ${catalog.counts.mapping} mapping, ${catalog.counts.hubs} hubs).

## Canonical LLM indexes

- [Reports llms.txt](${CANONICAL_LLMS[0]}): canonical mapping index on metix.ai
- [Series llms.txt](${CANONICAL_LLMS[1]}): canonical series index on metix.ai

## Hubs

- [Reports hub](https://metix.ai/reports/)
- [Series hub](https://metix.ai/reports/series/)

## Catalog URLs

${pointerLines}
`;
writeFileSync(join(ROOT, 'docs/llms.txt'), llms);
console.log('synced', catalog.counts);
