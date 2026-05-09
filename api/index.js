import { createRequestHandler } from "@react-router/node";

const handler = createRequestHandler(
  () => import("../build/server/index.js"),
  process.env.NODE_ENV || "production"
);

export default handler;