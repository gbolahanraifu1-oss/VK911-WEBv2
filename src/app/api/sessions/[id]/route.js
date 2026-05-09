import sql from "@/app/api/utils/sql";

export async function action({ request, params }) {
  if (request.method !== "DELETE") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const { id } = params;
    await sql`DELETE FROM bot_sessions WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (err) {
    console.error("Delete session error:", err);
    return Response.json({ error: "Failed to delete" }, { status: 500 });
  }
}
