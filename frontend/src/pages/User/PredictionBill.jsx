import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import {
  LuTrendingUp,
  LuTriangleAlert,
  LuCalculator,
  LuWallet,
  LuInfo,
  LuArrowRight,
  LuZap,
  LuShieldCheck,
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



const PredictionBill = () => {
  const navigate = useNavigate();
  
  const [budget, setBudget] = useState(5000);
  
  // ================= DATA =================
  const slabData = [
    { name: "Your Prediction", units: 192, color: "#3b82f6" },
    { name: "Next Slab Limit", units: 200, color: "#10b981" },
  ];
  
  const predictedBill = 4850;
  const predictedUnits = 192;

  const difference = budget - predictedBill;

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <LuCalculator className="text-brand-blue" />
          Bill Prediction
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          AI-powered forecasting based on your current consumption patterns.
        </p>
      </div>

      {/* ================= HERO SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN CARD */}
        <div className="lg:col-span-2 relative bg-brand-gradient p-8 rounded-[40px] text-white shadow-2xl overflow-hidden group">
          
          {/* subtle overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

          <div className="relative z-10">
            <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              Estimated Monthly Bill
            </span>

            <div className="mt-6 flex items-end gap-2">
              <span className="text-5xl md:text-7xl font-black">
                Rs. {predictedBill}
              </span>
              <span className="text-xl opacity-70">/ month</span>
            </div>

            <p className="mt-4 text-blue-100 font-medium max-w-md">
              Based on your last 7 days, you are projected to consume
              <span className="text-white font-black underline decoration-amber-400 ml-1">
                {predictedUnits} Units
              </span>.
            </p>

            {/* Confidence */}
            <div className="mt-4 text-xs text-blue-100">
              Confidence:{" "}
              <span className="font-bold text-white">87%</span>
            </div>
          </div>

          <LuTrendingUp className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* ================= BUDGET CARD ================= */}
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

          {/* Dynamic feedback */}
          <div className="mt-6 p-4 rounded-2xl border 
            ${difference >= 0 
              ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20'
              : 'bg-red-50 border-red-100 dark:bg-red-500/10 dark:border-red-500/20'
            }"
          >
            <p className={`text-xs font-bold leading-tight ${
              difference >= 0 
                ? "text-emerald-700 dark:text-emerald-400" 
                : "text-red-600 dark:text-red-400"
            }`}>
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
            Visualizing how close you are to the next tariff.
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

          {/* Alerts */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-500/5 dark:border-amber-500/20 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-600 mb-1 font-black text-sm">
                <LuTriangleAlert size={18} /> WARNING
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Crossing <b>200 units</b> may increase bill to <b>Rs. 7,200+</b>.
              </p>
            </div>

            <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-500/5 dark:border-blue-500/20 rounded-2xl">
              <div className="flex items-center gap-2 text-brand-blue mb-1 font-black text-sm">
                <LuShieldCheck size={18} /> PROTECTED
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Keep usage under 8 units/day to stay in protected slab.
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          
          <h3 className="text-xl font-black mb-6 dark:text-white">
            Predicted Breakdown
          </h3>

          <div className="space-y-6">
            
            {/* ITEM */}
            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-lg">
                  <LuZap size={16} />
                </div>
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  Energy Cost
                </span>
              </div>
              <span className="font-black dark:text-white">Rs. 3,120</span>
            </div>

            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <LuInfo size={16} />
                </div>
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  Fixed & Taxes
                </span>
              </div>
              <span className="font-black dark:text-white">Rs. 1,450</span>
            </div>

            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-lg">
                  <LuTrendingUp size={16} />
                </div>
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  Est. FPA
                </span>
              </div>
              <span className="font-black dark:text-white">Rs. 280</span>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-black dark:text-white">
                Total
              </span>
              <span className="text-3xl font-black text-brand-blue">
                Rs. {predictedBill}
              </span>
            </div>

            <button onClick={() => navigate('/tariff')} className="w-full mt-4 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-brand-blue dark:hover:bg-brand-blue dark:hover:text-white transition-all active:scale-95">
              VIEW TARIFF <LuArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionBill;