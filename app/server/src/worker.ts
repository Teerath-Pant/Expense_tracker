// Cloudflare Workers entry (oRPC + Drizzle on D1). Local dev: `npm run cf:dev`.
import { RPCHandler } from "@orpc/server/fetch";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { appRouter } from "./orpc/routers/_app.js";

interface Env {
  DB: Parameters<typeof drizzle>[0];
  JWT_SECRET: string;
  ALLOWED_ORIGIN?: string; // e.g. https://your-app.vercel.app (default "*")
}

const handler = new RPCHandler(appRouter);

const corsHeaders = (env: Env): Record<string, string> => ({
  "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
});

const withCors = (res: Response, env: Env) => {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(corsHeaders(env))) out.headers.set(k, v);
  return out;
};

export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    const { pathname } = new URL(request.url);

    if (pathname === "/health") {
      return withCors(Response.json({ ok: true, service: "expense-tracker-server" }), env);
    }

    const db: DrizzleD1Database = drizzle(env.DB);

    try {
      const { matched, response } = await handler.handle(request, {
        prefix: "/rpc",
        context: {
          db,
          // authMiddleware reads Node-style req.headers.authorization
          req: { headers: { authorization: request.headers.get("authorization") ?? undefined } },
        },
      });
      if (matched) return withCors(response, env);
      return withCors(new Response("Not found", { status: 404 }), env);
    } catch (error) {
      console.error("RPC error:", error);
      return withCors(Response.json({ error: "Internal Server Error" }, { status: 500 }), env);
    }
  },
};
