import pg from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const rows = (await pool.query("SELECT id, source_url, title FROM grants")).rows;
  console.log(`Validating ${rows.length} URLs...`);

  const BATCH = 20;
  const dead: Array<{ id: string; url: string; title: string; status: any }> = [];

  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const results = await Promise.all(
      chunk.map(async (r) => {
        try {
          const res = await fetch(r.source_url, {
            method: "HEAD",
            redirect: "follow",
            headers: { "User-Agent": "Mozilla/5.0 (FemmeresGrants validator)" },
            signal: AbortSignal.timeout(15000),
          });
          return { r, status: res.status, ok: res.ok };
        } catch (err: any) {
          return { r, status: err.message ?? "error", ok: false };
        }
      })
    );
    for (const { r, status, ok } of results) {
      if (!ok) dead.push({ id: r.id, url: r.source_url, title: r.title, status });
    }
    process.stdout.write(`Checked ${Math.min(i + BATCH, rows.length)}/${rows.length}\r`);
  }

  console.log(`\n\n${dead.length} dead URLs found`);
  if (dead.length > 0) {
    for (const d of dead.slice(0, 30)) console.log(`  [${d.status}] ${d.title.slice(0, 60)}`);
    if (dead.length > 30) console.log(`  ... and ${dead.length - 30} more`);

    const ids = dead.map((d) => d.id);
    const del = await pool.query(
      `DELETE FROM grants WHERE id = ANY($1::uuid[])`,
      [ids]
    );
    console.log(`\nDeleted ${del.rowCount} grants with dead URLs`);
  }

  const count = (await pool.query("SELECT COUNT(*)::int AS c FROM grants")).rows[0].c;
  console.log(`Final count: ${count}`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
