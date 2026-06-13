import React, { useState } from "react";
import {
  LuUser,
  LuZap,
  LuBell,
  LuShieldCheck,
  LuCamera,
  LuSave,
  LuTrash2,
  LuTriangleAlert,
} from "react-icons/lu";
import useravator from "../../assets/avator.jpg";
import { useAuth } from "../../hooks/useAuth";


const Settings = () => {

  const {user} = useAuth();

  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState("profile");
  const [meterType, setMeterType] = useState("single"); // Adaptive Logic State

  // Form States (Inhain aap backend se fetch karke populate karenge)
  const [formData, setFormData] = useState({
    name: "Zain Ahmed",
    email: "zain@email.com",
    refNo: "12345678901234",
    sanctionedLoad: "5",
    unitTarget: "300",
  });

  // const tabs = [
  //   { id: "profile", label: "Profile", icon: <LuUser size={18} /> },
  //   { id: "electricity", label: "Electricity", icon: <LuZap size={18} /> },
  //   { id: "notifications", label: "Alerts", icon: <LuBell size={18} /> },
  //   { id: "security", label: "Security", icon: <LuShieldCheck size={18} /> },
  // ];

  // ✅ 1. Conditional Tabs Logic
  const tabs = [
    { id: "profile", label: "Profile", icon: <LuUser size={18} /> },
    // Agar admin NAHI hai, to hi Electricity aur Alerts dikhao
    ...(!isAdmin
      ? [
          { id: "electricity", label: "Electricity", icon: <LuZap size={18} /> },
          { id: "notifications", label: "Alerts", icon: <LuBell size={18} /> },
        ]
      : []),
    { id: "security", label: "Security", icon: <LuShieldCheck size={18} /> },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black dark:text-white italic">
          Account Settings
        </h1>
        <p className="text-gray-500 font-medium">
          Manage your identity and SlabGuard preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ================= SIDEBAR TABS ================= */}
        <div className="lg:w-66 flex flex-row lg:flex-col gap-3 max-lg:overflow-x-auto pb-6 lg:pb-0">
        {/* <div className="lg:w-66 flex flex-row lg:flex-col gap-3 pb-2 lg:pb-0"> */}
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`outline-none cursor-pointer flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-brand-blue text-white shadow-lg shadow-blue-500/30 translate-x-1"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ================= MAIN CONTENT AREA ================= */}
        <div className="flex-1 bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 p-6 md:p-10 shadow-sm min-h-[500px]">
          {/* --- TAB 1: PROFILE --- */}
          {activeTab === "profile" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-gray-50 dark:border-gray-800 pb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                    <img
                      src={useravator}
                      alt="Avatar"
                    />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-brand-blue text-white rounded-full shadow-lg hover:scale-110 transition cursor-pointer">
                    <LuCamera size={16} />
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-black dark:text-white italic">
                    Your Photo
                  </h3>
                  <p className="text-sm text-gray-500">
                    Allowed JPG, GIF or PNG. Max size of 800K
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                  label="Full Name"
                  value={formData.name}
                  placeholder="Zain Ahmed"
                />
                <InputGroup
                  label="Email Address"
                  value={formData.email}
                  placeholder="zain@email.com"
                />
              </div>
            </div>
          )}

          {/* --- TAB 2: ELECTRICITY (ADAPTIVE LOGIC) --- */}
          {activeTab === "electricity" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                  label="MEPCO Reference No"
                  value={formData.refNo}
                  placeholder="14 Digit Number"
                />

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                    Meter Type
                  </label>
                  <select
                    value={meterType}
                    onChange={(e) => setMeterType(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                  >
                    <option value="single">Single Phase</option>
                    <option value="three">Three Phase</option>
                  </select>
                </div>

                {/* CONDITIONAL RENDERING FOR 3-PHASE (MDI Logic) */}
                {meterType === "three" && (
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/50 dark:bg-blue-500/5 rounded-3xl border border-blue-100 dark:border-blue-900/30 animate-in zoom-in-95 duration-300">
                    <InputGroup
                      label="Sanctioned Load (kW)"
                      value={formData.sanctionedLoad}
                      placeholder="Enter load in kW"
                      info="This is mentioned on the top-right corner of your bill."
                    />
                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 p-4">
                      <LuTriangleAlert size={24} />
                      <p className="text-xs font-medium italic">
                        MDI penalties may apply if load exceeds the sanctioned limit on 3-phase meters.
                      </p>
                    </div>
                  </div>
                )}

                <InputGroup
                  label="Monthly Unit Target"
                  value={formData.unitTarget}
                  placeholder="e.g. 300"
                />
              </div>
            </div>
          )}

          {/* --- TAB 3: NOTIFICATIONS --- */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <ToggleRow
                title="Slab Breach Alerts"
                desc="Receive a notification when usage is close to the next slab."
                active
              />
              <ToggleRow
                title="Peak Hour Reminder"
                desc="Reminder to turn off appliances at 6 PM."
                active
              />
              {meterType === "three" && (
                <ToggleRow
                  title="MDI Overload Alert"
                  desc="Get alerted when load exceeds 90% of the sanctioned load."
                  active
                />
              )}
              <ToggleRow
                title="Weekly Usage Report"
                desc="Receive a weekly summary via email every Sunday."
              />
            </div>
          )}

          {/* --- TAB 4: SECURITY --- */}
          {activeTab === "security" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 gap-6">
                <InputGroup
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                  />
                  <InputGroup
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                <h4 className="text-red-500 font-black italic mb-2">
                  Danger Zone
                </h4>
                <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-500 transition cursor-pointer">
                  <LuTrash2 size={16} /> Delete my SlabGuard account and data
                </button>
              </div>
            </div>
          )}

          {/* SAVE BUTTON FOOTER */}
          <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-800 flex justify-end">
            <button className="bg-brand-gradient text-white px-10 py-4 rounded-full font-black flex items-center gap-3 hover:shadow-xl hover:-translate-y-1 transition active:scale-95 cursor-pointer">
              Save Changes <LuSave size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- REUSABLE COMPONENTS FOR CLEANER CODE ---

const InputGroup = ({ label, value, placeholder, type = "text", info }) => (
  <div className="space-y-2">
    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
      {label}
    </label>
    <input
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold transition"
    />
    {info && <p className="text-[10px] text-gray-400 ml-2 italic">{info}</p>}
  </div>
);

const ToggleRow = ({ title, desc, active = false }) => (
  <div className="flex items-center justify-between p-6 rounded-3xl border border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
    <div>
      <h4 className="font-bold dark:text-white">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
    <div
      className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${active ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition-transform ${active ? "translate-x-6" : "translate-x-0"}`}
      />
    </div>
  </div>
);

export default Settings;
