import LogoIcon from "../../assets/Frame2.svg";
import { FaXTwitter, FaGithub, FaLinkedin } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";

const MobileBottombar = () => {
  const navigate = useNavigate();

  return (
    <footer
      className="
      px-6 py-4 
      border-t border-gray-200 dark:border-gray-800
      bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl
      transition-all duration-300 z-20 
      "
    >
      <div
        className="
        max-w-7xl mx-auto 
        grid grid-cols-1 
        sm:grid-cols-2 
        max-sm:gap-4 max-md:gap-2 items-center
        "
      >
        {/* LOGO */}
        <div className="flex justify-center md:justify-start">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img
              src={LogoIcon}
              className="h-8 transition-transform duration-300 hover:scale-110"
            />
          </button>
        </div>

        {/* ICONS */}
        <div className="flex justify-center md:justify-end gap-3">
          {[
            { icon: <FaXTwitter />, link: "https://x.com/" },
            { icon: <FaLinkedin />, link: "https://www.linkedin.com/" },
            { icon: <FaGithub />, link: "https://github.com/" },
          ].map((item, i) => (
            <Link
              key={i}
              to={item.link}
              target="_blank"
              className="
              p-2 rounded-full 
              text-gray-400 hover:text-white
              relative overflow-hidden
              transition-all duration-300
              group hover:scale-110
              "
            >
              <span className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-100 transition duration-300"></span>
              <span className="relative z-10 text-sm">{item.icon}</span>
            </Link>
          ))}
        </div>

        {/* COPYRIGHT (FULL WIDTH) */}
        <div className="sm:col-span-2 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          © 2026 SlabGuard. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default MobileBottombar;