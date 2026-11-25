import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// D1 (SQLite) helpers. Amounts stay as 2-decimal strings, same as old numeric columns.
const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date());
const amount = (name: string) => text(name).notNull();

export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarId: text("avatar_id").notNull().default("logo"),
  customAvatarData: text("custom_avatar_data"),
  preferredCurrency: text("preferred_currency").notNull().default("INR"),
  createdAt: createdAt(),
});

export const expenses = sqliteTable("expenses", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amount: amount("amount"),
  category: text("category").notNull(),
  type: text("type").notNull(),
  date: text("date").notNull(),
  createdAt: createdAt(),
});

export const wallets = sqliteTable("wallets", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  currency: text("currency").notNull().default("INR"),
  openingBalance: text("opening_balance").notNull().default("0.00"),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

export const walletTransfers = sqliteTable("wallet_transfers", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fromWalletId: text("from_wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "restrict" }),
  toWalletId: text("to_wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "restrict" }),
  amount: amount("amount"),
  note: text("note"),
  createdAt: createdAt(),
});

export const recurringTransactions = sqliteTable("recurring_transactions", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amount: amount("amount"),
  category: text("category").notNull(),
  type: text("type").notNull(),
  frequency: text("frequency").notNull(),
  nextDate: text("next_date").notNull(),
  createdAt: createdAt(),
});

export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
  wallets: many(wallets),
  walletTransfers: many(walletTransfers),
  recurringTransactions: many(recurringTransactions),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  outgoingTransfers: many(walletTransfers, { relationName: "wallet_transfer_from" }),
  incomingTransfers: many(walletTransfers, { relationName: "wallet_transfer_to" }),
}));

export const walletTransfersRelations = relations(walletTransfers, ({ one }) => ({
  user: one(users, {
    fields: [walletTransfers.userId],
    references: [users.id],
  }),
  fromWallet: one(wallets, {
    relationName: "wallet_transfer_from",
    fields: [walletTransfers.fromWalletId],
    references: [wallets.id],
  }),
  toWallet: one(wallets, {
    relationName: "wallet_transfer_to",
    fields: [walletTransfers.toWalletId],
    references: [wallets.id],
  }),
}));

export const recurringTransactionsRelations = relations(recurringTransactions, ({ one }) => ({
  user: one(users, {
    fields: [recurringTransactions.userId],
    references: [users.id],
  }),
}));
