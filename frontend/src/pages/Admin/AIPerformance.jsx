import React from "react";
import {
  LuBrain,
  LuTrendingUp,
  LuActivity,
  LuZap,
  LuTarget,
  LuTriangleAlert,
  LuCircleCheck,
} from "react-icons/lu";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const AIPerformance = () => {
  // Dummy Data for Prediction vs Actual (Last 6 Months)
  const performanceData = [
    { month: "Nov", predicted: 240, actual: 235 },
    { month: "Dec", predicted: 310, actual: 320 },
    { month: "Jan", predicted: 280, actual: 275 },
    { month: "Feb", predicted: 190, actual: 200 },
    { month: "Mar", predicted: 220, actual: 215 },
    { month: "Apr", predicted: 260, actual: 258 },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <LuBrain className="text-brand-blue" /> AI Intelligence Hub
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium italic">
            Meta Prophet Model Analytics & Forecasting Accuracy
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-2xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Model: Active
          </div>
        </div>
      </div>

      {/* ================= KEY METRICS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Overall Accuracy"
          value="94.8%"
          desc="Based on last 1,000 predictions"
          icon={<LuTarget />}
          color="text-blue-500"
        />
        <MetricCard
          title="Mean Absolute Error"
          value="4.2 Units"
          desc="Average deviation from actual"
          icon={<LuActivity />}
          color="text-purple-500"
        />
        <MetricCard
          title="Jumps Prevented"
          value="128"
          desc="Users saved from higher slabs"
          icon={<LuZap />}
          color="text-amber-500"
        />
        <MetricCard
          title="Confidence Level"
          value="High"
          desc="Prophet seasonal trend sync"
          icon={<LuCircleCheck />}
          color="text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MAIN CHART: PREDICTION VS ACTUAL */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black dark:text-white flex items-center gap-2">
              <LuTrendingUp className="text-brand-blue" /> Prediction vs Actual
              Usage
            </h3>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-1 text-blue-500">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>{" "}
                Predicted
              </span>
              <span className="flex items-center gap-1 text-gray-400">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span>{" "}
                Actual
              </span>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: "bold" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: "bold" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#3B82F6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorPred)"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDE COLUMN: INSIGHTS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-brand-blue p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
            <LuBrain className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
            <h4 className="text-lg font-black mb-4 relative z-10 flex items-center gap-2">
              AI Status Report
            </h4>
            <p className="text-sm text-blue-50 font-medium leading-relaxed mb-6 relative z-10">
              The Prophet model is currently analyzing seasonal trends for May
              2026. High temperature alerts are influencing unit consumption
              forecasts.
            </p>
            <div className="space-y-3 relative z-10">
              <StatusCheck text="Seasonality Factor Loaded" />
              <StatusCheck text="Trend Component: Optimal" />
              <StatusCheck text="MEPCO Holiday Logic: Sync" />
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-500/5 p-6 rounded-[30px] border border-amber-100 dark:border-amber-500/20">
            <h5 className="text-sm font-black text-amber-900 dark:text-amber-400 flex items-center gap-2 mb-3">
              <LuTriangleAlert size={18} /> Optimization Tip
            </h5>
            <p className="text-xs text-amber-800/70 dark:text-amber-400/60 leading-relaxed italic">
              "Accuracy drops when users fail to upload clear bill images.
              Integrating OCR pre-checks could improve data quality by 15%."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const MetricCard = ({ title, value, desc, icon, color }) => (
  <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[35px] border border-gray-100 dark:border-gray-800 shadow-sm group hover:border-brand-blue/30 transition-all duration-300">
    <div
      className={`p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 w-fit mb-4 ${color} group-hover:scale-110 transition-transform`}
    >
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest mb-1">
      {title}
    </h3>
    <p className="text-2xl font-black dark:text-white mb-1">{value}</p>
    <p className="text-[10px] text-gray-400 font-medium">{desc}</p>
  </div>
);

const StatusCheck = ({ text }) => (
  <div className="flex items-center gap-2 text-xs font-bold text-blue-100">
    <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div> {text}
  </div>
);

export default AIPerformance;
