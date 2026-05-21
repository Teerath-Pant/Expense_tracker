import { z } from "zod";
import { eq, and, ilike, desc } from "drizzle-orm";
import { authed } from "../../orpc.js";
import { expenses } from "../../db/schema.js";

// Reusable expense validator schema
const expenseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  amount: z.string().transform(Number).or(z.number()),
  category: z.string(),
  type: z.string(),
  date: z.string(),
  createdAt: z.date(),
});

export const expensesRouter = {
  list: authed
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        type: z.string().optional(),
      })
    )
    .output(z.array(expenseSchema))
    .handler(async ({ input, context }) => {
      const conditions = [eq(expenses.userId, context.user.id)];

      if (input.search) {
        conditions.push(ilike(expenses.title, `%${input.search}%`));
      }
      if (input.category && input.category !== "All") {
        conditions.push(eq(expenses.category, input.category));
      }
      if (input.type && input.type !== "All") {
        conditions.push(eq(expenses.type, input.type));
      }

      const results = await context.db
        .select()
        .from(expenses)
        .where(and(...conditions))
        .orderBy(desc(expenses.date));

      return results;
    }),

  create: authed
    .input(
      z.object({
        title: z.string().min(1),
        amount: z.number().positive(),
        category: z.string(),
        type: z.string(),
        date: z.string(),
      })
    )
    .output(expenseSchema)
    .handler(async ({ input, context }) => {
      const [newExpense] = await context.db
        .insert(expenses)
        .values({
          userId: context.user.id,
          title: input.title.trim(),
          amount: input.amount.toFixed(2), // Store as numeric string
          category: input.category,
          type: input.type,
          date: input.date,
        })
        .returning();

      if (!newExpense) {
        throw new Error("INTERNAL_SERVER_ERROR: Failed to add transaction");
      }

      return newExpense;
    }),

  update: authed
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        amount: z.number().positive(),
        category: z.string(),
        type: z.string(),
        date: z.string(),
      })
    )
    .output(expenseSchema)
    .handler(async ({ input, context }) => {
      // Confirm ownership
      const [existing] = await context.db
        .select()
        .from(expenses)
        .where(and(eq(expenses.id, input.id), eq(expenses.userId, context.user.id)))
        .limit(1);

      if (!existing) {
        throw new Error("NOT_FOUND: Transaction not found or access denied");
      }

      const [updatedExpense] = await context.db
        .update(expenses)
        .set({
          title: input.title.trim(),
          amount: input.amount.toFixed(2),
          category: input.category,
          type: input.type,
          date: input.date,
        })
        .where(eq(expenses.id, input.id))
        .returning();

      if (!updatedExpense) {
        throw new Error("INTERNAL_SERVER_ERROR: Failed to update transaction");
      }

      return updatedExpense;
    }),

  delete: authed
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input, context }) => {
      const [existing] = await context.db
        .select()
        .from(expenses)
        .where(and(eq(expenses.id, input.id), eq(expenses.userId, context.user.id)))
        .limit(1);

      if (!existing) {
        throw new Error("NOT_FOUND: Transaction not found or access denied");
      }

      await context.db.delete(expenses).where(eq(expenses.id, input.id));

      return { success: true };
    }),
};
