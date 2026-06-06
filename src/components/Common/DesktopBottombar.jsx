import LogoIcon from "../../assets/Frame2.svg";
import { FaXTwitter, FaGithub, FaLinkedin } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";

const DesktopBottombar = () => {
  const navigate = useNavigate();
  return (
    <footer
      className="flex items-center justify-between 
      px-6 py-3 
      border-t border-gray-200 dark:border-gray-800
      bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl
      transition-all duration-300 z-20"
    >
      {/* LEFT */}
      <button
        onClick={() => {
          navigate("/home");
        }}
        className="cursor-pointer"
      >
        <img
          src={LogoIcon}
          className="w-full h-8 object-cover transition-transform duration-300 hover:scale-110"
        />
      </button>

      {/* CENTER */}

      <div className="text-sm text-gray-500 dark:text-gray-400">
        © 2026 SlabGuard. All Rights Reserved.
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 text-xs">
        {/* Twitter */}
        <Link
          to="https://x.com/"
          className=" p-2 rounded-full 
          text-gray-400 hover:text-white
          relative overflow-hidden
          transition-all duration-300
          group"
        >
          <span
            className="absolute inset-0 bg-brand-gradient 
            opacity-0 group-hover:opacity-100 transition duration-300"
          ></span>
          <FaXTwitter className="w-4 h-4 relative z-10" />
        </Link>

        {/* LinkedIn */}
        <Link
          to="https://www.linkedin.com/"
          className=" p-2 rounded-full 
          text-gray-400 hover:text-white
          relative overflow-hidden
          transition-all duration-300
          group"
        >
          <span
            className="absolute inset-0 bg-brand-gradient 
            opacity-0 group-hover:opacity-100 transition duration-300"
          ></span>
          <FaLinkedin className="w-4 h-4 relative z-10" />
        </Link>

        {/* GitHub */}
        <Link
          to="https://github.com/"
          className=" p-2 rounded-full 
          text-gray-400 hover:text-white
          relative overflow-hidden
          transition-all duration-300
          group"
        >
          <span
            className="absolute inset-0 bg-brand-gradient 
            opacity-0 group-hover:opacity-100 transition duration-300"
          ></span>
          <FaGithub className="w-4 h-4 relative z-10" />
        </Link>
      </div>
    </footer>
  );
};

export default DesktopBottombar;
