import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Search, Filter, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import ExpenseList from "./ExpenseList";

export default function TransactionsView({
  expenses,
  onSaveExpense,
  onDeleteExpense,
  onEditClick,
  onAddClick,
  user,
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const totalIncome = expenses
    .filter((exp) => exp.type === "income")
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  const totalExpense = expenses
    .filter((exp) => exp.type === "expense")
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  const netBalance = totalIncome - totalExpense;

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || exp.category === categoryFilter;
    const matchesType = typeFilter === "All" || exp.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-emerald-400">{user?.name}</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Here is a summary of your financial tracker.</p>
        </div>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="rounded-2xl bg-emerald-500/10 p-3 border border-emerald-500/20 text-emerald-400">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-zinc-500 bg-white/5 px-2.5 py-1 rounded-full uppercase">Net Balance</span>
          </div>
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Net Balance</h3>
          <p className={`text-3xl font-extrabold mt-1 tracking-tight ${netBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            ₹{netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="rounded-2xl bg-teal-500/10 p-3 border border-teal-500/20 text-teal-400">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-teal-500 bg-teal-500/10 px-2.5 py-1 rounded-full uppercase">Inflows</span>
          </div>
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Total Income</h3>
          <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            ₹{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="rounded-2xl bg-rose-500/10 p-3 border border-rose-500/20 text-rose-400">
              <ArrowDownRight className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full uppercase">Outflows</span>
          </div>
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Total Expenses</h3>
          <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            ₹{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </motion.div>
      </div>

      {/* Filter and List Panel */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-2xl placeholder-zinc-500 text-white outline-none focus:border-emerald-500/80 focus:bg-white/10 transition-all"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5 w-1/2 sm:w-auto">
              <Filter className="h-4 w-4 text-emerald-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-sm text-zinc-200 outline-none w-full cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-white">All Categories</option>
                <option value="Food" className="bg-slate-900 text-white">Food & Dining</option>
                <option value="Bills" className="bg-slate-900 text-white">Bills & Utilities</option>
                <option value="Shopping" className="bg-slate-900 text-white">Shopping</option>
                <option value="Travel" className="bg-slate-900 text-white">Travel</option>
                <option value="Health" className="bg-slate-900 text-white">Health & Fitness</option>
                <option value="Entertainment" className="bg-slate-900 text-white">Entertainment</option>
                <option value="Income" className="bg-slate-900 text-white">Income</option>
                <option value="Other" className="bg-slate-900 text-white">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5 w-1/2 sm:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-sm text-zinc-200 outline-none w-full cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-white">All Types</option>
                <option value="income" className="bg-slate-900 text-teal-400 font-semibold">Income Only</option>
                <option value="expense" className="bg-slate-900 text-rose-400 font-semibold">Expenses Only</option>
              </select>
            </div>
          </div>
        </div>

        <ExpenseList
          expenses={filteredExpenses}
          onDelete={onDeleteExpense}
          onEdit={onEditClick}
        />
      </div>
    </div>
  );
}
