/**
 * For each grant in the DB, fetch the hellodarwin page-data to find the
 * grant provider's official external URL, then update source_url to point
 * to the real external funder website.
 */
import pg from "pg";
import * as dotenv from "dotenv";
import { existsSync, readFileSync, writeFileSync } from "fs";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const PROVIDER_CACHE = "C:/tmp/hd_providers.json";

interface Row {
  id: string;
  source_url: string;
  title: string;
}

let providerCache: Record<string, string | null> = {};
if (existsSync(PROVIDER_CACHE)) {
  try { providerCache = JSON.parse(readFileSync(PROVIDER_CACHE, "utf-8")); } catch {}
}
function saveCache() {
  writeFileSync(PROVIDER_CACHE, JSON.stringify(providerCache));
}

async function fetchProviderSlug(programSlug: string): Promise<string | null> {
  // Fetch program page-data to find the provider slug
  const url = `https://hellodarwin.com/page-data/business-aid/programs/${programSlug}/page-data.json`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const d = await res.json() as any;
    const grant = d?.result?.data?.singleGrantPageLinks?.grant;
    const providers = grant?.grant_providers_response;
    if (Array.isArray(providers) && providers.length > 0) {
      return providers[0].slug ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchProviderOfficialUrl(providerSlug: string): Promise<string | null> {
  if (providerSlug in providerCache) return providerCache[providerSlug];

  const url = `https://hellodarwin.com/page-data/business-aid/organizations/${providerSlug}/page-data.json`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) { providerCache[providerSlug] = null; return null; }
    const d = await res.json() as any;
    const nodes = d?.result?.data?.allSingleGrantProviderPageLinks?.nodes ?? [];
    for (const n of nodes) {
      const officialUrl = n?.grantProvider?.url;
      if (officialUrl) {
        providerCache[providerSlug] = officialUrl;
        return officialUrl;
      }
    }
    providerCache[providerSlug] = null;
    return null;
  } catch {
    providerCache[providerSlug] = null;
    return null;
  }
}

async function main() {
  const { rows } = await pool.query<Row>(
    "SELECT id, source_url, title FROM grants WHERE source_url LIKE 'https://hellodarwin.com/%'"
  );
  console.log(`Processing ${rows.length} grants...`);

  let updated = 0;
  let noUrl = 0;
  const BATCH = 15;

  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);

    await Promise.all(
      chunk.map(async (row) => {
        const slug = row.source_url.split("/").pop()!;
        const providerSlug = await fetchProviderSlug(slug);
        if (!providerSlug) { noUrl++; return; }

        const officialUrl = await fetchProviderOfficialUrl(providerSlug);
        if (!officialUrl) { noUrl++; return; }

        // Validate the official URL before updating
        try {
          const res = await fetch(officialUrl, {
            method: "HEAD",
            redirect: "follow",
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(12000),
          });
          if (!res.ok && res.status !== 403 && res.status !== 405) {
            noUrl++;
            return;
          }
        } catch {
          // Timeouts/errors — still update; some funder sites are slow
        }

        await pool.query(
          `UPDATE grants SET source_url = $1, updated_at = NOW() WHERE id = $2`,
          [officialUrl, row.id]
        );
        updated++;
      })
    );

    saveCache();
    process.stdout.write(`\r${Math.min(i + BATCH, rows.length)}/${rows.length} checked, ${updated} updated`);
  }

  console.log(`\n\nDone. ${updated} updated, ${noUrl} kept on hellodarwin`);

  // Final count with official URLs
  const stats = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE source_url LIKE 'https://hellodarwin.com/%')::int AS on_hd,
      COUNT(*) FILTER (WHERE source_url NOT LIKE 'https://hellodarwin.com/%')::int AS official
    FROM grants
  `);
  console.log(`Total: ${stats.rows[0].total} | Official URLs: ${stats.rows[0].official} | Still on hellodarwin: ${stats.rows[0].on_hd}`);

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
