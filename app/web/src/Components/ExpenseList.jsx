import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  Zap,
  ShoppingBag,
  Car,
  Activity,
  Tv,
  DollarSign,
  Briefcase,
  HelpCircle,
  Trash2,
  Edit2
} from "lucide-react";

const CATEGORY_ICONS = {
  Food: { icon: Utensils, bg: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  Bills: { icon: Zap, bg: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  Shopping: { icon: ShoppingBag, bg: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  Travel: { icon: Car, bg: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  Health: { icon: Activity, bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  Entertainment: { icon: Tv, bg: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  Income: { icon: Briefcase, bg: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
  Other: { icon: HelpCircle, bg: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
};

export default function ExpenseList({ expenses, onDelete, onEdit }) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-white/5 border border-white/10 p-4 mb-4 text-zinc-500">
          <HelpCircle className="h-8 w-8" />
        </div>
        <p className="text-zinc-400 font-medium">No transactions found</p>
        <p className="text-zinc-500 text-xs mt-1">Try resetting filters or add a new transaction.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-zinc-500 px-2 pb-3 border-b border-white/5">
        <span>Details</span>
        <span className="text-right">Amount / Action</span>
      </div>

      <div className="divide-y divide-white/5 max-h-[450px] overflow-y-auto mt-2 pr-1 space-y-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {expenses.map((expense) => {
            const config = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.Other;
            const IconComponent = config.icon;
            const isExpense = expense.type === "expense";

            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                layout
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${config.bg}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{expense.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-zinc-400">
                        {expense.category}
                      </span>
                      <span className="text-[10px] text-zinc-500">{expense.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isExpense ? "text-zinc-200" : "text-emerald-400"}`}>
                      {isExpense ? "-" : "+"}₹{Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Actions buttons that appear on hover */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                    <button
                      onClick={() => onEdit(expense)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/20 cursor-pointer"
                      title="Edit transaction"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 cursor-pointer"
                      title="Delete transaction"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
