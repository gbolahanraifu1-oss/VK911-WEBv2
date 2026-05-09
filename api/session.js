import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const sql = neon(process.env.DATABASE_URL);

  // Ensure table exists
  await sql`
    CREATE TABLE IF NOT EXISTS bot_sessions (
      id SERIAL PRIMARY KEY, session_id TEXT UNIQUE NOT NULL,
      phone_number TEXT, status TEXT DEFAULT 'disconnected',
      last_active TIMESTAMP DEFAULT NOW(), created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  if (req.method === "GET") {
    try {
      const sessions = await sql`SELECT * FROM bot_sessions ORDER BY last_active DESC`;
      return res.status(200).json(sessions);
    } catch (err) {
      console.error("Sessions GET error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { session_id, phone_number, status } = req.body;
      const result = await sql`
        INSERT INTO bot_sessions (session_id, phone_number, status)
        VALUES (${session_id}, ${phone_number}, ${status || "disconnected"})
        ON CONFLICT (session_id) DO UPDATE
          SET phone_number = EXCLUDED.phone_number,
              status = EXCLUDED.status,
              last_active = NOW()
        RETURNING *
      `;
      return res.status(200).json(result[0]);
    } catch (err) {
      console.error("Sessions POST error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}