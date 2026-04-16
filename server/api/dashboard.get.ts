import { query } from "../utils/db";

export default defineEventHandler(async () => {
  const [totalsRow] = await query<any>(
    `SELECT
      (SELECT COUNT(*)::int FROM grants) AS total_grants,
      (SELECT COUNT(*)::int FROM grants WHERE scraped_at >= NOW() - INTERVAL '7 days') AS new_this_week,
      (SELECT COUNT(*)::int FROM grants
        WHERE is_open = true
          AND deadline IS NOT NULL
          AND deadline >= NOW()
          AND deadline <= NOW() + INTERVAL '30 days'
      ) AS closing_soon,
      (SELECT COUNT(*)::int FROM applications
        WHERE status IN ('interested','drafting','submitted')
      ) AS active_apps`,
    []
  );

  const deadlines = await query<any>(
    `SELECT id, title, source_name, source_type, amount_max, deadline
     FROM grants
     WHERE is_open = true AND deadline IS NOT NULL
       AND deadline >= NOW() AND deadline <= NOW() + INTERVAL '30 days'
     ORDER BY deadline ASC
     LIMIT 5`,
    []
  );

  const recent = await query<any>(
    `SELECT id, title, description, source_name, source_type, category,
            amount_min, amount_max, deadline, is_open
     FROM grants
     ORDER BY scraped_at DESC
     LIMIT 6`,
    []
  );

  const bySourceRow = await query<any>(
    `SELECT source_type, COUNT(*)::int AS count
     FROM grants
     GROUP BY source_type
     ORDER BY count DESC`,
    []
  );

  return {
    stats: {
      totalGrants: totalsRow?.total_grants ?? 0,
      newThisWeek: totalsRow?.new_this_week ?? 0,
      closingSoon: totalsRow?.closing_soon ?? 0,
      activeApps: totalsRow?.active_apps ?? 0,
    },
    deadlines,
    recent,
    bySource: bySourceRow,
  };
});
