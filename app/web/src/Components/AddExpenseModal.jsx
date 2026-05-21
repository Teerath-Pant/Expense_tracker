import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Calendar, IndianRupee, Tag, FileText } from "lucide-react";

export default function AddExpenseModal({ isOpen, onClose, onSave, editingExpense }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Pre-fill if editing
  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setType(editingExpense.type);
      setDate(editingExpense.date);
    } else {
      setTitle("");
      setAmount("");
      setCategory("Food");
      setType("expense");
      setDate(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
      });
    }
  }, [editingExpense, isOpen]);

  // Adjust category when type changes
  useEffect(() => {
    if (!editingExpense) {
      if (type === "income") {
        setCategory("Income");
      } else {
        setCategory("Food");
      }
    }
  }, [type, editingExpense]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    onSave({
      title: title.trim(),
      amount: Number(amount),
      category,
      type,
      date,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl sm:p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            {editingExpense ? "Edit Transaction" : "Add Transaction"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full bg-white/5 border border-white/5 p-1.5 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle Switch */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  type === "expense"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-950/20"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  type === "income"
                    ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-950/20"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Description / Title
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                <FileText className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. Weekly Grocery Run/ salaryof the month"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500/80 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 font-semibold">
                ₹
              </span>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500/80 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Category
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                <Tag className="h-4 w-4" />
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-emerald-500/80 focus:bg-white/10 transition-all cursor-pointer appearance-none"
              >
                {type === "expense" ? (
                  <>
                    <option value="Food" className="bg-slate-900 text-white">Food & Dining</option>
                    <option value="Bills" className="bg-slate-900 text-white">Bills & Utilities</option>
                    <option value="Shopping" className="bg-slate-900 text-white">Shopping</option>
                    <option value="Travel" className="bg-slate-900 text-white">Travel</option>
                    <option value="Health" className="bg-slate-900 text-white">Health & Fitness</option>
                    <option value="Entertainment" className="bg-slate-900 text-white">Entertainment</option>
                    <option value="Other" className="bg-slate-900 text-white">Other</option>
                  </>
                ) : (
                  <>
                    <option value="Income" className="bg-slate-900 text-white">Income / Salary</option>
                    <option value="Other" className="bg-slate-900 text-white">Other Credit</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Transaction Date
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                <Calendar className="h-4 w-4" />
              </span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-emerald-500/80 focus:bg-white/10 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="mt-6 w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/10 cursor-pointer transition-colors duration-200"
          >
            {editingExpense ? "Save Changes" : "Create Transaction"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
