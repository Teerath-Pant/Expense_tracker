import { and, desc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { authed } from "../../orpc.js";
import { expenses, wallets, walletTransfers } from "../../db/schema.js";

const walletTypeSchema = z.enum(["Bank", "Card", "Cash"]);

const walletSummarySchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: walletTypeSchema,
  currency: z.string(),
  openingBalance: z.number(),
  balance: z.number(),
  transactionCount: z.number().int(),
  isDefault: z.boolean(),
  createdAt: z.date(),
});

const walletTransferSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fromWalletId: z.string(),
  toWalletId: z.string(),
  amount: z.number(),
  note: z.string().nullable(),
  createdAt: z.date(),
});

const walletOverviewSchema = z.object({
  wallets: z.array(walletSummarySchema),
  transfers: z.array(walletTransferSchema),
});

type WalletOverview = z.infer<typeof walletOverviewSchema>;

const walletMutationSchema = z.object({
  success: z.boolean(),
});

const ensureDefaultWallet = async (db: any, userId: string) => {
  const [existingDefault] = await db
    .select()
    .from(wallets)
    .where(and(eq(wallets.userId, userId), eq(wallets.isDefault, true)))
    .limit(1);

  if (existingDefault) {
    return existingDefault;
  }

  const [createdWallet] = await db
    .insert(wallets)
    .values({
      userId,
      name: "Default",
      type: "Cash",
      currency: "INR",
      openingBalance: "0.00",
      isDefault: true,
    })
    .returning();

  if (!createdWallet) {
    throw new Error("INTERNAL_SERVER_ERROR: Failed to initialize default wallet");
  }

  return createdWallet;
};

const buildWalletOverview = async (db: any, userId: string): Promise<WalletOverview> => {
  await ensureDefaultWallet(db, userId);

  const [rawWallets, rawTransfers, rawExpenses] = await Promise.all([
    db.select().from(wallets).where(eq(wallets.userId, userId)),
    db.select().from(walletTransfers).where(eq(walletTransfers.userId, userId)).orderBy(desc(walletTransfers.createdAt)),
    db
      .select({
        id: expenses.id,
        amount: expenses.amount,
        type: expenses.type,
      })
      .from(expenses)
      .where(eq(expenses.userId, userId)),
  ]);

  const baseDefaultBalance = rawExpenses.reduce((sum: number, expense: { amount: string | number; type: string }) => {
    const amount = Number(expense.amount);
    return expense.type === "income" ? sum + amount : sum - amount;
  }, 0);

  const walletTransferDeltaMap = new Map<string, number>();
  const walletTransferCountMap = new Map<string, number>();

  rawTransfers.forEach((transfer: { fromWalletId: string; toWalletId: string; amount: string | number }) => {
    const transferAmount = Number(transfer.amount);

    walletTransferDeltaMap.set(
      transfer.fromWalletId,
      (walletTransferDeltaMap.get(transfer.fromWalletId) || 0) - transferAmount
    );
    walletTransferDeltaMap.set(
      transfer.toWalletId,
      (walletTransferDeltaMap.get(transfer.toWalletId) || 0) + transferAmount
    );

    walletTransferCountMap.set(
      transfer.fromWalletId,
      (walletTransferCountMap.get(transfer.fromWalletId) || 0) + 1
    );
    walletTransferCountMap.set(
      transfer.toWalletId,
      (walletTransferCountMap.get(transfer.toWalletId) || 0) + 1
    );
  });

  const walletSummaries = rawWallets
    .slice()
    .sort((left: { isDefault: boolean; createdAt: Date }, right: { isDefault: boolean; createdAt: Date }) => {
      if (left.isDefault !== right.isDefault) {
        return left.isDefault ? -1 : 1;
      }

      return left.createdAt.getTime() - right.createdAt.getTime();
    })
    .map(
      (wallet: {
        id: string;
        userId: string;
        name: string;
        type: "Bank" | "Card" | "Cash";
        currency: string;
        openingBalance: string | number;
        isDefault: boolean;
        createdAt: Date;
      }) => {
        const openingBalance = Number(wallet.openingBalance);
        const transferDelta = walletTransferDeltaMap.get(wallet.id) || 0;
        const balance = openingBalance + transferDelta + (wallet.isDefault ? baseDefaultBalance : 0);
        const transactionCount =
          (wallet.isDefault ? rawExpenses.length : 0) + (walletTransferCountMap.get(wallet.id) || 0);

        return {
          id: wallet.id,
          userId: wallet.userId,
          name: wallet.name,
          type: wallet.type,
          currency: wallet.currency,
          openingBalance,
          balance,
          transactionCount,
          isDefault: wallet.isDefault,
          createdAt: wallet.createdAt,
        };
      }
    );

  const serializedTransfers = rawTransfers.map(
    (transfer: {
      id: string;
      userId: string;
      fromWalletId: string;
      toWalletId: string;
      amount: string | number;
      note: string | null;
      createdAt: Date;
    }) => ({
      id: transfer.id,
      userId: transfer.userId,
      fromWalletId: transfer.fromWalletId,
      toWalletId: transfer.toWalletId,
      amount: Number(transfer.amount),
      note: transfer.note,
      createdAt: transfer.createdAt,
    })
  );

  return {
    wallets: walletSummaries,
    transfers: serializedTransfers,
  };
};

