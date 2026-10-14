import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosServerInstance } from "../../axios.js";
import { TypingText } from "../../components/Common";
import Logo from "../../assets/Frame3.svg";
import { LuLock, LuCircleCheck, LuEye, LuEyeOff } from "react-icons/lu";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // No token in the URL at all → this page was reached incorrectly,
  // send them back to request a fresh link instead of showing a dead form.
  useEffect(() => {
    if (!token) {
      toast.error("Invalid access. No reset token found.");
      navigate("/forgot-password", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setIsSubmitting(true);
    try {
      const res = await axiosServerInstance.patch(
        `/user/reset-password?token=${token}`,
        {
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      // Covers both "expired" and "invalid" cases — backend already
      // distinguishes these in its message, we just surface it.
      toast.error(error.response?.data?.message || "Reset failed, try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const paraText =
    "Almost there! Create a strong new password to secure your SlabGuard account.";

  if (!token) return null; // effect above already redirects

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white dark:bg-[#0B1220] transition-colors duration-300">
      {/* --- Left Side: Form --- */}
      <div className="w-full md:w-[70%] flex items-center justify-center px-6 sm:px-8 md:px-16 pt-14 pb-6 md:pt-16 md:pb-0">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-10">
            <img
              src={Logo}
              alt="Logo"
              className="w-18 h-18 object-contain mb-2"
            />
            <h1 className="text-xl font-black text-brand-gradient italic">
              SlabGuard
            </h1>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-gradient mb-2 text-left italic">
            Set New Password
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-left text-sm sm:text-base">
            Choose a strong new password for your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-gray-200 ml-1">
                New Password<span className="text-brand-blue">*</span>
              </label>
              <div className="relative">
                <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  className="w-full pl-12 pr-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-[#1A1A1A] dark:text-white outline-none focus:border-brand-blue transition-all"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition"
                >
                  {showPass ? <LuEyeOff size={20} /> : <LuEye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-gray-200 ml-1">
                Confirm New Password<span className="text-brand-blue">*</span>
              </label>
              <div className="relative">
                <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Repeat your password"
                  className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-[#1A1A1A] dark:text-white outline-none focus:border-brand-blue transition-all"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
                {/* <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition"
                >
                  {showPass ? <LuEyeOff size={20} /> : <LuEye size={20} />}
                </button> */}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative overflow-hidden w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-brand-gradient text-white font-bold shadow-lg group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? "Updating..." : "Update Password"}{" "}
                <LuCircleCheck size={18} />
              </span>
              <span className="absolute top-0 left-0 h-full w-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
            </button>
          </form>

          <p className="mt-10 text-xs text-center text-gray-400 dark:text-gray-500">
            © 2026 SlabGuard. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* --- Right Side: Same Visual --- */}
      <div className="hidden md:w-1/2 md:flex rounded-bl-[90px] items-center justify-center relative overflow-hidden bg-gradient-to-br from-brand-blue via-[#1F4FFF] to-brand-green">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="text-center z-10 px-12">
          <div className="flex justify-center mb-4">
            <img
              src={Logo}
              alt="Logo"
              className="w-40 h-40 object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-white text-5xl font-black tracking-tight mb-3 italic">
            SlabGuard
          </h1>
          <div className="h-1 w-20 bg-brand-green mx-auto rounded-full mb-5"></div>
          <TypingText paraText={paraText} />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
