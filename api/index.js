import { createRequestListener } from "@react-router/node";

const handler = createRequestListener(
  () => import("../build/server/index.js"),
  { mode: process.env.NODE_ENV || "production" }
);

export default handler;