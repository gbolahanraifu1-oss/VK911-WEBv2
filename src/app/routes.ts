import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./page.jsx"),
  route("dashboard", "./dashboard/layout.jsx", [
    index("./dashboard/page.jsx"),
    route("pairing", "./dashboard/pairing/page.jsx"),
    route("commands", "./dashboard/commands/page.jsx"),
    route("analytics", "./dashboard/analytics/page.jsx"),
    route("sessions", "./dashboard/sessions/page.jsx"),
    route("settings", "./dashboard/settings/page.jsx"),
    route("download", "./dashboard/download/page.jsx"),
  ]),
  route("api/auth/login", "./api/auth/login/route.js"),
  route("api/auth/token", "./api/auth/token/route.js"),
  route("api/stats", "./api/stats/route.js"),
  route("api/analytics", "./api/analytics/route.js"),
  route("api/sessions", "./api/sessions/route.js"),
  route("api/sessions/:id", "./api/sessions/[id]/route.js"),
  route("api/download/:file", "./api/download/[file]/route.js"),
] satisfies RouteConfig;
