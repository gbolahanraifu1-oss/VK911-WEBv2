export default async function handler(req, res) {
  try {
    const nodeModule = await import("@react-router/node");
    console.log("@react-router/node exports:", Object.keys(nodeModule));

    const createRequestHandler = nodeModule.createRequestHandler;

    if (!createRequestHandler) {
      res.statusCode = 500;
      res.end(
        "createRequestHandler not found. Available exports: " +
          Object.keys(nodeModule).join(", ")
      );
      return;
    }

    const handle = createRequestHandler(
      () => import("../build/server/index.js"),
      process.env.NODE_ENV || "production"
    );

    return handle(req, res);
  } catch (err) {
    console.error("Handler error:", err);
    res.statusCode = 500;
    res.end(err.message);
  }
}