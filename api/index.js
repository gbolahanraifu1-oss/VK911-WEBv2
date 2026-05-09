import { createRequestListener } from "@react-router/node";
import * as build from "../build/server/index.js";

const handler = createRequestListener(build, {
  mode: "production",
});

export default handler;