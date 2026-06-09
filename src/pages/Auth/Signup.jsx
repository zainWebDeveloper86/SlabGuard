import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { TypingText } from "../../components/Common";
import Logo from "../../assets/Frame3.svg";
import { LuArrowLeft } from "react-icons/lu";

const Signup = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user?.isLogin) navigate("/", { replace: true });
  }, [user, navigate, loading]);

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !registerForm.username ||
      !registerForm.email ||
      !registerForm.password
    ) {
      toast.error("Please fill all fields");
    } else {
      toast.success("Registration successful! Please login.");
      navigate("/login");
    }
  };

  if (loading) return null;

  const paraText =
    "Start your journey with AI-powered smart saving and billing insights.";

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white dark:bg-[#0B1220] transition-colors duration-300">
      {/* --- Top Side: Login Form --- */}

      <div className="absolute top-5 left-5 group">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl
    bg-gray-100/80 dark:bg-gray-800/60 backdrop-blur-md
    text-gray-700 dark:text-gray-300
    hover:bg-brand-gradient
    transition-all duration-300 shadow-sm hover:shadow-lg hover:font-extrabold outline-none"
        >
          <LuArrowLeft
            className="transition-all duration-300 group-hover:-translate-x-0.5 group-hover:scale-110"
            strokeWidth={3}
          />

          <span className="text-sm font-medium hover:font-extrabold">Go Back</span>
        </button>
      </div>

      {/* --- Left Side: Form --- */}
      <div className="w-full md:w-[70%] flex items-center justify-center px-6 sm:px-8 md:px-16 pt-14 pb-6 md:pt-16 md:pb-0">
        <div className="w-full max-w-md">
          {/* ✅ Mobile Header (Improved) */}
          <div className="md:hidden flex flex-col items-center mb-10">
            <img
              src={Logo}
              alt="SlabGuard Logo"
              className="w-18 h-18 object-contain mb-2 drop-shadow-md"
            />
            {/* <h1 className="text-2xl font-black text-brand-gradient">
              SlabGuard
            </h1> */}
            <p className="text-xs sm:text-[14px] text-gray-400 dark:text-gray-500 text-center">
              Create your account & start saving ⚡
            </p>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-gradient mb-2 text-left">
            Create Account
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mb-8 text-left text-sm sm:text-base">
            Join SlabGuard and start saving smartly!
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-gray-200 mb-2">
                Username<span className="text-brand-blue">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter a unique username for yourself"
                className="w-full px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-[#1A1A1A] dark:text-white outline-none focus:border-brand-blue transition-all input-focus"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, username: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-gray-200 mb-2">
                Email<span className="text-brand-blue">*</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-[#1A1A1A] dark:text-white outline-none focus:border-brand-blue transition-all input-focus"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-gray-200 mb-2">
                Password<span className="text-brand-blue">*</span>
              </label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-[#1A1A1A] dark:text-white outline-none focus:border-brand-blue transition-all input-focus"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="relative overflow-hidden w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-blue to-[#1A2EFF] text-white font-bold shadow-lg group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
            >
              <span className="relative z-10">Create Account</span>

              <span className="absolute top-0 left-0 h-full w-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></span>
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-blue font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>

          <p className="mt-10 text-xs text-center text-gray-400 dark:text-gray-500">
            © 2026 SlabGuard. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* --- Right Side: SAME AS LOGIN --- */}
      <div className="hidden md:w-1/2 md:flex rounded-bl-[90px] items-center justify-center relative overflow-hidden bg-gradient-to-br from-brand-blue via-[#1F4FFF] to-brand-green">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-[-20%] left-[-10%] w-72 h-72 bg-brand-green/50 rounded-full blur-3xl"></div>

        <div className="text-center z-10 px-12">
          {/* Logo Icon */}
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-brand-green/30 blur-2xl rounded-full"></div>

              {/* Logo */}
              <img
                src={Logo}
                alt="SlabGuard Logo"
                className="w-50 h-50 object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.3)]"
              />
            </div>
          </div>

          <h1 className="text-white text-5xl font-black tracking-tight mb-3">
            SlabGuard
          </h1>

          <div className="h-1 w-20 bg-brand-green mx-auto rounded-full mb-5"></div>
          {/* Description */}
          <TypingText paraText={paraText} />
        </div>
      </div>
    </div>
  );
};

export default Signup;
