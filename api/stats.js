import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Ensure tables exist
    await sql`
      CREATE TABLE IF NOT EXISTS message_volume (
        id SERIAL PRIMARY KEY, timestamp TIMESTAMP DEFAULT NOW(), count INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS command_usage (
        id SERIAL PRIMARY KEY, command_name TEXT NOT NULL, category TEXT NOT NULL,
        used_at TIMESTAMP DEFAULT NOW(), success BOOLEAN DEFAULT true
      );
    `;

    const msgVolumeRaw = await sql`
      SELECT EXTRACT(HOUR FROM timestamp) as hour, SUM(count) as count
      FROM message_volume
      WHERE timestamp >= NOW() - INTERVAL '24 hours'
      GROUP BY EXTRACT(HOUR FROM timestamp)
      ORDER BY hour
    `;

    const messageVolume = msgVolumeRaw.map((r) => ({
      hour: `${String(Math.round(r.hour)).padStart(2, "0")}:00`,
      count: parseInt(r.count) || 0,
    }));

    const topCommandsRaw = await sql`
      SELECT command_name as name, COUNT(*) as count
      FROM command_usage
      WHERE used_at >= NOW() - INTERVAL '24 hours'
      GROUP BY command_name ORDER BY count DESC LIMIT 8
    `;
    const topCommands = topCommandsRaw.map((r) => ({
      name: r.name, count: parseInt(r.count) || 0,
    }));

    const categoryRaw = await sql`
      SELECT category, COUNT(*) as value
      FROM command_usage
      WHERE used_at >= NOW() - INTERVAL '7 days'
      GROUP BY category ORDER BY value DESC
    `;
    const categoryStats = categoryRaw.map((r) => ({
      name: r.category, value: parseInt(r.value) || 0,
    }));

    const totalMsgRaw = await sql`
      SELECT COALESCE(SUM(count), 0) as total
      FROM message_volume WHERE timestamp >= CURRENT_DATE
    `;
    const messagesToday = parseInt(totalMsgRaw[0]?.total) || 0;

    const cmdTodayRaw = await sql`
      SELECT COUNT(*) as total FROM command_usage WHERE used_at >= CURRENT_DATE
    `;
    const commandsUsed = parseInt(cmdTodayRaw[0]?.total) || 0;

    const successRaw = await sql`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as success_count
      FROM command_usage WHERE used_at >= NOW() - INTERVAL '24 hours'
    `;
    const total = parseInt(successRaw[0]?.total) || 1;
    const successCount = parseInt(successRaw[0]?.success_count) || total;
    const successRate = Math.round((successCount / total) * 100);

    return res.status(200).json({
      messageVolume, topCommands, categoryStats,
      messagesToday, commandsUsed, successRate, totalCommands: 214,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return res.status(500).json({
      messageVolume: [], topCommands: [], categoryStats: [],
      messagesToday: 0, commandsUsed: 0, successRate: 99, totalCommands: 214,
    });
  }
}