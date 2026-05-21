import { PieChart } from "lucide-react";

const CATEGORY_COLORS = {
  Food: { bar: "bg-orange-500", text: "text-orange-400 font-medium" },
  Bills: { bar: "bg-rose-500", text: "text-rose-400 font-medium" },
  Shopping: { bar: "bg-pink-500", text: "text-pink-400 font-medium" },
  Travel: { bar: "bg-blue-500", text: "text-blue-400 font-medium" },
  Health: { bar: "bg-emerald-500", text: "text-emerald-400 font-medium" },
  Entertainment: { bar: "bg-purple-500", text: "text-purple-400 font-medium" },
  Other: { bar: "bg-zinc-500", text: "text-zinc-400 font-medium" },
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function ExpenseSummary({ expenses }) {
  const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  const categoriesMap = expenses.reduce((accumulator, current) => {
    accumulator[current.category] = (accumulator[current.category] || 0) + Number(current.amount);
    return accumulator;
  }, {});

  const summaryData = Object.keys(categoriesMap)
    .map((category) => {
      const amount = categoriesMap[category];
      const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;

      return {
        category,
        amount,
        percentage,
      };
    })
    .sort((left, right) => right.amount - left.amount);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-xl bg-emerald-500/10 p-2.5 border border-emerald-500/20 text-emerald-400">
          <PieChart className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-white">Expense Breakdown</h3>
      </div>

      {totalExpense === 0 ? (
        <div className="text-center py-10 text-zinc-500 text-sm">
          No expenses recorded to analyze yet.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center mb-2">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Total Monthly Outflow</span>
            <p className="text-2xl font-extrabold text-white mt-1">
              {currencyFormatter.format(totalExpense)}
            </p>
          </div>

          <div className="space-y-4">
            {summaryData.map((item) => {
              const theme = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;

              return (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-200 font-semibold">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">{currencyFormatter.format(item.amount)}</span>
                      <span className={theme.text}>({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${theme.bar}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
