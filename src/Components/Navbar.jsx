import logo from "../assets/logo.png";

function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-white/10 px-6 py-4 backdrop-blur-md sm:px-10 lg:px-20">
      <a href="#" className="flex items-center gap-3">
        <img src={logo} alt="Expense Tracker" className="h-11 w-11 rounded-full bg-white/90 p-1" />

        <h1 className="text-lg font-bold sm:text-xl">
          <span className="text-white">Expense</span>
          <span className="text-emerald-300">Tracker</span>
        </h1>
      </a>

      <div className="hidden items-center gap-8 text-sm font-medium text-zinc-200 md:flex">
        <a href="#" className="transition-colors duration-200 hover:text-emerald-300">
          Home
        </a>
        <a href="#" className="transition-colors duration-200 hover:text-emerald-300">
          Features
        </a>
        <a href="#" className="transition-colors duration-200 hover:text-emerald-300">
          Contact
        </a>
      </div>

    </nav>
  );
}

export default Navbar;
