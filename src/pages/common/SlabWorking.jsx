import {
  LuCloudDownload,
  LuBrainCircuit,
  LuBellRing,
  LuShieldCheck,
  LuCpu,
  LuGlobe,
  LuArrowRight,
} from "react-icons/lu";
import { Link } from "react-router-dom";

const SlabWorking = () => {
  const steps = [
    {
      step: "01",
      icon: <LuCloudDownload className="w-7 h-7" />,
      title: "Data Synchronization",
      desc: "Connect your MEPCO reference number. We securely fetch your real-time units and billing history.",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-500",
    },
    {
      step: "02",
      icon: <LuBrainCircuit className="w-7 h-7" />,
      title: "AI Analysis",
      desc: "AI models analyze your usage patterns and predict your end-of-month bill.",
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-500",
    },
    {
      step: "03",
      icon: <LuShieldCheck className="w-7 h-7" />,
      title: "Slab Logic",
      desc: "We apply NEPRA slab rules and calculate your exact cost impact.",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-500",
    },
    {
      step: "04",
      icon: <LuBellRing className="w-7 h-7" />,
      title: "Smart Alerts",
      desc: "Get alerts before crossing expensive slabs and save money instantly.",
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-500",
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0B1220] min-h-screen">
      {/* ================= HEADER ================= */}
      <section className="pt-24 pb-20 px-6 text-center bg-gray-50 dark:bg-[#0F172A] border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            How <span className="text-brand-blue">SlabGuard</span> Works
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            A simple yet powerful system powered by AI that helps you stay in
            the safe electricity slab and avoid high bills.
          </p>
        </div>
      </section>

      {/* ================= TIMELINE ================= */}
      <section className="py-24 px-6 max-w-6xl mx-auto relative">
        {/* vertical line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-gray-200 dark:via-gray-700 to-transparent -translate-x-1/2"></div>

        <div className="space-y-20 md:space-y-28">
          {steps.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center gap-10 ${
                index % 2 !== 0 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* TEXT SIDE */}
              <div className="md:w-1/2 text-center md:text-left px-4">
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5 shadow-sm ${item.bg} ${item.text}`}
                >
                  {item.icon}
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  <span className="text-brand-blue mr-2">{item.step}.</span>
                  {item.title}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* VISUAL SIDE */}
              {/* VISUAL SIDE */}
              <div className="relative md:w-1/2 flex justify-center">
                {/* timeline dot */}
                <div className="hidden md:flex w-12 h-12 rounded-full bg-brand-blue text-white items-center justify-center font-bold shadow-xl absolute left-[-26px] top-1/2 -translate-y-1/2 z-10">
                  {item.step}
                </div>

                {/* card */}
                <div
                  className="w-full max-w-xs h-44 sm:h-48 rounded-3xl bg-white dark:bg-[#1E293B] 
  border border-gray-100 dark:border-gray-800 shadow-md flex flex-col items-center justify-center 
  relative overflow-hidden group px-4"
                >
                  {/* glow background */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 
    bg-gradient-to-r from-brand-blue/10 to-brand-green/10"
                  ></div>

                  {/* ICON / STATUS */}
                  <div className="z-10 flex flex-col items-center gap-3">
                    {/* animated loader */}
                    <div className="flex items-end gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 sm:w-2 h-6 sm:h-8 bg-brand-blue rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>

                    {/* text */}
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Processing data...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TECH ================= */}
      <section className="py-24 bg-brand-gradient text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Built with Modern Tech
            </h2>
            <p className="text-blue-100">Fast • Intelligent • Scalable</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TechCard
              icon={<LuGlobe />}
              title="MERN Stack"
              desc="Modern frontend with scalable backend."
            />

            <TechCard
              icon={<LuBrainCircuit />}
              title="AI Engine"
              desc="Predictive intelligence powered by Python."
            />

            <TechCard
              icon={<LuCpu />}
              title="Real-time Sync"
              desc="Auto-fetch your billing data instantly."
            />
          </div>
        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-black dark:text-white mb-10">
          Your Data is Safe 🔒
        </h2>

        <div className="p-8 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1E293B] text-left shadow-sm">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
            SlabGuard only accesses public electricity data using your reference
            number. We never ask for passwords. Your data stays encrypted and
            private.
          </p>

          <div className="mt-6 flex items-center gap-2 font-bold text-brand-blue">
            <LuShieldCheck /> Secure & Trusted System
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16">
          <Link
            to="/login"
            className="relative inline-flex items-center gap-2 px-10 py-4 rounded-full 
    bg-brand-gradient text-white font-bold overflow-hidden group 
    hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Saving Now
              <LuArrowRight />
            </span>

            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition duration-700"></span>
          </Link>
        </div>
      </section>
    </div>
  );
};

/* COMPONENTS */

const TechCard = ({ icon, title, desc }) => (
  <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 text-center hover:scale-105 transition-all duration-300">
    <div className="mb-4 text-brand-green text-3xl flex justify-center">
      {icon}
    </div>
    <h4 className="text-xl font-bold mb-2">{title}</h4>
    <p className="text-sm text-blue-100">{desc}</p>
  </div>
);

export default SlabWorking;
