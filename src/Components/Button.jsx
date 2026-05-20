function Button(){
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <a
        href="#"
        className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
      >
        Track Your Expenses
      </a>
      <a
        href="#"
        className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-white/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
      >
        View Features
      </a>
    </div>
  );
}

export default Button;
