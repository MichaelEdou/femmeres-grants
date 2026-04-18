/**
 * Find specific program URLs on funder websites using DDG site search.
 *
 * For each grant:
 *   1. Look up its funder domain from the cached provider data
 *   2. Search DuckDuckGo: "<grant title>" site:<funder-domain>
 *   3. Validate the first matching result
 *   4. Update source_url if valid
 */
import pg from "pg";
import * as dotenv from "dotenv";
import { existsSync, readFileSync, writeFileSync } from "fs";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const CACHE_FILE = "C:/tmp/hd_grants_cache.json";
const PROVIDER_CACHE = "C:/tmp/hd_providers.json";
const SEARCH_CACHE = "C:/tmp/hd_search_cache.json";

const cache = JSON.parse(readFileSync(CACHE_FILE, "utf-8")) as Record<string, any>;

let providerCache: Record<string, string | null> = {};
if (existsSync(PROVIDER_CACHE)) {
  try { providerCache = JSON.parse(readFileSync(PROVIDER_CACHE, "utf-8")); } catch {}
}

let searchCache: Record<string, string | null> = {};
if (existsSync(SEARCH_CACHE)) {
  try { searchCache = JSON.parse(readFileSync(SEARCH_CACHE, "utf-8")); } catch {}
}

function saveSearchCache() {
  try { writeFileSync(SEARCH_CACHE, JSON.stringify(searchCache)); } catch {}
}

function hostnameOf(url: string): string | null {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return null; }
}

function decodeDdgRedirect(href: string): string | null {
  const m = href.match(/uddg=([^&"]+)/);
  if (m) {
    try { return decodeURIComponent(m[1]); } catch { return null; }
  }
  return null;
}

async function searchFunder(title: string, funderDomain: string): Promise<string | null> {
  const key = `${funderDomain}::${title}`;
  if (key in searchCache) return searchCache[key];

  const q = encodeURIComponent(`"${title}" site:${funderDomain}`);
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) { searchCache[key] = null; return null; }
    const html = await res.text();

    const hrefMatches = html.match(/href="(\/\/duckduckgo\.com\/l\/\?uddg=[^"]+)"/g) || [];
    for (const h of hrefMatches) {
      const hrefVal = h.slice(6, -1);
      const decoded = decodeDdgRedirect(hrefVal);
      if (!decoded) continue;
      const host = hostnameOf(decoded);
      if (!host) continue;
      if (host === funderDomain || host.endsWith("." + funderDomain)) {
        try {
          const path = new URL(decoded).pathname;
          if (path.length > 1) {
            searchCache[key] = decoded;
            return decoded;
          }
        } catch {}
      }
    }
    searchCache[key] = null;
    return null;
  } catch {
    return null;
  }
}

async function validate(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, {
      method: "HEAD", redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(12000),
    });
    return r.ok || r.status === 405 || r.status === 403;
  } catch { return false; }
}

async function fetchProviderUrl(providerSlug: string): Promise<string | null> {
  if (providerSlug in providerCache) return providerCache[providerSlug];
  try {
    const r = await fetch(`https://hellodarwin.com/page-data/business-aid/organizations/${providerSlug}/page-data.json`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) { providerCache[providerSlug] = null; return null; }
    const d = await r.json() as any;
    const nodes = d?.result?.data?.allSingleGrantProviderPageLinks?.nodes ?? [];
    for (const n of nodes) {
      const u = n?.grantProvider?.url;
      if (u) { providerCache[providerSlug] = u; return u; }
    }
    providerCache[providerSlug] = null;
    return null;
  } catch { providerCache[providerSlug] = null; return null; }
}

async function main() {
  const { rows } = await pool.query<{ id: string; title: string; source_url: string; source_name: string }>(
    "SELECT id, title, source_url, source_name FROM grants"
  );
  console.log(`Processing ${rows.length} grants...\n`);

  let upgraded = 0, kept = 0, failed = 0;
  const BATCH = 4;

  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);

    await Promise.all(chunk.map(async (row) => {
      // If source_url already non-hellodarwin with a path, keep it
      if (!row.source_url.includes("hellodarwin.com")) {
        try {
          const p = new URL(row.source_url).pathname;
          if (p.length > 1) { kept++; return; }
        } catch {}
      }

      // Extract slug from current URL
      const slug = row.source_url.split("/").pop();
      if (!slug) { failed++; return; }

      // Get grant data from cache
      const grant = cache[slug];
      if (!grant) { failed++; return; }

      // Get provider slug
      const providerSlug = grant.grant_providers_response?.[0]?.slug;
      if (!providerSlug) { failed++; return; }

      // Get funder's homepage URL
      const funderUrl = await fetchProviderUrl(providerSlug);
      if (!funderUrl) { failed++; return; }

      const funderDomain = hostnameOf(funderUrl);
      if (!funderDomain) { failed++; return; }

      // Search DDG for "title site:funderdomain"
      const specific = await searchFunder(row.title, funderDomain);
      if (!specific) { kept++; return; }

      // Validate
      const ok = await validate(specific);
      if (!ok) { kept++; return; }

      await pool.query(
        `UPDATE grants SET source_url = $1, updated_at = NOW() WHERE id = $2`,
        [specific, row.id]
      );
      upgraded++;
    }));

    saveSearchCache();
    process.stdout.write(`\r${Math.min(i + BATCH, rows.length)}/${rows.length} | upgraded ${upgraded} | kept ${kept} | failed ${failed}`);
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n\nUpgraded: ${upgraded}, Kept: ${kept}, Failed: ${failed}`);

  const stats = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE source_url LIKE 'https://hellodarwin.com/%')::int AS hd,
      COUNT(*) FILTER (WHERE source_url NOT LIKE 'https://hellodarwin.com/%')::int AS external
    FROM grants
  `);
  console.log(`Total: ${stats.rows[0].total} | External specific: ${stats.rows[0].external} | hellodarwin: ${stats.rows[0].hd}`);

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
