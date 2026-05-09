export default async function handler(req, res) {
  try {
    const mod = await import("../build/server/index.js");

    const info = {
      moduleKeys: Object.keys(mod),
      hasDefault: !!mod.default,
      defaultType: typeof mod.default,
      defaultKeys: mod.default ? Object.keys(mod.default) : [],
      hasRoutes: !!mod.routes,
      routesType: typeof mod.routes,
      defaultHasRoutes: !!(mod.default?.routes),
    };

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(info, null, 2));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("Error: " + err.message + "\n" + err.stack);
  }
}