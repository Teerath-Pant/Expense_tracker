import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightLeft,
  Banknote,
  CreditCard,
  Landmark,
  PencilLine,
  Plus,
  Wallet,
  Trash2,
  X,
} from "lucide-react";
import { orpcClient } from "../orpcClient";

const WALLET_TYPES = [
  {
    value: "Bank",
    label: "Bank",
    icon: Landmark,
    accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    badge: "bg-emerald-500/15 text-emerald-300",
  },
  {
    value: "Card",
    label: "Card",
    icon: CreditCard,
    accent: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    badge: "bg-sky-500/15 text-sky-300",
  },
  {
    value: "Cash",
    label: "Cash",
    icon: Banknote,
    accent: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    badge: "bg-violet-500/15 text-violet-300",
  },
];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const getWalletTypeMeta = (type) =>
  WALLET_TYPES.find((item) => item.value === type) || WALLET_TYPES[2];

function WalletFormModal({ title, initialWallet, isSaving, onClose, onSubmit }) {
  const [name, setName] = useState(initialWallet?.name || "");
  const [openingBalance, setOpeningBalance] = useState(
    initialWallet ? String(initialWallet.openingBalance ?? 0) : "0"
  );
  const [type, setType] = useState(initialWallet?.type || "Bank");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }

    onSubmit({
      name: name.trim(),
      openingBalance: Number(openingBalance) || 0,
      type,
      currency: "INR",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        className="relative z-10 w-full max-w-4xl rounded-[2rem] border border-white/10 bg-slate-950 p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Wallet Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. HDFC Bank, Office Cash"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition focus:border-amber-500/70 focus:bg-white/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Starting Balance (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={openingBalance}
                onChange={(event) => setOpeningBalance(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition focus:border-amber-500/70 focus:bg-white/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
              Wallet Type
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {WALLET_TYPES.map((walletType) => {
                const Icon = walletType.icon;
                const isSelected = walletType.value === type;

                return (
                  <button
                    key={walletType.value}
                    type="button"
                    onClick={() => setType(walletType.value)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                      isSelected
                        ? `${walletType.accent} shadow-lg`
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{walletType.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : initialWallet ? "Save Wallet" : "Add Wallet"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function TransferFundsModal({ wallets, selectedSourceId, isSaving, onClose, onSubmit }) {
  const defaultSource = selectedSourceId || wallets[0]?.id || "";
  const defaultTarget = wallets.find((wallet) => wallet.id !== defaultSource)?.id || "";

  const [fromWalletId, setFromWalletId] = useState(defaultSource);
  const [toWalletId, setToWalletId] = useState(defaultTarget);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sourceWallet = wallets.find((wallet) => wallet.id === fromWalletId);
  const destinationOptions = wallets.filter((wallet) => wallet.id !== fromWalletId);

  const handleSourceChange = (nextSourceId) => {
    setFromWalletId(nextSourceId);
    if (nextSourceId === toWalletId) {
      const nextTarget = wallets.find((wallet) => wallet.id !== nextSourceId)?.id || "";
      setToWalletId(nextTarget);
    }
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const transferAmount = Number(amount);
    if (!fromWalletId || !toWalletId) {
      setErrorMessage("Choose both source and destination wallets.");
      return;
    }

    if (fromWalletId === toWalletId) {
      setErrorMessage("Source and destination wallets must be different.");
      return;
    }

    if (!transferAmount || transferAmount <= 0) {
      setErrorMessage("Enter a valid transfer amount.");
      return;
    }

    if (sourceWallet && transferAmount > sourceWallet.balance) {
      setErrorMessage("The source wallet does not have enough balance for this transfer.");
      return;
    }

    try {
      await onSubmit({
        fromWalletId,
        toWalletId,
        amount: transferAmount,
        note: note.trim(),
      });
    } catch (error) {
      setErrorMessage(error.message || "Unable to transfer funds right now.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-950 p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white">Transfer Funds</h3>
            <p className="mt-1 text-sm text-zinc-400">Move money safely between your wallets.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                From Wallet
              </label>
              <select
                value={fromWalletId}
                onChange={(event) => handleSourceChange(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-500/70"
              >
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id} className="bg-slate-950 text-white">
                    {wallet.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-zinc-500">
                Available: {sourceWallet ? formatCurrency(sourceWallet.balance) : formatCurrency(0)}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                To Wallet
              </label>
              <select
                value={toWalletId}
                onChange={(event) => {
                  setToWalletId(event.target.value);
                  setErrorMessage("");
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-500/70"
              >
                {destinationOptions.map((wallet) => (
                  <option key={wallet.id} value={wallet.id} className="bg-slate-950 text-white">
                    {wallet.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Amount (₹)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setErrorMessage("");
                }}
                placeholder="0.00"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-500/70"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional transfer note"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-500/70"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Transferring..." : "Confirm Transfer"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function WalletsView({ user }) {
  const [wallets, setWallets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [transferSourceId, setTransferSourceId] = useState(null);

  const fetchWalletData = async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    setPageError("");

    try {
      const response = await orpcClient.wallets.list({});
      setWallets(response.wallets);
      setTransfers(response.transfers);
    } catch (error) {
      setPageError(error.message || "Unable to load wallets right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  const totalWallets = wallets.length;
  const totalTransferred = transfers.reduce((sum, item) => sum + Number(item.amount), 0);
  const customWalletCount = wallets.filter((wallet) => !wallet.isDefault).length;
  const defaultWallet = wallets.find((wallet) => wallet.isDefault);
  const recentTransfers = transfers.slice(0, 5);

  const runMutation = async (callback) => {
    setIsSaving(true);
    try {
      await callback();
      await fetchWalletData();
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddWallet = async (walletData) => {
    try {
      await runMutation(() => orpcClient.wallets.create(walletData));
      setIsAddModalOpen(false);
    } catch (error) {
      throw new Error(error.message || "Unable to save wallet.");
    }
  };

  const handleSaveWallet = async (walletData) => {
    try {
      await runMutation(() =>
        orpcClient.wallets.update({
          id: editingWallet.id,
          ...walletData,
        })
      );
      setEditingWallet(null);
    } catch (error) {
      throw new Error(error.message || "Unable to update wallet.");
    }
  };

  const handleDeleteWallet = async (walletId) => {
    const confirmed = window.confirm(
      "Delete this wallet? This only works for wallets without transfer history."
    );

    if (!confirmed) {
      return;
    }

    setPageError("");
    try {
      await runMutation(() => orpcClient.wallets.delete({ id: walletId }));
    } catch (error) {
      setPageError(error.message || "Unable to delete this wallet.");
    }
  };

  const handleTransfer = async (transferData) => {
    try {
      await runMutation(() => orpcClient.wallets.transfer(transferData));
      setTransferSourceId(null);
    } catch (error) {
      throw new Error(error.message || "Unable to transfer funds.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Wallet Manager
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Create wallets, keep balances organized, and transfer funds between them.
          </p>
        </div>
      </div>

      {pageError && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {pageError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Total Wallets</p>
          <p className="mt-2 text-3xl font-extrabold text-white">{totalWallets}</p>
          <p className="mt-1 text-sm text-zinc-400">{customWalletCount} custom wallets plus your default balance.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Transferred</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-300">{formatCurrency(totalTransferred)}</p>
          <p className="mt-1 text-sm text-zinc-400">Across {transfers.length} wallet transfer events.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Default Wallet</p>
          <p className="mt-2 text-3xl font-extrabold text-amber-300">
            {formatCurrency(defaultWallet?.balance || 0)}
          </p>
          <p className="mt-1 text-sm text-zinc-400">Automatically reflects your income and expense activity.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            Add Wallet
          </button>

          <button
            type="button"
            onClick={() => setTransferSourceId(defaultWallet?.id || null)}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={wallets.length < 2 || isLoading}
          >
            <ArrowRightLeft className="h-4 w-4" />
            Transfer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_360px] gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
          {isLoading ? (
            <div className="py-20 text-center text-sm text-zinc-500">Loading wallets...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-y-3 text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    <th className="pb-2 font-semibold">Wallet</th>
                    <th className="pb-2 font-semibold">Type</th>
                    <th className="pb-2 font-semibold">Balance</th>
                    <th className="pb-2 font-semibold">Currency</th>
                    <th className="pb-2 font-semibold">Transactions</th>
                    <th className="pb-2 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((wallet) => {
                    const walletType = getWalletTypeMeta(wallet.type);
                    const WalletIcon = walletType.icon;
                    const canDelete =
                      !wallet.isDefault &&
                      !transfers.some(
                        (item) => item.fromWalletId === wallet.id || item.toWalletId === wallet.id
                      );

                    return (
                      <tr key={wallet.id} className="rounded-2xl bg-white/5">
                        <td className="rounded-l-2xl px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-2xl border p-2.5 ${walletType.accent}`}>
                              <WalletIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{wallet.name}</p>
                              <p className="text-xs text-zinc-500">
                                {wallet.isDefault ? "Primary account wallet" : "Custom wallet"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${walletType.badge}`}>
                            {wallet.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-white">
                          {formatCurrency(wallet.balance)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-zinc-300">
                            {wallet.currency}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-zinc-300">
                          {wallet.transactionCount} {wallet.transactionCount === 1 ? "transaction" : "transactions"}
                        </td>
                        <td className="rounded-r-2xl px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setTransferSourceId(wallet.id)}
                              disabled={wallets.length < 2}
                              className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-emerald-500/10 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                              title={`Transfer from ${wallet.name}`}
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingWallet(wallet)}
                              disabled={wallet.isDefault}
                              className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-sky-500/10 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
                              title={wallet.isDefault ? "Default wallet cannot be edited here" : "Edit wallet"}
                            >
                              <PencilLine className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWallet(wallet.id)}
                              disabled={!canDelete}
                              className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
                              title={
                                wallet.isDefault
                                  ? "Default wallet cannot be deleted"
                                  : canDelete
                                    ? "Delete wallet"
                                    : "Wallet with transfer history cannot be deleted"
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Recent Transfers</h3>
              <p className="text-xs text-zinc-500 mt-1">The latest money movement between wallets.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {recentTransfers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-zinc-500">
                No wallet transfers yet. Create another wallet and move funds from the default wallet when you are ready.
              </div>
            ) : (
              recentTransfers.map((transfer) => {
                const fromWallet = wallets.find((wallet) => wallet.id === transfer.fromWalletId);
                const toWallet = wallets.find((wallet) => wallet.id === transfer.toWalletId);

                return (
                  <div key={transfer.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {fromWallet?.name || "Wallet"} to {toWallet?.name || "Wallet"}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {new Date(transfer.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-emerald-300">
                        {formatCurrency(transfer.amount)}
                      </span>
                    </div>
                    {transfer.note && (
                      <p className="mt-3 text-xs text-zinc-400">{transfer.note}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <WalletFormModal
            title="Add Wallet"
            isSaving={isSaving}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddWallet}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingWallet && (
          <WalletFormModal
            title="Edit Wallet"
            initialWallet={editingWallet}
            isSaving={isSaving}
            onClose={() => setEditingWallet(null)}
            onSubmit={handleSaveWallet}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transferSourceId && wallets.length >= 2 && (
          <TransferFundsModal
            wallets={wallets}
            selectedSourceId={transferSourceId}
            isSaving={isSaving}
            onClose={() => setTransferSourceId(null)}
            onSubmit={handleTransfer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
