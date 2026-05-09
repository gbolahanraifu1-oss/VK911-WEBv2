import { createRequestListener } from "@react-router/node";
import {
  allowedActionOrigins,
  assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr,
} from "../build/server/index.js";

// Explicitly construct plain object — avoids ESM namespace exotic object issues
const build = {
  allowedActionOrigins,
  assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr,
};

const handler = createRequestListener(build, {
  mode: "production",
});

export default handler;