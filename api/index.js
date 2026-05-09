import * as ReactRouterNode from "@react-router/node";

const handler = ReactRouterNode.createRequestHandler(
  () => import("../build/server/index.js"),
  process.env.NODE_ENV || "production"
);

export default handler;