import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { TypingText } from "../../components/Common";
import Logo from "../../assets/Frame3.svg";
import { LuArrowLeft, LuMail } from "react-icons/lu";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    // Backend logic yahan aayegi (e.g., Axios post request)
    console.log("Password reset link sent to:", email);
    
    setIsSubmitted(true);
    toast.success("Reset link sent to your email!");
  };

  const paraText = "Don't worry! It happens. Enter your email and we'll help you get back on track.";

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white dark:bg-[#0B1220] transition-colors duration-300">
      
      {/* --- Back Button --- */}
      <div className="absolute top-5 left-5 group z-50">
        <button
          onClick={() => navigate("/login")}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 backdrop-blur-md text-gray-700 dark:text-gray-300 hover:bg-brand-gradient transition-all duration-300 shadow-sm hover:shadow-lg outline-none"
        >
          <LuArrowLeft className="transition-all duration-300 group-hover:-translate-x-0.5" strokeWidth={3} />
          <span className="text-sm font-medium">Back to Login</span>
        </button>
      </div>

      {/* --- Left Side: Form --- */}
      <div className="w-full md:w-[70%] flex items-center justify-center px-6 sm:px-8 md:px-16 pt-14 pb-6 md:pt-16 md:pb-0">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-10">
            <img src={Logo} alt="SlabGuard Logo" className="w-18 h-18 object-contain mb-2 drop-shadow-md" />
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">Security First ⚡</p>
          </div>

          {!isSubmitted ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-gradient mb-2 text-left italic">
                Forgot Password?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-left text-sm sm:text-base">
                No worries! Enter your email below to receive a password reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-gray-200 mb-2">
                    Registered Email<span className="text-brand-blue">*</span>
                  </label>
                  <div className="relative">
                    <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-[#1A1A1A] dark:text-white outline-none focus:border-brand-blue transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="relative overflow-hidden w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-brand-gradient text-white font-bold shadow-lg group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                >
                  <span className="relative z-10">Send Reset Link</span>
                  <span className="absolute top-0 left-0 h-full w-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
                </button>
              </form>
            </div>
          ) : (
            /* Success State */
            <div className="text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <LuMail size={40} />
              </div>
              <h2 className="text-3xl font-black dark:text-white mb-2 italic">Check Your Email</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                We've sent a password reset link to <br/>
                <span className="font-bold text-brand-blue">{email}</span>
              </p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-sm font-bold text-gray-400 hover:text-brand-blue transition cursor-pointer underline underline-offset-4"
              >
                Didn't get the email? Try again
              </button>
            </div>
          )}

          <p className="mt-10 text-xs text-center text-gray-400 dark:text-gray-500">
            © 2026 SlabGuard. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* --- Right Side: Same Visual as Login --- */}
      <div className="hidden md:w-1/2 md:flex rounded-bl-[90px] items-center justify-center relative overflow-hidden bg-gradient-to-br from-brand-blue via-[#1F4FFF] to-brand-green">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="text-center z-10 px-12">
          <div className="flex justify-center mb-4">
            <img src={Logo} alt="Logo" className="w-40 h-40 object-contain drop-shadow-2xl animate-pulse" />
          </div>
          <h1 className="text-white text-5xl font-black tracking-tight mb-3">SlabGuard</h1>
          <div className="h-1 w-20 bg-brand-green mx-auto rounded-full mb-5"></div>
          <TypingText paraText={paraText} />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;