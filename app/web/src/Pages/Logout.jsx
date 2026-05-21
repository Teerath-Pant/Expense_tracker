import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";
import { motion } from "framer-motion";
import { LogOut, ArrowRight } from "lucide-react";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    logout();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [logout, navigate]);

  return (
    <div className="flex w-full items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm text-center rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
      >
        <motion.div
          initial={{ rotate: -180, scale: 0.5 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20"
        >
          <LogOut className="h-8 w-8" />
        </motion.div>

        <h2 className="text-2xl font-bold tracking-tight text-white">
          Logged Out Successfully
        </h2>
        <p className="mt-3 text-sm text-zinc-400">
          Thank you for tracking your expenses today.
        </p>

        <div className="relative mt-8 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 3, ease: "linear" }}
            className="absolute left-0 top-0 h-full bg-emerald-500"
          />
        </div>

        <p className="mt-4 text-xs text-zinc-500">
          Redirecting to home page in <span className="font-semibold text-emerald-400">{countdown}s</span>...
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 transition hover:text-emerald-300 hover:underline focus:outline-none"
        >
          Go back immediately <ArrowRight className="h-3 w-3" />
        </button>
      </motion.div>
    </div>
  );
}
