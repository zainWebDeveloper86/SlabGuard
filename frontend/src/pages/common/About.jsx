import {
  LuTarget,
  LuEye,
  LuCpu,
  LuShieldCheck,
  LuUsers,
  LuTrophy,
  LuSparkles,
  LuArrowRight,
} from "react-icons/lu";
import { Link } from "react-router-dom";
import dashboard_img from "../../assets/dashboard_img.png";
import { useAuth } from "../../hooks/useAuth";

const About = () => {
  const { user } = useAuth();
  const isDashboard = user?.isLogin;

  const values = [
    {
      icon: <LuTarget className="text-brand-blue" />,
      title: "Our Mission",
      desc: "To empower everyday consumers with data-driven insights to fight inflation and rising electricity costs.",
    },
    {
      icon: <LuEye className="text-brand-green" />,
      title: "Our Vision",
      desc: "Becoming Pakistan's leading smart energy companion, making energy management accessible for everyone.",
    },
    {
      icon: <LuCpu className="text-purple-500" />,
      title: "Our Tech",
      desc: "Leveraging MERN Stack and Python-based AI models to provide 95% accurate bill predictions.",
    },
  ];

  return (
    <div
      className={`bg-white dark:bg-[#0B1220] ${!isDashboard ? "min-h-screen" : ""}`}
    >
      {/* ================= HERO SECTION ================= */}
      <div
        className={`relative px-6 overflow-hidden transition-all duration-500 ${
          isDashboard
            ? "pt-12 pb-16 bg-white dark:bg-[#0B1220]"
            : "pt-28 pb-24 bg-gray-50 dark:bg-[#0F172A]"
        }`}
      >
        {/* Background Decorative Element (Hidden in Dashboard for clean look) */}
        {!isDashboard && (
          <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-gradient opacity-5 rounded-l-[120px] hidden lg:block"></div>
        )}

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          {/* TEXT CONTENT */}
          <div className={`${isDashboard ? "w-full text-center" : "lg:w-1/2"}`}>
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-widest ${isDashboard ? "mx-auto" : ""}`}
            >
              <LuSparkles className="w-3 h-3" />
              {isDashboard
                ? "Welcome to the Mission"
                : "Our Story"}
            </div>

            <h1
              className={`font-black text-gray-900 dark:text-white mb-6 leading-tight ${
                isDashboard ? "text-3xl md:text-5xl" : "text-4xl md:text-6xl"
              }`}
            >
              {isDashboard ? (
                <>
                  You're part of the{" "}
                  <span className="text-brand-gradient bg-clip-text text-transparent">
                    Energy Revolution
                  </span>
                </>
              ) : (
                <>
                  Empowering Pakistan to <br />{" "}
                  <span className="text-brand-gradient bg-clip-text text-transparent">
                    Save Smarter
                  </span>
                </>
              )}
            </h1>

            <p
              className={`text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8 ${isDashboard ? "max-w-3xl mx-auto" : ""}`}
            >
              {isDashboard
                ? "SlabGuard is your personal AI energy companion. We're working around the clock to ensure your MEPCO bills are no longer a mystery. Together, we're optimizing every unit."
                : "SlabGuard was built to solve unpredictable electricity billing in Pakistan. We turn complex MEPCO slab calculations into simple, real-time insights using AI."}
            </p>

            {/* STATS (Only show on Public Page to build trust) */}
            {!isDashboard && (
              <div className="flex flex-wrap gap-8 items-center border-t border-gray-200 dark:border-gray-800 pt-8">
                <div>
                  <h4 className="text-3xl font-black text-brand-blue">2026</h4>
                  <p className="text-sm text-gray-500">Launch Year</p>
                </div>
                <div className="w-px h-12 bg-gray-200 dark:bg-gray-800"></div>
                <div>
                  <h4 className="text-3xl font-black text-brand-green">100%</h4>
                  <p className="text-sm text-gray-500">Privacy Focused</p>
                </div>
                <div className="w-px h-12 bg-gray-200 dark:bg-gray-800"></div>
                <div>
                  <h4 className="text-3xl font-black text-orange-500">AI</h4>
                  <p className="text-sm text-gray-500">Powered System</p>
                </div>
              </div>
            )}
          </div>

          {/* IMAGE SECTION (Only show on Public Page) */}
          {!isDashboard && (
            <div className="lg:w-1/2 w-full">
              <div className="relative group">
                <div className="absolute -inset-4 bg-brand-gradient rounded-[50px] opacity-20 blur-xl group-hover:opacity-30 transition"></div>
                <div className="relative bg-white dark:bg-[#1E293B] p-2 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <img
                    src={dashboard_img}
                    alt="SlabGuard Dashboard"
                    className="rounded-[32px] w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-black/5 dark:ring-white/10"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= VALUES SECTION ================= */}
      <div
        className={`px-6 max-w-6xl mx-auto ${isDashboard ? "pt-8 pb-16" : "py-28"}`}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
            What Defines Us
          </h2>
          <div className="h-1.5 w-20 bg-gradient-to-r from-green-500 to-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {values.map((v, i) => (
            <div
              key={i}
              className="p-8 xl:p-10 rounded-[40px] bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-3xl mb-8">
                {v.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white">
                {v.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= WHY IT MATTERS ================= */}
      <div
        className={`py-20 bg-brand-gradient text-white px-8 md:px-12 text-center transition-all ${
          isDashboard ? "mx-0 rounded-3xl mb-10" : "mx-6 rounded-[60px] mb-24"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            Why SlabGuard Matters
          </h2>
          <p className="text-blue-100 mb-12">
            Electricity bills in Pakistan are unpredictable. We make them
            predictable, transparent, and optimized.
          </p>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20">
              <LuTrophy className="mb-4 text-brand-green w-8 h-8" />
              <h4 className="text-xl font-bold mb-2">Clarity Over Confusion</h4>
              <p className="text-blue-50 text-sm">
                We simplify complex slab calculations into human-friendly
                insights.
              </p>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20">
              <LuShieldCheck className="mb-4 text-brand-green w-8 h-8" />
              <h4 className="text-xl font-bold mb-2">Zero Hidden Surprises</h4>
              <p className="text-blue-50 text-sm">
                No guessing. No surprises. Only real-time, transparent billing
                predictions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CTA (PUBLIC ONLY) ================= */}
      {!isDashboard && (
        <section className="pb-28 px-6 text-center">
          <LuUsers
            size={48}
            className="mx-auto text-brand-blue mb-6 opacity-40"
          />
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6">
            Join the Energy Revolution
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto text-lg">
            Be among the first users taking control of their electricity bills
            with AI-powered insights.
          </p>
          <Link
            to="/register"
            className="relative inline-flex items-center gap-2 px-10 py-4 rounded-full bg-brand-gradient text-white font-bold overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              Create Your Account <LuArrowRight />
            </span>
            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition duration-700"></span>
          </Link>
        </section>
      )}
    </div>
  );
};

export default About;
