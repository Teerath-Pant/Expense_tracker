import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Calendar,
  TrendingUp,
  Wallet,
} from "lucide-react";
import ExpenseSummary from "./ExpenseSummary";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const categoryStyles = {
  Food: { fill: "from-orange-500 to-amber-400", text: "text-orange-300" },
  Bills: { fill: "from-rose-500 to-pink-400", text: "text-rose-300" },
  Shopping: { fill: "from-fuchsia-500 to-pink-400", text: "text-pink-300" },
  Travel: { fill: "from-sky-500 to-cyan-400", text: "text-sky-300" },
  Health: { fill: "from-emerald-500 to-teal-400", text: "text-emerald-300" },
  Entertainment: { fill: "from-violet-500 to-purple-400", text: "text-violet-300" },
  Other: { fill: "from-zinc-500 to-zinc-300", text: "text-zinc-300" },
};

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const formatCompactCurrency = (value) => {
  if (!value) {
    return formatCurrency(0);
  }

  if (Math.abs(value) < 1000) {
    return formatCurrency(value);
  }

  return `${value < 0 ? "-" : ""}\u20B9${compactCurrencyFormatter.format(Math.abs(value))}`;
};

const formatShortDate = (value) => {
  const parsedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(parsedDate);
};

const getCircleCoordinates = (index, total, value, maxValue, width, height, padding) => {
  if (total <= 1) {
    return {
      x: width / 2,
      y: height - padding - (value / maxValue) * (height - padding * 2),
    };
  }

  return {
    x: padding + (index / (total - 1)) * (width - padding * 2),
    y: height - padding - (value / maxValue) * (height - padding * 2),
  };
};

