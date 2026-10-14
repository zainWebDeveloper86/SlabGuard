import { LuSun, LuMoon, LuSearch, LuLogOut, LuSettings } from "react-icons/lu";
import { RiMenu4Fill } from "react-icons/ri";

import { useTheme } from "../../hooks/useTheme";
// import useravator from "../../assets/avator.jpg";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { sidebarMenuItems } from "../../constants";
import { useLocation, useNavigate } from "react-router-dom";
import { backend_url } from "../../axios";

const Topbar = ({ setMobileOpen }) => {
  const { dark, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const { user, logout, loading } = useAuth();
  // console.log(user.avatar)

  // console.log(user);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Ref banao
  const dropdownRef = useRef(null);

  // 2. useEffect add karo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    // ✅ Close dropdown on ESC key
    const handleEscKey = (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [open]);

  const sections = sidebarMenuItems[user?.role] || sidebarMenuItems.user;

  const findTitleFromMenu = (path, sections) => {
    let bestMatch = "";

    for (const section of sections) {
      for (const item of section.items) {
        if (path.startsWith(item.path) && item.path.length > bestMatch.length) {
          bestMatch = item.name;
        }
      }
    }

    return bestMatch || "Settings";
  };

  const pageTitles = {
    "/application-form": "Application Form",
    // "/settings": "Account Settings",
  };

  // const pageTitle = findTitleFromMenu(location.pathname, sections);
  const pageTitle =
    pageTitles[location.pathname] ||
    findTitleFromMenu(location.pathname, sections);

  const logoutHandler = async () => {
    await logout();
    navigate("/login");
  };

  // console.log("Sending state:", { from: location });

  return (
    <header
      className="h-16 flex items-center justify-between px-4 md:px-6
      border-b border-gray-200 dark:border-gray-800
      bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl
      shadow-sm transition-all duration-300 z-30"
    >
      {/* LEFT */}
      <div className="flex items-center gap-4 ">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden cursor-pointer outline-none p-2 rounded-full text-gray-600 dark:text-gray-300 
          hover:bg-gray-200/80 dark:hover:bg-gray-700/60 transition-all duration-200"
        >
          <RiMenu4Fill className="w-5 h-5 hover:rotate-12 transition" />
        </button>
        {/* <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {user?.role === "admin" ? "Admin / " : ""}
          {pageTitle}
        </h1> */}

        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
            {`Pages / ${pageTitle}`}
          </span>
          <h1 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100/90 dark:bg-gray-800/60 backdrop-blur-md">
        {/* SEARCH */}
        <div className="relative hidden sm:block">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            placeholder="Search..."
            className="w-44 md:w-64 pl-9 pr-3 py-1.5 rounded-full bg-gray-200/90 dark:bg-gray-800 border border-transparent text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 transition-all duration-200"
          />
        </div>

        {/* THEME BUTTON */}
        <button
          onClick={toggleTheme}
          className="outline-none cursor-pointer p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/60 transition-all duration-200"
        >
          {dark ? (
            <LuSun className="w-5 h-5  transition-transform hover:rotate-90" />
          ) : (
            <LuMoon className="w-5 h-5 transition-transform hover:rotate-12" />
          )}
        </button>

        {/* PROFILE */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="cursor-pointer flex items-center p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700/60 transition-all duration-200 outline-none"
          >
            <div className="relative">
              <img
                src={`${backend_url}${user.avatar}`}
                alt={user?.fullName || "User"}
                className="w-7 h-7 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.fullName || "User",
                  )}&background=2F5FF6&color=fff&size=128`;
                }}
              />

              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
            </div>
          </button>

          {/* DROPDOWN */}
          {open && (
            <div className="absolute right-0 mt-3 min-w-52 grow rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="flex flex-row gap-2 items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100">
                <div className="relative">
                  <img
                    src={`${backend_url}${user.avatar}`}
                    alt="Avatar"
                    className="min-w-7 h-7 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.fullName || "User",
                      )}&background=2F5FF6&color=fff&size=128`;
                    }}
                  />
                  {/* <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" /> */}
                </div>
                <div className="text-gray-800 dark:text-gray-100">
                  <p className="text-sm font-medium">
                    {!loading ? user?.fullName : "Hi User"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {!loading ? user?.email : "user@gmail.com"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  navigate("/settings");
                  setOpen(!open);
                }}
                className="flex flex-row gap-2 items-center w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 cursor-pointer"
              >
                <LuSettings size={16} /> <span>Account Settings</span>
              </button>

              <div className="border-t border-gray-200 dark:border-gray-800" />

              <button
                onClick={logoutHandler}
                className="flex flex-row gap-2 items-center w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
              >
                <LuLogOut size={16} /> <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
