import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./page.jsx"),
  route("signup", "./signup/page.jsx"),

  // User portal (regular users)
  route("user", "./user/layout.jsx", [
    index("./user/page.jsx"),
    route("pair", "./user/pair/page.jsx"),
    route("contact", "./user/contact/page.jsx"),
  ]),

  // Admin dashboard
  route("dashboard", "./dashboard/layout.jsx", [
    index("./dashboard/page.jsx"),
    route("pairing", "./dashboard/pairing/page.jsx"),
    route("commands", "./dashboard/commands/page.jsx"),
    route("analytics", "./dashboard/analytics/page.jsx"),
    route("sessions", "./dashboard/sessions/page.jsx"),
    route("settings", "./dashboard/settings/page.jsx"),
    route("download", "./dashboard/download/page.jsx"),
  ]),
] satisfies RouteConfig;