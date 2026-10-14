import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Logo from "../../assets/Frame3.svg";
import { TypingText } from "../../components/Common";
import {
  LuArrowLeft,
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuUser,
} from "react-icons/lu";
import { axiosServerInstance } from "../../axios.js";

const Login = () => {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const location = useLocation();
  const [rememberMe, setRememberMe] = useState(false);

  // console.log(user)

  const from = location.state?.from?.pathname;

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user?.isLogin) {
      if (user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [user, navigate, loading]);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginForm, setLoginForm] = useState({
    usernameOREmail: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { usernameOREmail, password } = loginForm;

    if (!usernameOREmail || !password) {
      toast.error("Username/Email and password are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosServerInstance.post("/user/login", {
        usernameOREmail,
        password,
        rememberMe,
      });

      if (response.data.success) {
        login(response.data.user);

        toast.success("Login successful!");
        if (response.data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Server error. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  const paraText =
    "AI-powered smart saving assistant & billing forecaster. Track usage, save money, and stay ahead.";

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white dark:bg-[#0B1220] transition-colors duration-300">
      {/* Back button */}
      <div className="absolute top-5 left-5 group">
        <button
          onClick={() => {
            if (from && from !== "/home") {
              navigate("/");
            } else {
              navigate(-1);
            }
          }}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 backdrop-blur-md text-gray-700 dark:text-gray-300 hover:bg-brand-gradient transition-all duration-300 shadow-sm hover:shadow-lg outline-none"
        >
          <LuArrowLeft
            className="transition-all duration-300 group-hover:-translate-x-0.5 group-hover:scale-110"
            strokeWidth={3}
          />
          <span className="text-sm font-medium">
            {from && from !== "/home" ? "Go to Home" : "Go Back"}
          </span>
        </button>
      </div>

      {/* Left side: Form */}
      <div className="w-full md:w-[70%] flex items-center justify-center px-6 sm:px-8 md:px-16 pt-14 pb-6 md:pt-16 md:pb-0">
        <div className="w-full max-w-md">
          <div className="md:hidden flex flex-col items-center mb-10">
            <img
              src={Logo}
              alt="SlabGuard Logo"
              className="w-18 h-18 object-contain mb-2 drop-shadow-md"
            />
            <p className="text-xs sm:text-[14px] text-gray-400 dark:text-gray-500 text-center">
              Smart energy saving starts here ⚡
            </p>
          </div>

          <h2 className="text-3xl sm:text-4xl leading-normal font-extrabold text-brand-gradient mb-2 text-left">
            Sign In
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-left text-sm sm:text-base">
            Enter your username/email and password to log in!
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username or Email Field */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-gray-200 mb-2">
                Username or Email<span className="text-brand-blue">*</span>
              </label>
              <div className="relative">
                <LuMail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  name="usernameOREmail"
                  value={loginForm.usernameOREmail}
                  onChange={handleChange}
                  placeholder="e.g., zain86 or zain@example.com"
                  className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-[#1A1A1A] dark:text-white outline-none focus:border-brand-blue transition-all input-focus"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-gray-200 mb-2">
                Password<span className="text-brand-blue">*</span>
              </label>
              <div className="relative">
                <LuLock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginForm.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-[#1A1A1A] dark:text-white outline-none focus:border-brand-blue transition-all input-focus"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition"
                >
                  {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-blue hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Remember Me (optional – just UI for now) */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                Keep me logged in
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative overflow-hidden w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-brand-gradient text-white font-bold shadow-lg group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? "Logging in..." : "Login Now"}
                <LuUser size={18} />
              </span>
              <span className="absolute top-0 left-0 h-full w-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></span>
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
            Not registered yet?{" "}
            <Link
              to="/register"
              className="text-brand-blue font-semibold hover:underline"
            >
              Create an Account
            </Link>
          </p>
          <p className="mt-10 text-xs text-center text-gray-400 dark:text-gray-500">
            © 2026 SlabGuard. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Right side: Visual */}
      <div className="hidden md:w-1/2 md:flex rounded-bl-[90px] items-center justify-center relative overflow-hidden bg-gradient-to-br from-brand-blue via-[#1F4FFF] to-brand-green">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-[-20%] left-[-10%] w-72 h-72 bg-brand-green/50 rounded-full blur-3xl"></div>
        <div className="text-center z-10 px-12">
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-brand-green/30 blur-2xl rounded-full"></div>
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
          <TypingText paraText={paraText} />
        </div>
      </div>
    </div>
  );
};

export default Login;
