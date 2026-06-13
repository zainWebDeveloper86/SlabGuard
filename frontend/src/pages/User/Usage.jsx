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
  Legend,
} from "recharts";
import { LuZap, LuTrendingUp, LuMousePointer2, LuInfo } from "react-icons/lu";

// 1. Data for Area Chart (Trend)
const usageData = [
  { date: "01 April", units: 12 },
  { date: "02 April", units: 15 },
  { date: "03 April", units: 10 },
  { date: "04 April", units: 18 },
  { date: "05 April", units: 25 },
  { date: "06 April", units: 14 },
  { date: "07 April", units: 12 },
];

// 2. Data for Pie Chart (Appliances)
const applianceData = [
  { name: "Air Conditioner", value: 45, color: "#3b82f6" },
  { name: "Refrigerator", value: 25, color: "#10b981" },
  { name: "Lights & Fans", value: 20, color: "#f59e0b" },
  { name: "Others", value: 10, color: "#6366f1" },
];

const Usage = () => {
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
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
          <button className="px-4 py-2 text-xs font-bold  shadow-sm rounded-xl dark:text-white bg-brand-blue text-white">
            Last 7 Days
          </button>
          <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition">
            Last 30 Days
          </button>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1E293B] p-4 sm:p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase mb-1">
            Total Units
          </p>
          <h4 className="text-2xl font-black dark:text-white">106 kWh</h4>
          <p className="text-xs text-emerald-500 mt-2 font-bold">
            ↑ 12% from last week
          </p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-4 sm:p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase mb-1">
            Peak Day
          </p>
          <h4 className="text-2xl font-black dark:text-white">05 April</h4>
          <p className="text-xs text-gray-500 mt-2">Highest: 25 Units</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-4 sm:p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase mb-1">
            Avg. Daily Cost
          </p>
          <h4 className="text-2xl font-black dark:text-white">Rs. 420</h4>
          <p className="text-xs text-emerald-500 mt-2 font-bold">
            Within Budget
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8">
        {/* LEFT: AREA CHART */}
        <div className="md:col-span-2 lg:col-span-8 bg-white dark:bg-[#1E293B] p-4 sm:p-6 md:p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-black text-xl mb-6 md:mb-8 dark:text-white flex items-center gap-2">
            <LuTrendingUp className="text-brand-blue" /> Consumption Trend
          </h3>
          <div className="h-[250px] sm:h-[300px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
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
                  itemStyle={{ fontWeight: "bold" }}
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
        </div>

        {/* RIGHT: PIE CHART */}
        {/* <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-[#1E293B] p-4 sm:p-6 md:p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-black text-xl mb-4 dark:text-white flex items-center gap-2">
            <LuZap className="text-amber-500" /> Breakdown
          </h3>
          <div className="h-[250px] sm:h-[300px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {applianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* RIGHT: PIE CHART WITH COST TOGGLE */}
        <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-[#1E293B] p-4 sm:p-6 md:p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-xl dark:text-white flex items-center gap-2">
              <LuZap className="text-amber-500" /> Breakdown
            </h3>
            {/* NEW: Small Toggle for Units vs Rs */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button className="px-2 py-1 text-[10px] font-bold bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                Units
              </button>
              <button className="px-2 py-1 text-[10px] font-bold text-gray-500 italic">
                Rs.
              </button>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60} // Thora bara inner radius for modern donut look
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none" // Remove white borders for cleaner look
                >
                  {applianceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
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

          {/* NEW: Custom Legend with Percentages */}
          <div className="mt-4 space-y-3">
            {applianceData.map((item, i) => (
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
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage.jsx - Trend Chart ke Neeche Add karein */}
      <div className="mt-4 flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl">
        <LuInfo className="text-amber-500 animate-pulse" size={20} />
        <p className="text-xs md:text-sm font-medium text-amber-800 dark:text-amber-400">
          <span className="font-black underline">MEPCO Peak Hours:</span>{" "}
          Current timings are **06:00 PM to 10:00 PM**. Avoid using heavy
          appliances (AC, Motors) during this window to reduce cost.
        </p>
      </div>

      {/* FOOTER TIP */}
      <div className="bg-brand-blue/5 border border-brand-blue/20 p-4 sm:p-6 rounded-[30px] flex items-center gap-4">
        <div className="p-3 bg-brand-blue rounded-2xl text-white shadow-lg shadow-brand-blue/30">
          <LuMousePointer2 size={24} />
        </div>
        <div>
          <h4 className="font-black dark:text-white text-lg">
            Pro Tip: Hover for Details
          </h4>
          <p className="text-sm text-gray-500">
            You can hover over any chart element to see precise units and cost
            breakdown.
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 md:p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              Daily Usage Log
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              Detailed breakdown of the last 7 days
            </p>
          </div>
          <button className="cursor-pointer outline-none text-xs font-bold text-brand-blue hover:underline">
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-6 md:px-8 py-4 md:py-5">Date</th>
                <th className="px-6 md:px-8 py-4 md:py-5 text-center">
                  Units Consumed
                </th>
                <th className="px-6 md:px-8 py-4 md:py-5 text-center">
                  Estimated Cost
                </th>
                <th className="px-6 md:px-8 py-4 md:py-5 text-right">
                  Slab Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {usageData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group"
                >
                  <td className="px-6 md:px-8 py-5 md:py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="font-bold text-gray-700 dark:text-gray-200">
                        {row.date}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-5 md:py-6 text-center font-black dark:text-white">
                    {row.units}{" "}
                    <span className="text-[10px] font-medium text-gray-400">
                      kWh
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-5 md:py-6 text-center font-black text-brand-blue">
                    Rs. {row.units * 30}
                  </td>
                  <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                    <span
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${
                        row.units > 20
                          ? "bg-red-100 text-red-600 dark:bg-red-500/20"
                          : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20"
                      }`}
                    >
                      {row.units > 20 ? "High" : "Normal"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Usage;
