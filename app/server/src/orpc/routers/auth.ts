import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { authed, pub, jwt } from "../../orpc.js";
import { users, wallets } from "../../db/schema.js";

const avatarIdSchema = z.enum([
  "logo",
  "emerald-user",
  "sky-wallet",
  "amber-bank",
  "rose-fire",
  "teal-trend",
  "violet-spark",
  "cyan-cash",
  "slate-shield",
  "custom",
]);
type AvatarId = z.infer<typeof avatarIdSchema>;

const normalizeAvatarId = (avatarId: string | null | undefined): AvatarId => {
  const parsedAvatarId = avatarIdSchema.safeParse(avatarId);
  return parsedAvatarId.success ? parsedAvatarId.data : "logo";
};

const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarId: avatarIdSchema,
  customAvatarData: z.string().nullable(),
  preferredCurrency: z.enum(["INR", "USD", "EUR", "GBP"]),
});

const authSessionSchema = z.object({
  token: z.string(),
  user: authUserSchema,
});

const signUserSession = (user: z.infer<typeof authUserSchema>) => {
  const secret = process.env.JWT_SECRET || "super_secret_key_for_expense_tracker_jwt_12345";
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarId: user.avatarId,
      customAvatarData: user.customAvatarData,
      preferredCurrency: user.preferredCurrency,
    },
    secret
  );

  return {
    token,
    user,
  };
};

export const authRouter = {
  register: pub
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .output(authSessionSchema)
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
          avatarId: "logo",
          preferredCurrency: "INR",
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

      return signUserSession({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatarId: normalizeAvatarId(newUser.avatarId),
        customAvatarData: newUser.customAvatarData || null,
        preferredCurrency: (newUser.preferredCurrency as "INR" | "USD" | "EUR" | "GBP") || "INR",
      });
    }),

  login: pub
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .output(authSessionSchema)
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

      return signUserSession({
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        avatarId: normalizeAvatarId(foundUser.avatarId),
        customAvatarData: foundUser.customAvatarData || null,
        preferredCurrency: (foundUser.preferredCurrency as "INR" | "USD" | "EUR" | "GBP") || "INR",
      });
    }),

  updateProfile: authed
    .input(
      z.object({
        name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
        avatarId: avatarIdSchema,
        customAvatarData: z.string().max(250_000).nullable().optional(),
        preferredCurrency: z.enum(["INR", "USD", "EUR", "GBP"]),
      })
    )
    .output(authSessionSchema)
    .handler(async ({ input, context }) => {
      const [updatedUser] = await context.db
        .update(users)
        .set({
          name: input.name.trim(),
          avatarId: input.avatarId,
          customAvatarData: input.customAvatarData || null,
          preferredCurrency: input.preferredCurrency,
        })
        .where(eq(users.id, context.user.id))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          avatarId: users.avatarId,
          customAvatarData: users.customAvatarData,
          preferredCurrency: users.preferredCurrency,
        });

      if (!updatedUser) {
        throw new Error("NOT_FOUND: User profile not found");
      }

      return signUserSession({
        ...updatedUser,
        avatarId: normalizeAvatarId(updatedUser.avatarId),
        customAvatarData: updatedUser.customAvatarData || null,
        preferredCurrency: (updatedUser.preferredCurrency as "INR" | "USD" | "EUR" | "GBP") || "INR",
      });
    }),

  changePassword: authed
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const [foundUser] = await context.db
        .select()
        .from(users)
        .where(eq(users.id, context.user.id))
        .limit(1);

      if (!foundUser) {
        throw new Error("NOT_FOUND: User profile not found");
      }

      const isMatch = await bcrypt.compare(input.currentPassword, foundUser.passwordHash);
      if (!isMatch) {
        throw new Error("UNAUTHORIZED: Current password is incorrect");
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 10);
      await context.db.update(users).set({ passwordHash }).where(eq(users.id, context.user.id));

      return { success: true };
    }),

  deleteAccount: authed
    .input(
      z.object({
        password: z.string().min(1),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const [foundUser] = await context.db
        .select()
        .from(users)
        .where(eq(users.id, context.user.id))
        .limit(1);

      if (!foundUser) {
        throw new Error("NOT_FOUND: User profile not found");
      }

      const isMatch = await bcrypt.compare(input.password, foundUser.passwordHash);
      if (!isMatch) {
        throw new Error("UNAUTHORIZED: Password is incorrect");
      }

      await context.db.delete(users).where(eq(users.id, context.user.id));

      return { success: true };
    }),
};
