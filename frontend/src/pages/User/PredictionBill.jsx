import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LuTrendingUp,
  LuTriangleAlert,
  LuCalculator,
  LuInfo,
  LuArrowRight,
  LuZap,
  LuShieldCheck,
  LuRefreshCw,
  LuSparkles,
  LuClock,
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
import BudgetGoalCard from "../../components/Common/BudgetGoalCard";
import ForecastPeriodDetails from "../../components/Common/ForecastPeriodDetails";
import { predictionPeriodLabel } from "../../utils/predictionPeriod.js";

const PendingBadge = ({ note }) => (
  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-400 px-2 py-1 rounded-full border border-dashed border-gray-300 dark:border-gray-700">
    ⏳ Pending — {note}
  </span>
);

const PredictionBill = () => {
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [threshold, setThreshold] = useState(200);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [predictionNotice, setPredictionNotice] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      axiosServerInstance.get("/prediction/me"),
      axiosServerInstance.get("/tariff"),
    ]).then(([predRes, tariffRes]) => {
      if (!active) return;
      if (predRes.data.success && predRes.data.hasPrediction) {
        setPrediction(predRes.data.prediction);
      } else if (predRes.data.success) {
        setPrediction(null);
        setPredictionNotice(predRes.data.message);
      }
      if (tariffRes.data.success) {
        const slabs = tariffRes.data.tariff.protectedSlabs;
        if (slabs?.length) setThreshold(slabs[slabs.length - 1].rangeTo);
      }
    }).catch((error) => {
      if (active) toast.error(error.response?.data?.message || "Failed to load prediction");
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await axiosServerInstance.post("/prediction/generate");
      if (res.data.success) {
        setPrediction(res.data.prediction);
        setPredictionNotice(null);
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
  const trainingCount = prediction?.daysUsed ?? prediction?.monthsUsed;
  const historyDescription = trainingCount > 0
    ? prediction.modelVersion === "prophet-v1"
      ? `Based on ${trainingCount} complete recorded days of electricity usage,`
      : `Based on your last ${prediction.monthsUsed} synced months,`
    : "Based on your available electricity usage history,";

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
            Estimated electricity costs based on your available usage history.
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

      {predictionNotice && <p role="status" className="text-sm text-amber-600 dark:text-amber-400">{predictionNotice}</p>}

      {!prediction ? (
        <>
        <div className="bg-white dark:bg-[#1E293B] rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800 p-12 text-center">
          <LuSparkles className="mx-auto text-gray-300 mb-4" size={40} />
          <p className="text-gray-500 font-bold">
            No prediction yet. Prophet needs at least 10 complete past days of
            usage (24 hourly readings per day) and the running Python service.
            Alternatively, sync at least 2 months of billing history for the
            moving-average fallback, then hit "Generate My First Prediction".
          </p>
        </div>
          <div className="max-w-xl"><BudgetGoalCard /></div>
        </>
      ) : (
        <>
          {/* ================= HERO SECTION ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 relative bg-brand-gradient p-8 rounded-[40px] text-white shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
              <div className="relative z-10">
                <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                  {predictionPeriodLabel(prediction)}
                </span>

                <div className="mt-6 flex items-end gap-2">
                  <span className="text-5xl md:text-7xl font-black">
                    Rs. {predictedBill}
                  </span>
                </div>

                <p className="mt-4 text-blue-100 font-medium max-w-md">
                  {historyDescription} you're projected to consume
                  <span className="text-white font-black underline decoration-amber-400 ml-1">
                    {predictedUnits} Units
                  </span>
                  .
                </p>

                {prediction.projection && (
                  <div className="mt-3 text-xs text-blue-100 space-y-1">
                    <p>{prediction.projection.observedDays} complete days recorded; {prediction.projection.estimatedDays} days estimated.</p>
                    <p>{prediction.projection.actualUnits} kWh recorded + {prediction.projection.estimatedUnits} kWh estimated.</p>
                    {prediction.projection.estimatedPastDays > 0 && (
                      <p>{prediction.projection.estimatedPastDays} past days have missing or incomplete readings and are estimated.</p>
                    )}
                  </div>
                )}
                <ForecastPeriodDetails prediction={prediction} />

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
                    Model score:{" "}
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
                <p className="mt-2 text-[11px] text-blue-100/80">
                  Model score is a heuristic. Forecast accuracy needs comparison with actual consumption.
                </p>
                {prediction.modelVersion === "moving-average-v1" &&
                  prediction.monthsUsed > 0 && prediction.monthsUsed < 6 && (
                  <p className="mt-2 text-[11px] text-blue-100/80 italic">
                    SlabGuard checks each of the six most recent historical bills
                    for protected-slab eligibility — you have {prediction.monthsUsed} synced months so far.
                  </p>
                )}
              </div>
              <LuTrendingUp className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            </div>

            <BudgetGoalCard predictedBill={predictedBill} />
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
