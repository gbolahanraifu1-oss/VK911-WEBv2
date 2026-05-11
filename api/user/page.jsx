import pkg from "pg";
const { Pool } = pkg;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "").trim();
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const [userId] = decoded.split(":");
    if (!userId) return res.status(401).json({ error: "Invalid token" });

    if (!process.env.DATABASE_URL)
      return res.status(500).json({ error: "DATABASE_URL not configured" });

    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bot_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        phone TEXT,
        status TEXT DEFAULT 'disconnected',
        connected_at TIMESTAMPTZ,
        messages_sent INTEGER DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const result = await pool.query(
      "SELECT * FROM bot_sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1",
      [userId]
    );

    await pool.end();

    if (result.rows.length === 0) return res.status(200).json(null);
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Session error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}