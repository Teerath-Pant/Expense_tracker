import { os } from "@orpc/server";
import crypto from "crypto";
import { db } from "./db/index.js";

// Configured interfaces
export interface InitialContext {
  db: typeof db;
  req?: any;
  res?: any;
}

export interface UserContext {
  user?: {
    id: string;
    name: string;
    email: string;
    avatarId: string;
  };
}

// Custom Zero-Dependency JWT Helper
export const jwt = {
  sign(payload: object, secret: string): string {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${data}`)
      .digest("base64url");
    return `${header}.${data}.${signature}`;
  },

  verify(token: string, secret: string): any | null {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${data}`)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    try {
      return JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    } catch {
      return null;
    }
  },
};

// Base oRPC Builder
export const pub = os.$context<InitialContext & UserContext>();

// Auth checking middleware
export const authMiddleware = pub.middleware(async ({ next, context }) => {
  const authHeader = context.req?.headers?.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED: Missing or invalid token");
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "super_secret_key_for_expense_tracker_jwt_12345";
  const decoded = jwt.verify(token, secret);

  if (!decoded || !decoded.id) {
    throw new Error("UNAUTHORIZED: Session expired or invalid");
  }

  // Inject user into context and chain next
  return next({
    context: {
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        avatarId: decoded.avatarId || "logo",
      },
    },
  });
});

// Authenticated procedure builder
export const authed = pub.use(authMiddleware);
export default pub;
