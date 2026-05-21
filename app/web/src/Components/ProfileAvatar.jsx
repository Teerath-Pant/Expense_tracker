import { BadgeDollarSign, Flame, Landmark, Shield, Sparkles, TrendingUp, UserRound, Wallet } from "lucide-react";
import logo from "../assets/logo.png";

export const AVATAR_OPTIONS = [
  {
    id: "logo",
    label: "Tracker",
    type: "logo",
    className: "border-emerald-500/20 bg-white/90",
  },
  {
    id: "emerald-user",
    label: "Emerald",
    icon: UserRound,
    className: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
  },
  {
    id: "sky-wallet",
    label: "Wallet",
    icon: Wallet,
    className: "border-sky-400/30 bg-sky-500/15 text-sky-300",
  },
  {
    id: "amber-bank",
    label: "Bank",
    icon: Landmark,
    className: "border-amber-400/30 bg-amber-500/15 text-amber-300",
  },
  {
    id: "rose-fire",
    label: "Streak",
    icon: Flame,
    className: "border-rose-400/30 bg-rose-500/15 text-rose-300",
  },
  {
    id: "teal-trend",
    label: "Growth",
    icon: TrendingUp,
    className: "border-teal-400/30 bg-teal-500/15 text-teal-300",
  },
  {
    id: "violet-spark",
    label: "Spark",
    icon: Sparkles,
    className: "border-violet-400/30 bg-violet-500/15 text-violet-300",
  },
  {
    id: "cyan-cash",
    label: "Cash",
    icon: BadgeDollarSign,
    className: "border-cyan-400/30 bg-cyan-500/15 text-cyan-300",
  },
  {
    id: "slate-shield",
    label: "Secure",
    icon: Shield,
    className: "border-zinc-300/20 bg-zinc-500/15 text-zinc-200",
  },
];

export const AVATAR_IDS = AVATAR_OPTIONS.map((avatar) => avatar.id);

export const getAvatarOption = (avatarId) =>
  AVATAR_OPTIONS.find((avatar) => avatar.id === avatarId) || AVATAR_OPTIONS[0];

export default function ProfileAvatar({ avatarId = "logo", size = "md", className = "" }) {
  const avatar = getAvatarOption(avatarId);
  const Icon = avatar.icon;
  const sizeClass = size === "lg" ? "h-16 w-16 p-1.5" : "h-9 w-9 p-1";
  const iconSizeClass = size === "lg" ? "h-7 w-7" : "h-4 w-4";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border ${sizeClass} ${avatar.className} ${className}`}
    >
      {avatar.type === "logo" ? (
        <img src={logo} alt="Expense Tracker profile" className="h-full w-full rounded-full object-contain" />
      ) : (
        <Icon className={iconSizeClass} />
      )}
    </span>
  );
}
