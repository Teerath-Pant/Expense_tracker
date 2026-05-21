import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, BarChart2, IndianRupee, Settings, Menu, Wallet, X, LogOut } from "lucide-react";
import { useAuth } from "./AuthContext";
import ProfileAvatar from "./ProfileAvatar";

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "transactions", label: "Transactions", icon: Calendar },
    { id: "stats", label: "Stats", icon: BarChart2 },
    { id: "budgets", label: "Budgets", icon: IndianRupee },
  ];

  const manageItems = [
    { id: "wallets", label: "Wallets", icon: Wallet },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderItem = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => {
          setActiveTab(item.id);
          setIsOpen(false);
        }}
        className="w-full relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer group focus:outline-none"
      >
        {/* Smooth active background transition */}
        {isActive && (
          <motion.div
            layoutId="activeTabBackground"
            className="absolute inset-0 bg-white shadow-lg shadow-white/5"
            style={{ borderRadius: "1rem" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
          />
        )}
        
        {/* Label & Icon */}
        <span className="relative z-10 flex items-center gap-3.5 w-full">
          <Icon
            className={`h-5 w-5 transition-colors duration-250 ${
              isActive ? "text-slate-950" : "text-zinc-400 group-hover:text-white"
            }`}
          />
          <span
            className={`transition-colors duration-250 ${
              isActive ? "text-slate-950 font-bold" : "text-zinc-400 group-hover:text-white"
            }`}
          >
            {item.label}
          </span>
        </span>
      </button>
    );
  };

  const accountSection = user ? (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur-sm">
      <p className="px-1 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">Account</p>
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
        <ProfileAvatar avatarId={user.avatarId} customAvatarData={user.customAvatarData} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-100">{user.name}</p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
        </div>
      </div>
      <Link
        to="/logout"
        onClick={() => setIsOpen(false)}
        className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors duration-200 hover:bg-red-500/20"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Link>
    </div>
  ) : null;

  return (
    <>
      {/* Mobile Dashboard Header with Hamburger */}
      <div className="md:hidden w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md mb-2">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-zinc-300 hover:text-white rounded-xl bg-white/5 border border-white/5 active:scale-95 transition cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          {activeTab === "transactions" && <Calendar className="h-4 w-4 text-emerald-400" />}
          {activeTab === "stats" && <BarChart2 className="h-4 w-4 text-emerald-400" />}
          {activeTab === "budgets" && <IndianRupee className="h-4 w-4 text-emerald-400" />}
          {activeTab === "wallets" && <Wallet className="h-4 w-4 text-emerald-400" />}
          {activeTab === "settings" && <Settings className="h-4 w-4 text-emerald-400" />}
          <span className="text-zinc-200">{activeTab}</span>
        </span>
      </div>

      {/* Mobile Slide-over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />
            {/* Drawer container */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-slate-950/95 border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl md:hidden"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold text-white">Menu</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex flex-1 flex-col gap-6">
                  {/* Main section */}
                  <div className="flex flex-col gap-1.5 w-full">
                    {menuItems.map(renderItem)}
                  </div>

                  {/* Section Divider & Manage Section */}
                  <div className="border-t border-white/5 pt-4">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest px-4 block mb-2">
                      Manage
                    </span>
                    <div className="flex flex-col gap-1.5 w-full">
                      {manageItems.map(renderItem)}
                    </div>
                  </div>
                </div>

                {accountSection ? <div className="mt-6">{accountSection}</div> : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sticky Sidebar */}
      <div className="hidden md:flex w-64 shrink-0 sticky top-6 flex-col gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-md flex min-h-[calc(100vh-8rem)] flex-col w-full">
          <div className="flex flex-1 flex-col">
            <div className="flex flex-col gap-1.5 w-full">
              {menuItems.map(renderItem)}
            </div>

            <div className="my-3 border-t border-white/5 pt-3">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest px-4 block mb-2">
                Manage
              </span>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              {manageItems.map(renderItem)}
            </div>
          </div>

          {accountSection ? <div className="mt-4 pt-4 border-t border-white/5">{accountSection}</div> : null}
        </div>
      </div>
    </>
  );
}
