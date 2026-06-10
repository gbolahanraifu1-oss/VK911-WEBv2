import pkg from "pg";
const { Pool } = pkg;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  return new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const pool = getPool();
  if (!pool) return res.status(500).json({ error: "DATABASE_URL not configured" });

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

    if (req.method === "POST") {
      const { session_id, phone_number, status } = req.body || {};
      if (!session_id) return res.status(400).json({ error: "session_id required" });
      const result = await pool.query(`
        INSERT INTO bot_sessions (session_id, phone_number, status)
        VALUES ($1, $2, $3)
        ON CONFLICT (session_id) DO UPDATE
          SET phone_number = EXCLUDED.phone_number,
              status = EXCLUDED.status,
              last_active = NOW()
        RETURNING *
      `, [session_id, phone_number || null, status || "disconnected"]);
      return res.status(200).json(result.rows[0]);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Sessions error:", err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    await pool.end();
  }
}
