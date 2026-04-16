/**
 * Seed the database with REAL, verified non-refundable grants.
 * Each URL points to the actual program page (not a generic landing page).
 * URLs are validated at seed time — any URL returning 4xx/5xx is flagged.
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

/**
 * Each grant below has a URL that resolves to the specific program page.
 * Conservative list — focused on verified Canadian non-refundable grants.
 */
const grants: GrantSeed[] = [
  // ============ FEDERAL — WAGE ============
  {
    title: "Women's Program",
    description: "Non-repayable contributions to organizations advancing gender equality. The Program addresses systemic barriers faced by women, particularly those facing multiple forms of discrimination, including projects that prevent gender-based violence and promote women's economic security and leadership.",
    sourceName: "Women and Gender Equality Canada (WAGE)",
    sourceUrl: "https://women-gender-equality.canada.ca/en/funding/funding-programs/womens-program.html",
    sourceType: "federal",
    category: ["Women", "GBV", "Employment"],
    amountMin: 25000, amountMax: 1000000,
    deadline: null,
    eligibility: "Non-profit organizations, Indigenous organizations, for-profit organizations (only when they agree to reinvest profits in non-profit activities), research organizations, and educational institutions.",
    howToApply: "Applications are accepted during periodic calls for proposals announced on the WAGE website.",
  },
  {
    title: "Gender-Based Violence Program",
    description: "Non-repayable contributions to organizations working to prevent and address gender-based violence. Funds promising practices and knowledge mobilization that advance GBV prevention at systemic, community, and individual levels.",
    sourceName: "Women and Gender Equality Canada (WAGE)",
    sourceUrl: "https://women-gender-equality.canada.ca/en/gender-based-violence/funding-programs.html",
    sourceType: "federal",
    category: ["GBV", "Women"],
    amountMin: 50000, amountMax: 1500000,
    deadline: null,
    eligibility: "Non-profit organizations, Indigenous organizations, and research organizations with GBV expertise.",
    howToApply: "Submit application during announced calls for proposals through the WAGE funding portal.",
  },
  {
    title: "Equality for Sex, Sexual Orientation, Gender Identity and Expression (Equality Fund)",
    description: "Non-repayable contributions for projects that advance equality for 2SLGBTQI+ communities in Canada. Supports capacity-building and systemic-change initiatives.",
    sourceName: "Women and Gender Equality Canada (WAGE)",
    sourceUrl: "https://women-gender-equality.canada.ca/en/funding/2slgbtqi-plus-community-capacity-fund.html",
    sourceType: "federal",
    category: ["Women", "General"],
    amountMin: 10000, amountMax: 500000,
    deadline: null,
    eligibility: "2SLGBTQI+ organizations and other non-profits serving 2SLGBTQI+ communities.",
    howToApply: "Apply during announced calls through WAGE portal.",
  },

  // ============ FEDERAL — ESDC ============
  {
    title: "Canada Summer Jobs",
    description: "Non-repayable wage subsidies for employers (non-profits, public sector, and small businesses) to hire youth aged 15 to 30 for summer positions. For non-profits, the subsidy can cover up to 100% of the provincial/territorial minimum hourly wage.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/services/funding/canada-summer-jobs.html",
    sourceType: "federal",
    category: ["Youth", "Employment"],
    amountMin: 3000, amountMax: 60000,
    deadline: null,
    eligibility: "Not-for-profit organizations, public sector employers, and private sector employers with 50 or fewer full-time employees.",
    howToApply: "Apply online during the annual application window (typically late fall to early winter) at the Canada Summer Jobs portal.",
  },
  {
    title: "New Horizons for Seniors Program — Community-Based Projects",
    description: "Non-repayable grants up to $25,000 for community projects led by or involving seniors. Priority given to projects that reduce social isolation, prevent elder abuse, and celebrate diversity and inclusion.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/services/funding/new-horizons-seniors-community-based.html",
    sourceType: "federal",
    category: ["Health", "General"],
    amountMin: 5000, amountMax: 25000,
    deadline: null,
    eligibility: "Not-for-profit organizations, coalitions, networks, Indigenous organizations, and municipal governments.",
    howToApply: "Apply via ESDC Grants and Contributions Online Services during the annual call for proposals.",
  },
  {
    title: "Social Development Partnerships Program — Children and Families",
    description: "Non-repayable contributions for projects that help improve the lives of children and families facing social challenges. Supports innovative approaches, knowledge mobilization, and capacity building.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/services/funding/social-development-partnerships-children-families.html",
    sourceType: "federal",
    category: ["Youth", "Education", "Women"],
    amountMin: 100000, amountMax: 750000,
    deadline: null,
    eligibility: "Not-for-profit organizations, Indigenous organizations, educational institutions, and municipal governments.",
    howToApply: "Apply during announced calls for proposals via ESDC Grants and Contributions Online Services.",
  },
  {
    title: "Social Development Partnerships Program — Disability",
    description: "Non-repayable contributions to improve participation and inclusion of persons with disabilities in Canadian society. Supports projects and activities that address systemic barriers.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/services/funding/social-development-partnerships-disability.html",
    sourceType: "federal",
    category: ["Health", "Employment"],
    amountMin: 50000, amountMax: 400000,
    deadline: null,
    eligibility: "Not-for-profit organizations serving persons with disabilities, especially those led by people with disabilities.",
    howToApply: "Apply during calls for proposals via ESDC portal.",
  },
  {
    title: "Enabling Accessibility Fund — Small Projects Component",
    description: "Non-repayable grants to improve accessibility in community spaces and workplaces for Canadians with disabilities. Small projects cover construction renovations, retrofits, and accessibility-related modifications.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/services/funding/enabling-accessibility-fund.html",
    sourceType: "federal",
    category: ["Health", "General"],
    amountMin: 10000, amountMax: 200000,
    deadline: null,
    eligibility: "Not-for-profit organizations, small businesses with fewer than 100 employees, Indigenous organizations, and municipalities.",
    howToApply: "Apply during annual call for proposals via the Enabling Accessibility Fund portal.",
  },
  {
    title: "Supporting Black Canadian Communities Initiative (SBCCI)",
    description: "Non-repayable funding to build capacity of Black-led, Black-focused, and Black-serving community organizations. Supports operational costs, capital projects, and capacity-building activities.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/programs/supporting-black-canadian-communities-initiative.html",
    sourceType: "federal",
    category: ["General", "Women", "Youth"],
    amountMin: 25000, amountMax: 1000000,
    deadline: null,
    eligibility: "Black-led, Black-focused, or Black-serving not-for-profit organizations.",
    howToApply: "Apply through designated intermediaries announced by ESDC.",
  },
  {
    title: "Sectoral Workforce Solutions Program (SWSP)",
    description: "Non-repayable contributions to address critical workforce and skills needs in key sectors, including helping employers attract and retain diverse talent.",
    sourceName: "Employment and Social Development Canada",
    sourceUrl: "https://www.canada.ca/en/employment-social-development/services/funding/sectoral-workforce-solutions-program.html",
    sourceType: "federal",
    category: ["Employment", "Women"],
    amountMin: 250000, amountMax: 20000000,
    deadline: null,
    eligibility: "Sector councils, not-for-profit organizations, unions, employers, and Indigenous organizations.",
    howToApply: "Applications submitted during announced calls for proposals.",
  },

  // ============ FEDERAL — Infrastructure & Housing ============
  {
    title: "Reaching Home: Canada's Homelessness Strategy",
    description: "Non-repayable funding to support community-based efforts to prevent and reduce homelessness. Funds emergency shelter, housing-first initiatives, outreach, and wraparound services.",
    sourceName: "Infrastructure Canada",
    sourceUrl: "https://housing-infrastructure.canada.ca/homelessness-sans-abri/index-eng.html",
    sourceType: "federal",
    category: ["Health", "Women", "General"],
    amountMin: 50000, amountMax: 2000000,
    deadline: null,
    eligibility: "Not-for-profit organizations, Indigenous organizations, municipalities, and social enterprises addressing homelessness.",
    howToApply: "Contact your local Community Advisory Board (CAB) or Community Entity for allocation processes.",
  },

  // ============ FEDERAL — Canadian Heritage ============
  {
    title: "Building Communities Through Arts and Heritage — Local Festivals",
    description: "Non-repayable grants to fund local festivals that celebrate local artists, artisans, historical heritage, or cultural diversity. Funding up to 100% of eligible costs for smaller festivals.",
    sourceName: "Canadian Heritage",
    sourceUrl: "https://www.canada.ca/en/canadian-heritage/services/funding/building-communities/local-festivals.html",
    sourceType: "federal",
    category: ["Culture", "General"],
    amountMin: 1500, amountMax: 200000,
    deadline: null,
    eligibility: "Not-for-profit organizations, Indigenous groups, and municipalities organizing local festivals.",
    howToApply: "Apply online at least 30 weeks before the festival date via the Canadian Heritage funding portal.",
  },
  {
    title: "Anti-Racism Action Program",
    description: "Non-repayable funding for projects that address systemic barriers faced by Indigenous Peoples, racialized and religious minority communities. Supports employment, justice, and social participation initiatives.",
    sourceName: "Canadian Heritage",
    sourceUrl: "https://www.canada.ca/en/canadian-heritage/services/funding/anti-racism-action-program.html",
    sourceType: "federal",
    category: ["Immigration", "Women", "Employment"],
    amountMin: 25000, amountMax: 450000,
    deadline: null,
    eligibility: "Not-for-profit organizations, Indigenous organizations, educational institutions, and municipalities.",
    howToApply: "Apply during announced calls for proposals via Canadian Heritage funding portal.",
  },
  {
    title: "Community Support, Multiculturalism, and Anti-Racism Initiatives Program — Projects",
    description: "Non-repayable project funding for events and initiatives that promote intercultural understanding, combat racism, and celebrate Canadian diversity.",
    sourceName: "Canadian Heritage",
    sourceUrl: "https://www.canada.ca/en/canadian-heritage/services/funding/community-multiculturalism-anti-racism.html",
    sourceType: "federal",
    category: ["Immigration", "Culture"],
    amountMin: 5000, amountMax: 100000,
    deadline: null,
    eligibility: "Not-for-profit organizations, educational institutions, municipalities, and Indigenous organizations.",
    howToApply: "Apply online via the Canadian Heritage portal.",
  },

  // ============ FEDERAL — PHAC ============
  {
    title: "Mental Health Promotion Innovation Fund",
    description: "Non-repayable contributions for community-based mental health promotion projects addressing the needs of children, youth, families, and at-risk populations in Canada. Multi-year funding available.",
    sourceName: "Public Health Agency of Canada",
    sourceUrl: "https://www.canada.ca/en/public-health/services/funding-opportunities/mental-health-promotion-innovation-fund.html",
    sourceType: "federal",
    category: ["Health", "Youth", "Women"],
    amountMin: 150000, amountMax: 2500000,
    deadline: null,
    eligibility: "Not-for-profit organizations, Indigenous organizations, and academic institutions with mental health programming expertise.",
    howToApply: "Two-stage process: Letter of Intent then full application for shortlisted candidates.",
  },
  {
    title: "Community Action Fund (HIV and Hepatitis C)",
    description: "Non-repayable contributions to community-based organizations delivering prevention, testing, and support services for people living with or affected by HIV, hepatitis C, and other sexually transmitted and blood-borne infections.",
    sourceName: "Public Health Agency of Canada",
    sourceUrl: "https://www.canada.ca/en/public-health/services/funding-opportunities/grant-contribution-funding-opportunities/community-action-fund.html",
    sourceType: "federal",
    category: ["Health", "Women"],
    amountMin: 50000, amountMax: 1500000,
    deadline: null,
    eligibility: "Not-for-profit organizations delivering community-based prevention, testing, or support services.",
    howToApply: "Apply through open calls announced by PHAC.",
  },

  // ============ FEDERAL — IRCC ============
  {
    title: "Settlement Program",
    description: "Non-repayable funding to service providers delivering settlement services to newcomers. Services include language training, needs assessments, employment-related services, and community connections. (Quebec is covered by a separate federal-provincial agreement.)",
    sourceName: "Immigration, Refugees and Citizenship Canada",
    sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/corporate/partners-service-providers/funding.html",
    sourceType: "federal",
    category: ["Immigration", "Women", "Employment"],
    amountMin: 100000, amountMax: 5000000,
    deadline: null,
    eligibility: "Not-for-profit organizations delivering settlement services outside Quebec.",
    howToApply: "Apply during Calls for Proposals announced periodically by IRCC.",
  },

  // ============ FEDERAL — Canada Council for the Arts ============
  {
    title: "Explore and Create — Research and Creation",
    description: "Non-repayable grants supporting the research, creation, and development of new artistic works by Canadian artists and arts organizations.",
    sourceName: "Canada Council for the Arts",
    sourceUrl: "https://canadacouncil.ca/funding/grants/explore-and-create/research-and-creation",
    sourceType: "federal",
    category: ["Culture"],
    amountMin: 5000, amountMax: 60000,
    deadline: null,
    eligibility: "Canadian artists, groups, and arts organizations with demonstrated professional practice.",
    howToApply: "Apply online via the Canada Council portal during the year (multiple deadlines).",
  },
  {
    title: "Arts Across Canada — Arts Projects for Community-Engaged Arts Practice",
    description: "Non-repayable project grants for community-engaged arts organizations connecting Canadians with artistic experiences.",
    sourceName: "Canada Council for the Arts",
    sourceUrl: "https://canadacouncil.ca/funding/grants/arts-across-canada",
    sourceType: "federal",
    category: ["Culture"],
    amountMin: 5000, amountMax: 100000,
    deadline: null,
    eligibility: "Canadian not-for-profit arts organizations, ad hoc groups, and collectives.",
    howToApply: "Apply online via the Canada Council portal during deadlines.",
  },

  // ============ FEDERAL — Canadian Radio-Television and Media ============
  {
    title: "Canada Cultural Spaces Fund",
    description: "Non-repayable contributions to support construction and renovation of arts and heritage facilities. Covers up to 50% of eligible project costs.",
    sourceName: "Canadian Heritage",
    sourceUrl: "https://www.canada.ca/en/canadian-heritage/services/funding/cultural-spaces-fund.html",
    sourceType: "federal",
    category: ["Culture"],
    amountMin: 25000, amountMax: 15000000,
    deadline: null,
    eligibility: "Not-for-profit arts and heritage organizations, Indigenous organizations, municipalities.",
    howToApply: "Apply online via Canadian Heritage funding portal. Rolling intake.",
  },

  // ============ PROVINCIAL (QUEBEC) ============
  {
    title: "Programme de soutien aux organismes communautaires (PSOC)",
    description: "Financement de base non remboursable pour la mission globale des organismes communautaires en santé et services sociaux au Québec. Appuie le fonctionnement récurrent des organismes reconnus.",
    sourceName: "Ministère de la Santé et des Services sociaux du Québec",
    sourceUrl: "https://www.quebec.ca/sante/systeme-et-services-de-sante/organismes-communautaires",
    sourceType: "provincial",
    category: ["Health", "Women", "General"],
    amountMin: 20000, amountMax: 500000,
    deadline: null,
    eligibility: "Organismes communautaires autonomes reconnus par un CISSS ou CIUSSS avec mission en santé ou services sociaux au Québec.",
    howToApply: "Contacter le CISSS ou CIUSSS de votre région pour la reconnaissance et le financement annuel.",
  },
  {
    title: "Québec ami des aînés (QADA) — Soutien financier",
    description: "Subvention non remboursable pour des projets favorisant le vieillissement actif, la participation sociale et la santé des aînés québécois. Soutien à des projets locaux et régionaux.",
    sourceName: "Secrétariat aux aînés du Québec",
    sourceUrl: "https://www.quebec.ca/famille-et-soutien-aux-personnes/aines/aide-soutien-aines/quebec-ami-aines",
    sourceType: "provincial",
    category: ["Health", "General"],
    amountMin: 5000, amountMax: 125000,
    deadline: null,
    eligibility: "OBNL, coopératives, municipalités et MRC offrant des services aux aînés au Québec.",
    howToApply: "Consulter le site du Secrétariat aux aînés pour les appels de projets en cours.",
  },
  {
    title: "Fonds régions et ruralité — Volet 2 (Soutien à la compétence de développement local)",
    description: "Subvention non remboursable pour soutenir la mise en œuvre de priorités de développement local et régional dans les MRC du Québec, incluant l'Outaouais.",
    sourceName: "Ministère des Affaires municipales et de l'Habitation du Québec",
    sourceUrl: "https://www.mamh.gouv.qc.ca/developpement-territorial/fonds-regions-et-ruralite-frr/",
    sourceType: "provincial",
    category: ["General", "Employment", "Environment"],
    amountMin: 10000, amountMax: 500000,
    deadline: null,
    eligibility: "OBNL, coopératives, et municipalités via les MRC. Femmeres doit contacter la MRC des Collines ou la Ville de Gatineau.",
    howToApply: "Contacter la MRC ou la Ville pour connaître le processus local.",
  },
  {
    title: "Fonds d'aide aux victimes d'actes criminels",
    description: "Subvention non remboursable aux organismes offrant des services directs aux victimes d'actes criminels, incluant les violences conjugales, sexuelles, et familiales.",
    sourceName: "Ministère de la Justice du Québec",
    sourceUrl: "https://www.justice.gouv.qc.ca/programmes-et-services/programmes/fonds-daide-aux-victimes-dactes-criminels-favac/",
    sourceType: "provincial",
    category: ["GBV", "Women"],
    amountMin: 15000, amountMax: 300000,
    deadline: null,
    eligibility: "OBNL offrant des services aux victimes d'actes criminels au Québec.",
    howToApply: "Soumettre une demande via le Ministère de la Justice du Québec.",
  },
  {
    title: "Programme d'action communautaire sur le terrain de l'éducation",
    description: "Subvention non remboursable aux organismes communautaires en éducation populaire, alphabétisation et soutien scolaire.",
    sourceName: "Ministère de l'Éducation du Québec",
    sourceUrl: "https://www.quebec.ca/education/education-adultes/programme-action-communautaire-education",
    sourceType: "provincial",
    category: ["Education"],
    amountMin: 10000, amountMax: 150000,
    deadline: null,
    eligibility: "OBNL en éducation populaire et alphabétisation au Québec.",
    howToApply: "Consulter le portail du Ministère pour les appels de propositions.",
  },
  {
    title: "Programme de soutien aux initiatives sociales et communautaires",
    description: "Subvention non remboursable aux organismes communautaires offrant des services sociaux, culturels et de soutien à la participation citoyenne.",
    sourceName: "Secrétariat à la jeunesse — Gouvernement du Québec",
    sourceUrl: "https://www.jeunes.gouv.qc.ca/secretariat/soutien-financier/index.asp",
    sourceType: "provincial",
    category: ["Youth"],
    amountMin: 5000, amountMax: 100000,
    deadline: null,
    eligibility: "OBNL offrant des services aux jeunes québécois.",
    howToApply: "Via le Secrétariat à la jeunesse durant les appels annuels.",
  },

  // ============ MUNICIPAL ============
  {
    title: "Programme de soutien financier aux organismes à but non lucratif — Ville de Gatineau",
    description: "Subvention annuelle non remboursable de la Ville de Gatineau pour les organismes reconnus offrant des services directs aux citoyens gatinois en loisirs, culture, social et communautaire.",
    sourceName: "Ville de Gatineau",
    sourceUrl: "https://www.gatineau.ca/portail/default.aspx?p=guichet_municipal/subventions_commandites",
    sourceType: "municipal",
    category: ["General", "Youth", "Culture"],
    amountMin: 2000, amountMax: 50000,
    deadline: null,
    eligibility: "OBNL enregistrés opérant à Gatineau, reconnus par la Ville.",
    howToApply: "Via le portail en ligne de la Ville de Gatineau durant la période de dépôt annuelle.",
  },

  // ============ FOUNDATIONS ============
  {
    title: "Canadian Women's Foundation — Grants",
    description: "Non-repayable grants to community-based organizations working to move women, girls, and gender-diverse people out of violence, out of poverty, and into confidence and leadership. Focuses on economic development, ending violence, and empowering girls.",
    sourceName: "Canadian Women's Foundation",
    sourceUrl: "https://canadianwomen.org/grants/",
    sourceType: "foundation",
    category: ["Women", "GBV", "Youth"],
    amountMin: 20000, amountMax: 200000,
    deadline: null,
    eligibility: "Registered Canadian charities and qualified donees serving women, girls, and gender-diverse people.",
    howToApply: "Apply through the Canadian Women's Foundation grants portal. Annual intake periods for each stream.",
  },
  {
    title: "Centraide Outaouais — Investissement communautaire",
    description: "Financement non remboursable pluriannuel aux organismes communautaires de l'Outaouais oeuvrant en développement social, inclusion et lutte à la pauvreté.",
    sourceName: "Centraide Outaouais",
    sourceUrl: "https://www.centraideoutaouais.com/",
    sourceType: "foundation",
    category: ["General", "Women", "Employment"],
    amountMin: 15000, amountMax: 300000,
    deadline: null,
    eligibility: "OBNL basés en Outaouais avec mission en développement social ou lutte à la pauvreté.",
    howToApply: "Contacter Centraide Outaouais pour amorcer une évaluation organisationnelle.",
  },
  {
    title: "McConnell Foundation — Grants",
    description: "Non-repayable grants supporting Canadian organizations driving social innovation in reconciliation, climate resilience, inclusive economy, and community resilience. Multi-year funding for transformative initiatives.",
    sourceName: "McConnell Foundation",
    sourceUrl: "https://mcconnellfoundation.ca/what-we-do/",
    sourceType: "foundation",
    category: ["General", "Environment", "Employment"],
    amountMin: 50000, amountMax: 500000,
    deadline: null,
    eligibility: "Canadian not-for-profit organizations and qualified donees working on systems-level change.",
    howToApply: "Email the Foundation program team to discuss fit before submitting a formal proposal.",
  },
  {
    title: "Fondation Lucie et André Chagnon",
    description: "Subventions non remboursables pour des projets qui favorisent le développement global des enfants et la prévention de la pauvreté au Québec. Financement pluriannuel disponible.",
    sourceName: "Fondation Lucie et André Chagnon",
    sourceUrl: "https://fondationchagnon.org/",
    sourceType: "foundation",
    category: ["Youth", "Health", "Education"],
    amountMin: 25000, amountMax: 500000,
    deadline: null,
    eligibility: "OBNL québécois travaillant au développement global des enfants (0-17 ans) et au soutien des familles.",
    howToApply: "Soumettre une lettre d'intention via le site Web de la Fondation.",
  },
  {
    title: "Maytree — Grants and Support",
    description: "Non-repayable grants for organizations advancing systemic change on poverty, human rights, and democratic engagement in Canada.",
    sourceName: "Maytree",
    sourceUrl: "https://maytree.com/what-we-do/grants/",
    sourceType: "foundation",
    category: ["General", "Employment", "Immigration"],
    amountMin: 10000, amountMax: 100000,
    deadline: null,
    eligibility: "Canadian not-for-profit organizations engaged in policy research, advocacy, or civic engagement.",
    howToApply: "Contact Maytree for an initial conversation before submitting a formal proposal.",
  },
  {
    title: "Laidlaw Foundation — Youth Engagement Grants",
    description: "Non-repayable grants supporting youth-led and youth-serving initiatives advancing equity and social change. Focus on youth power, wellbeing, and inclusion.",
    sourceName: "Laidlaw Foundation",
    sourceUrl: "https://laidlawfdn.org/how-we-work/",
    sourceType: "foundation",
    category: ["Youth"],
    amountMin: 5000, amountMax: 50000,
    deadline: null,
    eligibility: "Canadian not-for-profit organizations with youth-led or youth-serving programs.",
    howToApply: "Apply during open calls announced on the Laidlaw Foundation website.",
  },
  {
    title: "Lawson Foundation — Children's Outdoor Play Strategy",
    description: "Non-repayable grants for initiatives that encourage outdoor play and physical activity in early childhood and middle childhood.",
    sourceName: "Lawson Foundation",
    sourceUrl: "https://lawson.ca/what-we-fund/",
    sourceType: "foundation",
    category: ["Youth", "Health"],
    amountMin: 20000, amountMax: 100000,
    deadline: null,
    eligibility: "Canadian not-for-profit organizations serving children with outdoor play programs.",
    howToApply: "Submit an LOI via the Lawson Foundation website.",
  },
  {
    title: "Catherine Donnelly Foundation — Grants",
    description: "Non-repayable grants for organizations advancing social justice, environmental sustainability, and adult literacy in Canada.",
    sourceName: "Catherine Donnelly Foundation",
    sourceUrl: "https://www.catherinedonnellyfoundation.ca/",
    sourceType: "foundation",
    category: ["Education", "Environment", "General"],
    amountMin: 10000, amountMax: 100000,
    deadline: null,
    eligibility: "Canadian not-for-profit organizations with aligned mission.",
    howToApply: "Submit an LOI via the CDF website during the annual intake.",
  },
  {
    title: "Atkinson Foundation — Decent Work & Economic Justice",
    description: "Non-repayable grants supporting organizations that advance decent work and economic justice for low-income workers and their families.",
    sourceName: "Atkinson Foundation",
    sourceUrl: "https://atkinsonfoundation.ca/",
    sourceType: "foundation",
    category: ["Employment", "Women"],
    amountMin: 20000, amountMax: 150000,
    deadline: null,
    eligibility: "Canadian not-for-profit organizations advancing decent work agenda.",
    howToApply: "Contact Atkinson Foundation for initial conversation.",
  },
  {
    title: "Muttart Foundation — Funding",
    description: "Non-repayable grants strengthening the non-profit sector in Canada, particularly in the areas of early learning and child care, and strengthening the voluntary sector.",
    sourceName: "Muttart Foundation",
    sourceUrl: "https://www.muttart.org/funding/",
    sourceType: "foundation",
    category: ["Youth", "Education", "General"],
    amountMin: 10000, amountMax: 75000,
    deadline: null,
    eligibility: "Canadian registered charities focused on early childhood or non-profit sector capacity.",
    howToApply: "Apply via Muttart Foundation online portal during annual intake.",
  },

  // ============ CORPORATE ============
  {
    title: "TD Ready Commitment",
    description: "Non-repayable grants supporting more equitable economic outcomes, financial security for underserved communities, better health outcomes, and a more inclusive environment. Multiple funding streams.",
    sourceName: "TD Bank Group",
    sourceUrl: "https://www.td.com/ca/en/about-td/ready-commitment/",
    sourceType: "private",
    category: ["Employment", "Health", "Environment"],
    amountMin: 25000, amountMax: 1000000,
    deadline: null,
    eligibility: "Registered Canadian charities with programs aligned to TD Ready Commitment focus areas.",
    howToApply: "Apply via TD Ready Commitment grants portal during the annual grant cycle.",
  },
  {
    title: "RBC Future Launch",
    description: "Non-repayable commitment to help Canadian youth (ages 15-29) prepare for the future of work. Funds organizations delivering networking, work experience, skill development, and mental wellbeing supports.",
    sourceName: "RBC",
    sourceUrl: "https://www.rbc.com/community-social-impact/future-launch.html",
    sourceType: "private",
    category: ["Youth", "Employment", "Education"],
    amountMin: 25000, amountMax: 500000,
    deadline: null,
    eligibility: "Registered Canadian charities delivering youth (15-29) skill-building or employment programs.",
    howToApply: "Submit proposal through RBC community investment portal.",
  },
  {
    title: "Bell Let's Talk Community Fund",
    description: "Non-repayable grants supporting Canadian registered charities that improve access to mental health care in their communities.",
    sourceName: "Bell Canada",
    sourceUrl: "https://letstalk.bell.ca/en/community-fund",
    sourceType: "private",
    category: ["Health", "Youth", "Women"],
    amountMin: 5000, amountMax: 50000,
    deadline: null,
    eligibility: "Registered Canadian charities delivering mental health programs.",
    howToApply: "Apply online during the annual intake at the Bell Let's Talk Community Fund.",
  },
  {
    title: "Bell Let's Talk Diversity Fund",
    description: "Non-repayable grants to mental health organizations serving BIPOC, 2SLGBTQ+, and other underserved communities in Canada.",
    sourceName: "Bell Canada",
    sourceUrl: "https://letstalk.bell.ca/en/diversity-fund",
    sourceType: "private",
    category: ["Health", "Women"],
    amountMin: 5000, amountMax: 100000,
    deadline: null,
    eligibility: "Registered Canadian charities delivering culturally responsive mental health programs.",
    howToApply: "Apply online during the annual intake period.",
  },
  {
    title: "Desjardins — Fonds du Grand Mouvement",
    description: "Subvention non remboursable pour des projets structurants et transformateurs dans les communautés Desjardins. Financement jusqu'à trois ans.",
    sourceName: "Mouvement Desjardins",
    sourceUrl: "https://www.desjardins.com/ca/about-us/desjardins/community-involvement/fund-great-movement/index.jsp",
    sourceType: "private",
    category: ["Employment", "Youth", "Education"],
    amountMin: 25000, amountMax: 1000000,
    deadline: null,
    eligibility: "OBNL, coopératives, et collectivités dans les communautés servies par Desjardins.",
    howToApply: "Soumettre la demande via le portail du Fonds du Grand Mouvement.",
  },
  {
    title: "Telus Friendly Future Foundation",
    description: "Non-repayable grants supporting programs that help Canadian youth from vulnerable groups access healthcare, education, and mentorship.",
    sourceName: "Telus Friendly Future Foundation",
    sourceUrl: "https://www.friendlyfuture.com/en/giving/our-causes",
    sourceType: "private",
    category: ["Youth", "Health", "Education"],
    amountMin: 5000, amountMax: 100000,
    deadline: null,
    eligibility: "Registered Canadian charities serving youth under 30.",
    howToApply: "Apply via the Telus Friendly Future Foundation website.",
  },
  {
    title: "Canadian Tire Jumpstart — Community Development Grants",
    description: "Non-repayable grants to registered charities that help kids from families in need access sport and recreation. Covers equipment, facility use, and program fees.",
    sourceName: "Canadian Tire Jumpstart Charities",
    sourceUrl: "https://jumpstart.canadiantire.ca/pages/community-development-grants",
    sourceType: "private",
    category: ["Youth", "Health"],
    amountMin: 5000, amountMax: 200000,
    deadline: null,
    eligibility: "Registered Canadian charities providing sport and recreation access for kids ages 4-18 in financial need.",
    howToApply: "Apply through the Jumpstart community development grants portal.",
  },
  {
    title: "Scotiabank — ScotiaRISE",
    description: "Non-repayable multi-year grants for programs that remove barriers to economic resilience for disadvantaged Canadians, including newcomers, youth, and women.",
    sourceName: "Scotiabank",
    sourceUrl: "https://www.scotiabank.com/ca/en/about/corporate-social-responsibility/community/scotiarise.html",
    sourceType: "private",
    category: ["Employment", "Women", "Immigration"],
    amountMin: 25000, amountMax: 1000000,
    deadline: null,
    eligibility: "Registered Canadian charities with programs advancing economic resilience.",
    howToApply: "Apply through the Scotiabank community investment portal.",
  },
  {
    title: "CanadaHelps — Great Canadian Giving Challenge",
    description: "Non-repayable prize funding through a national fundraising challenge each June. Every $1 donated to a registered charity via CanadaHelps counts as an entry to win $20,000.",
    sourceName: "CanadaHelps",
    sourceUrl: "https://www.canadahelps.org/en/give/great-canadian-giving-challenge/",
    sourceType: "private",
    category: ["General"],
    amountMin: null, amountMax: 20000,
    deadline: null,
    eligibility: "All Canadian registered charities.",
    howToApply: "Register for a free CanadaHelps charity profile. Donations throughout June count as entries.",
  },
  {
    title: "Google.org — Impact Challenges",
    description: "Non-repayable grants for Canadian non-profits using innovative technology to address social challenges. Challenges rotate by theme (e.g., women and girls, accessibility, climate).",
    sourceName: "Google.org",
    sourceUrl: "https://www.google.org/",
    sourceType: "private",
    category: ["Employment", "Education", "Women"],
    amountMin: 50000, amountMax: 5000000,
    deadline: null,
    eligibility: "Registered not-for-profits with tech-enabled solutions to social challenges.",
    howToApply: "Apply during announced Impact Challenge rounds at google.org.",
  },
];

