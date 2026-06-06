import React, { useState } from "react";
import {
  LuSnowflake,
  LuZap,
  LuCircleCheck,
  LuChevronRight,
  LuChevronLeft,
  //   LuTimer,
  LuUtensilsCrossed,
  //   LuHome, // ✅ Lucide React se hai, React Icons mein nahi
  //   LuRefrigerator,
  //   LuDroplet,
  //   LuMicrowave,
} from "react-icons/lu";
// React Icons se alternative
// import { MdHome, MdOutlineHome } from "react-icons/md";
import { FaHome } from "react-icons/fa";

const StepIndicator = ({ step }) => (
  <div className="flex items-center justify-center gap-3 mb-10">
    {[1, 2, 3].map((num) => (
      <div key={num} className="flex items-center">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${
            step === num
              ? "bg-brand-blue text-white scale-110 shadow-lg shadow-blue-500/20"
              : step > num
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
          }`}
        >
          {step > num ? <LuCircleCheck size={20} /> : num}
        </div>
        {num !== 3 && (
          <div
            className={`w-10 h-1 border-t-2 ${step > num ? "border-emerald-500" : "border-gray-100 dark:border-gray-800"}`}
          />
        )}
      </div>
    ))}
  </div>
);

const ApplianceForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ac_qty: 0,
    ac_type: "Inverter",
    ac_ton: "1.5",
    fridge_qty: 1,
    oven_type: "Microwave",
    water_pump_hrs: "1-2 Hours",
    geyser_type: "Gas",
    washing_machine_freq: "3 times a week",
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Setup Your Energy Profile
        </h1>
        <p className="text-gray-500 font-medium">
          This helps our AI provide accurate saving tips for your home.
        </p>
      </div>

      <StepIndicator step={step} />

      <div className="bg-white dark:bg-[#1E293B] p-8 md:p-12 rounded-[45px] border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden">
        {/* STEP 1: COOLING & AC */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl">
                <LuSnowflake size={24} />
              </div>
              <h2 className="text-xl font-black dark:text-white">
                Cooling Appliances
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Number of ACs
                </label>
                <input
                  type="number"
                  name="ac_qty"
                  value={formData.ac_qty}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none ring-2 ring-transparent focus:ring-brand-blue/20"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  AC Type
                </label>
                <select
                  name="ac_type"
                  value={formData.ac_type}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                >
                  <option>Inverter</option>
                  <option>Non-Inverter</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  AC Tonnage
                </label>
                <select
                  name="ac_ton"
                  value={formData.ac_ton}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                >
                  <option>1.0</option>
                  <option>1.5</option>
                  <option>2.0</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Refrigerator Qty
                </label>
                <select
                  name="fridge_qty"
                  value={formData.fridge_qty}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                >
                  <option>0</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3+</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: KITCHEN & HEAVY LOAD */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-2xl">
                <LuUtensilsCrossed size={24} />
              </div>
              <h2 className="text-xl font-black dark:text-white">
                Kitchen & Heavy Load
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Oven Type
                </label>
                <select
                  name="oven_type"
                  value={formData.oven_type}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                >
                  <option>Microwave</option>
                  <option>Electric Oven (OTG)</option>
                  <option>Both</option>
                  <option>None</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Water Pump (Daily Use)
                </label>
                <select
                  name="water_pump_hrs"
                  value={formData.water_pump_hrs}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                >
                  <option>Less than 1 Hour</option>
                  <option>1-2 Hours</option>
                  <option>More than 2 Hours</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Geyser Type
                </label>
                <select
                  name="geyser_type"
                  value={formData.geyser_type}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                >
                  <option>Gas</option>
                  <option>Electric</option>
                  <option>Solar</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Washing Machine Frequency
                </label>
                <select
                  name="washing_machine_freq"
                  value={formData.washing_machine_freq}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                >
                  <option>1 time a week</option>
                  <option>2-3 times a week</option>
                  <option>4-5 times a week</option>
                  <option>Daily</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LIFESTYLE & SUMMARY */}
        {/* {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl">
                <FaHome size={24} />
              </div>
              <h2 className="text-xl font-black dark:text-white">
                Lifestyle Settings
              </h2>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-black text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <LuZap size={16} /> Your Energy Profile Summary
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 py-2">
                  <span className="text-gray-500">AC Units:</span>
                  <span className="font-bold dark:text-white">{formData.ac_qty}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 py-2">
                  <span className="text-gray-500">AC Type:</span>
                  <span className="font-bold dark:text-white">{formData.ac_type}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 py-2">
                  <span className="text-gray-500">Water Pump:</span>
                  <span className="font-bold dark:text-white">{formData.water_pump_hrs}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 py-2">
                  <span className="text-gray-500">Oven Type:</span>
                  <span className="font-bold dark:text-white">{formData.oven_type}</span>
                </div>
              </div>
            </div>

            

            <div className="p-6 bg-brand-blue/5 rounded-[30px] border border-brand-blue/10 space-y-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic">
                "Based on these details, SlabGuard AI will monitor your **Slab
                thresholds** and alert you before you hit the danger zone."
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  className="w-5 h-5 accent-brand-blue rounded"
                />
                <label
                  htmlFor="consent"
                  className="text-xs font-bold text-gray-500"
                >
                  I agree to receive AI-driven saving alerts.
                </label>
              </div>
            </div>
          </div>
        )} */}

        {/* STEP 3: LIFESTYLE & SUMMARY (Updated) */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl">
                <FaHome size={24} />
              </div>
              <h2 className="text-xl font-black dark:text-white">
                Lifestyle & Meter
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Meter Type
                </label>
                <select
                  name="meter_type"
                  value={formData.meter_type}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none ring-2 ring-transparent focus:ring-brand-blue/20"
                >
                  <option value="single">Single Phase (Regular)</option>
                  <option value="three">Three Phase (TOU)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Home Occupancy
                </label>
                <select
                  name="occupancy"
                  value={formData.occupancy}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                >
                  <option value="Empty">Empty during day</option>
                  <option value="Occupied">Occupied during day</option>
                </select>
              </div>
            </div>

            {/* SUMMARY CARD */}
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-black text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <LuZap size={16} /> Final Review
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
                <div className="flex justify-between border-b dark:border-gray-700 py-1">
                  <span className="text-gray-500 uppercase">Meter:</span>
                  <span className="font-bold dark:text-white">
                    {formData.meter_type === "three"
                      ? "Three Phase"
                      : "Single Phase"}
                  </span>
                </div>
                <div className="flex justify-between border-b dark:border-gray-700 py-1">
                  <span className="text-gray-500 uppercase">ACs:</span>
                  <span className="font-bold dark:text-white">
                    {formData.ac_qty} ({formData.ac_type})
                  </span>
                </div>
                <div className="flex justify-between border-b dark:border-gray-700 py-1">
                  <span className="text-gray-500 uppercase">Occupancy:</span>
                  <span className="font-bold dark:text-white">
                    {formData.occupancy}
                  </span>
                </div>
                <div className="flex justify-between border-b dark:border-gray-700 py-1">
                  <span className="text-gray-500 uppercase">Pump:</span>
                  <span className="font-bold dark:text-white">
                    {formData.water_pump_hrs}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-brand-blue/5 rounded-[30px] border border-brand-blue/10 space-y-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic leading-snug">
                "We'll track your **
                {formData.meter_type === "three"
                  ? "Peak Hours"
                  : "Slab Thresholds"}
                ** to keep your bill under control."
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  className="w-5 h-5 accent-brand-blue rounded cursor-pointer"
                />
                <label
                  htmlFor="consent"
                  className="text-xs font-bold text-gray-500 cursor-pointer"
                >
                  I agree to receive AI-driven saving alerts.
                </label>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="flex gap-4 mt-12">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition cursor-pointer"
            >
              <LuChevronLeft size={20} /> BACK
            </button>
          )}
          <button
            onClick={step === 3 ? () => alert("Profile Saved!") : nextStep}
            className="flex-[2] py-4 rounded-2xl bg-brand-gradient text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition cursor-pointer"
          >
            {step === 3 ? "COMPLETE SETUP" : "CONTINUE"}{" "}
            <LuChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-center gap-1">
        <LuZap size={12} /> All data is encrypted and used for prediction only
      </p>
    </div>
  );
};

export default ApplianceForm;
