import { createRequestListener } from "@react-router/node";
import * as buildModule from "../build/server/index.js";

// Spread module namespace into a plain object so React Router can read routes
const build = { ...buildModule };

const handler = createRequestListener(build, {
  mode: "production",
});

export default handler;