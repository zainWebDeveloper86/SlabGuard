import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  LuZap, LuBrain, LuBell, LuHistory,
  LuLightbulb, LuLayoutDashboard, LuArrowRight, LuTriangleAlert
} from "react-icons/lu";

const Startup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.isLogin) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <LuLayoutDashboard />,
      title: "Live Slab Tracking",
      desc: "Stay updated with your current unit consumption and real-time slab status.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <LuBrain />,
      title: "AI Bill Predictions",
      desc: "AI predicts your bill before month-end based on real usage.",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: <LuBell />,
      title: "Smart Alerts",
      desc: "Instant alerts before entering high-cost slabs.",
      gradient: "from-orange-500 to-red-600",
    },
    {
      icon: <LuHistory />,
      title: "Usage History",
      desc: "Compare monthly usage trends and optimize decisions.",
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      icon: <LuLightbulb />,
      title: "Energy Tips",
      desc: "Smart suggestions to reduce your electricity bill.",
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      icon: <LuZap />,
      title: "No Hardware",
      desc: "Start instantly — no device or setup required.",
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <div className="overflow-hidden bg-white dark:bg-[#0B1220]">

      {/* ================= HERO ================= */}
      <section className="relative pt-24 pb-32 px-6 text-center bg-brand-gradient text-white rounded-b-[60px] md:rounded-b-[100px] shadow-2xl overflow-hidden">

        {/* Background Glow */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="max-w-5xl mx-auto relative z-10">

          {/* Badge */}
          <div className="inline-block px-5 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-widest uppercase animate-bounce">
            ⚡ Smart Energy Management
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            Control Your Bill Before
            <br className="hidden md:block" />
            It <span className="text-brand-green">Controls You</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            SlabGuard tracks your usage, predicts bills, and protects you from
            expensive slab jumps — all powered by AI.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link
              to="/register"
              className="group relative bg-white text-brand-blue px-10 py-4 rounded-full font-black text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Start Saving</span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition duration-700"></span>
            </Link>

            <Link
              to="/how-it-works"
              className="px-10 py-4 rounded-full font-bold border border-white/30 backdrop-blur-md hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              How it Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-white/20 max-w-2xl mx-auto">
            <Stat number="5K+" label="Users" />
            <Stat number="₨2M+" label="Saved" />
            <Stat number="98%" label="Accuracy" />
          </div>
        </div>
      </section>

      {/* ================= PROBLEM ================= */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center rounded-xl mb-6">
              <LuTriangleAlert size={24} />
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              One Unit Can
              <br />
              <span className="text-red-500">Double Your Bill</span>
            </h2>

            <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 leading-relaxed">
              Crossing slab limits doesn't just increase one unit price — it increases
              your entire bill. SlabGuard protects you before that happens.
            </p>

            <ul className="space-y-4">
              {[
                "Real-time slab alerts",
                "Protective slab tracking",
                "Simple tax breakdown",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-semibold">
                  <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT */}
          <div className="p-8 bg-gray-50 dark:bg-[#1E293B] rounded-[30px] shadow-inner border border-gray-100 dark:border-gray-800">
            <SlabProgress label="Safe Zone" percent="90%" color="bg-green-500" />
            <SlabProgress label="Warning Zone" percent="50%" color="bg-orange-500" />
            <SlabProgress label="Danger Zone" percent="20%" color="bg-red-500" />
          </div>

        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-24 bg-gray-50/50 dark:bg-[#0B1220] border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <div className="h-1.5 w-20 bg-gradient-to-r from-green-500 to-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>

        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center bg-brand-gradient text-white rounded-[40px] p-12 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Start Saving Today
          </h2>

          <p className="text-blue-100 mb-10">
            Join smart users who are already controlling their electricity bills using AI.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-brand-blue px-10 py-4 rounded-full font-bold hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Get Started <LuArrowRight />
          </Link>
        </div>
      </section>

    </div>
  );
};

/* ===== COMPONENTS ===== */

const Stat = ({ number, label }) => (
  <div>
    <div className="text-2xl md:text-3xl font-black">{number}</div>
    <div className="text-xs text-blue-100">{label}</div>
  </div>
);

const SlabProgress = ({ label, percent, color }) => (
  <div className="mb-6">
    <div className="flex justify-between mb-2 text-sm font-semibold dark:text-white">
      <span>{label}</span>
      <span className="text-gray-400">{percent}</span>
    </div>
    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: percent }}></div>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, desc, gradient }) => (
  <div className="group p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl mb-6 group-hover:rotate-6`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 dark:text-white">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
      {desc}
    </p>
  </div>
);

export default Startup;