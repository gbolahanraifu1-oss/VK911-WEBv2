import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./page.jsx"),
  route("dashboard", "./dashboard/layout.jsx", [
    index("./dashboard/page.jsx"),
    route("pairing",  "./dashboard/pairing/page.jsx"),
    route("commands", "./dashboard/commands/page.jsx"),
    route("analytics","./dashboard/analytics/page.jsx"),
    route("sessions", "./dashboard/sessions/page.jsx"),
    route("settings", "./dashboard/settings/page.jsx"),
    route("download", "./dashboard/download/page.jsx"),
  ]),
  // ⛔ API routes removed — SPA mode forbids loader/action exports
  // ✅ API is now handled by Vercel serverless functions in /api/ folder
] satisfies RouteConfig;