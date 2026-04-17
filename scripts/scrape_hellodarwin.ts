/**
 * Scrape hellodarwin.com's grant database and seed Femmeres' Neon database
 * with grants that match:
 *  - Non-repayable only (grant_financing_type contains "Grant and Funding", no loans)
 *  - Currently open (application_status === "open")
 *  - Available to Non-profit legal structure
 *  - Quebec or Canada-wide (Femmeres is in Gatineau, QC)
 *
 * The source_url points to the specific hellodarwin program page, which is a
 * detailed, validated program guide for each real Canadian grant.
 */
import pg from "pg";
import { createHash } from "crypto";
import * as dotenv from "dotenv";
import { writeFileSync, existsSync, readFileSync } from "fs";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

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
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

interface HDGrant {
  id: string;
  grant_title: string;
  grant_display_title?: string;
  grant_description_short: string | null;
  grant_description_long: string | null;
  grant_financing_type: string[];
  funding_min_amount: number | null;
  funding_max_amount: number | null;
  application_status: string;
  grant_provinces: string[];
  grant_regions: string[] | null;
  grant_mrcs: string[] | null;
  grant_providers: string[];
  grant_deadline: string | null;
  eligibility_criteria: string | null;
  eligibility_criteria_short: string | null;
  who_can_apply: string | null;
  steps_how_to_apply: string | null;
  grant_legal_structure: string[] | null;
  grant_npo_beneficiaries: string[] | null;
  grant_npo_scopes: string[] | null;
  grant_npo_streams: string[] | null;
  grant_tags_goals: string[] | null;
  grant_industries_icnpo: string[] | null;
  application_email_address: string | null;
  additional_information: string | null;
  grant_logo?: string | null;
}

type ST = "federal" | "provincial" | "municipal" | "foundation" | "private";

const SITEMAP_FILE = "C:/tmp/hd_programs.txt";
const CACHE_FILE = "C:/tmp/hd_grants_cache.json";

// ========== Categorization ==========

function classifySourceType(providers: string[], provinces: string[]): ST {
  const joined = providers.join(" ").toLowerCase();

  if (/\b(canada|government of canada|canadian heritage|esdc|ircc|phac|industry canada|innovation.*canada|infrastructure canada|wage|women and gender|department of finance|crtc)\b/.test(joined)) {
    return "federal";
  }

  // Quebec provincial government
  if (/\b(gouvernement du qu[ée]bec|m[ie]n[ie]st[eè]re|quebec government|secr[eé]tariat|qu[eé]bec.*minist|minist.*qu[eé]bec|investissement qu[eé]bec|cri[bt]|soci[eé]t[eé].*qu[eé]bec)\b/.test(joined)) {
    return "provincial";
  }

  // Municipal / MRC
  if (/\b(ville de|mrc|municipalit|city of|municipal|rcm|r[eé]gion|commune)\b/.test(joined)) {
    return "municipal";
  }

  // Banks / corporations
  if (/\b(bank|rbc|td|cibc|bmo|scotiabank|desjardins|national bank|bell|rogers|telus|walmart|loblaw|home depot|canadian tire|starbucks|scotia|enbridge|google|microsoft|aws|amazon|nestl|molson|tim hortons)\b/.test(joined)) {
    return "private";
  }

  // Default — foundations / associations
  if (/\b(foundation|fondation|trust|community foundation|centraide|united way|association|society)\b/.test(joined)) {
    return "foundation";
  }

  return "foundation";
}

