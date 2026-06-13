import React, { useState } from "react";
import {
  LuHistory,
  LuDownload,
  LuFileSpreadsheet,
  LuArrowUpRight,
  LuArrowDownRight,
} from "react-icons/lu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const History = () => {
  const historyData = [
    {
      month: "Oct",
      units: 180,
      cost: 4200,
      status: "Protected",
      saving: "+15%",
    },
    {
      month: "Nov",
      units: 210,
      cost: 6800,
      status: "Non-Protected",
      saving: "-5%",
    },
    {
      month: "Dec",
      units: 250,
      cost: 8500,
      status: "Non-Protected",
      saving: "-10%",
    },
    {
      month: "Jan",
      units: 190,
      cost: 4500,
      status: "Protected",
      saving: "+12%",
    },
    {
      month: "Feb",
      units: 150,
      cost: 3200,
      status: "Protected",
      saving: "+20%",
    },
    {
      month: "Mar",
      units: 220,
      cost: 7200,
      status: "Non-Protected",
      saving: "-8%",
    },
  ];

  const [selectedYear, setSelectedYear] = useState("2026");

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            <LuHistory className="text-brand-blue" /> Consumption History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Track your monthly performance & efficiency trends
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-gray-200 dark:bg-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 ring-brand-blue/20 outline-none transition"
          >
            <option>2026</option>
            <option>2025</option>
          </select>

          <button className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-xl text-sm font-black hover:bg-blue-700 transition shadow-md hover:shadow-blue-500/30">
            <LuDownload size={18} /> Export
          </button>
        </div>
      </div>

      {/* ================= CHART ================= */}
      <div className="bg-white dark:bg-[#1E293B] p-6 md:p-8 rounded-[30px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-xl dark:text-white">
            Units Consumption Trend
          </h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Last 6 Months
          </span>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: "bold", fill: "#94a3b8" }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: "bold", fill: "#94a3b8" }}
              />

              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                }}
              />

              <Bar dataKey="units" radius={[10, 10, 0, 0]} barSize={38}>
                {historyData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.units > 200 ? "#ef4444" : "#10b981"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[30px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-black dark:text-white">
            Monthly Breakdown
          </h3>
          <LuFileSpreadsheet className="text-gray-300" size={22} />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-174 w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] uppercase tracking-widest font-black text-gray-400">
              <tr>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Units</th>
                <th className="px-6 py-4">Cost</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Efficiency</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {historyData.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                >
                  {/* Month */}
                  <td className="px-6 py-5 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center font-black text-sm">
                      {row.month[0]}
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-200">
                      {row.month} {selectedYear}
                    </span>
                  </td>

                  {/* Units */}
                  <td className="px-6 py-5 font-semibold text-gray-600 dark:text-gray-400">
                    {row.units} kWh
                  </td>

                  {/* Cost */}
                  <td className="px-6 py-5 font-black text-blue-600 text-lg">
                    Rs. {row.cost}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        row.status === "Protected"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-red-100 text-red-500"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Efficiency */}
                  <td className="px-6 py-5 text-right">
                    <div
                      className={`flex items-center justify-end gap-1 font-black ${
                        row.saving.startsWith("+")
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {row.saving.startsWith("+") ? (
                        <LuArrowDownRight size={16} />
                      ) : (
                        <LuArrowUpRight size={16} />
                      )}
                      {row.saving}
                    </div>
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

export default History;
