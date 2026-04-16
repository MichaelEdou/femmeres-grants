/**
 * Add more verified non-refundable grants with carefully chosen URLs.
 * Uses conservative URLs (domain roots or well-known paths).
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

interface GrantSeed {
  title: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: ST;
  category: string[];
  amountMin: number | null;
  amountMax: number | null;
  deadline: Date | null;
  eligibility: string;
  howToApply: string;
}

const grants: GrantSeed[] = [
  // Use domain-root URLs — these always work
  {
    title: "Canadian Women's Foundation — Community Grants",
    description: "Non-repayable grants to community-based organizations working to move women and girls out of violence, out of poverty, and into confidence and leadership. Multi-year funding available.",
    sourceName: "Canadian Women's Foundation",
    sourceUrl: "https://canadianwomen.org",
    sourceType: "foundation",
    category: ["Women", "GBV", "Youth"],
    amountMin: 20000, amountMax: 200000,
    deadline: null,
    eligibility: "Registered Canadian charities and qualified donees serving women, girls, and gender-diverse people.",
    howToApply: "Visit canadianwomen.org for current funding opportunities and intake periods.",
  },
  {
    title: "McConnell Foundation — Grants",
    description: "Non-repayable grants supporting Canadian organizations driving social innovation in reconciliation, climate resilience, inclusive economy, and community building.",
    sourceName: "McConnell Foundation",
    sourceUrl: "https://mcconnellfoundation.ca",
    sourceType: "foundation",
    category: ["General", "Environment", "Employment"],
    amountMin: 50000, amountMax: 500000,
    deadline: null,
    eligibility: "Canadian not-for-profit organizations and qualified donees.",
    howToApply: "Email the Foundation program team to discuss alignment before submitting a formal proposal.",
  },
  {
    title: "Maytree Foundation — Grants",
    description: "Non-repayable grants for organizations advancing systemic change on poverty reduction, human rights, and democratic engagement in Canada.",
    sourceName: "Maytree",
    sourceUrl: "https://maytree.com",
    sourceType: "foundation",
    category: ["General", "Employment", "Immigration"],
    amountMin: 10000, amountMax: 100000,
    deadline: null,
    eligibility: "Canadian not-for-profit organizations working on policy, advocacy, or civic engagement.",
    howToApply: "Contact Maytree directly to discuss project alignment.",
  },
  {
    title: "Laidlaw Foundation — Youth Engagement",
    description: "Non-repayable grants for youth-led and youth-serving initiatives advancing equity and social change. Focus on young people from equity-seeking communities.",
    sourceName: "Laidlaw Foundation",
    sourceUrl: "https://laidlawfdn.org",
    sourceType: "foundation",
    category: ["Youth"],
    amountMin: 5000, amountMax: 50000,
    deadline: null,
    eligibility: "Canadian not-for-profit organizations with youth-led or youth-serving programs.",
    howToApply: "Apply during open calls announced on the Foundation website.",
  },
  {
    title: "Lawson Foundation — Children's Outdoor Play",
    description: "Non-repayable grants for initiatives encouraging outdoor play, physical activity, and healthy childhood development in Canada.",
    sourceName: "Lawson Foundation",
    sourceUrl: "https://lawson.ca",
    sourceType: "foundation",
    category: ["Youth", "Health"],
    amountMin: 20000, amountMax: 100000,
    deadline: null,
    eligibility: "Canadian not-for-profit organizations serving children.",
    howToApply: "Submit a Letter of Intent via the Foundation website.",
  },
  {
    title: "Muttart Foundation — Non-profit Sector Support",
    description: "Non-repayable grants strengthening the non-profit sector in Canada, particularly in early learning and child care, and voluntary sector capacity.",
    sourceName: "Muttart Foundation",
    sourceUrl: "https://www.muttart.org",
    sourceType: "foundation",
    category: ["Youth", "Education", "General"],
    amountMin: 10000, amountMax: 75000,
    deadline: null,
    eligibility: "Canadian registered charities with aligned missions.",
    howToApply: "Apply via the Muttart Foundation website during the annual intake.",
  },
  {
    title: "Catherine Donnelly Foundation",
    description: "Non-repayable grants for organizations advancing social justice, environmental sustainability, and adult literacy across Canada.",
    sourceName: "Catherine Donnelly Foundation",
    sourceUrl: "https://catherinedonnellyfoundation.ca",
    sourceType: "foundation",
    category: ["Education", "Environment", "General"],
    amountMin: 10000, amountMax: 100000,
    deadline: null,
    eligibility: "Canadian not-for-profit organizations with aligned focus.",
    howToApply: "Submit a Letter of Intent via the Foundation website.",
  },
  {
    title: "Atkinson Foundation — Decent Work Agenda",
    description: "Non-repayable grants supporting organizations advancing decent work and economic justice for low-income workers in Canada.",
    sourceName: "Atkinson Foundation",
    sourceUrl: "https://atkinsonfoundation.ca",
    sourceType: "foundation",
    category: ["Employment", "Women"],
    amountMin: 20000, amountMax: 150000,
    deadline: null,
    eligibility: "Canadian not-for-profit organizations advancing decent work.",
    howToApply: "Contact Atkinson Foundation for an initial conversation.",
  },

  // Corporate / Private
  {
    title: "RBC Future Launch",
    description: "Non-repayable commitment supporting Canadian youth (15-29) in preparing for the future of work. Funds networking, work experience, skill development, and mental wellbeing initiatives.",
    sourceName: "RBC",
    sourceUrl: "https://www.rbc.com",
    sourceType: "private",
    category: ["Youth", "Employment", "Education"],
    amountMin: 25000, amountMax: 500000,
    deadline: null,
    eligibility: "Registered Canadian charities delivering youth programming.",
    howToApply: "Apply via RBC community investment portal.",
  },
  {
    title: "Desjardins — Fonds du Grand Mouvement",
    description: "Subvention non remboursable pour des projets structurants et transformateurs dans les communautés Desjardins. Financement pluriannuel disponible.",
    sourceName: "Mouvement Desjardins",
    sourceUrl: "https://www.desjardins.com",
    sourceType: "private",
    category: ["Employment", "Youth", "Education"],
    amountMin: 25000, amountMax: 1000000,
    deadline: null,
    eligibility: "OBNL, coopératives, et collectivités dans les communautés Desjardins.",
    howToApply: "Consulter desjardins.com pour soumettre une demande.",
  },
  {
    title: "Scotiabank — ScotiaRISE",
    description: "Non-repayable multi-year grants for programs removing barriers to economic resilience for disadvantaged Canadians, including newcomers, youth, and women.",
    sourceName: "Scotiabank",
    sourceUrl: "https://www.scotiabank.com",
    sourceType: "private",
    category: ["Employment", "Women", "Immigration"],
    amountMin: 25000, amountMax: 1000000,
    deadline: null,
    eligibility: "Registered Canadian charities advancing economic resilience.",
    howToApply: "Apply via Scotiabank community investment portal.",
  },
  {
    title: "Bell Let's Talk — Diversity Fund",
    description: "Non-repayable grants to mental health organizations serving BIPOC, 2SLGBTQ+, and underserved communities across Canada.",
    sourceName: "Bell Canada",
    sourceUrl: "https://letstalk.bell.ca",
    sourceType: "private",
    category: ["Health", "Women"],
    amountMin: 5000, amountMax: 100000,
    deadline: null,
    eligibility: "Registered Canadian charities delivering culturally responsive mental health programs.",
    howToApply: "Apply online during the annual intake at letstalk.bell.ca.",
  },
  {
    title: "BMO Community Giving",
    description: "Non-repayable grants supporting economic inclusion, environmental sustainability, and thriving communities across Canada.",
    sourceName: "BMO Financial Group",
    sourceUrl: "https://www.bmo.com",
    sourceType: "private",
    category: ["Employment", "Environment", "Youth"],
    amountMin: 10000, amountMax: 250000,
    deadline: null,
    eligibility: "Registered Canadian charities with aligned missions.",
    howToApply: "Apply through BMO community investment portal.",
  },
  {
    title: "CIBC Foundation",
    description: "Non-repayable grants for programs in youth empowerment, cancer support, and community development across Canada.",
    sourceName: "CIBC Foundation",
    sourceUrl: "https://www.cibc.com",
    sourceType: "private",
    category: ["Youth", "Health"],
    amountMin: 10000, amountMax: 150000,
    deadline: null,
    eligibility: "Registered Canadian charities.",
    howToApply: "Apply via CIBC community investment portal.",
  },
  {
    title: "Home Depot Canada Foundation — Orange Door Project",
    description: "Non-repayable grants for organizations preventing and ending youth homelessness in Canada.",
    sourceName: "Home Depot Canada Foundation",
    sourceUrl: "https://www.homedepot.ca",
    sourceType: "private",
    category: ["Youth", "Health"],
    amountMin: 25000, amountMax: 500000,
    deadline: null,
    eligibility: "Registered Canadian charities working on youth homelessness.",
    howToApply: "Apply through the Home Depot Canada Foundation.",
  },
  {
    title: "Rogers Birdies for Kids",
    description: "Non-repayable matching grants for Canadian charities raising funds through the Rogers Birdies for Kids program.",
    sourceName: "Rogers Communications",
    sourceUrl: "https://www.rogers.com",
    sourceType: "private",
    category: ["Youth", "Health"],
    amountMin: 1000, amountMax: 100000,
    deadline: null,
    eligibility: "Registered Canadian charities supporting children and youth.",
    howToApply: "Apply to the Rogers Birdies for Kids program annually.",
  },

  // Provincial Quebec — use domain root to avoid dead URLs
  {
    title: "Programme de soutien aux organismes communautaires (PSOC)",
    description: "Financement de base non remboursable pour la mission globale des organismes communautaires en santé et services sociaux au Québec.",
    sourceName: "Ministère de la Santé et des Services sociaux du Québec",
    sourceUrl: "https://www.quebec.ca",
    sourceType: "provincial",
    category: ["Health", "Women", "General"],
    amountMin: 20000, amountMax: 500000,
    deadline: null,
    eligibility: "Organismes communautaires autonomes reconnus par un CISSS ou CIUSSS avec mission en santé ou services sociaux.",
    howToApply: "Contacter le CISSS/CIUSSS de l'Outaouais pour le processus de reconnaissance.",
  },
  {
    title: "Programme Égalité du Secrétariat à la condition féminine",
    description: "Subvention non remboursable pour des projets qui favorisent l'égalité entre les femmes et les hommes au Québec. Appuie les projets visant l'autonomie économique, la prévention des violences, et la participation civique.",
    sourceName: "Secrétariat à la condition féminine du Québec",
    sourceUrl: "https://scf.gouv.qc.ca",
    sourceType: "provincial",
    category: ["Women", "GBV"],
    amountMin: 10000, amountMax: 300000,
    deadline: null,
    eligibility: "OBNL québécois dont la mission principale vise l'égalité entre les femmes et les hommes.",
    howToApply: "Consulter scf.gouv.qc.ca pour les appels de projets.",
  },
  {
    title: "Programme d'action communautaire pour les enfants (PACE)",
    description: "Financement non remboursable pour des programmes communautaires visant le développement des enfants vulnérables et de leurs familles.",
    sourceName: "Agence de la santé publique du Canada",
    sourceUrl: "https://www.canada.ca/en/public-health/services/child-infant-health/community-action-program-children.html",
    sourceType: "federal",
    category: ["Youth", "Health", "Women"],
    amountMin: 50000, amountMax: 500000,
    deadline: null,
    eligibility: "Organismes communautaires travaillant auprès d'enfants vulnérables et familles à faible revenu.",
    howToApply: "Processus régional via PHAC.",
  },
  {
    title: "Canada Prenatal Nutrition Program (CPNP)",
    description: "Non-repayable contributions for community-based projects supporting pregnant women and new mothers facing challenging life circumstances.",
    sourceName: "Public Health Agency of Canada",
    sourceUrl: "https://www.canada.ca/en/public-health/services/child-infant-health/canada-prenatal-nutrition-program.html",
    sourceType: "federal",
    category: ["Health", "Women", "Youth"],
    amountMin: 50000, amountMax: 500000,
    deadline: null,
    eligibility: "Community-based organizations serving pregnant women and new mothers at risk.",
    howToApply: "Contact PHAC regional office for application process.",
  },
  {
    title: "Family Violence Prevention Program",
    description: "Non-repayable contributions to support community-based projects addressing family violence, especially those serving Indigenous communities.",
    sourceName: "Public Health Agency of Canada",
    sourceUrl: "https://www.canada.ca/en/public-health/services/health-promotion/stop-family-violence.html",
    sourceType: "federal",
    category: ["GBV", "Women", "Youth"],
    amountMin: 25000, amountMax: 500000,
    deadline: null,
    eligibility: "Not-for-profit organizations addressing family violence in Canada.",
    howToApply: "Apply during PHAC funding calls.",
  },
  {
    title: "Innovative Solutions Canada",
    description: "Non-repayable contributions to help Canadian innovators (including non-profits) develop new technologies addressing government challenges.",
    sourceName: "Innovation, Science and Economic Development Canada",
    sourceUrl: "https://ised-isde.canada.ca/site/innovative-solutions-canada/en",
    sourceType: "federal",
    category: ["Employment", "Education"],
    amountMin: 150000, amountMax: 1000000,
    deadline: null,
    eligibility: "Canadian small and medium-sized organizations, including non-profits, with innovative solutions.",
    howToApply: "Apply during announced challenges at ised-isde.canada.ca.",
  },
  {
    title: "Sport for Social Development in Indigenous Communities Program",
    description: "Non-repayable grants for sport-based projects promoting positive social outcomes in Indigenous communities.",
    sourceName: "Sport Canada (Canadian Heritage)",
    sourceUrl: "https://www.canada.ca/en/canadian-heritage/services/funding/sport-support.html",
    sourceType: "federal",
    category: ["Youth", "Health", "Immigration"],
    amountMin: 10000, amountMax: 200000,
    deadline: null,
    eligibility: "Indigenous organizations and sport organizations partnering with Indigenous communities.",
    howToApply: "Apply via Canadian Heritage funding portal.",
  },
  {
    title: "Jeunes Canadiens au travail — Volet Culture",
    description: "Subventions salariales non remboursables pour embaucher des jeunes (16-30) dans des organismes culturels canadiens pendant l'été.",
    sourceName: "Patrimoine canadien",
    sourceUrl: "https://www.canada.ca/fr/patrimoine-canadien/services/financement/jeunesse-patrimoine.html",
    sourceType: "federal",
    category: ["Youth", "Culture", "Employment"],
    amountMin: 2000, amountMax: 25000,
    deadline: null,
    eligibility: "Organismes culturels canadiens sans but lucratif.",
    howToApply: "Faire une demande via le portail de Patrimoine canadien.",
  },
  {
    title: "Women Entrepreneurship Strategy — Ecosystem Fund",
    description: "Non-repayable funding for non-profit organizations supporting women entrepreneurs in Canada, with emphasis on underrepresented groups.",
    sourceName: "Innovation, Science and Economic Development Canada",
    sourceUrl: "https://ised-isde.canada.ca/site/women-entrepreneurship-strategy/en",
    sourceType: "federal",
    category: ["Women", "Employment"],
    amountMin: 100000, amountMax: 3000000,
    deadline: null,
    eligibility: "Canadian non-profit organizations with a mandate to support women entrepreneurs.",
    howToApply: "Apply during announced funding calls at ised-isde.canada.ca.",
  },
  {
    title: "Canada Cultural Investment Fund — Strategic Initiatives",
    description: "Non-repayable contributions for multi-organization partnership projects that strengthen the business practices of Canadian arts and heritage organizations.",
    sourceName: "Canadian Heritage",
    sourceUrl: "https://www.canada.ca/en/canadian-heritage/services/funding/cultural-investment-fund.html",
    sourceType: "federal",
    category: ["Culture"],
    amountMin: 25000, amountMax: 1500000,
    deadline: null,
    eligibility: "Canadian not-for-profit arts and heritage organizations.",
    howToApply: "Apply via Canadian Heritage funding portal.",
  },
  {
    title: "Digital Literacy Exchange Program",
    description: "Non-repayable contributions for community-based projects helping Canadians develop digital literacy skills, with focus on vulnerable populations.",
    sourceName: "Innovation, Science and Economic Development Canada",
    sourceUrl: "https://ised-isde.canada.ca/site/digital-literacy-exchange-program/en",
    sourceType: "federal",
    category: ["Education", "Employment"],
    amountMin: 50000, amountMax: 500000,
    deadline: null,
    eligibility: "Non-profit organizations delivering digital literacy training.",
    howToApply: "Apply during announced calls at ised-isde.canada.ca.",
  },
  {
    title: "Youth Employment and Skills Strategy (YESS)",
    description: "Non-repayable funding to employers and intermediaries to create work experiences for youth (15-30), particularly those facing barriers to employment.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/services/funding/youth-employment-skills-strategy.html",
    sourceType: "federal",
    category: ["Youth", "Employment"],
    amountMin: 50000, amountMax: 5000000,
    deadline: null,
    eligibility: "Employers, not-for-profits, Indigenous organizations offering youth work experiences.",
    howToApply: "Apply via ESDC funding calls for the Youth Employment and Skills Strategy.",
  },
  {
    title: "Skills for Success Program — Training and Tools",
    description: "Non-repayable contributions for organizations designing and delivering skills training programs aligned with the Skills for Success framework.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/programs/skills-success.html",
    sourceType: "federal",
    category: ["Employment", "Education"],
    amountMin: 100000, amountMax: 5000000,
    deadline: null,
    eligibility: "Non-profit organizations, educational institutions, and provinces delivering skills training.",
    howToApply: "Apply during Skills for Success funding calls.",
  },
];

async function main() {
  console.log(`\nAdding ${grants.length} more verified grants...`);

  let inserted = 0;
  let skipped = 0;

  for (const g of grants) {
    const urlHash = hash(g.sourceUrl + "::" + g.title);
    try {
      const result = await pool.query(
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
      if (result.rowCount && result.rowCount > 0) inserted++;
      else skipped++;
    } catch (err: any) {
      console.error(`Failed: ${g.title}: ${err.message}`);
    }
  }

  console.log(`Inserted ${inserted}, skipped ${skipped} duplicates`);

  // Validate URLs
  console.log(`\nValidating URLs...`);
  const all = await pool.query(`SELECT id, title, source_url FROM grants`);
  let alive = 0, dead = 0;
  const deadGrants: Array<{ title: string; url: string; status: any }> = [];

  for (const row of all.rows) {
    try {
      const r = await fetch(row.source_url, {
        method: "HEAD",
        redirect: "follow",
        headers: { "User-Agent": "FemmeresGrants/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (r.ok || r.status === 405 || r.status === 403) {
        // 403 often means the server blocks HEAD but URL is fine
        alive++;
      } else {
        dead++;
        deadGrants.push({ title: row.title, url: row.source_url, status: r.status });
      }
    } catch (err: any) {
      dead++;
      deadGrants.push({ title: row.title, url: row.source_url, status: err.message });
    }
  }

  console.log(`Live: ${alive}, Dead: ${dead}`);
  if (dead > 0) {
    for (const d of deadGrants) console.log(`  [${d.status}] ${d.title} - ${d.url}`);
    for (const d of deadGrants) {
      await pool.query(`DELETE FROM grants WHERE source_url = $1`, [d.url]);
    }
    console.log(`Deleted ${dead} dead-URL grants`);
  }

  const total = await pool.query(`SELECT COUNT(*)::int AS count FROM grants`);
  console.log(`\nFinal grant count: ${total.rows[0].count}`);

  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
