import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LuTrendingUp,
  LuTriangleAlert,
  LuCalculator,
  LuWallet,
  LuInfo,
  LuArrowRight,
  LuZap,
  LuShieldCheck,
  LuRefreshCw,
  LuSparkles,
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
import toast from "react-hot-toast";
import { axiosServerInstance } from "../../axios.js";

const PendingBadge = ({ note }) => (
  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-400 px-2 py-1 rounded-full border border-dashed border-gray-300 dark:border-gray-700">
    ⏳ Pending — {note}
  </span>
);

const PredictionBill = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(5000);
  const [prediction, setPrediction] = useState(null);
  const [threshold, setThreshold] = useState(200);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadPrediction = async () => {
    try {
      const [predRes, tariffRes] = await Promise.all([
        axiosServerInstance.get("/prediction/me"),
        axiosServerInstance.get("/tariff"),
      ]);

      if (predRes.data.success && predRes.data.hasPrediction) {
        setPrediction(predRes.data.prediction);
      }
      if (tariffRes.data.success) {
        const slabs = tariffRes.data.tariff.protectedSlabs;
        if (slabs?.length) setThreshold(slabs[slabs.length - 1].rangeTo);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load prediction");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrediction();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await axiosServerInstance.post("/prediction/generate");
      if (res.data.success) {
        setPrediction(res.data.prediction);
        toast.success("Prediction updated!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate prediction",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const predictedUnits = prediction?.predictedUnits ?? 0;
  const predictedBill = prediction?.predictedBill ?? 0;
  const difference = budget - predictedBill;

  const slabData = prediction
    ? [
        { name: "Your Prediction", units: predictedUnits, color: "#3b82f6" },
        { name: "Protected Limit", units: threshold, color: "#10b981" },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400 font-bold">
        Loading prediction...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <LuCalculator className="text-brand-blue" />
            Bill Prediction
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Statistical forecasting based on your synced billing history.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-brand-blue text-white px-5 py-3 rounded-2xl text-sm font-black hover:bg-blue-700 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <LuRefreshCw
            size={16}
            className={isGenerating ? "animate-spin" : ""}
          />
          {isGenerating
            ? "Generating..."
            : prediction
              ? "Refresh Prediction"
              : "Generate My First Prediction"}
        </button>
      </div>

      {!prediction ? (
        <div className="bg-white dark:bg-[#1E293B] rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800 p-12 text-center">
          <LuSparkles className="mx-auto text-gray-300 mb-4" size={40} />
          <p className="text-gray-500 font-bold">
            No prediction yet. Sync at least 2 months of billing history (Home
            dashboard → Sync), then hit "Generate My First Prediction".
          </p>
        </div>
      ) : (
        <>
          {/* ================= HERO SECTION ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 relative bg-brand-gradient p-8 rounded-[40px] text-white shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
              <div className="relative z-10">
                <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                  Predicted Next Bill
                </span>

                <div className="mt-6 flex items-end gap-2">
                  <span className="text-5xl md:text-7xl font-black">
                    Rs. {predictedBill}
                  </span>
                </div>

                <p className="mt-4 text-blue-100 font-medium max-w-md">
                  Based on your last {prediction.monthsUsed} synced months,
                  you're projected to consume
                  <span className="text-white font-black underline decoration-amber-400 ml-1">
                    {predictedUnits} Units
                  </span>
                  .
                </p>

                {/* <div className="mt-4 text-xs text-blue-100">
                  Confidence:{" "}
                  <span className="font-bold text-white">
                    {prediction.confidence}%
                  </span>
                  <span className="opacity-70 ml-2">
                    (moving-average model — not Prophet yet)
                  </span>
                </div> */}

                <div className="mt-4 text-xs text-blue-100 flex flex-wrap items-center gap-2">
                  <span>
                    Confidence:{" "}
                    <span className="font-bold text-white">
                      {prediction.confidence}%
                    </span>
                  </span>

                  {prediction.modelVersion === "prophet-v1" ? (
                    <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-black">
                      <LuSparkles size={10} className="text-amber-300" /> AI
                      Prophet
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[10px] font-black opacity-70">
                      Moving Average (Fallback)
                    </span>
                  )}
                </div>
                {prediction.monthsUsed < 6 && (
                  <p className="mt-2 text-[11px] text-blue-100/80 italic">
                    Protected-slab eligibility uses a 6-month rolling average —
                    you have {prediction.monthsUsed} so far.
                  </p>
                )}
              </div>
              <LuTrendingUp className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            </div>

            {/* BUDGET CARD — client-side goal tracking, real feature, no backend needed */}
            <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black dark:text-white flex items-center gap-2 mb-4">
                  <LuWallet className="text-emerald-500" />
                  My Budget Goal
                </h3>
                <input
                  type="range"
                  min="2000"
                  max="15000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                />
                <div className="flex justify-between mt-2 text-sm font-bold text-gray-400">
                  <span>Rs. 2k</span>
                  <span className="text-brand-blue">Rs. {budget}</span>
                  <span>Rs. 15k</span>
                </div>
              </div>

              <div
                className={`mt-6 p-4 rounded-2xl border ${
                  difference >= 0
                    ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                    : "bg-red-50 border-red-100 dark:bg-red-500/10 dark:border-red-500/20"
                }`}
              >
                <p
                  className={`text-xs font-bold leading-tight ${
                    difference >= 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {difference >= 0
                    ? `Great! You are Rs. ${difference} under your budget.`
                    : `Warning! You are Rs. ${Math.abs(difference)} over budget.`}
                </p>
              </div>
            </div>
          </div>

          {/* ================= MAIN GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-xl font-black mb-2 dark:text-white">
                Slab Jump Analysis
              </h3>
              <p className="text-sm text-gray-500 mb-8 font-medium">
                Visualizing how close you are to the protected-slab limit.
              </p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={slabData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={130}
                      tick={{ fill: "#94a3b8", fontWeight: "bold" }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} Units`, "Usage"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="units" radius={[0, 10, 10, 0]} barSize={40}>
                      {slabData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* SMART SAVING ASSISTANT — real, rules-engine-computed savings */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {prediction.savingSuggestion ? (
                  <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-500/5 dark:border-amber-500/20 rounded-2xl md:col-span-2">
                    <div className="flex items-center gap-2 text-amber-600 mb-1 font-black text-sm">
                      <LuTriangleAlert size={18} /> SMART SAVING SUGGESTION
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      {prediction.savingSuggestion.message}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <PendingBadge note="Appliance-specific advice (needs Appliance Profile)" />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/5 dark:border-emerald-500/20 rounded-2xl md:col-span-2">
                    <div className="flex items-center gap-2 text-emerald-600 mb-1 font-black text-sm">
                      <LuShieldCheck size={18} /> ON TRACK
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      Your predicted usage is within the {threshold}-unit
                      protected threshold. Keep it up!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: PREDICTED BREAKDOWN — real, from calculateBill() */}
            <div className="lg:col-span-5 bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-xl font-black mb-6 dark:text-white">
                Predicted Breakdown
              </h3>

              <div className="space-y-6">
                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-lg">
                      <LuZap size={16} />
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      Energy Cost
                    </span>
                  </div>
                  <span className="font-black dark:text-white">
                    Rs. {prediction.breakdown?.energyCost}
                  </span>
                </div>

                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-lg">
                      <LuInfo size={16} />
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      GST + Duty
                    </span>
                  </div>
                  <span className="font-black dark:text-white">
                    Rs.{" "}
                    {(prediction.breakdown?.gstAmount ?? 0) +
                      (prediction.breakdown?.edAmount ?? 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center group opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-lg">
                      <LuTrendingUp size={16} />
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      Est. FPA
                    </span>
                  </div>
                  <PendingBadge note="Not in Tariff config yet" />
                </div>

                <hr className="border-gray-100 dark:border-gray-800" />

                {prediction.breakdown?.peakSurcharge > 0 && (
                  <div className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-lg">
                        <LuClock size={16} />
                      </div>
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                        Peak Hour Surcharge
                      </span>
                    </div>
                    <span className="font-black dark:text-white">
                      Rs. {prediction.breakdown.peakSurcharge}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-black dark:text-white">
                    Total
                  </span>
                  <span className="text-3xl font-black text-brand-blue">
                    Rs. {predictedBill}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/tariff")}
                  className="relative w-full mt-4 py-4 rounded-2xl bg-brand-gradient text-white font-black flex items-center justify-center gap-2 overflow-hidden group shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <span className="relative z-10 flex items-center gap-2 text-xs">
                    VIEW TARIFF <LuArrowRight size={14} />
                  </span>
                  <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition duration-700"></span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionBill;
