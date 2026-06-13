import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LogoIcon from "../../assets/Frame1.svg";
import { useTheme } from "../../hooks/useTheme";
import { LuSun, LuMoon, LuX } from "react-icons/lu";
import { RiMenu4Fill } from "react-icons/ri";
import { navLinks } from "../../constants";
import { useState } from "react";

const Navbar = () => {
  const { user } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  // ✅ PUBLIC NAVBAR ONLY
  if (!user?.isLogin) {
    return (
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-[#0B1220]/70 border-b border-gray-100 dark:border-gray-800">
        {/* TOP BAR */}
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src={LogoIcon}
              className="h-12 group-hover:scale-105 transition"
            />
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex gap-6 lg:gap-12 text-base">
            {navLinks.map(({ name, path }) => (
              <Link
                key={name}
                to={path}
                className={`group relative transition-all duration-300
                ${
                  isActive(path)
                    ? "text-brand-blue"
                    : "text-gray-800 dark:text-gray-300 hover:text-brand-blue"
                }`}
              >
                {name}
                <span
                  className={`absolute left-0 -bottom-2.5 h-0.5 w-full bg-gradient-to-r from-green-500 to-blue-600 transition-transform duration-300 origin-right
                  ${
                    isActive(path)
                      ? "scale-x-100 origin-left"
                      : "scale-x-0 group-hover:scale-x-100 group-hover:origin-left"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* RIGHT SECTION */}

          {/*for Desktop*/}
          <div className="hidden md:block">
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative outline-none cursor-pointer p-2 rounded-full text-gray-500 hover:text-white overflow-hidden group transition"
              >
                <span
                  className="absolute inset-0 bg-brand-gradient 
                    opacity-0 group-hover:opacity-100 transition duration-300"
                />
                {dark ? (
                  <LuSun className="w-5 h-5 group-hover:rotate-90 transition relative" />
                ) : (
                  <LuMoon className="w-5 h-5 group-hover:rotate-12 transition relative" />
                )}
              </button>

              {/* Button for login */}

              <Link
                to="/login"
                className="relative px-5 py-2.5 rounded-full bg-brand-gradient text-white font-bold overflow-hidden group"
              >
                <span className="relative z-10">Get Started</span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition duration-700"></span>
              </Link>
            </div>
          </div>

          {/*for mobile*/}
          <div className="md:hidden">
            <div className="flex items-center  min-[400px]:gap-2 bg-brand-blue rounded-full">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="outline-none cursor-pointer p-2 rounded-full text-gray-300 transition-all duration-200"
              >
                {dark ? (
                  <LuSun className="w-5 h-5 hover:rotate-90 transition" />
                ) : (
                  <LuMoon className="w-5 h-5 hover:rotate-12 transition" />
                )}
              </button>

              {/* MOBILE MENU BUTTON */}
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="cursor-pointer p-2 rounded-full text-gray-300  transition-all duration-200"
              >
                {openMenu ? (
                  <LuX className="w-5 h-5 hover:rotate-90 transition" />
                ) : (
                  <RiMenu4Fill className="w-5 h-5 hover:rotate-12 transition" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {openMenu && (
          <div
            className="md:hidden px-6 pb-5 pt-3 space-y-3 
          bg-white/10 dark:bg-[#0B1220]/10 
          border-t border-gray-200 dark:border-gray-800
          animate-in fade-in slide-in-from-top-2 duration-300"
          >
            {navLinks.map(({ name, path }) => (
              <Link
                key={name}
                to={path}
                onClick={() => setOpenMenu(false)}
                className={`block py-2 text-sm font-medium transition
                ${
                  isActive(path)
                    ? "text-brand-blue"
                    : "text-gray-700 dark:text-gray-300 hover:text-brand-blue"
                }`}
              >
                {name}
              </Link>
            ))}

            {/* Mobile Button */}
            <Link
              to="/login"
              onClick={() => setOpenMenu(false)}
              className="block mt-4 text-center py-2.5 rounded-full bg-brand-gradient text-white font-semibold"
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>
    );
  }
};

export default Navbar;
