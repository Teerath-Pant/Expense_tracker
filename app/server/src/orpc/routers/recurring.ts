import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authed } from "../../orpc.js";
import { recurringTransactions } from "../../db/schema.js";

const recurringSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  amount: z.string().transform(Number).or(z.number()),
  category: z.string(),
  type: z.string(),
  frequency: z.string(),
  nextDate: z.string(),
  createdAt: z.date(),
});

const recurringInputSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.string(),
  type: z.enum(["income", "expense"]),
  frequency: z.enum(["weekly", "monthly"]),
  nextDate: z.string(),
});

export const recurringRouter = {
  list: authed
    .input(z.object({}))
    .output(z.array(recurringSchema))
    .handler(async ({ context }) => {
      const results = await context.db
        .select()
        .from(recurringTransactions)
        .where(eq(recurringTransactions.userId, context.user.id))
        .orderBy(desc(recurringTransactions.nextDate));

      return results;
    }),

  create: authed
    .input(recurringInputSchema)
    .output(recurringSchema)
    .handler(async ({ input, context }) => {
      const [createdRecurring] = await context.db
        .insert(recurringTransactions)
        .values({
          userId: context.user.id,
          title: input.title.trim(),
          amount: input.amount.toFixed(2),
          category: input.category,
          type: input.type,
          frequency: input.frequency,
          nextDate: input.nextDate,
        })
        .returning();

      if (!createdRecurring) {
        throw new Error("INTERNAL_SERVER_ERROR: Failed to save recurring transaction");
      }

      return createdRecurring;
    }),

  update: authed
    .input(recurringInputSchema.extend({ id: z.string() }))
    .output(recurringSchema)
    .handler(async ({ input, context }) => {
      const [updatedRecurring] = await context.db
        .update(recurringTransactions)
        .set({
          title: input.title.trim(),
          amount: input.amount.toFixed(2),
          category: input.category,
          type: input.type,
          frequency: input.frequency,
          nextDate: input.nextDate,
        })
        .where(and(eq(recurringTransactions.id, input.id), eq(recurringTransactions.userId, context.user.id)))
        .returning();

      if (!updatedRecurring) {
        throw new Error("NOT_FOUND: Recurring transaction not found");
      }

      return updatedRecurring;
    }),

  delete: authed
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      await context.db
        .delete(recurringTransactions)
        .where(and(eq(recurringTransactions.id, input.id), eq(recurringTransactions.userId, context.user.id)));

      return { success: true };
    }),
};
