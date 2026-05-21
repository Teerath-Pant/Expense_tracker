import { authRouter } from "./auth.js";
import { expensesRouter } from "./expenses.js";
import { recurringRouter } from "./recurring.js";
import { walletsRouter } from "./wallets.js";

export const appRouter = {
  auth: authRouter,
  expenses: expensesRouter,
  recurring: recurringRouter,
  wallets: walletsRouter,
};

export type AppRouter = typeof appRouter;
