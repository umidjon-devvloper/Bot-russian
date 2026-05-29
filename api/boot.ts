import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, "../../.env") });
loadEnv({ path: path.resolve(__dirname, "../.env"), override: true });

import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { runMigrations } from "./lib/migrations";

// Запускаем миграции при импорте модуля (один раз за процесс)
runMigrations().catch((e) => console.error("Migration error:", e));

const app = new Hono<{ Bindings: HttpBindings }>();

app.use("*", cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }));

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`tRPC error on ${path}:`, error.message);
    },
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
