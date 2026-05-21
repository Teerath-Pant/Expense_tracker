import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Download,
  Filter,
  PlusCircle,
  Search,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import ExpenseList from "./ExpenseList";

const CATEGORIES = ["Food", "Bills", "Shopping", "Travel", "Health", "Entertainment", "Income", "Other"];

const escapeCsv = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const parseCsvLine = (line) => {
  const cells = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell);
  return cells;
};

export default function TransactionsView({
  expenses,
  onSaveExpense,
  onDeleteExpense,
  onEditClick,
  onAddClick,
  onSaveRecurring,
  onDeleteRecurring,
  recurringTransactions = [],
  user,
}) {
  const fileInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [importMessage, setImportMessage] = useState("");
  const [recurringForm, setRecurringForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    type: "expense",
    frequency: "monthly",
    nextDate: new Date().toISOString().split("T")[0],
  });

  const filters = {
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "All",
    type: searchParams.get("type") || "All",
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
  };

  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (!value || value === "All") {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    setSearchParams(nextParams);
  };

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: user?.preferredCurrency || "INR",
        minimumFractionDigits: 2,
      }),
    [user?.preferredCurrency]
  );

  const totalIncome = expenses
    .filter((exp) => exp.type === "income")
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  const totalExpense = expenses
    .filter((exp) => exp.type === "expense")
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  const netBalance = totalIncome - totalExpense;

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === "All" || exp.category === filters.category;
    const matchesType = filters.type === "All" || exp.type === filters.type;
    const matchesFrom = !filters.from || exp.date >= filters.from;
    const matchesTo = !filters.to || exp.date <= filters.to;

    return matchesSearch && matchesCategory && matchesType && matchesFrom && matchesTo;
  });

  const exportCsv = () => {
    const rows = [
      ["title", "amount", "category", "type", "date"],
      ...filteredExpenses.map((expense) => [
        expense.title,
        expense.amount,
        expense.category,
        expense.type,
        expense.date,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expense-tracker-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const [headerLine, ...dataLines] = lines;
    const headers = parseCsvLine(headerLine || "").map((header) => header.trim().toLowerCase());
    let importedCount = 0;

    for (const line of dataLines) {
      const values = parseCsvLine(line);
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
      const amount = Number(row.amount);

      if (!row.title || !amount || !row.date) {
        continue;
      }

      await onSaveExpense({
        title: row.title,
        amount,
        category: row.category || (row.type === "income" ? "Income" : "Other"),
        type: row.type === "income" ? "income" : "expense",
        date: row.date,
      });
      importedCount += 1;
    }

    event.target.value = "";
    setImportMessage(importedCount > 0 ? `Imported ${importedCount} transactions.` : "No valid rows found.");
  };

  const handleRecurringSubmit = async (event) => {
    event.preventDefault();
    if (!recurringForm.title.trim() || Number(recurringForm.amount) <= 0) return;

    await onSaveRecurring({
      ...recurringForm,
      title: recurringForm.title.trim(),
      amount: Number(recurringForm.amount),
    });
    setRecurringForm((current) => ({ ...current, title: "", amount: "" }));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-emerald-400">{user?.name}</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Here is a summary of your financial tracker.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-zinc-200 transition hover:bg-white/10"
          >
            <Upload className="h-4 w-4 text-emerald-400" />
            Import CSV
          </button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={importCsv} className="hidden" />
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-zinc-200 transition hover:bg-white/10"
          >
            <Download className="h-4 w-4 text-teal-400" />
            Export CSV
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddClick}
            className="flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3 font-bold text-sm shadow-lg shadow-emerald-500/10 cursor-pointer transition-colors duration-200"
          >
            <PlusCircle className="h-5 w-5" />
            Add Transaction
          </motion.button>
        </div>
      </div>

      {importMessage && (
        <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {importMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Net Balance", value: netBalance, icon: Wallet, tone: netBalance >= 0 ? "text-emerald-400" : "text-rose-400", chip: "Net Balance" },
          { label: "Total Income", value: totalIncome, icon: ArrowUpRight, tone: "text-white", chip: "Inflows" },
          { label: "Total Expenses", value: totalExpense, icon: ArrowDownRight, tone: "text-white", chip: "Outflows" },
        ].map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="rounded-2xl bg-emerald-500/10 p-3 border border-emerald-500/20 text-emerald-400">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold text-zinc-500 bg-white/5 px-2.5 py-1 rounded-full uppercase">{card.chip}</span>
              </div>
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{card.label}</h3>
              <p className={`text-3xl font-extrabold mt-1 tracking-tight ${card.tone}`}>
                {currencyFormatter.format(card.value)}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col gap-4 mb-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="relative md:col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-2xl placeholder-zinc-500 text-white outline-none focus:border-emerald-500/80 focus:bg-white/10 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5">
                <Filter className="h-4 w-4 text-emerald-400" />
                <select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)} className="bg-transparent text-sm text-zinc-200 outline-none w-full cursor-pointer">
                  <option value="All" className="bg-slate-900 text-white">All Categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category} className="bg-slate-900 text-white">{category}</option>
                  ))}
                </select>
              </div>

              <select value={filters.type} onChange={(e) => updateFilter("type", e.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-200 outline-none cursor-pointer">
                <option value="All" className="bg-slate-900 text-white">All Types</option>
                <option value="income" className="bg-slate-900 text-teal-400">Income Only</option>
                <option value="expense" className="bg-slate-900 text-rose-400">Expenses Only</option>
              </select>

              <button
                onClick={() => setSearchParams({})}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input type="date" value={filters.from} onChange={(e) => updateFilter("from", e.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-200 outline-none" />
              <input type="date" value={filters.to} onChange={(e) => updateFilter("to", e.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-200 outline-none" />
            </div>
          </div>

          <ExpenseList expenses={filteredExpenses} onDelete={onDeleteExpense} onEdit={onEditClick} />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/10 p-3 text-teal-300">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Recurring Templates</h3>
              <p className="text-xs text-zinc-500">Save repeat income or expense plans.</p>
            </div>
          </div>

          <form onSubmit={handleRecurringSubmit} className="space-y-3">
            <input value={recurringForm.title} onChange={(e) => setRecurringForm({ ...recurringForm, title: e.target.value })} placeholder="Title" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none" />
            <input value={recurringForm.amount} onChange={(e) => setRecurringForm({ ...recurringForm, amount: e.target.value })} placeholder="Amount" type="number" min="0.01" step="any" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <select value={recurringForm.type} onChange={(e) => setRecurringForm({ ...recurringForm, type: e.target.value, category: e.target.value === "income" ? "Income" : "Food" })} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-200 outline-none">
                <option value="expense" className="bg-slate-900 text-white">Expense</option>
                <option value="income" className="bg-slate-900 text-white">Income</option>
              </select>
              <select value={recurringForm.frequency} onChange={(e) => setRecurringForm({ ...recurringForm, frequency: e.target.value })} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-200 outline-none">
                <option value="monthly" className="bg-slate-900 text-white">Monthly</option>
                <option value="weekly" className="bg-slate-900 text-white">Weekly</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={recurringForm.category} onChange={(e) => setRecurringForm({ ...recurringForm, category: e.target.value })} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-200 outline-none">
                {CATEGORIES.map((category) => (
                  <option key={category} value={category} className="bg-slate-900 text-white">{category}</option>
                ))}
              </select>
              <input value={recurringForm.nextDate} onChange={(e) => setRecurringForm({ ...recurringForm, nextDate: e.target.value })} type="date" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-200 outline-none" />
            </div>
            <button type="submit" className="w-full rounded-2xl bg-teal-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-400">
              Save Recurring
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {recurringTransactions.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-500">No recurring templates yet.</p>
            ) : (
              recurringTransactions.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-zinc-500">{item.frequency} from {item.nextDate}</p>
                  </div>
                  <button onClick={() => onDeleteRecurring(item.id)} className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
