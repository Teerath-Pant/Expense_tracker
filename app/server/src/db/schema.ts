import { relations } from "drizzle-orm";
import { boolean, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarId: text("avatar_id").notNull().default("logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wallets = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  currency: text("currency").notNull().default("INR"),
  openingBalance: numeric("opening_balance", { precision: 12, scale: 2 }).notNull().default("0.00"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const walletTransfers = pgTable("wallet_transfers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fromWalletId: uuid("from_wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "restrict" }),
  toWalletId: uuid("to_wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
  wallets: many(wallets),
  walletTransfers: many(walletTransfers),
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
