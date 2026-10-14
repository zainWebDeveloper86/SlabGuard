import React, { useState, useEffect } from "react";
import { LuHistory, LuDownload, LuFileSpreadsheet } from "react-icons/lu";
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
import toast from "react-hot-toast";
import { axiosServerInstance } from "../../axios.js";

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axiosServerInstance.get("/billing/history/me");
        if (res.data.success) {
          // Oldest to newest looks better on a bar chart
          // const sorted = [];
          setHistoryData(res.data.billHistory);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load bill history",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400 font-bold">
        Loading your bill history...
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 font-bold">
          No bill history yet — hit "Sync" on your dashboard to fetch it from
          MEPCO.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            <LuHistory className="text-brand-blue" /> Consumption History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Track your monthly performance & efficiency trends
          </p>
        </div>
        <button className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-xl text-sm font-black hover:bg-blue-700 transition shadow-md hover:shadow-blue-500/30">
          <LuDownload size={18} /> Export
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E293B] p-6 md:p-8 rounded-[30px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-xl dark:text-white">
            Units Consumption Trend
          </h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Last {historyData.length} Months
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
                <th className="px-6 py-4">Bill</th>
                <th className="px-6 py-4 text-right">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {historyData.toReversed().map((row) => (
                <tr
                  key={row._id || row.month}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                >
                  <td className="px-6 py-5 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center font-black text-sm">
                      {row.month[0]}
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-200">
                      {row.month}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-semibold text-gray-600 dark:text-gray-400">
                    {row.units}
                  </td>
                  <td className="px-6 py-5 font-black text-blue-600 text-lg">
                    Rs. {row.billAmount}
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-gray-600 dark:text-gray-400">
                    Rs. {row.paymentAmount}
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
