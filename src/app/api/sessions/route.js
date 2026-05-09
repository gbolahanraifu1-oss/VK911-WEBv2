import sql from "@/app/api/utils/sql";

export async function loader() {
  try {
    const sessions = await sql`
      SELECT * FROM bot_sessions ORDER BY last_active DESC
    `;
    return Response.json(sessions);
  } catch (err) {
    console.error("Sessions error:", err);
    return Response.json([]);
  }
}

export async function action({ request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const { session_id, phone_number, status } = await request.json();
    const result = await sql`
      INSERT INTO bot_sessions (session_id, phone_number, status)
      VALUES (${session_id}, ${phone_number}, ${status || "disconnected"})
      ON CONFLICT (session_id) DO UPDATE 
        SET phone_number = EXCLUDED.phone_number,
            status = EXCLUDED.status,
            last_active = CURRENT_TIMESTAMP
      RETURNING *
    `;
    return Response.json(result[0]);
  } catch (err) {
    console.error("Session create error:", err);
    return Response.json({ error: "Failed to create session" }, { status: 500 });
  }
}
