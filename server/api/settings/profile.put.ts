import { queryOne } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event);
  const fields = [
    "name",
    "mission",
    "registration_number",
    "contact_email",
    "contact_phone",
    "address",
    "city",
    "province",
  ];
  const sets: string[] = [];
  const params: any[] = [];
  let p = 1;
  for (const f of fields) {
    const k = f === "registration_number" ? "registrationNumber"
         : f === "contact_email" ? "contactEmail"
         : f === "contact_phone" ? "contactPhone"
         : f;
    if (body[k] !== undefined || body[f] !== undefined) {
      sets.push(`${f} = $${p}`);
      params.push(body[k] ?? body[f]);
      p++;
    }
  }
  if (!sets.length) return await queryOne<any>(`SELECT * FROM org_profile LIMIT 1`, []);
  sets.push(`updated_at = NOW()`);
  const updated = await queryOne<any>(
    `UPDATE org_profile SET ${sets.join(", ")} WHERE id = 'default' RETURNING *`,
    params
  );
  return updated;
});
