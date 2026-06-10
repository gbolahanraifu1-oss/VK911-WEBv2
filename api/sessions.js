import pkg from "pg";
const { Pool } = pkg;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!process.env.DATABASE_URL) return res.status(200).json([]);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS bot_sessions (id SERIAL PRIMARY KEY, session_id TEXT UNIQUE NOT NULL, phone_number TEXT, status TEXT DEFAULT 'disconnected', last_active TIMESTAMP DEFAULT NOW(), created_at TIMESTAMP DEFAULT NOW())`);
    const result = await pool.query("SELECT * FROM bot_sessions ORDER BY last_active DESC");
    return res.status(200).json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    await pool.end();
  }
}
