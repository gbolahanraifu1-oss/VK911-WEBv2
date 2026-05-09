import { createRequestListener } from "@react-router/node";
import * as build from "../build/server/index.js";

console.log("Build exports:", Object.keys(build));
console.log("Build.default:", typeof build.default);
console.log("Routes:", build.routes);
console.log("Entry:", build.entry);

// Try default export if named exports don't have routes
const serverBuild = build.routes ? build : build.default;

const handler = createRequestListener(serverBuild, {
  mode: process.env.NODE_ENV || "production",
});

export default handler;