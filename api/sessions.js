import pkg from "pg";
const { Pool } = pkg;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!process.env.DATABASE_URL) return res.status(200).json([]);

  // Extract session id from path (/api/sessions/123 → rewritten here)
  // or from ?id=123 query param
  const [pathPart, queryStr] = (req.url || "").split("?");
  const segments = pathPart.split("/").filter(Boolean);
  const pathId = segments.length > 2 ? segments[segments.length - 1] : null;
  const id = pathId || new URLSearchParams(queryStr || "").get("id") || req.query?.id;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bot_sessions (
        id SERIAL PRIMARY KEY,
        session_id TEXT UNIQUE NOT NULL,
        phone_number TEXT,
        status TEXT DEFAULT 'disconnected',
        last_active TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    if (req.method === "GET") {
      const result = await pool.query("SELECT * FROM bot_sessions ORDER BY last_active DESC");
      return res.status(200).json(result.rows);
    }

    if (req.method === "DELETE") {
      if (!id) return res.status(400).json({ error: "Session ID required" });
      await pool.query("DELETE FROM bot_sessions WHERE id = $1", [parseInt(id)]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    await pool.end();
  }
}
