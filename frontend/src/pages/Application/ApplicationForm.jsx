import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosServerInstance } from "../../axios.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  LuFileText,
  LuZap,
  LuSnowflake,
  LuCircleCheck,
  LuChevronRight,
  LuChevronLeft,
  LuUtensilsCrossed,
} from "react-icons/lu";
import { FaHome } from "react-icons/fa";

const TOTAL_STEPS = 4;

const StepIndicator = ({ step }) => (
  <div className="flex items-center justify-center gap-3 mb-10">
    {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((num) => (
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
        {num !== TOTAL_STEPS && (
          <div
            className={`w-10 h-1 border-t-2 ${step > num ? "border-emerald-500" : "border-gray-100 dark:border-gray-800"}`}
          />
        )}
      </div>
    ))}
  </div>
);

const ApplicationForm = ({ onComplete }) => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Same idea as before — flat object, easy to extend with new fields later.
  // Just add a key here and a field in the relevant step; nothing else
  // needs to change structurally.
  const [formData, setFormData] = useState({
    // Step 1 — core account info (was ApplicationForm.jsx)
    referenceNo: "",
    meterType: "single",
    sanctionedLoad: "",
    unitTarget: 200,
    // Step 2 — cooling
    ac_qty: 0,
    ac_type: "Inverter",
    ac_ton: "1.5",
    fridge_qty: 1,
    // Step 3 — kitchen/heavy load
    oven_type: "Microwave",
    water_pump_hrs: "1-2 Hours",
    geyser_type: "Gas",
    washing_machine_freq: "3 times a week",
    // Step 4 — lifestyle (meterType removed from here — asked once, in step 1)
    occupancy: "Occupied",
    consentToAlerts: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const validateStep1 = () => {
    if (
      !formData.referenceNo.trim() ||
      !formData.meterType ||
      !formData.sanctionedLoad
    ) {
      toast.error("Please fill all required fields");
      return false;
    }
    if (Number(formData.sanctionedLoad) < 0) {
      toast.error("Sanctioned load cannot be negative");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      // 1. Core account info — required, this is the critical save.
      const appRes = await axiosServerInstance.patch("/user/application", {
        referenceNo: formData.referenceNo.trim(),
        meterType: formData.meterType,
        sanctionedLoad: Number(formData.sanctionedLoad),
        unitTarget: Number(formData.unitTarget),
      });

      if (appRes.data.success) {
        const updatedUser = appRes.data.user;
        login({ ...user, ...updatedUser });

        // Redirect to home
        navigate("/home", { replace: true });
        toast.success("Setup complete!");
      }

      // 2. Appliance profile — enrichment data, saved separately.
      // If this fails, the user's core account is still set up correctly,
      // so we don't block navigation on it — just warn.
      try {
        await axiosServerInstance.put("/appliance-profile", {
          acQty: Number(formData.ac_qty),
          acType: formData.ac_type,
          acTonnage: Number(formData.ac_ton),
          fridgeQty: Number(formData.fridge_qty),
          ovenType: formData.oven_type,
          waterPumpHours: formData.water_pump_hrs,
          geyserType: formData.geyser_type,
          washingMachineFreq: formData.washing_machine_freq,
          occupancy: formData.occupancy,
          consentToAlerts: formData.consentToAlerts,
        });
      } catch (error) {
        toast.error(
          "Account saved, but appliance details failed — you can add them later in Settings.",
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save your application",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Setup Your SlabGuard Profile
        </h1>
        <p className="text-gray-500 font-medium">
          A few quick steps so our AI can give you accurate predictions.
        </p>
      </div>

      <StepIndicator step={step} />

      <div className="bg-white dark:bg-[#1E293B] p-8 md:p-12 rounded-[45px] border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden">
        {/* STEP 1: CORE ACCOUNT INFO */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-2xl">
                <LuFileText size={24} />
              </div>
              <h2 className="text-xl font-black dark:text-white">
                Electricity Meter Info
              </h2>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Reference Number <span className="text-brand-blue">*</span>
                </label>
                <input
                  type="text"
                  name="referenceNo"
                  value={formData.referenceNo}
                  onChange={handleChange}
                  placeholder="Enter your electricity reference number"
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none ring-2 ring-transparent focus:ring-brand-blue/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                    Meter Type <span className="text-brand-blue">*</span>
                  </label>
                  <select
                    name="meterType"
                    value={formData.meterType}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                  >
                    <option value="single">Single Phase</option>
                    <option value="three">Three Phase</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                    Sanctioned Load (kW){" "}
                    <span className="text-brand-blue">*</span>
                  </label>
                  <input
                    type="number"
                    name="sanctionedLoad"
                    value={formData.sanctionedLoad}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    min="0"
                    step="0.1"
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Monthly Unit Target
                </label>
                <input
                  type="number"
                  name="unitTarget"
                  value={formData.unitTarget}
                  onChange={handleChange}
                  min="0"
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                />
                <p className="text-[10px] text-gray-500 ml-2">
                  Default target is 200 units per month.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: COOLING */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl">
                <LuSnowflake size={24} />
              </div>
              <h2 className="text-xl font-black dark:text-white">
                Cooling Appliances
              </h2>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Number of ACs
                </label>
                <input
                  type="number"
                  name="ac_qty"
                  value={formData.ac_qty}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
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
                  <option value="1.0">1.0</option>
                  <option value="1.5">1.5</option>
                  <option value="2.0">2.0</option>
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
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3+</option>
                </select>
              </div>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AC Quantity — hamesha dikhega */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Number of ACs
                </label>
                <input
                  type="number"
                  name="ac_qty"
                  min="0"
                  value={formData.ac_qty}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                />
              </div>

              {/* ✅ Sirf tab dikhein jab ACs hain */}
              {formData.ac_qty > 0 && (
                <>
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
                      <option value="1.0">1.0</option>
                      <option value="1.5">1.5</option>
                      <option value="2.0">2.0</option>
                    </select>
                  </div>
                </>
              )}

              {/* Fridge Qty — hamesha dikhega */}
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
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3+</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: KITCHEN & HEAVY LOAD */}
        {step === 3 && (
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
                {/* <select
                  name="geyser_type"
                  value={formData.geyser_type}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                >
                  <option>Gas</option>
                  <option>Electric</option>
                  <option>Solar</option>
                </select> */}
                <select
                  name="geyser_type"
                  value={formData.geyser_type}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold dark:text-white outline-none"
                >
                  <option value="None">None</option> 
                  <option value="Gas">Gas</option>
                  <option value="Electric">Electric</option>
                  <option value="Solar">Solar</option>
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

        {/* STEP 4: LIFESTYLE & SUMMARY — meterType NOT asked again, already have it from Step 1 */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl">
                <FaHome size={24} />
              </div>
              <h2 className="text-xl font-black dark:text-white">
                Lifestyle & Review
              </h2>
            </div>

            <div className="space-y-2 mb-6">
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

            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-black text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <LuZap size={16} /> Final Review
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
                <div className="flex justify-between border-b dark:border-gray-700 py-1">
                  <span className="text-gray-500 uppercase">Reference No:</span>
                  <span className="font-bold dark:text-white">
                    {formData.referenceNo || "—"}
                  </span>
                </div>
                <div className="flex justify-between border-b dark:border-gray-700 py-1">
                  <span className="text-gray-500 uppercase">Meter:</span>
                  <span className="font-bold dark:text-white">
                    {formData.meterType === "three"
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
              </div>
            </div>

            <div className="p-6 bg-brand-blue/5 rounded-[30px] border border-brand-blue/10 space-y-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic leading-snug">
                We'll track your{" "}
                {formData.meterType === "three"
                  ? "Peak Hours"
                  : "Slab Thresholds"}{" "}
                to keep your bill under control.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  name="consentToAlerts"
                  checked={formData.consentToAlerts}
                  onChange={handleChange}
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

        {/* NAVIGATION */}
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
            onClick={step === TOTAL_STEPS ? handleFinish : nextStep}
            disabled={isSaving}
            className="flex-[2] py-4 rounded-2xl bg-brand-gradient text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition cursor-pointer disabled:opacity-60"
          >
            {step === TOTAL_STEPS
              ? isSaving
                ? "Saving..."
                : "COMPLETE SETUP"
              : "CONTINUE"}{" "}
            <LuChevronRight size={20} />
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-center gap-1">
        <LuZap size={12} /> All data is encrypted and used for prediction only
      </p>
    </div>
  );
};

export default ApplicationForm;
