import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Menu, X, LogOut, LayoutDashboard, User } from "lucide-react";
import logo from "../assets/logo.png";

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <nav className="relative z-30 border-b border-white/10 px-6 py-4 backdrop-blur-md sm:px-10 lg:px-20">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <img src={logo} alt="Expense Tracker" className="h-11 w-11 rounded-full bg-white/90 p-1" />
          <h1 className="text-lg font-bold sm:text-xl">
            <span className="text-white">Expense</span>
            <span className="text-emerald-300">Tracker</span>
          </h1>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-8 text-sm font-medium text-zinc-200 md:flex">
          <Link to="/" className="transition-colors duration-200 hover:text-emerald-300">
            Home
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-1.5 transition-colors duration-200 hover:text-emerald-300">
                <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                Dashboard
              </Link>
              <div className="flex items-center gap-2 border-l border-white/20 pl-6">
                <span className="flex items-center gap-1 text-zinc-300 bg-white/5 border border-white/5 rounded-full px-3 py-1 text-xs">
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  {user.name}
                </span>
                <Link
                  to="/logout"
                  className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-full px-4 py-1.5 transition-colors duration-200 font-semibold"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Link>
              </div>
            </>
          ) : (
            <>
              <a href="#" className="transition-colors duration-200 hover:text-emerald-300">
                Features
              </a>
              <div className="flex items-center gap-4 border-l border-white/20 pl-6">
                <Link to="/login" className="transition-colors duration-200 hover:text-emerald-300 font-semibold">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2 transition-colors duration-200 font-bold"
                >
                  Register
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 hover:text-white transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 top-[100%] w-full border-b border-white/10 bg-slate-950/95 py-6 px-6 shadow-2xl backdrop-blur-xl md:hidden flex flex-col gap-4 z-40">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 text-base font-semibold text-zinc-200 hover:text-emerald-300 transition-colors"
          >
            Home
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-base font-semibold text-zinc-200 hover:text-emerald-300 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5 text-emerald-400" />
                Dashboard
              </Link>
              <div className="border-t border-white/10 pt-4 mt-2">
                <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3">Logged In As</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                    <User className="h-4 w-4 text-emerald-400" />
                    {user.name}
                  </span>
                  <Link
                    to="/logout"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl px-4 py-2 font-bold text-sm transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <a
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-base font-semibold text-zinc-200 hover:text-emerald-300 transition-colors"
              >
                Features
              </a>
              <div className="border-t border-white/10 pt-4 mt-2 flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-2xl border border-white/10 py-3 font-bold text-zinc-200 hover:bg-white/5 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-2xl bg-emerald-500 py-3 font-bold text-slate-950 shadow-lg shadow-emerald-950/20 hover:bg-emerald-400 transition"
                >
                  Register
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
