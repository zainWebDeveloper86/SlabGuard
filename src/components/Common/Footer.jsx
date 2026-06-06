import LogoIcon from "../../assets/Frame1.svg";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { navLinks,socialLinks } from "../../constants";


const Footer = () => {
  const { user } = useAuth();

  if (!user?.isLogin) {
    return (
      <footer
        className="mt-20 border-t border-gray-200 dark:border-gray-800
      bg-white/70 dark:bg-[#0B1220]/70 backdrop-blur-xl
      transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-6">
          {/* TOP SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* 🔹 LEFT - BRAND */}
            <div>
              <Link className="inline-block mb-4" to="/">
                <img
                  src={LogoIcon}
                  className="h-10 hover:scale-105 transition"
                />
              </Link>

              <p className="pl-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed w-[88%]">
                Smart AI-powered energy monitoring system that helps you track
                usage, predict bills, and avoid expensive slabs.
              </p>
            </div>

            {/* 🔹 MIDDLE - LINKS */}
            <div className="flex flex-col gap-3 md:pl-16 lg:pl-30">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Quick Links
              </h3>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="group relative w-fit text-sm text-gray-500 dark:text-gray-400 hover:text-brand-blue transition"
                >
                  {link.name}

                  {/* underline */}
                  <span
                    className="absolute left-0 -bottom-1 h-[2px] w-full 
                  bg-gradient-to-r from-green-500 to-blue-600
                  scale-x-0 origin-right
                  transition-transform duration-300
                  group-hover:scale-x-100 group-hover:origin-left"
                  />
                </Link>
              ))}
            </div>

            {/* 🔹 RIGHT - SOCIAL */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Connect
              </h3>

              <div className="flex gap-3">
                {socialLinks?.map(({ Icon, label, path }) => (
                  <Link
                    key={label}
                    to={path}
                    className="relative p-2.5 rounded-full 
                  text-gray-500 dark:text-gray-400
                  hover:text-white
                  overflow-hidden group transition"
                  >
                    {/* gradient bg */}
                    <span
                      className="absolute inset-0 bg-brand-gradient 
                    opacity-0 group-hover:opacity-100 transition duration-300"
                    />

                    <Icon className="w-4 h-4 relative z-10" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 🔻 BOTTOM LINE */}
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2026 SlabGuard. All rights reserved.
            </p>

            <div className="flex gap-4 text-xs">
              <Link
                to="/privacy"
                className="text-gray-500 dark:text-gray-400 hover:text-brand-blue transition"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-gray-500 dark:text-gray-400 hover:text-brand-blue transition"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }
};

export default Footer;
