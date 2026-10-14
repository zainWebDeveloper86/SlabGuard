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
  Legend,
} from "recharts";
import {
  LuUsers,
  LuZap,
  LuTriangleAlert,
  LuActivity,
  LuTrendingUp,
  LuMegaphone,
  LuArrowRight,
  LuLink,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosServerInstance } from "../../axios.js";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          axiosServerInstance.get("/admin/stats"),
          axiosServerInstance.get("/admin/activity"),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (activityRes.data.success) setActivity(activityRes.data.activity);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load admin data",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400 font-bold">
        Loading dashboard...
      </div>
    );
  }

  const slabPieData = stats
    ? [
        {
          name: "Protected",
          value: stats.slabDistribution.protected,
          color: "#10b981",
        },
        {
          name: "Non-Protected",
          value: stats.slabDistribution.nonProtected,
          color: "#f43f5e",
        },
      ]
    : [];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            System <span className="text-brand-blue">Overview</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            SlabGuard monitoring and administrative control.
          </p>
        </div>
      </div>

      {/* STATS — all real now */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Users",
            value: stats.totalUsers,
            icon: <LuUsers />,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            title: "Meter Linked",
            value: stats.linkedUsers,
            icon: <LuLink />,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            title: "Avg Latest Bill",
            value: `₨ ${stats.avgLatestBill}`,
            icon: <LuZap />,
            color: "text-yellow-500",
            bg: "bg-yellow-50",
          },
          {
            title: "Non-Protected",
            value: stats.slabDistribution.nonProtected,
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

      {/* SLAB DISTRIBUTION — real, from latest bill per user */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-black mb-6 dark:text-white flex items-center gap-2">
            <LuActivity className="text-brand-blue" /> Recent System Activity
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3 text-right">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {activity.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-gray-400 font-bold"
                    >
                      No activity yet.
                    </td>
                  </tr>
                ) : (
                  activity.map((a, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                    >
                      <td className="px-4 py-4 text-sm font-bold text-gray-800 dark:text-gray-200">
                        {a.event}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {a.actor}
                      </td>
                      <td className="px-4 py-4 text-right text-xs text-gray-400">
                        {new Date(a.time).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-[#1E293B] p-8 rounded-[45px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-black mb-6 dark:text-white text-center">
            Slab Distribution
          </h3>
          {stats.slabDistribution.protected +
            stats.slabDistribution.nonProtected ===
          0 ? (
            <p className="text-center text-gray-400 font-bold text-sm py-10">
              No bill data synced yet.
            </p>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slabPieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {slabPieData.map((entry, index) => (
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
                Based on each user's most recent synced bill (≤200 units =
                Protected).
              </p>
            </>
          )}
        </div>
      </div>

      {/* ACTION SHORTCUTS — unchanged, these already go to real pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
          <div className="absolute right-2 bottom-16 text-blue-500 opacity-5 group-hover:opacity-10 transition-opacity">
            <LuMegaphone size={140} />
          </div>
          <div className="relative z-10">
            <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">
              Manage Users
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
              View, search, and manage all SlabGuard consumers.
            </p>
            <button
              onClick={() => navigate("/admin/manage-users")}
              className="relative w-full py-4 rounded-2xl bg-brand-gradient text-white font-black text-sm flex items-center justify-center gap-2 overflow-hidden group shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2">
                OPEN USER LIST <LuArrowRight size={16} />
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition duration-700"></span>
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
              Modify MEPCO unit rates and tax slabs.
            </p>
            <button
              onClick={() => navigate("/admin/tariff-rates")}
              className="relative w-full py-4 rounded-2xl bg-brand-gradient text-white font-black text-sm flex items-center justify-center gap-2 overflow-hidden group shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2">
                OPEN RATE EDITOR <LuArrowRight size={16} />
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition duration-700"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
