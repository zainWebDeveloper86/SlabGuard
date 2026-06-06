import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  LuZap,
  LuChartLine,
  LuTriangleAlert,
  LuLightbulb,
  LuInfo,
  LuHistory,
  LuArrowRight,
} from "react-icons/lu";

import { MeterStatusCard } from "../../components/Common";
import { Link } from "react-router-dom";

// 2. Dummy Data (Missing - Chart ko chalane ke liye zaroori hai)
const usageData = [
  { date: "1", units: 4 },
  { date: "2", units: 6 },
  { date: "3", units: 8 },
  { date: "4", units: 5 },
  { date: "5", units: 9 },
  { date: "6", units: 7 },
  { date: "7", units: 10 },
];

const Home = () => {
  const stats = [
    {
      title: "Current Units",
      value: "142.5",
      unit: "kWh",
      icon: <LuZap size={20} />,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      title: "Predicted Bill",
      value: "₨ 3,850",
      unit: "Est.",
      icon: <LuChartLine size={20} />,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      title: "Slab Status",
      value: "Protective",
      unit: "Safe",
      icon: <LuLightbulb size={20} />,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Welcome back, <span className="text-brand-blue">Zain</span> 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Here’s what’s happening with your energy consumption today.
        </p>
      </div>

      {/* NEW SECTION: METER STATUS CARD INTEGRATED */}
      <MeterStatusCard />

      {/* NEW: PEAK HOUR COUNTDOWN (Proposal Module 2) */}
      <div className="bg-amber-100/50 dark:bg-amber-900/20 border-2 border-dashed border-amber-200 dark:border-amber-800 p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
          <p className="text-sm font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
            Next Peak Window: 6:00 PM – 10:00 PM
          </p>
        </div>
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400">
          Starts in:{" "}
          <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white ml-2">
            03h 45m 12s
          </span>
        </div>
      </div>

      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1E293B] p-7 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-5">
              <div
                className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}
              >
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                {stat.unit}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {stat.title}
              </p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          {/* CONSUMPTION TREND CHART CONTAINER */}
          <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  Consumption Trend
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Visualizing your daily unit usage
                </p>
              </div>
              <div className="flex gap-2">
                <button className="cursor-pointer px-4 py-2 text-xs font-bold bg-brand-blue text-white rounded-xl">
                  Weekly
                </button>
                <button className="cursor-pointer px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                  Monthly
                </button>
              </div>
            </div>

            <div className="w-full h-55 sm:h-65 md:h-75 lg:h-80 bg-white dark:bg-[#1E293B] rounded-3xl sm:rounded-[40px] overflow-hidden group">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={usageData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="dashboardGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                    opacity={0.5}
                  />

                  <XAxis dataKey="date" hide={true} />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="units"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fill="url(#dashboardGradient)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* INSIGHTS SUB-GRID */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/20 p-8 rounded-[35px] relative group overflow-hidden">
              <div className="absolute -right-4 -top-4 text-brand-blue opacity-5 group-hover:opacity-10 transition-opacity">
                <LuTriangleAlert size={120} />
              </div>
              <LuTriangleAlert className="text-brand-blue mb-4" size={28} />
              <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2">
                Peak Hour Alert
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Usage peaks between **7:00 PM – 10:00 PM**. Shifting heavy loads
                can save you significant costs.
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-8 rounded-[35px] relative group overflow-hidden">
              <div className="absolute -right-4 -top-4 text-emerald-500 opacity-5 group-hover:opacity-10 transition-opacity">
                <LuLightbulb size={120} />
              </div>
              <LuLightbulb className="text-emerald-500 mb-4" size={28} />
              <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2">
                Savings Tip
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Keep your monthly units under **200** to maintain your
                "Protective" status and save ~₨ 2,400.
              </p>
            </div>
          </div>

          {/* NEW: SMART SAVING NUDGE (Proposal Module 1) */}
          <div className="md:col-span-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-8 rounded-[35px] relative group overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl text-indigo-500 shadow-sm">
                <LuZap size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900 dark:text-white">
                  Smart Saving Assistant
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reducing your **AC usage by 1.5 hours** daily for the next 5
                  days can save you
                  <span className="text-indigo-600 font-bold"> Rs. 5,200</span>.
                </p>
              </div>
            </div>
          </div>

          {/* FINANCIAL IMPACT TABLE */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-8">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                Financial Impact Analysis
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Comparing current vs potential bill slabs
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                  <tr>
                    <th className="px-8 py-4 text-left">Scenario</th>
                    <th className="px-8 py-4 text-center">Units</th>
                    <th className="px-8 py-4 text-center">Estimated Bill</th>
                    <th className="px-8 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-8 py-6 font-bold text-gray-800 dark:text-gray-200">
                      Current Consumption
                    </td>
                    <td className="px-8 py-6 text-center font-black dark:text-white">
                      142
                    </td>
                    <td className="px-8 py-6 text-center text-emerald-500 font-black">
                      ₨ 3,850
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
                        Safe
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition opacity-70">
                    <td className="px-8 py-6 font-bold text-gray-800 dark:text-gray-200 italic">
                      Slab Jump Alert
                    </td>
                    <td className="px-8 py-6 text-center font-black dark:text-white">
                      201
                    </td>
                    <td className="px-8 py-6 text-center text-red-500 font-black">
                      ₨ 7,400+
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
                        Danger
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-8">
          {/* SLAB PROGRESS */}
          <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="font-black text-lg mb-6 dark:text-white flex gap-3 items-center">
              <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                <LuInfo size={18} />
              </div>
              Slab Progress
            </h3>

            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Consumed
                  </p>
                  <p className="text-xl font-black dark:text-white">
                    142{" "}
                    <span className="text-sm font-normal opacity-50">
                      / 200
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-500 uppercase">
                    Remaining
                  </p>
                  <p className="text-xl font-black text-emerald-500">58</p>
                </div>
              </div>

              <div className="w-full h-3 sm:h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 sm:p-1">
                <div
                  className="h-full bg-brand-gradient rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-all duration-1000"
                  style={{ width: "71%" }}
                ></div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex items-start gap-3">
                <LuTriangleAlert
                  className="text-amber-500 shrink-0"
                  size={16}
                />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-tight font-medium">
                  **Caution:** Crossing 200 units will trigger the
                  "Non-Protective" tax bracket.
                </p>
              </div>
            </div>
          </div>

          {/* BILL BREAKDOWN */}
          <div className="bg-brand-gradient p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
            <LuHistory className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
            <h3 className="font-black text-xl mb-8 relative z-10">
              Monthly Breakdown
            </h3>

            <div className="space-y-5 relative z-10">
              <div className="flex justify-between items-center group/item">
                <span className="text-sm opacity-80 group-hover/item:opacity-100 transition">
                  Cost of Energy
                </span>
                <span className="font-bold tracking-wider italic">₨ 2,150</span>
              </div>
              <div className="flex justify-between items-center group/item">
                <span className="text-sm opacity-80 group-hover/item:opacity-100 transition">
                  Government Taxes
                </span>
                <span className="font-bold tracking-wider italic">₨ 980</span>
              </div>
              <div className="flex justify-between items-center group/item">
                <span className="text-sm opacity-80 group-hover/item:opacity-100 transition">
                  Estimated FPA
                </span>
                <span className="font-bold tracking-wider italic">₨ 720</span>
              </div>

              <div className="pt-6 border-t border-white/20 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Total Bill
                </span>
                <span className="text-3xl font-black drop-shadow-lg">
                  ₨ 3,850
                </span>
              </div>
            </div>
          </div>
          {/* AI ACTION CARD */}
          {/* <div className="bg-white dark:bg-gray-800/20 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 group hover:border-amber-500/50 transition-colors">
            <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              AI Prediction ✨
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Based on your last 3 days, you are likely to finish the month at
              **192 units**. Stay careful on Sundays!
            </p>
            <Link
              to="/predict"
              className="relative w-full py-4 rounded-2xl bg-brand-gradient text-white font-black flex items-center justify-center gap-2 overflow-hidden group shadow-lg shadow-blue-500/20"
            >
              <span className="relative z-10 flex items-center gap-2">
                VIEW FULL PREDICTION <LuArrowRight size={14} />
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition duration-700"></span>
            </Link>
          </div> */}

          {/* UPDATED: AI ACTION CARD WITH WEATHER */}
          <div className="bg-white dark:bg-gray-800/20 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 group hover:border-amber-500/50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                AI Prediction ✨
              </h4>
              {/* Weather Indicator - Added as per proposal */}
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                <span className="text-[10px] font-black text-blue-600 uppercase italic">
                  Sahiwal: 42°C
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              High temperature detected! **Prophet AI** predicts a load spike.
              You are likely to finish at
              <span className="text-red-500 font-bold"> 212 units </span>
              unless you reduce AC usage.
            </p>
            <Link
              to="/predict"
              className="relative w-full py-4 rounded-2xl bg-brand-gradient text-white font-black flex items-center justify-center gap-2 overflow-hidden group shadow-lg shadow-blue-500/20"
            >
              <span className="relative z-10 flex items-center gap-2 text-xs">
                VIEW FULL PREDICTION <LuArrowRight size={14} />
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition duration-700"></span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
