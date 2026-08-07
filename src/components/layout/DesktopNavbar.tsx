import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { GoHome, GoHomeFill } from "react-icons/go";
import {
  PiTrophy,
  PiTrophyFill,
  PiFilmReel,
  PiFilmReelFill,
} from "react-icons/pi";

import {
  HiOutlineUserGroup,
  HiUserGroup,
} from "react-icons/hi2";

import {
  MdOutlinePhotoLibrary,
  MdPhotoLibrary,
} from "react-icons/md";

import { FaRegUserCircle } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";

const navItems = [
  {
    label: "Home",
    path: "/",
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    label: "Leader Board",
    path: "/leaderboard",
    icon: PiTrophy,
    activeIcon: PiTrophyFill,
  },
  {
    label: "Reel",
    path: "/reel",
    icon: PiFilmReel,
    activeIcon: PiFilmReelFill,
  },
  {
    label: "Guild",
    path: "/guild",
    icon: HiOutlineUserGroup,
    activeIcon: HiUserGroup,
  },
  {
    label: "Gallery",
    path: "/gallery",
    icon: MdOutlinePhotoLibrary,
    activeIcon: MdPhotoLibrary,
  },
];

function DesktopNavbar() {
  const navigate = useNavigate();

  const [isLoggedIn] = useState(false);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 h-20 bg-slate-100/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex h-full items-center justify-between gap-4 px-4 xl:px-6">

        {/* Logo */}

        <NavLink
          to="/"
          className="flex shrink-0 items-center gap-2 xl:gap-3"
        >
          <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
            G
          </div>

          <span className="hidden sm:inline font-bold text-xl xl:text-2xl text-slate-800">
            Guildly
          </span>
        </NavLink>

        {/* Navigation */}

        <nav className="flex items-center gap-1 rounded-full bg-[#0B1220] p-2 shadow-lg overflow-x-auto">

          {navItems.map((item) => (

            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-2 whitespace-nowrap rounded-full px-3 xl:px-5 py-2.5 text-sm xl:text-base font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => {

                const Icon = isActive
                  ? item.activeIcon
                  : item.icon;

                return (
                  <>
                    <Icon className="text-lg shrink-0" />

                    <span className="hidden xl:inline">{item.label}</span>

                    {isActive && (
                      <span className="absolute left-1/2 -bottom-2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-400" />
                    )}
                  </>
                );
              }}
            </NavLink>

          ))}

        </nav>

        {/* Login */}

        {isLoggedIn ? (

          <NavLink
            to="/profile"
            className="flex shrink-0 items-center gap-2 rounded-full px-3 xl:px-5 py-2.5 font-medium hover:bg-slate-200"
          >
            <FaRegUserCircle />

            <span className="hidden sm:inline">Profile</span>
          </NavLink>

        ) : (

          <button
            onClick={() => navigate("/login")}
            className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 xl:px-5 py-2.5 font-semibold text-white"
          >
            <span className="hidden sm:inline">Login</span>

            <FiLogIn />
          </button>

        )}
      </div>
    </header>
  );
}

export default DesktopNavbar;