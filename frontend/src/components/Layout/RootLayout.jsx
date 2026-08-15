import { Outlet, useLocation } from "react-router-dom";
import { Navbar, Footer } from "../Common";

const RootLayout = () => {
  const location = useLocation();

  // console.log(location);
  // console.log(location.pathname);
  
  // where you want to hide navbar and footer
  const hideLayoutRoutes = ["/login", "/register","/forgot-password","/reset-password"];

  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B1220]">
      
      {/* Navbar */}
      {!hideLayout && <Navbar />}

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      {!hideLayout && <Footer />}
    </div>
  );
};

export default RootLayout;