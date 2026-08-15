import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { sidebarMenuItems } from "../../constants";
import { LuLogOut, LuChevronsLeftRight } from "react-icons/lu";
import * as Tooltip from "@radix-ui/react-tooltip";
import LogoIcon from "../../assets/Frame3.svg";

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);

  const sections = sidebarMenuItems[user?.role] || sidebarMenuItems.user;

  //    =============   old way routing check
  // const isActive = (path) => location.pathname.startsWith(path);

  //    =============   New way checking routing
  const isActive = (path) => {
    const currentPath = location.pathname;

    // Special case for /admin and /home
    if (path === "/admin" || path === "/home") {
      return currentPath === path; // Exact match
    }

    // Baqi routes ke liye standard nested check    ||    Baqi sab ke liye startsWith
    return currentPath.startsWith(path);
  };

  const logoutHandler = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* 📱 Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static z-50 h-screen transition-all duration-300 flex flex-col gap-5 pt-5
        ${collapsed ? "w-20" : "w-64"}
        ${mobileOpen ? "left-0" : "-left-full md:left-0"}
        bg-white dark:bg-[#0B1220]
        border-r border-gray-200 dark:border-gray-800`}
      >
        {/* 🔹 Header */}

        <div className="flex items-center justify-between px-4">
          {!collapsed && (
            <h1 className="text-lg font-black text-brand-gradient">
              SlabGuard
            </h1>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="cursor-pointer outline-none group relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-200/80 dark:hover:bg-[#1E293B] transition text-white"
          >
            {/* Arrow */}
            <LuChevronsLeftRight
              size={22}
              className={`absolute transition-all duration-300 ${!collapsed ? "opacity-100 scale-100" : "opacity-0 scale-75"} group-hover:opacity-100 group-hover:scale-100 text-gray-700 dark:text-gray-300`}
            />

            {/* Logo */}
            <img
              src={LogoIcon}
              alt="Logo"
              className={`absolute w-8 h-8 object-contain transition-all duration-300 ${collapsed ? "opacity-100 scale-150 drop-shadow-xl" : "opacity-0 scale-75"} group-hover:opacity-0 group-hover:scale-75`}
            />
          </button>
        </div>

        {/* 🔹 Menu */}
        <Tooltip.Provider delayDuration={100}>
          <div className="px-3 space-y-6 flex-1 overflow-y-auto">
            {sections.map((section, i) => (
              <div key={i}>
                {!collapsed && (
                  <p className="text-xs text-gray-400 uppercase px-2 mb-2">
                    {section.section}
                  </p>
                )}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Tooltip.Root key={item.name}>
                        <Tooltip.Trigger asChild>
                          <Link
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                            ${
                              isActive(item.path)
                                ? "text-white bg-brand-blue"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-[#1E293B]"
                            }
                            
                            ${collapsed ? "justify-center" : ""}`}
                          >
                            {isActive(item.path) && (
                              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></span>
                            )}

                            <Icon size={18} />

                            {!collapsed && (
                              <span className="text-sm font-medium">
                                {item.name}
                              </span>
                            )}
                          </Link>
                        </Tooltip.Trigger>

                        {/* Tooltip */}
                        {collapsed && (
                          <Tooltip.Content
                            side="right"
                            className="bg-black text-white text-xs px-2 py-1 rounded-md"
                          >
                            {item.name}
                          </Tooltip.Content>
                        )}
                      </Tooltip.Root>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Tooltip.Provider>

        {/* 🔹 Logout */}
        <div className="w-full px-3">
          <button
            onClick={logoutHandler}
            className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LuLogOut size={22} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
