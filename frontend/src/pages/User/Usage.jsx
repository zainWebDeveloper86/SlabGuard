import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  LuZap,
  LuTrendingUp,
  LuMousePointer2,
  LuInfo,
  LuCpu,
  LuClock,
} from "react-icons/lu";
import toast from "react-hot-toast";
import { axiosServerInstance } from "../../axios.js";
import { useAuth } from "../../hooks/useAuth.js"; // ✅ ADDED

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

const Usage = () => {
  const { user } = useAuth(); // ✅ ADDED
  const [history, setHistory] = useState([]);
  const [dailyUsage, setDailyUsage] = useState([]);
  const [threshold, setThreshold] = useState(200);
  const [hourlyData, setHourlyData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, tariffRes, dailyRes] = await Promise.all([
          axiosServerInstance.get("/billing/history/me"),
          axiosServerInstance.get("/tariff"),
          axiosServerInstance.get("/usage/daily/me"),
        ]);

        if (historyRes.data.success) setHistory(historyRes.data.billHistory);
        if (tariffRes.data.success) {
          const slabs = tariffRes.data.tariff.protectedSlabs;
          if (slabs?.length) setThreshold(slabs[slabs.length - 1].rangeTo);
        }
        if (dailyRes.data.success) {
          setDailyUsage(dailyRes.data.days);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load usage data",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchHourlyData = async (date) => {
    try {
      const res = await axiosServerInstance.get("/usage/hourly/me", {
        params: { date: date.toISOString().slice(0, 10) },
      });
      if (res.data.success) setHourlyData(res.data.hourlyData);
    } catch (error) {
      console.error("Failed to fetch hourly data:", error);
    }
  };

  useEffect(() => {
    fetchHourlyData(selectedDate);
  }, [selectedDate]);

  const latest = history[0];
  const avgMonthlyCost = history.length
    ? Math.round(
        history.reduce((sum, h) => sum + h.billAmount, 0) / history.length,
      )
    : 0;

  const withinThreshold = history.filter((h) => h.units <= threshold).length;
  const aboveThreshold = history.length - withinThreshold;
  const distributionData = [
    { name: "Within Threshold", value: withinThreshold, color: "#10b981" },
    { name: "Above Threshold", value: aboveThreshold, color: "#ef4444" },
  ];

  const chartData = [...dailyUsage]
    .reverse()
    .map((d) => ({ date: formatDateLabel(d.date), units: d.totalUnits }));

  const peakDay = dailyUsage.length
    ? dailyUsage.reduce((max, d) => (d.totalUnits > max.totalUnits ? d : max))
    : null;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400 font-bold">
        Loading usage data...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white">
            Usage Analytics
          </h1>
          <p className="text-gray-500 font-medium">
            Deep dive into your consumption patterns
          </p>
        </div>
        {dailyUsage.length > 0 ? (
          <SourceBadge note="Data source: IoT (simulator)" />
        ) : (
          <PendingBadge note="No daily readings yet — run the simulator" />
        )}
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1E293B] p-4 sm:p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase mb-1">
            Latest Month Units
          </p>
          <h4 className="text-2xl font-black dark:text-white">
            {latest ? `${latest.units} kWh` : "—"}
          </h4>
          <p className="text-xs text-gray-500 mt-2">
            {latest?.month || "No data synced yet"}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 sm:p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase mb-1">
            Peak Day
          </p>
          {peakDay ? (
            <>
              <h4 className="text-2xl font-black dark:text-white">
                {formatDateLabel(peakDay.date)}
              </h4>
              <p className="text-xs text-gray-500 mt-2">
                Highest: {peakDay.totalUnits} kWh
              </p>
            </>
          ) : (
            <>
              <h4 className="text-2xl font-black text-gray-300 dark:text-gray-600">
                —
              </h4>
              <p className="text-xs text-gray-400 mt-2">No daily data yet</p>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 sm:p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase mb-1">
            Avg. Monthly Bill
          </p>
          <h4 className="text-2xl font-black dark:text-white">
            {history.length ? `Rs. ${avgMonthlyCost}` : "—"}
          </h4>
          <p className="text-xs text-gray-500 mt-2">
            Across {history.length} synced months
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8">
        {/* LEFT: DAILY TREND */}
        <div className="md:col-span-2 lg:col-span-8 bg-white dark:bg-[#1E293B] p-4 sm:p-6 md:p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h3 className="font-black text-xl dark:text-white flex items-center gap-2">
              <LuTrendingUp className="text-brand-blue" /> Daily Consumption
              Trend
            </h3>
            {dailyUsage.length > 0 && (
              <span className="text-[10px] text-gray-400 font-bold">
                Last {dailyUsage.length} day(s)
              </span>
            )}
          </div>

          {chartData.length === 0 ? (
            <p className="text-sm text-gray-400 font-bold text-center py-16">
              No daily readings yet — run the simulator backfill script to
              generate data.
            </p>
          ) : (
            <div className="h-[250px] sm:h-[300px] md:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="usageGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "15px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="units"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#usageGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* RIGHT: MONTH DISTRIBUTION */}
        <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-[#1E293B] p-4 sm:p-6 md:p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <h3 className="font-black text-xl dark:text-white flex items-center gap-2 mb-6">
            <LuZap className="text-amber-500" /> Month Distribution
          </h3>

          {history.length === 0 ? (
            <p className="text-sm text-gray-400 font-bold text-center py-10">
              No synced months yet.
            </p>
          ) : (
            <>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "15px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-3">
                {distributionData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-black dark:text-white">
                      {item.value} months
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 italic mt-3">
                Simplified per-month view (not the official rolling 6-month rule
                used for actual billing).
              </p>
            </>
          )}
        </div>
      </div>

      {/* 24-HOUR CONSUMPTION PATTERN */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-xl dark:text-white flex items-center gap-2">
            <LuClock className="text-brand-blue" /> 24-Hour Consumption Pattern
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate.toISOString().slice(0, 10)}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="bg-gray-200 rounded-lg px-3 py-1 text-sm font-bold border-none outline-none"
            />
            <span className="text-[10px] text-gray-400">
              Peak hours: 6 PM – 10 PM
            </span>
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
                formatter={(value) => [`${value} kWh`, "Consumption"]}
              />
              <Bar dataKey="units" radius={[4, 4, 0, 0]}>
                {hourlyData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={index >= 18 && index <= 22 ? "#f59e0b" : "#3b82f6"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">
          <span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-1"></span>
          Peak hours (6 PM – 10 PM) — rates are higher
        </p>
      </div>

      {/* PEAK HOURS INFO BOX — Sirf Three-Phase Users Ke Liye */}
      {user?.meterType === "three" && (
        <div className="mt-4 flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl">
          <LuInfo className="text-amber-500 animate-pulse" size={20} />
          <p className="text-xs md:text-sm font-medium text-amber-800 dark:text-amber-400">
            <span className="font-black underline">MEPCO Peak Hours:</span>{" "}
            Current timings are <strong>06:00 PM to 10:00 PM</strong>. Avoid
            using heavy appliances (AC, Motors) during this window to reduce
            cost.
          </p>
        </div>
      )}

      <div className="bg-brand-blue/5 border border-brand-blue/20 p-4 sm:p-6 rounded-[30px] flex items-center gap-4">
        <div className="p-3 bg-brand-blue rounded-2xl text-white shadow-lg shadow-brand-blue/30">
          <LuMousePointer2 size={24} />
        </div>
        <div>
          <h4 className="font-black dark:text-white text-lg">
            Pro Tip: Hover for Details
          </h4>
          <p className="text-sm text-gray-500">
            You can hover over any chart element to see precise values.
          </p>
        </div>
      </div>

      {/* DAILY LOG TABLE */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 md:p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              Daily Usage Log
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              Hourly readings aggregated per day (last {dailyUsage.length} days)
            </p>
          </div>
        </div>

        {dailyUsage.length === 0 ? (
          <div className="p-10 text-center text-gray-400 font-bold">
            No daily readings yet. Run the simulator to generate data.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-6 md:px-8 py-4 md:py-5">Date</th>
                  <th className="px-6 md:px-8 py-4 md:py-5 text-center">
                    Units Consumed
                  </th>
                  <th className="px-6 md:px-8 py-4 md:py-5 text-center">
                    Hours Logged
                  </th>
                  <th className="px-6 md:px-8 py-4 md:py-5 text-right">
                    Day Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {dailyUsage.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group"
                  >
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="font-bold text-gray-700 dark:text-gray-200">
                          {formatDateLabel(row.date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-center font-black dark:text-white">
                      {row.totalUnits}{" "}
                      <span className="text-[10px] font-medium text-gray-400">
                        kWh
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-center text-gray-500 font-bold">
                      {row.hoursLogged}/24
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${
                          row.isHoliday
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-700"
                        }`}
                      >
                        {row.isHoliday ? "Weekend" : "Weekday"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Usage;
