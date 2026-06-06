import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Logo from "../../assets/Frame3.svg";
import { TypingText } from "../../components/Common";
import { LuArrowLeft } from "react-icons/lu";

const Login = () => {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const location = useLocation();

  // ✅ Get from state (ProtectedRoute se aayega)
  const from = location.state?.from?.pathname;

  // console.log("Full location.state:", location.state);
  // console.log("From path:", from);

  // Agar user pehlay se login hai, to usay Home par bhej do
  useEffect(() => {
    if (!loading && user?.isLogin) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate, loading]);

  // user ko os page par bajh do jaha sa logout ka time aya tha

  // if (!loading && user?.isLogin) {
  //     navigate(from, { replace: true });
  //   }
  // }, [user, navigate, loading, from]);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = (e) => {
    e.preventDefault();

    if (!loginForm.email || !loginForm.password)
      return toast.error("Please fill all fields");
    const UserData = {
      tokenID: "fake-jwt-token-" + Math.random().toString(36).substr(2),
      role: "user",
      email: loginForm.email,
    };

    login(UserData);
    toast.success("Login successfully!");
    // Aik chota sa delay taake state update confirm ho jaye
    // setTimeout(() => {
    navigate("/home", { replace: true });
    // }, 1200);
  };

  if (loading) return null;

  const paraText =
    "AI-powered smart saving assistant & billing forecaster.Track usage, save money, and stay ahead.";

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white dark:bg-[#0B1220] transition-colors duration-300">
      {/* --- Top Side: Login Form --- */}

      <div className="absolute top-5 left-5 group">
        <button
          onClick={() => {
            if (from && from !== "/home") {
              navigate("/");
            } else {
              navigate(-1);
            }
          }}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 backdrop-blur-md text-gray-700 dark:text-gray-300 hover:bg-brand-gradient transition-all duration-300 shadow-sm hover:shadow-lg hover:font-extrabold outline-none"
        >
          <LuArrowLeft
            className="transition-all duration-300 group-hover:-translate-x-0.5 group-hover:scale-110"
            strokeWidth={3}
          />

          <span className="text-sm font-medium hover:font-extrabold">
            {from && from !== "/home" ? "Go to Home" : "Go Back"}
          </span>
        </button>
      </div>

      {/* --- Left Side: Login Form --- */}
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
              Smart energy saving starts here ⚡
            </p>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl leading-normal font-extrabold text-brand-gradient mb-2 text-left">
            Sign In
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mb-8 text-left text-sm sm:text-base">
            Enter your email and password to log in!
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-gray-200 mb-2">
                Email<span className="text-brand-blue">*</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-[#1A1A1A] dark:text-white outline-none focus:border-brand-blue transition-all input-focus"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-gray-200 mb-2">
                Password<span className="text-brand-blue">*</span>
              </label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-[#1A1A1A] dark:text-white outline-none focus:border-brand-blue transition-all input-focus"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
              />
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-blue hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                Keep me logged in
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="relative overflow-hidden w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r text-white font-bold shadow-lg group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer bg-brand-gradient"
            >
              <span className="relative z-10">Login Now</span>

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

      {/* --- Right Side: Visual Section --- */}
      <div className="hidden md:w-1/2 md:flex rounded-bl-[90px] items-center justify-center relative overflow-hidden bg-gradient-to-br from-brand-blue via-[#1F4FFF] to-brand-green">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-[-20%] left-[-10%] w-72 h-72 bg-brand-green/50 rounded-full blur-3xl"></div>

        <div className="text-center z-10 px-12">
          {/* Logo Icon  */}
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

          {/* Title */}
          <h1 className="text-white text-5xl font-black tracking-tight mb-3">
            SlabGuard
          </h1>

          {/* Accent Line */}
          <div className="h-1 w-20 bg-brand-green mx-auto rounded-full mb-5"></div>

          {/* Description */}
          <TypingText paraText={paraText} />
        </div>
      </div>
    </div>
  );
};

export default Login;
