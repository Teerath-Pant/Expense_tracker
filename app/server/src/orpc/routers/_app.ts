import { authRouter } from "./auth.js";
import { expensesRouter } from "./expenses.js";
import { walletsRouter } from "./wallets.js";

export const appRouter = {
  auth: authRouter,
  expenses: expensesRouter,
  wallets: walletsRouter,
};

export type AppRouter = typeof appRouter;
