import { motion } from "framer-motion";
import { User, Mail, Shield, CheckCircle } from "lucide-react";
import { useAuth } from "./AuthContext";

export default function SettingsView() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your account credentials and app parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md space-y-6">
          <div className="flex items-center gap-4 border-b border-white/10 pb-6">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-xl">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{user?.name}</h3>
              <p className="text-sm text-zinc-500">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-xs uppercase text-zinc-500 font-semibold tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                Username
              </span>
              <p className="text-sm font-bold text-zinc-200">{user?.name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-xs uppercase text-zinc-500 font-semibold tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-teal-400" />
                Email Address
              </span>
              <p className="text-sm font-bold text-zinc-200">{user?.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-xs uppercase text-zinc-500 font-semibold tracking-wider flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                Security Status
              </span>
              <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Active Session Verified
              </p>
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-base font-bold text-white">System Environment</h3>
          <div className="space-y-3 text-xs text-zinc-400">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Frontend:</span>
              <span className="text-zinc-200 font-medium">React 19 + Vite</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Backend APIs:</span>
              <span className="text-zinc-200 font-medium">Express + oRPC</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Database Client:</span>
              <span className="text-zinc-200 font-medium">PostgreSQL + Drizzle</span>
            </div>
            <div className="flex justify-between">
              <span>Auth Session:</span>
              <span className="text-zinc-200 font-medium">State-Signed JWT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
