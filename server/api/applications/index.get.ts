import { query } from "../../utils/db";

export default defineEventHandler(async () => {
  const apps = await query<any>(
    `SELECT a.*,
       json_build_object(
         'id', g.id,
         'title', g.title,
         'source_name', g.source_name,
         'source_type', g.source_type,
         'amount_max', g.amount_max,
         'deadline', g.deadline
       ) AS grant
     FROM applications a
     JOIN grants g ON g.id = a.grant_id
     ORDER BY a.updated_at DESC`,
    []
  );
  return apps;
});
