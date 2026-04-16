import { query, queryOne } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing grant id" });
  }

  const grant = await queryOne<any>(
    `SELECT g.*,
       COALESCE(json_agg(json_build_object('id', a.id, 'status', a.status))
                FILTER (WHERE a.id IS NOT NULL), '[]'::json) AS applications
     FROM grants g
     LEFT JOIN applications a ON a.grant_id = g.id
     WHERE g.id = $1
     GROUP BY g.id`,
    [id]
  );

  if (!grant) {
    throw createError({ statusCode: 404, statusMessage: "Grant not found" });
  }

  const related = await query<any>(
    `SELECT id, title, source_name, source_type, amount_max, deadline
     FROM grants
     WHERE id != $1
       AND (source_type = $2 OR category && $3::text[])
     ORDER BY deadline ASC NULLS LAST
     LIMIT 3`,
    [id, grant.source_type, grant.category]
  );

  return { grant, related };
});
