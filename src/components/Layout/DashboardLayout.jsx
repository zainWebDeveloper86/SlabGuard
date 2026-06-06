import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Bottombar, Topbar, Sidebar } from "../Common";

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar setMobileOpen={setMobileOpen} />

        {/* ✅ FIXED: Main content with proper overflow */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-[#0F172A]">
          <Outlet />
        </main>

        <Bottombar />
      </div>
    </div>
  );
};

export default DashboardLayout;