export default function StatsView({ expenses, user }) {
  const expenseItems = expenses.filter((item) => item.type === "expense");
  const incomeItems = expenses.filter((item) => item.type === "income");

  const totalExpense = expenseItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalIncome = incomeItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netBalance / totalIncome) * 100) : 0;
  const activeDays = new Set(expenses.map((item) => item.date)).size;
  const averageExpense = expenseItems.length > 0 ? totalExpense / expenseItems.length : 0;
  const averageTransaction = expenses.length > 0 ? (totalIncome + totalExpense) / expenses.length : 0;
  const largestExpense = expenseItems.reduce(
    (largest, item) => (Number(item.amount) > Number(largest.amount || 0) ? item : largest),
    {}
  );

  const dateMap = {};
  expenses.forEach((item) => {
    if (!dateMap[item.date]) {
      dateMap[item.date] = { income: 0, expense: 0 };
    }

    if (item.type === "income") {
      dateMap[item.date].income += Number(item.amount);
    } else {
      dateMap[item.date].expense += Number(item.amount);
    }
  });

  const sortedDates = Object.keys(dateMap).sort();
  const chartData = sortedDates.map((date) => ({
    date,
    label: formatShortDate(date),
    income: dateMap[date].income,
    expense: dateMap[date].expense,
    net: dateMap[date].income - dateMap[date].expense,
  }));

  const width = 600;
  const height = 220;
  const padding = 30;
  const maxChartValue = Math.max(
    ...chartData.map((point) => Math.max(point.income, point.expense)),
    100
  );

  let incomePath = "";
  let incomeAreaPath = "";
  let expensePath = "";
  let expenseAreaPath = "";

  if (chartData.length > 0) {
    const incomePoints = chartData.map((point, index) =>
      getCircleCoordinates(index, chartData.length, point.income, maxChartValue, width, height, padding)
    );
    const expensePoints = chartData.map((point, index) =>
      getCircleCoordinates(index, chartData.length, point.expense, maxChartValue, width, height, padding)
    );

    incomePath =
      `M ${incomePoints[0].x} ${incomePoints[0].y} ` +
      incomePoints.slice(1).map((point) => `L ${point.x} ${point.y}`).join(" ");
    incomeAreaPath =
      `${incomePath} L ${incomePoints[incomePoints.length - 1].x} ${height - padding} ` +
      `L ${incomePoints[0].x} ${height - padding} Z`;

    expensePath =
      `M ${expensePoints[0].x} ${expensePoints[0].y} ` +
      expensePoints.slice(1).map((point) => `L ${point.x} ${point.y}`).join(" ");
    expenseAreaPath =
      `${expensePath} L ${expensePoints[expensePoints.length - 1].x} ${height - padding} ` +
      `L ${expensePoints[0].x} ${height - padding} Z`;
  }

  const categoryTotals = expenseItems.reduce((accumulator, item) => {
    accumulator[item.category] = (accumulator[item.category] || 0) + Number(item.amount);
    return accumulator;
  }, {});

  const categoryData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    }))
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 5);

  const maxCategoryAmount = Math.max(...categoryData.map((item) => item.amount), 1);
  const recentNetData = chartData.slice(-7);
  const maxNetMovement = Math.max(...recentNetData.map((item) => Math.abs(item.net)), 1);
  const labelStep = chartData.length > 6 ? Math.ceil(chartData.length / 6) : 1;
  const gaugeOffset = 282.74 - (Math.min(savingsRate, 100) / 100) * 282.74;

  const summaryCards = [
    {
      label: "Net Balance",
      value: formatCurrency(netBalance),
      tone: netBalance >= 0 ? "text-emerald-300" : "text-rose-300",
      chip: netBalance >= 0 ? "Healthy" : "Watchlist",
      icon: Wallet,
      iconStyle: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    },
    {
      label: "Total Income",
      value: formatCurrency(totalIncome),
      tone: "text-teal-300",
      chip: `${incomeItems.length} entries`,
      icon: ArrowUpRight,
      iconStyle: "bg-teal-500/10 text-teal-300 border-teal-500/20",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(totalExpense),
      tone: "text-rose-300",
      chip: `${expenseItems.length} entries`,
      icon: ArrowDownRight,
      iconStyle: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    },
    {
      label: "Savings Rate",
      value: `${Math.round(savingsRate)}%`,
      tone: "text-cyan-300",
      chip: `${activeDays} active days`,
      icon: TrendingUp,
      iconStyle: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {user?.name ? `${user.name}'s Account Analytics` : "Account Analytics"}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Visualize how money moves through your account, spot patterns, and keep your cashflow in check.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`rounded-2xl border p-3 ${card.iconStyle}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  {card.chip}
                </span>
              </div>
              <p className="mt-5 text-xs uppercase tracking-[0.22em] text-zinc-500">{card.label}</p>
              <p className={`mt-2 text-2xl font-extrabold tracking-tight ${card.tone}`}>{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-teal-500/10 p-2.5 border border-teal-500/20 text-teal-300">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cashflow Trend</h3>
                <p className="text-xs text-zinc-500 mt-1">Daily inflow and outflow movement across your account.</p>
              </div>
            </div>

            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-teal-300">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
                Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-300">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                Expenses
              </span>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Calendar className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Add transactions to unlock the visual account summary.</p>
            </div>
          ) : (
            <div className="relative">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                <defs>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb7185" stopOpacity="0.26" />
                    <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = padding + ratio * (height - padding * 2);
                  return (
                    <line
                      key={ratio}
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.06)"
                      strokeWidth={1}
                    />
                  );
                })}

                {totalIncome > 0 && chartData.length > 1 && <path d={incomeAreaPath} fill="url(#incomeGrad)" />}
                {totalExpense > 0 && chartData.length > 1 && <path d={expenseAreaPath} fill="url(#expenseGrad)" />}

                {totalIncome > 0 && (
                  <>
                    {chartData.length > 1 && (
                      <path
                        d={incomePath}
                        fill="none"
                        stroke="#2dd4bf"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                    )}
                    {chartData.map((item, index) => {
                      const point = getCircleCoordinates(
                        index,
                        chartData.length,
                        item.income,
                        maxChartValue,
                        width,
                        height,
                        padding
                      );

                      return (
                        <circle
                          key={`income-${item.date}`}
                          cx={point.x}
                          cy={point.y}
                          r={4.5}
                          fill="#2dd4bf"
                          stroke="#0f172a"
                          strokeWidth={1.5}
                        >
                          <title>{`Income on ${item.label}: ${formatCurrency(item.income)}`}</title>
                        </circle>
                      );
                    })}
                  </>
                )}

                {totalExpense > 0 && (
                  <>
                    {chartData.length > 1 && (
                      <path
                        d={expensePath}
                        fill="none"
                        stroke="#fb7185"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                    )}
                    {chartData.map((item, index) => {
                      const point = getCircleCoordinates(
                        index,
                        chartData.length,
                        item.expense,
                        maxChartValue,
                        width,
                        height,
                        padding
                      );

                      return (
                        <circle
                          key={`expense-${item.date}`}
                          cx={point.x}
                          cy={point.y}
                          r={4.5}
                          fill="#fb7185"
                          stroke="#0f172a"
                          strokeWidth={1.5}
                        >
                          <title>{`Expense on ${item.label}: ${formatCurrency(item.expense)}`}</title>
                        </circle>
                      );
                    })}
                  </>
                )}

                {chartData.map((item, index) => {
                  if (index % labelStep !== 0 && index !== chartData.length - 1) {
                    return null;
                  }

                  const point = getCircleCoordinates(
                    index,
                    chartData.length,
                    0,
                    maxChartValue,
                    width,
                    height,
                    padding
                  );

                  return (
                    <text
                      key={`label-${item.date}`}
                      x={point.x}
                      y={height - 8}
                      fill="rgba(255, 255, 255, 0.45)"
                      fontSize={10}
                      textAnchor="middle"
                    >
                      {item.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-cyan-500/10 p-2.5 border border-cyan-500/20 text-cyan-300">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Account Pulse</h3>
              <p className="text-xs text-zinc-500 mt-1">A quick health check of the account.</p>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="flex h-full min-h-[320px] items-center justify-center text-center text-sm text-zinc-500">
              Activity starts here once you add your first transaction.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="relative h-40 w-40">
                  <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                    <circle
                      cx="60"
                      cy="60"
                      r="45"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="45"
                      fill="none"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray="282.74"
                      strokeDashoffset={gaugeOffset}
                    />
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#38bdf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Savings</span>
                    <span className="text-3xl font-extrabold text-white">{Math.round(savingsRate)}%</span>
                    <span className="text-xs text-zinc-400 mt-1">of income retained</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Avg Spend</p>
                  <p className="mt-2 text-base font-bold text-white">{formatCompactCurrency(averageExpense)}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Avg Move</p>
                  <p className="mt-2 text-base font-bold text-white">{formatCompactCurrency(averageTransaction)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-[0.22em] text-zinc-500">Recent Net Flow</span>
                  <span className="text-zinc-400">{recentNetData.length} days</span>
                </div>

                <div className="flex items-end gap-2 h-28">
                  {recentNetData.map((item) => {
                    const isPositive = item.net >= 0;
                    const heightRatio = Math.max(Math.abs(item.net) / maxNetMovement, 0.12);

                    return (
                      <div key={item.date} className="flex-1 flex flex-col items-center justify-end gap-2">
                        <div className="flex h-20 items-end">
                          <div
                            className={`w-full rounded-t-xl ${
                              isPositive ? "bg-emerald-400/80" : "bg-rose-400/80"
                            }`}
                            style={{ height: `${heightRatio * 100}%`, minWidth: "18px" }}
                            title={`${item.label}: ${formatCurrency(item.net)}`}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500">{item.label.split(" ")[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-zinc-400">Largest expense</span>
                  <span className="font-semibold text-white">
                    {largestExpense.title ? formatCurrency(largestExpense.amount) : "No expenses yet"}
                  </span>
                </div>
                {largestExpense.title && (
                  <p className="text-xs text-zinc-500">
                    {largestExpense.title} in {largestExpense.category} on {formatShortDate(largestExpense.date)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-amber-500/10 p-2.5 border border-amber-500/20 text-amber-300">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Spending Lanes</h3>
              <p className="text-xs text-zinc-500 mt-1">Where your outflow is concentrating the most.</p>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center text-center text-sm text-zinc-500">
              Add a few expenses to see category-level spending charts.
            </div>
          ) : (
            <div className="space-y-5">
              {categoryData.map((item) => {
                const style = categoryStyles[item.category] || categoryStyles.Other;

                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold ${style.text}`}>{item.category}</span>
                        <span className="text-xs text-zinc-500">{Math.round(item.percentage)}% of expenses</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${style.fill}`}
                        style={{ width: `${Math.max((item.amount / maxCategoryAmount) * 100, 12)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <ExpenseSummary expenses={expenseItems} />
      </div>
    </div>
  );
}
