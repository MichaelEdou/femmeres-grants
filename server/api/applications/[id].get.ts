import { queryOne, query } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });

  const app = await queryOne<any>(
    `SELECT a.*, row_to_json(g) AS grant
     FROM applications a
     JOIN grants g ON g.id = a.grant_id
     WHERE a.id = $1`,
    [id]
  );

  if (!app) throw createError({ statusCode: 404, statusMessage: "Application not found" });

  const docs = await query<any>(
    `SELECT id, filename, file_url, file_size, mime_type, uploaded_at
     FROM documents
     WHERE application_id = $1
     ORDER BY uploaded_at DESC`,
    [id]
  );

  return { ...app, documents: docs };
});
