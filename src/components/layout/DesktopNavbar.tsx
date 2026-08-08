import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import type { IconType } from "react-icons";
import { GoHome, GoHomeFill } from "react-icons/go";
import {
  PiTrophy,
  PiTrophyFill,
  PiFilmReel,
  PiFilmReelFill,
} from "react-icons/pi";
import { HiOutlineUserGroup, HiUserGroup } from "react-icons/hi2";
import { MdOutlinePhotoLibrary, MdPhotoLibrary } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";

// Files in /public are served from the root path directly — importing them
// as a module (as before) is what triggered Vite's "use /Logo...png" warning.
const logo = "/Logo-removebg-preview.png";

interface NavItem {
  label: string;
  path: string;
  icon: IconType;
  activeIcon: IconType;
}

const navItems: NavItem[] = [
  { label: "Home", path: "/", icon: GoHome, activeIcon: GoHomeFill },
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
  const location = useLocation();
  const [isLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Typed refs — this is what fixed the "implicitly any" / "does not exist
  // on type 'never'" errors. useRef({}) and useRef(null) with no generic
  // give TS nothing to work with.
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Slide the gold indicator to whichever item matches the current route
  useEffect(() => {
    const activeItem = navItems.find((item) => item.path === location.pathname);
    const el = activeItem ? itemRefs.current[activeItem.path] : null;
    if (el && navRef.current) {
      const navBox = navRef.current.getBoundingClientRect();
      const itemBox = el.getBoundingClientRect();
      setIndicator({
        left: itemBox.left - navBox.left,
        width: itemBox.width,
        opacity: 1,
      });
    } else {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [location.pathname]);

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 border-b transition-all duration-300 backdrop-blur-xl ${
        scrolled
          ? "h-16 bg-[#FAF6EE]/90 border-[#E9DCC0] shadow-[0_10px_30px_-14px_rgba(23,18,13,0.35)]"
          : "h-20 bg-[#FAF6EE]/60 border-transparent shadow-none"
      }`}
    >
      <div className="max-w-7xl mx-auto flex h-full items-center justify-between gap-6 px-4 xl:px-8">
        {/* Logo */}
        <NavLink to="/" className="flex shrink-0 items-center group">
          <div
            className={`flex items-center justify-center transition-all duration-300 ${
              scrolled ? "h-12 w-12" : "h-16 w-16"
            }`}
          >
            <img
              src={logo}
              alt="Logo"
              className="h-full w-full object-contain drop-shadow-[0_2px_6px_rgba(23,18,13,0.25)] transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </NavLink>

        {/* Navigation */}
        <nav
          ref={navRef}
          className="relative flex items-center gap-1 rounded-full bg-[#17120D] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_30px_-10px_rgba(23,18,13,0.55)] ring-1 ring-[#E3A012]/10 overflow-x-auto"
        >
          {/* Sliding gold indicator */}
          <span
            className="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-r from-[#FFD873] via-[#E3A012] to-[#B9660B] shadow-[0_4px_18px_-2px_rgba(227,160,18,0.55)] transition-all duration-300 ease-out"
            style={{
              left: indicator.left,
              width: indicator.width,
              opacity: indicator.opacity,
            }}
          />

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              ref={(el) => {
                itemRefs.current[item.path] = el;
              }}
              className={({ isActive }) =>
                `relative z-10 flex items-center gap-2 whitespace-nowrap rounded-full px-3 xl:px-5 py-2.5 text-sm xl:text-[15px] font-medium tracking-tight transition-colors duration-300 ${
                  isActive
                    ? "text-[#17120D]"
                    : "text-[#B3A488] hover:text-[#FBF3E2]"
                }`
              }
            >
              {({ isActive }) => {
                const Icon = isActive ? item.activeIcon : item.icon;
                return (
                  <>
                    <span className="relative flex items-center justify-center">
                      {isActive && (
                        <span className="absolute h-4 w-4 rounded-full bg-[#C81034] blur-[7px] opacity-50" />
                      )}
                      <Icon
                        className={`relative text-lg shrink-0 transition-transform duration-300 ${
                          isActive ? "scale-110" : ""
                        }`}
                      />
                    </span>
                    <span className="hidden xl:inline">{item.label}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>

        {/* Login / Profile */}
        {isLoggedIn ? (
          <NavLink
            to="/profile"
            className="flex shrink-0 items-center gap-2 rounded-full px-3 xl:px-5 py-2.5 font-medium text-[#4A3B27] transition-colors duration-200 hover:bg-[#17120D]/5 hover:text-[#17120D]"
          >
            <FaRegUserCircle className="text-lg" />
            <span className="hidden sm:inline">Profile</span>
          </NavLink>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="group flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[#FFD873] via-[#E3A012] to-[#B9660B] px-4 xl:px-5 py-2.5 font-semibold text-[#17120D] shadow-[0_8px_20px_-6px_rgba(185,102,11,0.55)] transition-all duration-300 hover:shadow-[0_10px_26px_-6px_rgba(185,102,11,0.75)] hover:brightness-105 active:scale-[0.97]"
          >
            <span className="hidden sm:inline">Login</span>
            <FiLogIn className="text-base transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </header>
  );
}

export default DesktopNavbar;