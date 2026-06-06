import React from "react";
import { 
  LuX, LuActivity, LuFileText, LuSmartphone, 
  LuTrendingUp, LuHistory, LuShieldAlert 
} from "react-icons/lu";

const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1E293B] rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-white font-black text-xl">
              {user.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-black dark:text-white italic">{user.name}</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{user.role} • ID: {user.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition cursor-pointer text-gray-500"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* 1. Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoBox icon={<LuFileText />} label="Reference No" value={user.refNo || "N/A"} />
            <InfoBox icon={<LuTrendingUp />} label="Meter Type" value={user.phase === 'three' ? '3-Phase (MDI)' : 'Single Phase'} />
            <InfoBox icon={<LuSmartphone />} label="Device" value="Android 14 • Chrome" />
          </div>

          {/* 2. Usage Stats & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[30px] border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-black dark:text-white mb-4 flex items-center gap-2">
                <LuActivity className="text-brand-blue" /> Usage Prediction (SlabGuard AI)
              </h3>
              {/* Placeholder for Graph */}
              <div className="h-40 w-full bg-white dark:bg-[#0B1220] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                <p className="text-xs text-gray-400 italic">Graph: Monthly Units vs Predictions</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black dark:text-white flex items-center gap-2">
                <LuHistory className="text-brand-blue" /> Recent OCR Logs
              </h3>
              {[1, 2].map((log) => (
                <div key={log} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-[10px] font-black">OCR</div>
                    <span className="text-xs font-bold dark:text-gray-300">Bill_Sept_2025.jpg</span>
                  </div>
                  <span className="text-[10px] text-gray-400">12 Oct, 2025</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Security Actions */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-black text-red-500 mb-4 flex items-center gap-2 italic">
              <LuShieldAlert /> Restricted Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-300 hover:text-red-500 rounded-xl text-xs font-bold transition">
                Reset Password
              </button>
              <button className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-gray-600 dark:text-gray-300 hover:text-orange-500 rounded-xl text-xs font-bold transition">
                Suspend Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component
const InfoBox = ({ icon, label, value }) => (
  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
    <div className="flex items-center gap-2 text-gray-400 mb-1">
      {React.cloneElement(icon, { size: 14 })}
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </div>
    <div className="text-sm font-bold dark:text-white">{value}</div>
  </div>
);

export default UserDetailModal;