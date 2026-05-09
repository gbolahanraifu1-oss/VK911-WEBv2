import sql from "@/app/api/utils/sql";

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const range = url.searchParams.get("range") || "24h";

    const intervals = {
      "1h": "1 hour",
      "24h": "24 hours",
      "7d": "7 days",
      "30d": "30 days",
    };
    const interval = intervals[range] || "24 hours";

    const msgVol = await sql(
      `SELECT to_char(timestamp, 'HH24:MI') as time, SUM(count) as messages
       FROM message_volume
       WHERE timestamp >= NOW() - INTERVAL '${interval}'
       GROUP BY to_char(timestamp, 'HH24:MI')
       ORDER BY time LIMIT 50`,
      []
    );

    const cmdUsage = await sql(
      `SELECT to_char(used_at, 'HH24:MI') as time, COUNT(*) as count
       FROM command_usage
       WHERE used_at >= NOW() - INTERVAL '${interval}'
       GROUP BY to_char(used_at, 'HH24:MI')
       ORDER BY time LIMIT 50`,
      []
    );

    const sessions = await sql`
      SELECT COUNT(*) as sessions FROM bot_sessions WHERE status = 'connected'
    `;

    const errors = await sql(
      `SELECT to_char(used_at, 'HH24:MI') as time,
         SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as success,
         SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as errors
       FROM command_usage
       WHERE used_at >= NOW() - INTERVAL '${interval}'
       GROUP BY to_char(used_at, 'HH24:MI')
       ORDER BY time LIMIT 50`,
      []
    );

    const totalMessages = await sql(
      `SELECT COALESCE(SUM(count), 0) as total FROM message_volume
       WHERE timestamp >= NOW() - INTERVAL '${interval}'`,
      []
    );

    const totalCmds = await sql(
      `SELECT COUNT(*) as total FROM command_usage
       WHERE used_at >= NOW() - INTERVAL '${interval}'`,
      []
    );

    const errorCount = await sql(
      `SELECT COUNT(*) as total FROM command_usage
       WHERE used_at >= NOW() - INTERVAL '${interval}' AND success = false`,
      []
    );

    return Response.json({
      messageVolume: msgVol.map((r) => ({ time: r.time, messages: parseInt(r.messages) || 0 })),
      commandUsage: cmdUsage.map((r) => ({ time: r.time, count: parseInt(r.count) || 0 })),
      sessions: Array.from({ length: 20 }, (_, i) => ({
        time: `${i * 2}:00`,
        sessions: parseInt(sessions[0]?.sessions) || 0,
      })),
      errorRate: errors.map((r) => ({
        time: r.time,
        success: parseInt(r.success) || 0,
        errors: parseInt(r.errors) || 0,
      })),
      totalMessages: parseInt(totalMessages[0]?.total) || 0,
      totalCommands: parseInt(totalCmds[0]?.total) || 0,
      activeSessions: parseInt(sessions[0]?.sessions) || 0,
      errors: parseInt(errorCount[0]?.total) || 0,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return Response.json({ messageVolume: [], commandUsage: [], sessions: [], errorRate: [] });
  }
}
