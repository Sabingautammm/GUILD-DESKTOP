import { NavLink } from "react-router-dom";

function MobileHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-100 border-b border-slate-200">

      <div className="flex h-full items-center px-5">

        <NavLink
          to="/"
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
            G
          </div>

          <span className="font-bold text-xl text-slate-800">
            Guildly
          </span>
        </NavLink>

      </div>

    </header>
  );
}

export default MobileHeader;