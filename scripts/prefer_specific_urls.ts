/**
 * Rebuild URLs to prefer specific program pages:
 *  1. Any external (non-hellodarwin) URL embedded in the grant's HTML fields
 *     (description, steps, additional_information, etc.)
 *  2. Falling back to hellodarwin's specific /programs/{slug} page
 *     (which is always a specific grant guide, not a homepage)
 *
 * Never use just the funder's homepage — we always want a specific URL.
 */
import pg from "pg";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { createHash } from "crypto";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const CACHE_FILE = "C:/tmp/hd_grants_cache.json";

function hash(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"').replace(/&mdash;/g, "—").replace(/&ndash;/g, "–")
    .replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Extract the best specific program URL from a grant's HTML fields.
 * Returns null if no external URL found.
 */
function findEmbeddedProgramUrl(grant: any): string | null {
  const textFields: string[] = [];

  const tf = [
    grant.grant_description_long, grant.additional_information,
    grant.steps_how_to_apply, grant.eligibility_criteria,
    grant.eligible_expenses, grant.who_can_apply,
    grant.processing_agreement, grant.documents_needed,
  ];
  for (const f of tf) if (f) textFields.push(String(f));

  for (const s of (grant.grant_steps || [])) {
    if (s?.description_en) textFields.push(String(s.description_en));
  }

  const text = textFields.join(" ");

  // Match URLs
  const urlMatches = text.match(/https?:\/\/[^\s"<>()\]]+/g) || [];

  // Filter out hellodarwin, framework assets, social media, generic homepages
  const blacklistHosts = [
    "hellodarwin.com", "assets.hellodarwin.com",
    "framer.com", "gstatic.com", "googleapis.com",
    "facebook.com", "twitter.com", "x.com", "linkedin.com",
    "instagram.com", "youtube.com", "youtu.be", "tiktok.com",
  ];

  const candidates = urlMatches
    .map(u => u.replace(/[.,;:!?)]+$/, "")) // trim trailing punctuation
    .filter(u => {
      try {
        const host = new URL(u).hostname.replace(/^www\./, "");
        if (blacklistHosts.some(b => host === b || host.endsWith("." + b))) return false;
        // Keep URLs that point to a specific path (not just homepage)
        const path = new URL(u).pathname;
        return path.length > 1; // has a path beyond "/"
      } catch { return false; }
    });

  return candidates[0] ?? null;
}

async function main() {
  const cache = JSON.parse(readFileSync(CACHE_FILE, "utf-8")) as Record<string, any>;

  // Get all grants currently in DB
  const { rows: existing } = await pool.query(
    "SELECT id, title, source_url FROM grants"
  );
  console.log(`Processing ${existing.length} grants...`);

  let withEmbedded = 0;
  let fellBackToHelloDarwin = 0;
  let failed = 0;

  for (const row of existing) {
    // Find the grant in cache by title match
    const entry = Object.entries(cache).find(([, g]: [string, any]) =>
      g && (g.grant_display_title === row.title || g.grant_title === row.title)
    );

    if (!entry) { failed++; continue; }
    const [slug, grant] = entry as [string, any];

    const embeddedUrl = findEmbeddedProgramUrl(grant);
    const hdUrl = `https://hellodarwin.com/business-aid/programs/${slug}`;

    const bestUrl = embeddedUrl ?? hdUrl;

    if (embeddedUrl) withEmbedded++;
    else fellBackToHelloDarwin++;

    await pool.query(
      `UPDATE grants SET source_url = $1, updated_at = NOW() WHERE id = $2`,
      [bestUrl, row.id]
    );
  }

  console.log(`\n${withEmbedded} grants now point to specific funder program URLs`);
  console.log(`${fellBackToHelloDarwin} grants use hellodarwin's specific program guide`);
  console.log(`${failed} grants couldn't be matched in cache`);

  // Validate all URLs
  console.log(`\nValidating updated URLs...`);
  const { rows: all } = await pool.query("SELECT id, source_url FROM grants");
  let alive = 0, dead = 0;
  const deadIds: string[] = [];

  const BATCH = 15;
  for (let i = 0; i < all.length; i += BATCH) {
    const chunk = all.slice(i, i + BATCH);
    const results = await Promise.all(
      chunk.map(async (r) => {
        try {
          const res = await fetch(r.source_url, {
            method: "HEAD", redirect: "follow",
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(12000),
          });
          // Treat 200/405/403 as alive (some servers block HEAD)
          return { r, ok: res.ok || res.status === 405 || res.status === 403 };
        } catch { return { r, ok: false }; }
      })
    );
    for (const { r, ok } of results) {
      if (ok) alive++;
      else { dead++; deadIds.push(r.id); }
    }
    process.stdout.write(`\r${Math.min(i + BATCH, all.length)}/${all.length}`);
  }

  console.log(`\nLive: ${alive}, Dead: ${dead}`);
  if (deadIds.length > 0) {
    // Use individual deletes to avoid array/uuid cast issues
    let deleted = 0;
    for (const id of deadIds) {
      const r = await pool.query(`DELETE FROM grants WHERE id = $1`, [id]);
      deleted += r.rowCount ?? 0;
    }
    console.log(`Deleted ${deleted} grants with dead URLs`);
  }

  const stats = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE source_url LIKE 'https://hellodarwin.com/%')::int AS hd,
      COUNT(*) FILTER (WHERE source_url NOT LIKE 'https://hellodarwin.com/%')::int AS external
    FROM grants
  `);
  console.log(`\nFinal: ${stats.rows[0].total} grants | ${stats.rows[0].external} external | ${stats.rows[0].hd} on hellodarwin`);

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
