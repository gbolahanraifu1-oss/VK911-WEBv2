import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "DELETE")
    return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Session ID required" });

  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`DELETE FROM bot_sessions WHERE id = ${parseInt(id)}`;
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Session delete error:", err);
    return res.status(500).json({ error: err.message });
  }
}