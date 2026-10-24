import { useState, useEffect } from "react";
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
  LuCpu,
  LuSparkles,
} from "react-icons/lu";

import { MeterStatusCard } from "../../components/Common";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { axiosServerInstance } from "../../axios.js";
import toast from "react-hot-toast";
import DashboardWeather from "../../components/Common/DashboardWeather";

const PendingBadge = ({ note }) => (
  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-400 px-2 py-1 rounded-full border border-dashed border-gray-300 dark:border-gray-700">
    ⏳ Pending — {note}
  </span>
);

const SourceBadge = ({ note }) => (
  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-500/30">
    <LuCpu size={10} /> {note}
  </span>
);

const formatDateLabel = (isoDate) => {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const StatCard = ({ title, value, unit, icon, color, bg }) => (
  <div className="bg-white dark:bg-[#1E293B] p-7 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 group">
    <div className="flex justify-between items-start mb-5">
      <div
        className={`p-4 rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110`}
      >
        {icon}
      </div>
      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
        {unit}
      </span>
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
        {title}
      </p>
      <h3 className="text-3xl font-black text-gray-900 dark:text-white">
        {value}
      </h3>
    </div>
  </div>
);

const Home = () => {
  const { loading, user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [dailyUsage, setDailyUsage] = useState([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, dailyRes] = await Promise.all([
          axiosServerInstance.get("/billing/summary"),
          axiosServerInstance.get("/usage/daily/me"),
        ]);

        if (summaryRes.data.success) setSummary(summaryRes.data);
        if (dailyRes.data.success) setDailyUsage(dailyRes.data.days);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load dashboard data",
        );
      } finally {
        setIsLoadingSummary(false);
      }
    };
    fetchData();
  }, []);

  const hasData = summary?.hasData;
  const threshold = summary?.protectedThreshold ?? 200;

  // LIVE this-month numbers — this is the whole fix.
  const liveMonth = summary?.liveMonth;
  const consumedSoFar = liveMonth?.actualUnitsSoFar ?? 0;
  const daysLogged = liveMonth?.daysLogged ?? 0;
  const prediction = liveMonth?.prediction; // null if not generated yet

  const remaining = Math.max(threshold - consumedSoFar, 0);
  const progressPercent = Math.min((consumedSoFar / threshold) * 100, 100);

  const lastBilled = summary?.lastBilled; // historical, secondary now

  const chartData = [...dailyUsage]
    .reverse()
    .map((d) => ({ date: formatDateLabel(d.date), units: d.totalUnits }));

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:justify-between items-start gap-5">
        <div className="flex flex-col gap-1 min-w-0">
          {/* greeting section */}
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Welcome back,{" "}
            <span className="text-brand-blue">
              {!loading ? user?.fullName : "Hi User"}
            </span>{" "}
            👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Here's what's happening with your energy consumption today.
          </p>
        </div>
        <DashboardWeather />
      </div>

      <MeterStatusCard />

      {/* PEAK HOUR COUNTDOWN — still pending */}
      {user?.meterType !== "single" && (
        <div className="relative bg-amber-100/50 dark:bg-amber-900/20 border-2 border-dashed border-amber-200 dark:border-amber-800 p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="absolute top-3 right-3">
            <PendingBadge note="Peak-hours config in Tariff model" />
          </div>
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
      )}

      {/* ================= STATS GRID — now LIVE, not last-bill ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoadingSummary ? (
          <div className="md:col-span-3 text-center text-gray-400 font-bold py-6">
            Loading your stats...
          </div>
        ) : !hasData ? (
          <div className="md:col-span-3 bg-white dark:bg-[#1E293B] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center">
            <p className="text-gray-500 font-bold">
              No usage data yet — hit "Sync" above, or run the IoT simulator, to
              populate your dashboard.
            </p>
          </div>
        ) : (
          <>
            <StatCard
              title="Units Used This Month"
              value={consumedSoFar}
              unit={`${daysLogged} day${daysLogged === 1 ? "" : "s"} logged`}
              icon={<LuZap size={20} />}
              color="text-blue-500"
              bg="bg-blue-50 dark:bg-blue-500/10"
            />
            <StatCard
              title="Projected Bill"
              value={prediction ? `₨ ${prediction.predictedBill}` : "—"}
              unit={prediction ? "AI Forecast" : "Not generated yet"}
              icon={<LuChartLine size={20} />}
              color="text-emerald-500"
              bg="bg-emerald-50 dark:bg-emerald-500/10"
            />
            <StatCard
              title="Slab Status"
              value={
                prediction
                  ? prediction.category === "lifeline"
                    ? "Lifeline"
                    : prediction.category === "protected"
                      ? "Protective"
                      : "Non-Protective"
                  : "—"
              }
              unit={
                prediction
                  ? prediction.category === "protected"
                    ? "Safe"
                    : "Watch"
                  : "Generate a prediction"
              }
              icon={<LuLightbulb size={20} />}
              color="text-amber-500"
              bg="bg-amber-50 dark:bg-amber-500/10"
            />
          </>
        )}
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          {/* CONSUMPTION TREND — real, sourced from DailyUsage (IoT simulator) */}
          <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  Consumption Trend
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Visualizing your daily unit usage
                </p>
              </div>
              {dailyUsage.length > 0 ? (
                <SourceBadge note="Data source: IoT (simulator)" />
              ) : (
                <PendingBadge note="No daily readings yet" />
              )}
            </div>

            {chartData.length === 0 ? (
              <p className="text-sm text-gray-400 font-bold text-center py-16">
                No daily readings yet — run the simulator backfill script, then
                check back.
              </p>
            ) : (
              <div className="w-full h-55 sm:h-65 md:h-75 lg:h-80 bg-white dark:bg-[#1E293B] rounded-3xl sm:rounded-[40px] overflow-hidden group">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
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
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
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
            )}
          </div>

          {/* INSIGHTS SUB-GRID — generic educational content, unchanged */}
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
                Keep your monthly units under **{threshold}** to maintain your
                "Protective" status.
              </p>
            </div>
          </div>

          {/* SMART SAVING NUDGE — still pending */}
          <div className="md:col-span-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-8 rounded-[35px] relative group overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <PendingBadge note="Smart Saving Assistant engine" />
            </div>
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

          {/* THIS MONTH: SO FAR vs PROJECTED — replaces the old fake "Financial Impact" table */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-8">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                This Month's Trajectory
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Live usage so far vs your AI-projected month-end
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                  <tr>
                    <th className="px-8 py-4 text-left">Stage</th>
                    <th className="px-8 py-4 text-center">Units</th>
                    <th className="px-8 py-4 text-center">Bill</th>
                    <th className="px-8 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-8 py-6 font-bold text-gray-800 dark:text-gray-200">
                      So Far ({daysLogged} days)
                    </td>
                    <td className="px-8 py-6 text-center font-black dark:text-white">
                      {consumedSoFar}
                    </td>
                    <td className="px-8 py-6 text-center text-gray-400 font-bold text-xs">
                      Partial month — billing is monthly
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
                        In Progress
                      </span>
                    </td>
                  </tr>
                  {prediction ? (
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="px-8 py-6 font-bold text-gray-800 dark:text-gray-200">
                        Projected Month-End
                      </td>
                      <td className="px-8 py-6 text-center font-black dark:text-white">
                        {prediction.predictedUnits}
                      </td>
                      <td
                        className={`px-8 py-6 text-center font-black ${
                          prediction.category === "protected"
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                      >
                        ₨ {prediction.predictedBill}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${
                            prediction.category === "protected"
                              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                              : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                          }`}
                        >
                          {prediction.category === "protected"
                            ? "Safe"
                            : "Danger"}
                        </span>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-8 py-6 text-center text-gray-400 font-bold"
                      >
                        <Link
                          to="/predict"
                          className="text-brand-blue hover:underline"
                        >
                          Generate a prediction
                        </Link>{" "}
                        to see your projected month-end.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-8">
          {/* SLAB PROGRESS — now LIVE, using actual units so far this month */}
          <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="font-black text-lg mb-6 dark:text-white flex gap-3 items-center">
              <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                <LuInfo size={18} />
              </div>
              Slab Progress
            </h3>

            {!hasData ? (
              <p className="text-sm text-gray-400 font-bold">
                Sync your account or run the simulator to see this.
              </p>
            ) : (
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Consumed (so far)
                    </p>
                    <p className="text-xl font-black dark:text-white">
                      {consumedSoFar}{" "}
                      <span className="text-sm font-normal opacity-50">
                        / {threshold}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-500 uppercase">
                      Remaining
                    </p>
                    <p className="text-xl font-black text-emerald-500">
                      {remaining}
                    </p>
                  </div>
                </div>

                <div className="w-full h-3 sm:h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 sm:p-1">
                  <div
                    className="h-full bg-brand-gradient rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex items-start gap-3">
                  <LuTriangleAlert
                    className="text-amber-500 shrink-0"
                    size={16}
                  />
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-tight font-medium">
                    <strong>Caution:</strong> Crossing {threshold} units THIS
                    month will trigger the "Non-Protective" tax bracket.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI PREDICTION — now real, replaces old hardcoded fake numbers */}
          <div className="bg-white dark:bg-gray-800/20 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 group hover:border-amber-500/50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                AI Prediction ✨
              </h4>
              {!prediction && <PendingBadge note="Not generated yet" />}
            </div>
            {prediction ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Based on your usage this month, you're projected to finish at
                <span
                  className={`font-bold ${prediction.category === "protected" ? "text-emerald-500" : "text-red-500"}`}
                >
                  {" "}
                  {prediction.predictedUnits} units
                </span>
                .{" "}
                {prediction.savingSuggestion?.message ??
                  "You're on track to stay within the protected threshold."}
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                <LuSparkles className="inline mb-1" size={14} /> No prediction
                yet for this month. Generate one to see a live, day-by-day
                forecast of where you'll land.
              </p>
            )}
            <Link
              to="/predict"
              className="relative w-full py-4 rounded-2xl bg-brand-gradient text-white font-black flex items-center justify-center gap-2 overflow-hidden group shadow-lg shadow-blue-500/20"
            >
              <span className="relative z-10 flex items-center gap-2 text-xs">
                {prediction ? "VIEW FULL PREDICTION" : "GENERATE PREDICTION"}{" "}
                <LuArrowRight size={14} />
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition duration-700"></span>
            </Link>
          </div>

          {/* LAST CONFIRMED BILL — historical, now clearly secondary/contextual */}
          <div className="bg-brand-gradient p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
            <LuHistory className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
            <h3 className="font-black text-xl mb-1 relative z-10">
              Last Confirmed Bill
            </h3>
            <p className="text-[10px] uppercase tracking-widest opacity-70 mb-7 relative z-10">
              Historical — from MEPCO sync
            </p>

            {!lastBilled ? (
              <p className="relative z-10 text-sm text-blue-100 font-medium">
                No bills synced yet — hit "Sync" above.
              </p>
            ) : (
              <div className="space-y-5 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">{lastBilled.month}</span>
                  <span className="font-bold tracking-wider italic">
                    {lastBilled.actualUnits} units
                  </span>
                </div>
                <div className="flex justify-between items-center group/item">
                  <span className="text-sm opacity-80 group-hover/item:opacity-100 transition">
                    Energy Cost
                  </span>
                  <span className="font-bold tracking-wider italic">
                    ₨ {lastBilled.calculatedBill.energyCost}
                  </span>
                </div>
                <div className="flex justify-between items-center group/item">
                  <span className="text-sm opacity-80 group-hover/item:opacity-100 transition">
                    GST
                  </span>
                  <span className="font-bold tracking-wider italic">
                    ₨ {lastBilled.calculatedBill.gstAmount}
                  </span>
                </div>
                <div className="flex justify-between items-center group/item">
                  <span className="text-sm opacity-60 italic">
                    FPA (Fuel Price Adj.)
                  </span>
                  <span className="text-xs font-bold opacity-60">
                    Not available yet
                  </span>
                </div>

                <div className="pt-6 border-t border-white/20 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    MEPCO's Actual Bill
                  </span>
                  <span className="text-2xl font-black drop-shadow-lg">
                    ₨ {lastBilled.actualBillAmount}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
