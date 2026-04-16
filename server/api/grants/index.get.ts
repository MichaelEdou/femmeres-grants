import { query } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const page = Math.max(1, parseInt(String(q.page ?? "1")) || 1);
  const limit = Math.min(50, parseInt(String(q.limit ?? "20")) || 20);
  const offset = (page - 1) * limit;

  const search = String(q.search ?? "").trim();
  const sourceType = String(q.sourceType ?? "").trim();
  const category = String(q.category ?? "").trim();
  const status = String(q.status ?? "").trim();
  const sort = String(q.sort ?? "deadline");

  const where: string[] = [];
  const params: any[] = [];
  let p = 1;

  if (search) {
    where.push(
      `(title ILIKE $${p} OR description ILIKE $${p} OR source_name ILIKE $${p})`
    );
    params.push(`%${search}%`);
    p++;
  }

  if (sourceType) {
    where.push(`source_type = $${p}::"SourceType"`);
    params.push(sourceType);
    p++;
  }

  if (category) {
    where.push(`$${p} = ANY(category)`);
    params.push(category);
    p++;
  }

  if (status === "open") {
    where.push(`is_open = true AND (deadline IS NULL OR deadline >= NOW())`);
  } else if (status === "closing") {
    where.push(
      `is_open = true AND deadline IS NOT NULL AND deadline >= NOW() AND deadline <= NOW() + INTERVAL '30 days'`
    );
  } else if (status === "closed") {
    where.push(`(is_open = false OR deadline < NOW())`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  let orderBy = "deadline ASC NULLS LAST";
  if (sort === "amount") orderBy = "amount_max DESC NULLS LAST";
  else if (sort === "newest") orderBy = "scraped_at DESC";

  const grants = await query<any>(
    `SELECT id, title, description, source_name, source_url, source_type,
            category, amount_min, amount_max, deadline, is_open, scraped_at
     FROM grants
     ${whereClause}
     ORDER BY ${orderBy}
     LIMIT $${p} OFFSET $${p + 1}`,
    [...params, limit, offset]
  );

  const countRows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM grants ${whereClause}`,
    params
  );
  const total = parseInt(countRows[0]?.count ?? "0");

  return {
    grants,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
});
