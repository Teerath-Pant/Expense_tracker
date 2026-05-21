import { useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CalendarDays,
  Check,
  CheckCircle,
  Download,
  Flame,
  KeyRound,
  Mail,
  Pencil,
  Shield,
  TrendingUp,
  Upload,
  User,
  UserX,
  X,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import ProfileAvatar, { AVATAR_OPTIONS } from "./ProfileAvatar";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const startOfDay = (date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const getActivityTone = (count) => {
  if (count >= 5) return "bg-emerald-400 border-emerald-300";
  if (count >= 3) return "bg-emerald-500/80 border-emerald-400/80";
  if (count >= 2) return "bg-teal-400/70 border-teal-300/80";
  if (count === 1) return "bg-emerald-500/25 border-emerald-400/40";
  return "bg-white/5 border-white/10";
};

const getLongestStreak = (activityDates) => {
  let longest = 0;
  let current = 0;
  let previousTime = null;

  activityDates.forEach((date) => {
    const currentTime = new Date(`${date}T00:00:00`).getTime();
    const isNextDay = previousTime !== null && currentTime - previousTime === 24 * 60 * 60 * 1000;

    current = isNextDay ? current + 1 : 1;
    longest = Math.max(longest, current);
    previousTime = currentTime;
  });

  return longest;
};

export default function SettingsView({ expenses = [] }) {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name || "");
  const [saveState, setSaveState] = useState({ status: "idle", message: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    setNameDraft(user?.name || "");
  }, [user?.name]);

  const activity = useMemo(() => {
    const today = startOfDay(new Date());
    const rangeStart = addDays(today, -364);
    const calendarStart = addDays(rangeStart, -rangeStart.getDay());
    const calendarEnd = addDays(today, 6 - today.getDay());
    const dayCount = Math.round((calendarEnd - calendarStart) / (24 * 60 * 60 * 1000)) + 1;
    const weekCount = Math.ceil(dayCount / 7);
    const activityByDate = new Map();

    expenses.forEach((expense) => {
      const expenseDate = new Date(`${expense.date}T00:00:00`);

      if (Number.isNaN(expenseDate.getTime()) || expenseDate < rangeStart || expenseDate > today) {
        return;
      }

      activityByDate.set(expense.date, (activityByDate.get(expense.date) || 0) + 1);
    });

    const activeDates = [...activityByDate.keys()].sort();
    const totalTransactions = [...activityByDate.values()].reduce((sum, count) => sum + count, 0);
    const activeDays = activeDates.length;
    const averagePerActiveDay = activeDays > 0 ? totalTransactions / activeDays : 0;
    const longestStreak = getLongestStreak(activeDates);

    const days = Array.from({ length: dayCount }, (_, index) => {
      const date = addDays(calendarStart, index);
      const key = dateKey(date);

      return {
        key,
        date,
        count: activityByDate.get(key) || 0,
        inRange: date >= rangeStart && date <= today,
      };
    });

    const monthMarkers = [];
    const seenMonths = new Set();

    days.forEach((day, index) => {
      if (!day.inRange) return;

      const monthKey = `${day.date.getFullYear()}-${day.date.getMonth()}`;
      if (day.date.getDate() === 1 || index === 0 || !seenMonths.has(monthKey)) {
        seenMonths.add(monthKey);
        monthMarkers.push({
          label: MONTH_LABELS[day.date.getMonth()],
          column: Math.floor(index / 7) + 1,
        });
      }
    });

    return {
      activeDays,
      averagePerActiveDay,
      days,
      longestStreak,
      monthMarkers,
      totalTransactions,
      weekCount,
    };
  }, [expenses]);

  const handleSaveName = async () => {
    const nextName = nameDraft.trim();

    if (nextName.length < 2) {
      setSaveState({ status: "error", message: "Name must be at least 2 characters." });
      return;
    }

    setSaveState({ status: "saving", message: "" });
    const result = await updateProfile({
      name: nextName,
      avatarId: user?.avatarId || "logo",
      customAvatarData: user?.customAvatarData || null,
      preferredCurrency: user?.preferredCurrency || "INR",
    });

    if (!result.success) {
      setSaveState({ status: "error", message: result.message });
      return;
    }

    setIsEditingName(false);
    setSaveState({ status: "success", message: "Username updated." });
  };

  const handleAvatarChange = async (avatarId) => {
    if (avatarId === (user?.avatarId || "logo")) {
      return;
    }

    setSaveState({ status: "saving", message: "" });
    const result = await updateProfile({
      name: user?.name || nameDraft,
      avatarId,
      customAvatarData: user?.customAvatarData || null,
      preferredCurrency: user?.preferredCurrency || "INR",
    });

    if (!result.success) {
      setSaveState({ status: "error", message: result.message });
      return;
    }

    setSaveState({ status: "success", message: "Avatar updated." });
  };

  const handleCustomAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = await updateProfile({
        name: user?.name || nameDraft,
        avatarId: "custom",
        customAvatarData: String(reader.result),
        preferredCurrency: user?.preferredCurrency || "INR",
      });

      setSaveState(result.success ? { status: "success", message: "Custom avatar updated." } : { status: "error", message: result.message });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleCurrencyChange = async (preferredCurrency) => {
    const result = await updateProfile({
      name: user?.name || nameDraft,
      avatarId: user?.avatarId || "logo",
      customAvatarData: user?.customAvatarData || null,
      preferredCurrency,
    });

    setSaveState(result.success ? { status: "success", message: "Currency preference updated." } : { status: "error", message: result.message });
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    const result = await changePassword(passwordForm);

    if (result.success) {
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setSaveState({ status: "success", message: "Password updated." });
      return;
    }

    setSaveState({ status: "error", message: result.message });
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    if (!window.confirm("Delete your account and all stored data?")) return;

    const result = await deleteAccount({ password: deletePassword });
    if (!result.success) {
      setSaveState({ status: "error", message: result.message });
    }
  };

  const handleExportData = () => {
    const payload = {
      user,
      expenses,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expense-tracker-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCancelNameEdit = () => {
    setNameDraft(user?.name || "");
    setIsEditingName(false);
    setSaveState({ status: "idle", message: "" });
  };

  const activityCards = [
    {
      label: "Total Transactions",
      value: activity.totalTransactions,
      icon: BadgeDollarSign,
      style: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    },
    {
      label: "Active Days",
      value: activity.activeDays,
      icon: TrendingUp,
      style: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    },
    {
      label: "Longest Streak",
      value: activity.longestStreak,
      icon: Flame,
      style: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    },
    {
      label: "Avg per Active Day",
      value: activity.averagePerActiveDay % 1 === 0 ? activity.averagePerActiveDay : activity.averagePerActiveDay.toFixed(1),
      icon: CalendarDays,
      style: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your account credentials and transaction activity.</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md space-y-6">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <ProfileAvatar avatarId={user?.avatarId} customAvatarData={user?.customAvatarData} size="lg" className="shadow-lg shadow-emerald-950/20" />
            <div className="min-w-0">
              {isEditingName ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white outline-none transition focus:border-emerald-400/60 sm:w-64"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveName}
                      disabled={saveState.status === "saving"}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Save username"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelNameEdit}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10"
                      title="Cancel username edit"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-lg font-bold text-white">{user?.name}</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
                    title="Edit username"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <p className="mt-1 truncate text-sm text-zinc-500">{user?.email}</p>
              {saveState.message && (
                <p className={`mt-2 text-xs ${saveState.status === "error" ? "text-rose-300" : "text-emerald-300"}`}>
                  {saveState.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-1">
            <span className="text-xs uppercase text-zinc-500 font-semibold tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-emerald-400" />
              Username
            </span>
            <p className="text-sm font-bold text-zinc-200">{user?.name}</p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-1">
            <span className="text-xs uppercase text-zinc-500 font-semibold tracking-wider flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-teal-400" />
              Email Address
            </span>
            <p className="text-sm font-bold text-zinc-200">{user?.email}</p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-1">
            <span className="text-xs uppercase text-zinc-500 font-semibold tracking-wider flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              Security Status
            </span>
            <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Active Session Verified
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-1">
            <span className="text-xs uppercase text-zinc-500 font-semibold tracking-wider flex items-center gap-1.5">
              <BadgeDollarSign className="h-3.5 w-3.5 text-sky-400" />
              Currency
            </span>
            <select
              value={user?.preferredCurrency || "INR"}
              onChange={(event) => handleCurrencyChange(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-bold text-zinc-200 outline-none"
            >
              {["INR", "USD", "EUR", "GBP"].map((currency) => (
                <option key={currency} value={currency} className="bg-slate-900 text-white">
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Profile Avatar</h3>
            <p className="mt-1 text-xs text-zinc-500">Choose a saved avatar for your dashboard profile.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
            {AVATAR_OPTIONS.map((avatar) => {
              const isSelected = (user?.avatarId || "logo") === avatar.id;

              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => handleAvatarChange(avatar.id)}
                  disabled={saveState.status === "saving"}
                  className={`group flex flex-col items-center gap-2 rounded-2xl border p-3 transition ${
                    isSelected
                      ? "border-emerald-400/60 bg-emerald-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                  title={avatar.label}
                >
                  <ProfileAvatar avatarId={avatar.id} customAvatarData={user?.customAvatarData} />
                  <span className={`text-[11px] font-semibold ${isSelected ? "text-emerald-300" : "text-zinc-500 group-hover:text-zinc-300"}`}>
                    {avatar.label}
                  </span>
                </button>
              );
            })}
          </div>
          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10">
            <Upload className="h-4 w-4 text-emerald-300" />
            Upload custom avatar
            <input type="file" accept="image/*" onChange={handleCustomAvatarUpload} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-6 xl:grid-cols-3">
          <form onSubmit={handlePasswordChange} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
              <KeyRound className="h-4 w-4 text-emerald-300" />
              Change Password
            </div>
            <div className="space-y-3">
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                placeholder="Current password"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
              />
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                placeholder="New password"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
              />
              <button className="w-full rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-400">
                Save Password
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
              <Download className="h-4 w-4 text-teal-300" />
              Export Data
            </div>
            <p className="mb-4 text-xs text-zinc-500">Download your profile and transactions as JSON.</p>
            <button
              type="button"
              onClick={handleExportData}
              className="w-full rounded-xl border border-teal-500/20 bg-teal-500/10 px-3 py-2 text-sm font-bold text-teal-300 transition hover:bg-teal-500/20"
            >
              Export Account Data
            </button>
          </div>

          <form onSubmit={handleDeleteAccount} className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-rose-200">
              <UserX className="h-4 w-4" />
              Delete Account
            </div>
            <input
              type="password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              placeholder="Confirm password"
              className="mb-3 w-full rounded-xl border border-rose-500/20 bg-black/20 px-3 py-2 text-sm text-white outline-none"
            />
            <button className="w-full rounded-xl bg-rose-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-rose-400">
              Delete Account
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {activityCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${card.style}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-3xl font-semibold text-white">{card.value}</p>
              <p className="mt-1 text-sm text-zinc-400">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="text-lg font-bold text-white">Expense Tracking Activity</h3>
          <p className="mt-1 text-sm text-zinc-400">Your transaction history over the past year</p>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/10 p-5">
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[780px]">
              <div className="ml-9 grid h-5 text-xs text-zinc-500" style={{ gridTemplateColumns: `repeat(${activity.weekCount}, minmax(12px, 1fr))` }}>
                {activity.monthMarkers.map((marker) => (
                  <span key={`${marker.label}-${marker.column}`} style={{ gridColumnStart: marker.column }}>
                    {marker.label}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="grid grid-rows-7 gap-1 text-xs text-zinc-500">
                  {DAY_LABELS.map((label) => (
                    <span key={label} className="h-3 leading-3">
                      {label === "Mon" || label === "Wed" || label === "Fri" ? label : ""}
                    </span>
                  ))}
                </div>

                <div
                  className="grid grid-flow-col grid-rows-7 gap-1"
                  style={{ gridTemplateColumns: `repeat(${activity.weekCount}, minmax(12px, 1fr))` }}
                >
                  {activity.days.map((day) => (
                    <span
                      key={day.key}
                      className={`h-3 w-3 rounded border ${day.inRange ? getActivityTone(day.count) : "bg-transparent border-transparent"}`}
                      title={`${day.key}: ${day.count} transaction${day.count === 1 ? "" : "s"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-1 text-xs text-zinc-400">
                <span className="mr-1">Less</span>
                {[0, 1, 2, 3, 5].map((count) => (
                  <span key={count} className={`h-3 w-3 rounded border ${getActivityTone(count)}`} />
                ))}
                <span className="ml-1">More</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="text-lg font-semibold text-white">{activity.activeDays}</span>{" "}
              {activity.activeDays === 1 ? "day" : "days"} tracked in the last year
            </p>
            <p className="flex items-center gap-2 text-orange-300">
              <Flame className="h-4 w-4" />
              {activity.longestStreak} {activity.longestStreak === 1 ? "day" : "days"} streak
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
