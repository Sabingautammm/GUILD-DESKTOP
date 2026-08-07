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

const navItems = [
  {
    path: "/",
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    path: "/leaderboard",
    icon: PiTrophy,
    activeIcon: PiTrophyFill,
  },
  {
    path: "/reel",
    icon: PiFilmReel,
    activeIcon: PiFilmReelFill,
  },
  {
    path: "/guild",
    icon: HiOutlineUserGroup,
    activeIcon: HiUserGroup,
  },
  {
    path: "/gallery",
    icon: MdOutlinePhotoLibrary,
    activeIcon: MdPhotoLibrary,
  },
];

function BottomNavbar() {
  const navigate = useNavigate();

  const [isLoggedIn] = useState(false);

  const handleProfile = () => {
    if (isLoggedIn) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white pb-[env(safe-area-inset-bottom)]">

      <div className="flex justify-around items-center py-2.5">

        {navItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center justify-center p-2"
          >
            {({ isActive }) => {

              const Icon = isActive
                ? item.activeIcon
                : item.icon;

              return (
                <Icon
                  className={`text-2xl ${
                    isActive
                      ? "text-emerald-500"
                      : "text-slate-500"
                  }`}
                />
              );
            }}
          </NavLink>

        ))}

        <button onClick={handleProfile} className="flex items-center justify-center p-2">
          <FaRegUserCircle className="text-2xl text-slate-500" />
        </button>

      </div>

    </nav>
  );
}

export default BottomNavbar;