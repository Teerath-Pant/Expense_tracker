import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { pub, jwt } from "../../orpc.js";
import { users, wallets } from "../../db/schema.js";

export const authRouter = {
  register: pub
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .output(
      z.object({
        token: z.string(),
        user: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
        }),
      })
    )
    .handler(async ({ input, context }) => {
      const emailLower = input.email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await context.db
        .select()
        .from(users)
        .where(eq(users.email, emailLower))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error("CONFLICT: Email is already registered");
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Create user
      const [newUser] = await context.db
        .insert(users)
        .values({
          name: input.name.trim(),
          email: emailLower,
          passwordHash,
        })
        .returning();

      if (!newUser) {
        throw new Error("INTERNAL_SERVER_ERROR: Failed to create user");
      }

      await context.db.insert(wallets).values({
        userId: newUser.id,
        name: "Default",
        type: "Cash",
        currency: "INR",
        openingBalance: "0.00",
        isDefault: true,
      });

      // Generate token
      const secret = process.env.JWT_SECRET || "super_secret_key_for_expense_tracker_jwt_12345";
      const token = jwt.sign(
        {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
        secret
      );

      return {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      };
    }),

  login: pub
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .output(
      z.object({
        token: z.string(),
        user: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
        }),
      })
    )
    .handler(async ({ input, context }) => {
      const emailLower = input.email.toLowerCase().trim();

      // Find user
      const [foundUser] = await context.db
        .select()
        .from(users)
        .where(eq(users.email, emailLower))
        .limit(1);

      if (!foundUser) {
        throw new Error("UNAUTHORIZED: Invalid email or password");
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(input.password, foundUser.passwordHash);
      if (!isMatch) {
        throw new Error("UNAUTHORIZED: Invalid email or password");
      }

      // Generate token
      const secret = process.env.JWT_SECRET || "super_secret_key_for_expense_tracker_jwt_12345";
      const token = jwt.sign(
        {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
        },
        secret
      );

      return {
        token,
        user: {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
        },
      };
    }),
};
