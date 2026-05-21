import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IndianRupee, ShieldAlert, PlusCircle, Edit } from "lucide-react";

const DEFAULT_BUDGETS = {
  Food: 500,
  Bills: 1000,
  Shopping: 300,
  Travel: 400,
  Health: 200,
  Entertainment: 300,
  Other: 200,
};

export default function BudgetsView({ expenses, user }) {
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editLimit, setEditLimit] = useState("");

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`expense_tracker_budgets_${user.id}`);
      if (stored) {
        setBudgets(JSON.parse(stored));
      } else {
        localStorage.setItem(`expense_tracker_budgets_${user.id}`, JSON.stringify(DEFAULT_BUDGETS));
      }
    }
  }, [user]);

  const handleSaveBudget = (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    const updated = {
      ...budgets,
      [editingCategory]: Number(editLimit) || 0,
    };
    setBudgets(updated);
    localStorage.setItem(`expense_tracker_budgets_${user.id}`, JSON.stringify(updated));
    setEditingCategory(null);
    setEditLimit("");
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setEditLimit(budgets[cat]);
  };

  // Calculate actual spending per category (excluding income)
  const spendingMap = {};
  expenses
    .filter((e) => e.type === "expense")
    .forEach((item) => {
      const cat = item.category;
      spendingMap[cat] = (spendingMap[cat] || 0) + Number(item.amount);
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Budget Planner
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Set monthly spend limits and keep track of your goals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budgets List Panel */}
        <div className="lg:col-span-2 space-y-4">
          {Object.keys(budgets).map((category) => {
            const limit = budgets[category];
            const spent = spendingMap[category] || 0;
            const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

            let barColor = "bg-emerald-500";
            let textColor = "text-emerald-400";
            let glowColor = "shadow-emerald-500/10";
            if (percentage > 100) {
              barColor = "bg-rose-500";
              textColor = "text-rose-400";
              glowColor = "shadow-rose-500/10";
            } else if (percentage > 75) {
              barColor = "bg-amber-500";
              textColor = "text-amber-400";
              glowColor = "shadow-amber-500/10";
            }

            return (
              <motion.div
                key={category}
                layout
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-base">{category}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Monthly Limit: ₹{limit}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-extrabold ${textColor}`}>{percentage}%</span>
                      <p className="text-xs text-zinc-400 mt-0.5">₹{spent.toLocaleString()} spent</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex sm:flex-col items-end gap-2 justify-end">
                  <button
                    onClick={() => handleEditClick(category)}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 px-3.5 py-2 font-semibold text-xs transition cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5 text-emerald-400" />
                    Set Limit
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info & Form Panel */}
        <div className="space-y-6">
          {editingCategory ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md"
            >
              <h3 className="text-lg font-bold text-white mb-4">Edit Budget: {editingCategory}</h3>
              <form onSubmit={handleSaveBudget} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Limit Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editLimit}
                    onChange={(e) => setEditLimit(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 px-4 text-sm text-white placeholder-zinc-500 outline-none ring-emerald-500/20 transition-all focus:border-emerald-500/80 focus:bg-white/10 focus:ring-4"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="w-1/2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 font-bold text-sm transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="w-1/2 rounded-2xl border border-white/10 hover:bg-white/5 text-zinc-300 py-3 font-bold text-sm transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md space-y-4">
              <div className="rounded-2xl bg-amber-500/10 p-3 border border-amber-500/20 text-amber-400 w-fit">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Smart Budget Warnings</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Categories exceeding **75%** of their monthly budget limits will display a warning yellow alert, while those exceeding **100%** will glow red.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
