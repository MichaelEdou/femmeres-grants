import { query, queryOne } from "../../utils/db";

export default defineEventHandler(async () => {
  let profile = await queryOne<any>(`SELECT * FROM org_profile LIMIT 1`, []);
  if (!profile) {
    await query(
      `INSERT INTO org_profile (id, name, city, province)
       VALUES ('default', 'Femmeres', 'Gatineau', 'QC')
       ON CONFLICT (id) DO NOTHING`,
      []
    );
    profile = await queryOne<any>(`SELECT * FROM org_profile LIMIT 1`, []);
  }
  return profile;
});
