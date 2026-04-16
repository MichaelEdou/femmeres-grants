import { query } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });

  await query(`DELETE FROM applications WHERE id = $1`, [id]);
  return { success: true };
});
