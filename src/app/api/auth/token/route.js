export async function loader({ request }) {
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length < 2) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }
    const [id, username] = parts;
    return Response.json({ valid: true, user: { id, username } });
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}
