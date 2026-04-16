import { query, queryOne } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ grantId?: string }>(event);
  const grantId = body?.grantId;

  if (!grantId) {
    throw createError({ statusCode: 400, statusMessage: "grantId is required" });
  }

  const existing = await queryOne<any>(
    `SELECT * FROM applications WHERE grant_id = $1 LIMIT 1`,
    [grantId]
  );
  if (existing) return existing;

  const created = await queryOne<any>(
    `INSERT INTO applications (grant_id, status, notes, draft_answers)
     VALUES ($1, 'interested', '', '[]'::jsonb)
     RETURNING *`,
    [grantId]
  );

  return created;
});
