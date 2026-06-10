import pkg from "pg";
const { Pool } = pkg;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const range = req.query?.range || "24h";
  const intervalMap = { "1h": "1 hour", "24h": "24 hours", "7d": "7 days", "30d": "30 days" };
  const interval = intervalMap[range] || "24 hours";

  if (!process.env.DATABASE_URL) {
    const times = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
    return res.status(200).json({
      messageVolume: times.map((time) => ({ time, messages: Math.floor(Math.random() * 200 + 30) })),
      commandUsage: times.map((time) => ({ time, count: Math.floor(Math.random() * 80 + 5) })),
      sessions: times.map((time) => ({ time, sessions: Math.floor(Math.random() * 5 + 1) })),
      errorRate: times.map((time) => ({ time, success: Math.floor(Math.random() * 180 + 50), errors: Math.floor(Math.random() * 10) })),
      totalMessages: 0, totalCommands: 0, activeSessions: 0, errors: 0, avgResponse: "—",
    });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS message_volume (id SERIAL PRIMARY KEY, timestamp TIMESTAMP DEFAULT NOW(), count INTEGER DEFAULT 0)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS command_usage (id SERIAL PRIMARY KEY, command_name TEXT NOT NULL, category TEXT NOT NULL, used_at TIMESTAMP DEFAULT NOW(), success BOOLEAN DEFAULT true)`);

    const [msgVol, cmdUsage, sessionCount, errors] = await Promise.all([
      pool.query(`SELECT TO_CHAR(timestamp, 'HH24:MI') as time, SUM(count) as messages FROM message_volume WHERE timestamp >= NOW() - INTERVAL '${interval}' GROUP BY TO_CHAR(timestamp, 'HH24:MI') ORDER BY time`),
      pool.query(`SELECT TO_CHAR(used_at, 'HH24:MI') as time, COUNT(*) as count FROM command_usage WHERE used_at >= NOW() - INTERVAL '${interval}' GROUP BY TO_CHAR(used_at, 'HH24:MI') ORDER BY time`),
      pool.query(`SELECT COUNT(*) as total FROM bot_sessions WHERE status = 'connected' AND last_active >= NOW() - INTERVAL '5 minutes'`).catch(() => ({ rows: [{ total: 0 }] })),
      pool.query(`SELECT COUNT(*) as total FROM command_usage WHERE success = false AND used_at >= NOW() - INTERVAL '${interval}'`).catch(() => ({ rows: [{ total: 0 }] })),
    ]);

    const totalMsg = msgVol.rows.reduce((a, r) => a + parseInt(r.messages || 0), 0);
    const totalCmd = cmdUsage.rows.reduce((a, r) => a + parseInt(r.count || 0), 0);

    return res.status(200).json({
      messageVolume: msgVol.rows.map((r) => ({ time: r.time, messages: parseInt(r.messages) || 0 })),
      commandUsage: cmdUsage.rows.map((r) => ({ time: r.time, count: parseInt(r.count) || 0 })),
      sessions: [],
      errorRate: [],
      totalMessages: totalMsg,
      totalCommands: totalCmd,
      activeSessions: parseInt(sessionCount.rows[0]?.total) || 0,
      errors: parseInt(errors.rows[0]?.total) || 0,
      avgResponse: "—",
    });
  } catch (err) {
    console.error("Analytics error:", err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    await pool.end();
  }
}
