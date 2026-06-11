import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { RPCHandler } from "@orpc/server/node";
import { appRouter } from "./orpc/routers/_app.js";
import { db } from "./db/index.js";
import morgan from "morgan"; 

dotenv.config();

const app = express();


app.use(morgan("dev")); 
// Standard CORS setup
app.use(
  cors({
    origin: "*", // Adjust as necessary for production security
    credentials: true,
  })
);


app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "expense-tracker-server" });
});

// oRPC Handler initialization
const handler = new RPCHandler(appRouter);

// Handle oRPC requests under /rpc prefix
app.use(async (req, res, next) => {
  if (!req.url.startsWith("/rpc")) {
    return next();
  }

  try {
    const { matched } = await handler.handle(req, res, {
      prefix: "/rpc",
      context: {
        db,
        req,
        res,
      },
    });

    if (matched) {
      return;
    }
  }  catch (error) {
    console.error("❌ FULL ERROR:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error("❌ ERROR STACK:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    }
    return;
  }

  next();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Monolithic Server running on http://localhost:${PORT}`);
  console.log(`🔌 oRPC Endpoint mounted at http://localhost:${PORT}/rpc`);
});
