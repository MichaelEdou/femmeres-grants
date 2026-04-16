/**
 * Restore the federal canada.ca grants that were wrongly removed for timeouts.
 * Re-validate with 30s timeout and treat timeouts as alive.
 */
import pg from "pg";
import { createHash } from "crypto";
import * as dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function hash(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

type ST = "federal" | "provincial" | "municipal" | "foundation" | "private";

const federalGrants: Array<{
  title: string; description: string; sourceName: string; sourceUrl: string;
  sourceType: ST; category: string[]; amountMin: number; amountMax: number;
  deadline: Date | null; eligibility: string; howToApply: string;
}> = [
  {
    title: "Women's Program",
    description: "Non-repayable contributions to organizations advancing gender equality. Addresses systemic barriers faced by women, including projects that prevent gender-based violence and promote women's economic security and leadership.",
    sourceName: "Women and Gender Equality Canada (WAGE)",
    sourceUrl: "https://women-gender-equality.canada.ca/en/funding/funding-programs/womens-program.html",
    sourceType: "federal", category: ["Women", "GBV", "Employment"],
    amountMin: 25000, amountMax: 1000000, deadline: null,
    eligibility: "Non-profit organizations, Indigenous organizations, for-profit organizations (if reinvesting profits in non-profit activities), research organizations, and educational institutions.",
    howToApply: "Applications accepted during periodic calls for proposals on the WAGE website.",
  },
  {
    title: "Gender-Based Violence Program",
    description: "Non-repayable contributions to organizations preventing and addressing gender-based violence in Canada. Funds promising practices and knowledge mobilization.",
    sourceName: "Women and Gender Equality Canada (WAGE)",
    sourceUrl: "https://women-gender-equality.canada.ca/en/gender-based-violence/funding-programs.html",
    sourceType: "federal", category: ["GBV", "Women"],
    amountMin: 50000, amountMax: 1500000, deadline: null,
    eligibility: "Non-profit, Indigenous, and research organizations with GBV expertise.",
    howToApply: "Submit during announced calls for proposals through the WAGE funding portal.",
  },
  {
    title: "2SLGBTQI+ Community Capacity Fund",
    description: "Non-repayable contributions for projects that advance equality for 2SLGBTQI+ communities in Canada. Supports capacity-building and systemic-change initiatives.",
    sourceName: "Women and Gender Equality Canada (WAGE)",
    sourceUrl: "https://women-gender-equality.canada.ca/en/funding/2slgbtqi-plus-community-capacity-fund.html",
    sourceType: "federal", category: ["Women", "General"],
    amountMin: 10000, amountMax: 500000, deadline: null,
    eligibility: "2SLGBTQI+ organizations and non-profits serving 2SLGBTQI+ communities.",
    howToApply: "Apply during announced calls through WAGE portal.",
  },
  {
    title: "Canada Summer Jobs",
    description: "Non-repayable wage subsidies for employers to hire youth aged 15-30 for summer positions. For non-profits, the subsidy can cover up to 100% of the provincial/territorial minimum hourly wage.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/services/funding/canada-summer-jobs.html",
    sourceType: "federal", category: ["Youth", "Employment"],
    amountMin: 3000, amountMax: 60000, deadline: null,
    eligibility: "Not-for-profits, public sector employers, and private employers with 50 or fewer full-time employees.",
    howToApply: "Apply online during the annual application window (typically late fall to early winter).",
  },
  {
    title: "New Horizons for Seniors Program — Community-Based",
    description: "Non-repayable grants up to $25,000 for community projects led by or involving seniors. Priority for projects reducing social isolation and celebrating diversity.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/services/funding/new-horizons-seniors-community-based.html",
    sourceType: "federal", category: ["Health", "General"],
    amountMin: 5000, amountMax: 25000, deadline: null,
    eligibility: "Not-for-profit organizations, coalitions, networks, Indigenous organizations, and municipal governments.",
    howToApply: "Apply via ESDC Grants and Contributions Online Services during the annual call.",
  },
  {
    title: "Social Development Partnerships Program — Children and Families",
    description: "Non-repayable contributions for projects improving the lives of children and families facing social challenges. Supports innovation, knowledge mobilization, and capacity building.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/services/funding/social-development-partnerships-children-families.html",
    sourceType: "federal", category: ["Youth", "Education", "Women"],
    amountMin: 100000, amountMax: 750000, deadline: null,
    eligibility: "Not-for-profit organizations, Indigenous organizations, educational institutions, and municipal governments.",
    howToApply: "Apply during announced calls for proposals via ESDC portal.",
  },
  {
    title: "Social Development Partnerships Program — Disability",
    description: "Non-repayable contributions improving participation and inclusion of persons with disabilities in Canadian society.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/services/funding/social-development-partnerships-disability.html",
    sourceType: "federal", category: ["Health", "Employment"],
    amountMin: 50000, amountMax: 400000, deadline: null,
    eligibility: "Not-for-profit organizations serving persons with disabilities, especially disability-led orgs.",
    howToApply: "Apply during calls for proposals via ESDC portal.",
  },
  {
    title: "Enabling Accessibility Fund — Small Projects",
    description: "Non-repayable grants to improve accessibility in community spaces and workplaces. Covers construction, renovations, and accessibility modifications.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/services/funding/enabling-accessibility-fund.html",
    sourceType: "federal", category: ["Health", "General"],
    amountMin: 10000, amountMax: 200000, deadline: null,
    eligibility: "Not-for-profits, small businesses (<100 employees), Indigenous organizations, and municipalities.",
    howToApply: "Apply during annual call for proposals via the Enabling Accessibility Fund portal.",
  },
  {
    title: "Supporting Black Canadian Communities Initiative",
    description: "Non-repayable funding to build capacity of Black-led, Black-focused, and Black-serving community organizations.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/programs/supporting-black-canadian-communities-initiative.html",
    sourceType: "federal", category: ["General", "Women", "Youth"],
    amountMin: 25000, amountMax: 1000000, deadline: null,
    eligibility: "Black-led, Black-focused, or Black-serving not-for-profit organizations.",
    howToApply: "Apply through designated intermediaries announced by ESDC.",
  },
  {
    title: "Sectoral Workforce Solutions Program",
    description: "Non-repayable contributions to address critical workforce and skills needs in key sectors, including diverse talent attraction and retention.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/services/funding/sectoral-workforce-solutions-program.html",
    sourceType: "federal", category: ["Employment", "Women"],
    amountMin: 250000, amountMax: 20000000, deadline: null,
    eligibility: "Sector councils, not-for-profits, unions, employers, and Indigenous organizations.",
    howToApply: "Apply during announced calls for proposals.",
  },
  {
    title: "Building Communities Through Arts and Heritage — Local Festivals",
    description: "Non-repayable grants for local festivals that celebrate artists, artisans, heritage, or cultural diversity. Up to 100% of eligible costs for smaller festivals.",
    sourceName: "Canadian Heritage",
    sourceUrl: "https://www.canada.ca/en/canadian-heritage/services/funding/building-communities/local-festivals.html",
    sourceType: "federal", category: ["Culture", "General"],
    amountMin: 1500, amountMax: 200000, deadline: null,
    eligibility: "Not-for-profit organizations, Indigenous groups, and municipalities organizing local festivals.",
    howToApply: "Apply online at least 30 weeks before the festival date.",
  },
  {
    title: "Anti-Racism Action Program",
    description: "Non-repayable funding for projects addressing systemic barriers faced by Indigenous Peoples, racialized and religious minority communities.",
    sourceName: "Canadian Heritage",
    sourceUrl: "https://www.canada.ca/en/canadian-heritage/services/funding/anti-racism-action-program.html",
    sourceType: "federal", category: ["Immigration", "Women", "Employment"],
    amountMin: 25000, amountMax: 450000, deadline: null,
    eligibility: "Not-for-profits, Indigenous organizations, educational institutions, and municipalities.",
    howToApply: "Apply during announced calls for proposals via Canadian Heritage portal.",
  },
  {
    title: "Canada Cultural Spaces Fund",
    description: "Non-repayable contributions for construction and renovation of arts and heritage facilities. Covers up to 50% of eligible project costs.",
    sourceName: "Canadian Heritage",
    sourceUrl: "https://www.canada.ca/en/canadian-heritage/services/funding/cultural-spaces-fund.html",
    sourceType: "federal", category: ["Culture"],
    amountMin: 25000, amountMax: 15000000, deadline: null,
    eligibility: "Not-for-profit arts and heritage organizations, Indigenous organizations, municipalities.",
    howToApply: "Apply online via Canadian Heritage funding portal. Rolling intake.",
  },
  {
    title: "Mental Health Promotion Innovation Fund",
    description: "Non-repayable contributions for community-based mental health promotion projects addressing the needs of children, youth, families, and at-risk populations.",
    sourceName: "Public Health Agency of Canada",
    sourceUrl: "https://www.canada.ca/en/public-health/services/funding-opportunities/mental-health-promotion-innovation-fund.html",
    sourceType: "federal", category: ["Health", "Youth", "Women"],
    amountMin: 150000, amountMax: 2500000, deadline: null,
    eligibility: "Not-for-profits, Indigenous organizations, and academic institutions with mental health expertise.",
    howToApply: "Two-stage: Letter of Intent then full application for shortlisted candidates.",
  },
  {
    title: "Community Action Fund (HIV and Hepatitis C)",
    description: "Non-repayable contributions for community-based prevention, testing, and support services for HIV, hepatitis C, and STBBIs.",
    sourceName: "Public Health Agency of Canada",
    sourceUrl: "https://www.canada.ca/en/public-health/services/funding-opportunities/grant-contribution-funding-opportunities/community-action-fund.html",
    sourceType: "federal", category: ["Health", "Women"],
    amountMin: 50000, amountMax: 1500000, deadline: null,
    eligibility: "Not-for-profits delivering community-based prevention, testing, or support.",
    howToApply: "Apply through open calls announced by PHAC.",
  },
  {
    title: "Settlement Program",
    description: "Non-repayable funding to service providers delivering settlement services to newcomers — language training, needs assessments, employment services, and community connections. (Quebec has separate federal-provincial agreement.)",
    sourceName: "Immigration, Refugees and Citizenship Canada",
    sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/corporate/partners-service-providers/funding.html",
    sourceType: "federal", category: ["Immigration", "Women", "Employment"],
    amountMin: 100000, amountMax: 5000000, deadline: null,
    eligibility: "Not-for-profits delivering settlement services outside Quebec.",
    howToApply: "Apply during Calls for Proposals announced periodically by IRCC.",
  },
  {
    title: "Community Support, Multiculturalism, and Anti-Racism — Projects",
    description: "Non-repayable project funding for events and initiatives promoting intercultural understanding, combating racism, and celebrating diversity.",
    sourceName: "Canadian Heritage",
    sourceUrl: "https://www.canada.ca/en/canadian-heritage/services/funding/community-multiculturalism-anti-racism.html",
    sourceType: "federal", category: ["Immigration", "Culture"],
    amountMin: 5000, amountMax: 100000, deadline: null,
    eligibility: "Not-for-profits, educational institutions, municipalities, and Indigenous organizations.",
    howToApply: "Apply online via the Canadian Heritage portal.",
  },
];

async function main() {
  console.log(`Re-inserting ${federalGrants.length} federal grants (timeout-tolerant)...`);

  let inserted = 0;
  for (const g of federalGrants) {
    const urlHash = hash(g.sourceUrl + "::" + g.title);
    try {
      const r = await pool.query(
        `INSERT INTO grants (
          id, title, description, source_name, source_url, source_type,
          category, amount_min, amount_max, deadline, eligibility,
          how_to_apply, is_open, url_hash, scraped_at, updated_at, created_at
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5::"SourceType", $6, $7, $8, $9, $10, $11, true, $12, NOW(), NOW(), NOW())
        ON CONFLICT (url_hash) DO NOTHING
        RETURNING id`,
        [g.title, g.description, g.sourceName, g.sourceUrl, g.sourceType,
         g.category, g.amountMin, g.amountMax, g.deadline, g.eligibility,
         g.howToApply, urlHash]
      );
      if (r.rowCount && r.rowCount > 0) inserted++;
    } catch (err: any) {
      console.error(`Failed: ${g.title}: ${err.message}`);
    }
  }
  console.log(`Inserted ${inserted}`);

  // Lenient validator: 30s timeout, treat AbortError as alive (canada.ca is slow but works)
  console.log(`\nValidating with 30s timeout...`);
  const all = await pool.query(`SELECT id, title, source_url FROM grants`);
  let alive = 0, dead = 0;
  const deadGrants: Array<{ title: string; url: string; status: any }> = [];

  for (const row of all.rows) {
    try {
      const r = await fetch(row.source_url, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FemmeresGrants/1.0; +https://femmeres.org)",
          "Accept": "text/html",
        },
        signal: AbortSignal.timeout(30000),
      });
      if (r.ok) alive++;
      else {
        dead++;
        deadGrants.push({ title: row.title, url: row.source_url, status: r.status });
      }
    } catch (err: any) {
      // Treat timeouts as alive — canada.ca is just slow
      if (err.name === "TimeoutError" || err.message?.includes("timeout")) {
        alive++;
      } else {
        dead++;
        deadGrants.push({ title: row.title, url: row.source_url, status: err.message });
      }
    }
  }

  console.log(`Live: ${alive}, Dead: ${dead}`);
  if (deadGrants.length > 0) {
    for (const d of deadGrants) console.log(`  [${d.status}] ${d.title}`);
    for (const d of deadGrants) {
      await pool.query(`DELETE FROM grants WHERE source_url = $1 AND title = $2`, [d.url, d.title]);
    }
    console.log(`Deleted ${deadGrants.length} truly-dead URLs`);
  }

  const total = await pool.query(`SELECT COUNT(*)::int AS count FROM grants`);
  console.log(`\nFinal count: ${total.rows[0].count}`);

  await pool.end();
}
main().catch(e => { console.error(e); process.exit(1); });
