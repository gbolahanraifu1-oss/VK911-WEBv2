import { createRequestListener } from "@react-router/node";

const handler = createRequestListener(
  async () => {
    const mod = await import("../build/server/index.js");
    // React Router v7 SSR build exports ServerBuild as default
    return mod.default ?? mod;
  },
  { mode: process.env.NODE_ENV || "production" }
);

export default handler;