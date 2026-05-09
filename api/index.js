import { createRequestListener } from "@react-router/node";
import * as buildModule from "../build/server/index.js";

// Must be a function — createRequestListener calls it lazily per request
function getBuild() {
  return {
    allowedActionOrigins: buildModule.allowedActionOrigins,
    assets: buildModule.assets,
    assetsBuildDirectory: buildModule.assetsBuildDirectory,
    basename: buildModule.basename,
    entry: buildModule.entry,
    future: buildModule.future,
    isSpaMode: buildModule.isSpaMode,
    prerender: buildModule.prerender,
    publicPath: buildModule.publicPath,
    routeDiscovery: buildModule.routeDiscovery,
    routes: buildModule.routes,
    ssr: buildModule.ssr,
  };
}

const handler = createRequestListener(getBuild, { mode: "production" });

export default handler;