function inferCategories(g: HDGrant): string[] {
  const cats = new Set<string>();
  const text = [
    g.grant_title,
    g.grant_description_short,
    g.grant_description_long,
    g.grant_npo_beneficiaries?.join(" "),
    g.grant_npo_streams?.join(" "),
    g.grant_tags_goals?.join(" "),
    g.grant_industries_icnpo?.join(" "),
  ].filter(Boolean).join(" ").toLowerCase();

  if (/(women|femme|gender|girls|feminist|maternal)/.test(text)) cats.add("Women");
  if (/(violence|gbv|abuse|assault|trafficking)/.test(text)) cats.add("GBV");
  if (/(employ|jobs?|workforce|career|skills|training|entrepreneur)/.test(text)) cats.add("Employment");
  if (/(immigrant|newcomer|refugee|migrant|settlement)/.test(text)) cats.add("Immigration");
  if (/(youth|young|child|tween|teen|adolescent)/.test(text)) cats.add("Youth");
  if (/(education|learning|literacy|school|studies|academic)/.test(text)) cats.add("Education");
  if (/(health|mental|wellbeing|medical|disease|nutrition|wellness)/.test(text)) cats.add("Health");
  if (/(arts|culture|heritage|music|festival|theatre|creative|artist|film|dance|literature)/.test(text)) cats.add("Culture");
  if (/(environment|climate|green|sustainab|ecology|carbon|biodivers|renewable)/.test(text)) cats.add("Environment");

  if (cats.size === 0) cats.add("General");
  return Array.from(cats);
}

// ========== Scraping ==========

async function fetchGrant(slug: string): Promise<HDGrant | null> {
  const url = `https://hellodarwin.com/page-data/business-aid/programs/${slug}/page-data.json`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (FemmeresGrants research; contact@femmeres.org)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const grant = data?.result?.data?.singleGrantPageLinks?.grant;
    return grant ?? null;
  } catch {
    return null;
  }
}

async function scrapeAll() {
  if (!existsSync(SITEMAP_FILE)) {
    console.error(`Missing ${SITEMAP_FILE} — extract it from hellodarwin sitemap first.`);
    process.exit(1);
  }

  const allUrls = readFileSync(SITEMAP_FILE, "utf-8")
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.startsWith("https://hellodarwin.com/business-aid/programs/"));

  console.log(`Found ${allUrls.length} program URLs to scan`);

  // Load cache if present
  let cache: Record<string, HDGrant | null> = {};
  if (existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
      console.log(`Loaded cache with ${Object.keys(cache).length} entries`);
    } catch {}
  }

  // After loading cache, build {slug: grant} map for all cached entries that match
  // This preserves the mapping between hellodarwin slug and grant data
  const bySlug: Array<{ slug: string; grant: HDGrant }> = [];
  for (const url of allUrls) {
    const slug = url.split("/").pop()!;
    if (slug in cache && cache[slug]) {
      const g = cache[slug]!;
      if (isRelevantForFemmeres(g)) {
        bySlug.push({ slug, grant: g });
      }
    }
  }

  console.log(`\n${bySlug.length} relevant grants from cache`);
  return bySlug.slice(0, 300);
}

// ========== Filtering ==========

function isRelevantForFemmeres(g: HDGrant): boolean {
  // 1. Must be a grant, not a loan or tax credit
  const types = (g.grant_financing_type ?? []).map(t => t.toLowerCase());
  const hasGrantType = types.some(t => t.includes("grant") || t.includes("subvention") || t.includes("funding"));
  const hasLoan = types.some(t =>
    t.includes("loan") || t.includes("prêt") ||
    t.includes("equity") || t.includes("investment") ||
    t.includes("guarantee") || t.includes("garantie")
  );
  if (!hasGrantType || hasLoan) return false;

  // 2. Must be currently open
  if (g.application_status !== "open") return false;

  // 3. Must be available in Quebec or nationally
  const provinces = g.grant_provinces ?? [];
  const inQC = provinces.some(p => /quebec|qu[eé]bec/i.test(p));
  const national = provinces.length === 0 || provinces.some(p => /canada|all provinces|national/i.test(p));
  if (!inQC && !national) return false;

  // 4. Must allow Non-profit legal structure
  const legalStructure = g.grant_legal_structure ?? [];
  if (legalStructure.length > 0) {
    const allowsNpo = legalStructure.some(s => /non.?profit|npo|obnl|not.?for.?profit/i.test(s));
    if (!allowsNpo) return false;
  }

  // 5. Non-repayable check in description / additional info
  const textForRepay = [g.grant_description_long, g.additional_information].filter(Boolean).join(" ").toLowerCase();
  if (/(repayable loan|repayment required|must be repaid|loan.*repaid|remboursable)/.test(textForRepay) &&
      !/(non.?repayable|non.?remboursable)/.test(textForRepay)) {
    return false;
  }

  // 6. Prefer grants that are topically relevant to a women-serving NGO
  // Accept if any of the categories match our focus
  // (We don't reject — Femmeres also does general NPO work)
  return true;
}