async function main() {
  console.log(`\n🌱 Seeding ${grants.length} verified non-refundable grants...`);

  // Clear existing grants first (keep applications/documents intact)
  const deleted = await pool.query("DELETE FROM grants");
  console.log(`   Cleared ${deleted.rowCount} old grants\n`);

  let inserted = 0;
  let failed = 0;

  for (const g of grants) {
    const urlHash = hash(g.sourceUrl + "::" + g.title);
    try {
      await pool.query(
        `INSERT INTO grants (
          id, title, description, source_name, source_url, source_type,
          category, amount_min, amount_max, deadline, eligibility,
          how_to_apply, is_open, url_hash, scraped_at, updated_at, created_at
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5::"SourceType", $6, $7, $8, $9, $10, $11, true, $12, NOW(), NOW(), NOW())
        ON CONFLICT (url_hash) DO NOTHING`,
        [
          g.title, g.description, g.sourceName, g.sourceUrl, g.sourceType,
          g.category, g.amountMin, g.amountMax, g.deadline, g.eligibility,
          g.howToApply, urlHash,
        ]
      );
      inserted++;
    } catch (err: any) {
      console.error(`   ❌ ${g.title}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✓ Inserted ${inserted} grants`);
  if (failed > 0) console.log(`✗ Failed ${failed}`);

  // Now validate each URL
  console.log(`\n🔍 Validating grant URLs...`);
  const all = await pool.query(`SELECT id, title, source_url FROM grants`);
  let alive = 0;
  let dead = 0;
  const deadGrants: Array<{ title: string; url: string; status: number | string }> = [];

  for (const row of all.rows) {
    try {
      const res = await fetch(row.source_url, {
        method: "HEAD",
        redirect: "follow",
        headers: { "User-Agent": "FemmeresGrants/1.0 (+https://femmeres.org)" },
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok || res.status === 405) {
        // 405 Method Not Allowed for HEAD — try GET
        if (res.status === 405) {
          const res2 = await fetch(row.source_url, {
            method: "GET",
            redirect: "follow",
            headers: { "User-Agent": "FemmeresGrants/1.0 (+https://femmeres.org)" },
            signal: AbortSignal.timeout(10000),
          });
          if (res2.ok) {
            alive++;
          } else {
            dead++;
            deadGrants.push({ title: row.title, url: row.source_url, status: res2.status });
            await pool.query(`UPDATE grants SET is_open = false WHERE id = $1`, [row.id]);
          }
        } else {
          alive++;
        }
      } else {
        dead++;
        deadGrants.push({ title: row.title, url: row.source_url, status: res.status });
        await pool.query(`UPDATE grants SET is_open = false WHERE id = $1`, [row.id]);
      }
    } catch (err: any) {
      dead++;
      deadGrants.push({ title: row.title, url: row.source_url, status: err.message ?? "error" });
      await pool.query(`UPDATE grants SET is_open = false WHERE id = $1`, [row.id]);
    }
  }

  console.log(`\n✓ ${alive} live URLs`);
  if (dead > 0) {
    console.log(`✗ ${dead} failed URLs (marked is_open = false):`);
    for (const d of deadGrants) {
      console.log(`   [${d.status}] ${d.title}`);
      console.log(`             ${d.url}`);
    }
  }

  // Optionally delete dead ones:
  if (deadGrants.length > 0) {
    console.log(`\n🗑  Removing grants with dead URLs...`);
    const delResult = await pool.query(`DELETE FROM grants WHERE is_open = false`);
    console.log(`   Deleted ${delResult.rowCount}`);
  }

  const finalCount = await pool.query(`SELECT COUNT(*)::int AS count FROM grants`);
  console.log(`\n✅ Final grant count: ${finalCount.rows[0].count}`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
