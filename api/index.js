import pkg from "@react-router/node";
const { createRequestHandler } = pkg;

const handler = createRequestHandler(
  () => import("../build/server/index.js"),
  process.env.NODE_ENV || "production"
);

export default handler;