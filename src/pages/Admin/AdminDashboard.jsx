// import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

import {
  LuUsers,
  LuBrain,
  LuTriangleAlert,
  LuActivity,
  LuZap,
  LuTrendingUp,
  LuMegaphone,
  LuArrowRight,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";

// Dummy Data for Admin Overview
const growthData = [
  { month: "Jan", users: 400 },
  { month: "Feb", users: 700 },
  { month: "Mar", users: 1200 },
  { month: "Apr", users: 1850 },
];

const featureUsage = [
  { name: "OCR Scan", value: 45, color: "#3b82f6" },
  { name: "Prediction", value: 35, color: "#10b981" },
  { name: "Tariff Check", value: 20, color: "#f59e0b" },
];

const slabDistribution = [
  { name: "Protective", value: 65, color: "#10b981" }, // Emerald
  { name: "Non-Protective", value: 35, color: "#f43f5e" }, // Rose
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            System <span className="text-brand-blue">Overview</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            SlabGuard real-time monitoring and administrative control.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-500/20 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            AI SERVER: ONLINE
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Users",
            value: "2,481",
            icon: <LuUsers />,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            title: "Avg Monthly Bill",
            value: "₨ 4,820",
            icon: <LuZap />,
            color: "text-yellow-500",
            bg: "bg-yellow-50",
          },
          {
            title: "AI Scans",
            value: "842",
            icon: <LuBrain />,
            color: "text-purple-500",
            bg: "bg-purple-50",
          },
          {
            title: "Urgent Tickets",
            value: "07",
            icon: <LuTriangleAlert />,
            color: "text-rose-500",
            bg: "bg-rose-50",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1E293B] p-6 rounded-[30px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition group"
          >
            <div className="flex justify-between items-center mb-4">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
            </div>

            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
              {card.title}
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      {/* ================= CHARTS SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* USER GROWTH */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-black mb-6 dark:text-white flex items-center gap-2">
            <LuTrendingUp className="text-blue-500" />
            User Growth
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.5}
                />
                <XAxis dataKey="month" />
                <YAxis hide />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-[#1E293B] p-8 rounded-[45px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-black mb-6 dark:text-white text-center">
            User Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slabDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {slabDistribution.map((entry, index) => (
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
          <p className="text-[11px] text-center text-gray-400 mt-4 leading-relaxed font-medium">
            Most users are currently in the <b>Protective Slab</b> category.
          </p>
        </div>
      </div>

      {/* AI chart and action buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Action Button */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
            <div className="absolute right-2 bottom-16 text-blue-500 opacity-5 group-hover:opacity-10 transition-opacity">
              <LuMegaphone size={140} />
            </div>

            <div className="relative z-10">
              <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                Send System Alert
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                Send real-time push notifications to all SlabGuard users.
              </p>

              <button onClick={() => navigate("/admin/broadcast")} className="w-full py-4 rounded-2xl bg-brand-gradient text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform">
                COMPOSE MESSAGE <LuArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
            <div className="absolute right-2 bottom-16 text-emerald-500 opacity-5 group-hover:opacity-10 transition-opacity">
              <LuZap size={140} />
            </div>

            <div className="relative z-10">
              <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                Update Tariffs
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                Modify MEPCO unit rates and tax slabs instantly.
              </p>

              <button onClick={() => navigate("/admin/tariff-rates")} className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-transform">
                OPEN RATE EDITOR <LuArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        {/* Feature Usage Bar Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-black mb-6 dark:text-white">
            Feature Popularity
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureUsage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  width={80}
                />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                  {featureUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-gray-400 mt-4">
            OCR scanning is currently the most used tool.
          </p>
        </div>
      </div>

      {/* ================= RECENT SYSTEM ACTIVITY ================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <LuActivity className="text-brand-blue" /> Recent System Activity
          </h3>
          <button
            onClick={() => navigate("/admin/logs")}
            className="text-xs font-bold text-brand-blue hover:underline cursor-pointer"
          >
            View All Logs
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-4">Event</th>
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {[
                {
                  event: "OCR Bill Extraction",
                  user: "zain@example.com",
                  status: "Success",
                  time: "2 mins ago",
                },
                {
                  event: "Tariff Update",
                  user: "System Admin",
                  status: "Completed",
                  time: "1 hour ago",
                },
                {
                  event: "New Registration",
                  user: "ahmed_99",
                  status: "Success",
                  time: "3 hours ago",
                },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <td className="px-8 py-5 text-sm font-bold text-gray-800 dark:text-gray-200">
                    {row.event}
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500">
                    {row.user}
                  </td>
                  <td className="px-8 py-5 text-sm">
                    <span className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-400">
                    {row.time}
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

export default AdminDashboard;