// ========== Conversion to DB rows ==========

function buildRow(slug: string, g: HDGrant) {
  const sourceType = classifySourceType(g.grant_providers ?? [], g.grant_provinces ?? []);
  const categories = inferCategories(g);
  const description = stripHtml(g.grant_description_long ?? g.grant_description_short ?? "");

  const eligibilityParts: string[] = [];
  if (g.who_can_apply) eligibilityParts.push("Who can apply:\n" + stripHtml(g.who_can_apply));
  if (g.eligibility_criteria) eligibilityParts.push("Eligibility criteria:\n" + stripHtml(g.eligibility_criteria));
  const eligibility = eligibilityParts.join("\n\n");

  const howToApplyParts: string[] = [];
  if (g.steps_how_to_apply) howToApplyParts.push(stripHtml(g.steps_how_to_apply));
  if (g.additional_information) howToApplyParts.push(stripHtml(g.additional_information));
  if (g.application_email_address && g.application_email_address !== "none") {
    howToApplyParts.push(`Contact: ${g.application_email_address}`);
  }
  const howToApply = howToApplyParts.join("\n\n");

  // Use the ACTUAL hellodarwin slug (from the sitemap), not one generated from title
  const sourceUrl = `https://hellodarwin.com/business-aid/programs/${slug}`;

  return {
    title: g.grant_display_title ?? g.grant_title,
    description: description.slice(0, 4000),
    sourceName: (g.grant_providers ?? []).join(", ") || "Unknown",
    sourceUrl,
    sourceType,
    category: categories,
    amountMin: g.funding_min_amount && g.funding_min_amount > 0 ? g.funding_min_amount : null,
    amountMax: g.funding_max_amount && g.funding_max_amount > 0 ? g.funding_max_amount : null,
    deadline: g.grant_deadline ? new Date(g.grant_deadline) : null,
    eligibility: eligibility.slice(0, 4000),
    howToApply: howToApply.slice(0, 4000),
  };
}

// ========== Main ==========

async function main() {
  const matches = await scrapeAll();
  console.log(`\nInserting ${matches.length} grants into Neon...`);

  // Clear existing grants
  const del = await pool.query("DELETE FROM grants");
  console.log(`Cleared ${del.rowCount} old grants`);

  let inserted = 0;
  let skipped = 0;
  const seenUrls = new Set<string>();

  for (const { slug, grant: g } of matches) {
    const row = buildRow(slug, g);
    if (seenUrls.has(row.sourceUrl)) { skipped++; continue; }
    seenUrls.add(row.sourceUrl);

    try {
      const urlHash = hash(row.sourceUrl + "::" + row.title);
      await pool.query(
        `INSERT INTO grants (
          id, title, description, source_name, source_url, source_type,
          category, amount_min, amount_max, deadline, eligibility,
          how_to_apply, is_open, url_hash, scraped_at, updated_at, created_at
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5::"SourceType", $6, $7, $8, $9, $10, $11, true, $12, NOW(), NOW(), NOW())
        ON CONFLICT (url_hash) DO NOTHING`,
        [row.title, row.description, row.sourceName, row.sourceUrl, row.sourceType,
         row.category, row.amountMin, row.amountMax, row.deadline, row.eligibility,
         row.howToApply, urlHash]
      );
      inserted++;
    } catch (err: any) {
      console.error(`Failed to insert "${row.title}":`, err.message);
    }
  }

  console.log(`\n✓ Inserted ${inserted} grants (skipped ${skipped} duplicates)`);
  const count = await pool.query("SELECT COUNT(*)::int AS count FROM grants");
  console.log(`Total grants in DB: ${count.rows[0].count}`);

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