export const walletsRouter = {
  list: authed
    .input(z.object({}))
    .output(walletOverviewSchema)
    .handler(async ({ context }) => buildWalletOverview(context.db, context.user.id)),

  create: authed
    .input(
      z.object({
        name: z.string().trim().min(1),
        type: walletTypeSchema,
        currency: z.string().trim().min(1).default("INR"),
        openingBalance: z.number().min(0),
      })
    )
    .output(walletMutationSchema)
    .handler(async ({ input, context }) => {
      await ensureDefaultWallet(context.db, context.user.id);

      const [createdWallet] = await context.db
        .insert(wallets)
        .values({
          userId: context.user.id,
          name: input.name,
          type: input.type,
          currency: input.currency,
          openingBalance: input.openingBalance.toFixed(2),
          isDefault: false,
        })
        .returning();

      if (!createdWallet) {
        throw new Error("INTERNAL_SERVER_ERROR: Failed to create wallet");
      }

      return { success: true };
    }),

  update: authed
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1),
        type: walletTypeSchema,
        currency: z.string().trim().min(1).default("INR"),
        openingBalance: z.number().min(0),
      })
    )
    .output(walletMutationSchema)
    .handler(async ({ input, context }) => {
      const [existingWallet] = await context.db
        .select()
        .from(wallets)
        .where(and(eq(wallets.id, input.id), eq(wallets.userId, context.user.id)))
        .limit(1);

      if (!existingWallet) {
        throw new Error("NOT_FOUND: Wallet not found or access denied");
      }

      if (existingWallet.isDefault) {
        throw new Error("BAD_REQUEST: Default wallet cannot be edited");
      }

      await context.db
        .update(wallets)
        .set({
          name: input.name,
          type: input.type,
          currency: input.currency,
          openingBalance: input.openingBalance.toFixed(2),
        })
        .where(eq(wallets.id, input.id));

      return { success: true };
    }),

  delete: authed
    .input(z.object({ id: z.string() }))
    .output(walletMutationSchema)
    .handler(async ({ input, context }) => {
      const [existingWallet] = await context.db
        .select()
        .from(wallets)
        .where(and(eq(wallets.id, input.id), eq(wallets.userId, context.user.id)))
        .limit(1);

      if (!existingWallet) {
        throw new Error("NOT_FOUND: Wallet not found or access denied");
      }

      if (existingWallet.isDefault) {
        throw new Error("BAD_REQUEST: Default wallet cannot be deleted");
      }

      const [linkedTransfer] = await context.db
        .select()
        .from(walletTransfers)
        .where(
          and(
            eq(walletTransfers.userId, context.user.id),
            or(eq(walletTransfers.fromWalletId, input.id), eq(walletTransfers.toWalletId, input.id))
          )
        )
        .limit(1);

      if (linkedTransfer) {
        throw new Error("BAD_REQUEST: Wallet with transfer history cannot be deleted");
      }

      await context.db.delete(wallets).where(eq(wallets.id, input.id));

      return { success: true };
    }),

  transfer: authed
    .input(
      z.object({
        fromWalletId: z.string(),
        toWalletId: z.string(),
        amount: z.number().positive(),
        note: z.string().trim().max(200).optional(),
      })
    )
    .output(walletMutationSchema)
    .handler(async ({ input, context }) => {
      if (input.fromWalletId === input.toWalletId) {
        throw new Error("BAD_REQUEST: Source and destination wallets must be different");
      }

      const overview = await buildWalletOverview(context.db, context.user.id);
      const fromWallet = overview.wallets.find((wallet) => wallet.id === input.fromWalletId);
      const toWallet = overview.wallets.find((wallet) => wallet.id === input.toWalletId);

      if (!fromWallet || !toWallet) {
        throw new Error("NOT_FOUND: Invalid wallet selection");
      }

      if (input.amount > fromWallet.balance) {
        throw new Error("BAD_REQUEST: Insufficient wallet balance for this transfer");
      }

      const [createdTransfer] = await context.db
        .insert(walletTransfers)
        .values({
          userId: context.user.id,
          fromWalletId: input.fromWalletId,
          toWalletId: input.toWalletId,
          amount: input.amount.toFixed(2),
          note: input.note || null,
        })
        .returning();

      if (!createdTransfer) {
        throw new Error("INTERNAL_SERVER_ERROR: Failed to save wallet transfer");
      }

      return { success: true };
    }),
};
