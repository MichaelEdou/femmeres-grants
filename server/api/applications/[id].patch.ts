import { queryOne } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });

  const body = await readBody<{ status?: string; notes?: string; draftAnswers?: any }>(event);

  const sets: string[] = [];
  const params: any[] = [];
  let p = 1;

  if (body.status !== undefined) {
    sets.push(`status = $${p}::"ApplicationStatus"`);
    params.push(body.status);
    p++;
  }
  if (body.notes !== undefined) {
    sets.push(`notes = $${p}`);
    params.push(body.notes);
    p++;
  }
  if (body.draftAnswers !== undefined) {
    sets.push(`draft_answers = $${p}::jsonb`);
    params.push(JSON.stringify(body.draftAnswers));
    p++;
  }

  if (!sets.length) {
    throw createError({ statusCode: 400, statusMessage: "No fields to update" });
  }

  sets.push(`updated_at = NOW()`);
  params.push(id);

  const updated = await queryOne<any>(
    `UPDATE applications SET ${sets.join(", ")} WHERE id = $${p} RETURNING *`,
    params
  );

  return updated;
});
