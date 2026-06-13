// import React from "react";
// import {
//   LuTable,
//   LuInfo,
//   LuFileText,
//   LuCircleAlert,
//   LuClock,
//   LuArrowLeft,
//   LuExternalLink,
// } from "react-icons/lu";
// // import { useNavigate } from 'react-router-dom';

// const TariffGuide = () => {
//   //   const navigate = useNavigate();

//   const residentialSlabs = [
//     {
//       range: "01 - 100",
//       rate: "16.48",
//       type: "Protected",
//       color: "text-emerald-500",
//     },
//     {
//       range: "101 - 200",
//       rate: "22.95",
//       type: "Protected",
//       color: "text-emerald-500",
//     },
//     {
//       range: "201 - 300",
//       rate: "34.20",
//       type: "Non-Protected",
//       color: "text-amber-500",
//     },
//     {
//       range: "301 - 700",
//       rate: "39.15",
//       type: "Non-Protected",
//       color: "text-orange-500",
//     },
//     {
//       range: "Above 700",
//       rate: "42.72",
//       type: "Non-Protected",
//       color: "text-red-500",
//     },
//   ];

//   return (
//     <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
//       {/* ================= HEADER ================= */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           {/* <button
//             onClick={() => navigate(-1)}
//             className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-blue transition mb-2"
//           >
//             <LuArrowLeft size={16} /> Back to Prediction
//           </button> */}
//           <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
//             <LuTable className="text-brand-blue" /> MEPCO Tariff Guide 2026
//           </h1>
//           <p className="text-gray-500 dark:text-gray-400 font-medium italic">
//             Official Unit Rates & Slab Information
//           </p>
//         </div>
//         <div className="bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-2xl border border-brand-blue/20 text-xs font-black uppercase tracking-widest">
//           Last Updated: April 2026
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//         {/* LEFT COLUMN: THE TABLE */}
//         <div className="lg:col-span-8 space-y-8">
//           <div className="bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
//             <div className="p-8 border-b border-gray-50 dark:border-gray-800">
//               <h3 className="text-xl font-black dark:text-white">
//                 Residential Tariff (A-1)
//               </h3>
//               <p className="text-sm text-gray-500">
//                 The most common tariff for household consumers.
//               </p>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="min-w-[500px] w-full text-left">
//                 <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
//                   <tr>
//                     <th className="px-8 py-5">Unit Range</th>
//                     <th className="px-8 py-5 text-center">Rate (Rs./Unit)</th>
//                     <th className="px-8 py-5 text-right">Slab Category</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
//                   {residentialSlabs.map((slab, i) => (
//                     <tr
//                       key={i}
//                       className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
//                     >
//                       <td className="px-8 py-6 font-black text-gray-700 dark:text-gray-200">
//                         {slab.range}
//                       </td>
//                       <td className="px-8 py-6 text-center">
//                         <span className="text-lg font-black text-brand-blue italic">
//                           Rs. {slab.rate}
//                         </span>
//                       </td>
//                       <td className="px-8 py-6 text-right">
//                         <span
//                           className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${slab.color} bg-current/10`}
//                         >
//                           {slab.type}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* PEAK HOURS NOTICE */}
//           <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 p-8 rounded-[40px] flex items-start gap-6 relative overflow-hidden group">
//             <LuClock className="text-amber-500 shrink-0" size={32} />
//             <div className="relative z-10">
//               <h4 className="text-lg font-black text-amber-900 dark:text-amber-400 mb-2">
//                 Peak Hours Schedule
//               </h4>
//               <p className="text-sm text-amber-800/80 dark:text-amber-400/70 leading-relaxed font-medium">
//                 MEPCO charges higher rates during peak hours. Current peak
//                 timing: <br />
//                 <span className="text-amber-600 dark:text-amber-300 font-black text-lg">
//                   06:00 PM – 10:00 PM
//                 </span>
//               </p>
//             </div>
//             <div className="absolute right-0 top-0 p-8 text-amber-500/10 group-hover:scale-110 transition-transform">
//               <LuClock size={120} />
//             </div>
//           </div>
//         </div>

//         {/* RIGHT COLUMN: TAXES & INFO */}
//         <div className="lg:col-span-4 space-y-8">
//           {/* TAXES LIST */}
//           <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
//             <h3 className="text-xl font-black mb-6 dark:text-white flex items-center gap-2">
//               <LuFileText className="text-brand-blue" /> Tax Breakdown
//             </h3>
//             <div className="space-y-6">
//               <div className="flex justify-between items-center group">
//                 <div>
//                   <p className="text-sm font-black dark:text-white">GST</p>
//                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
//                     Sales Tax
//                   </p>
//                 </div>
//                 <span className="font-bold text-gray-400">18%</span>
//               </div>
//               <div className="flex justify-between items-center group">
//                 <div>
//                   <p className="text-sm font-black dark:text-white">ED</p>
//                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
//                     Electricity Duty
//                   </p>
//                 </div>
//                 <span className="font-bold text-gray-400">1.5%</span>
//               </div>
//               <div className="flex justify-between items-center group">
//                 <div>
//                   <p className="text-sm font-black dark:text-white">IT</p>
//                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
//                     Income Tax
//                   </p>
//                 </div>
//                 <span className="font-bold text-gray-400">Varies</span>
//               </div>
//               <div className="flex justify-between items-center group">
//                 <div>
//                   <p className="text-sm font-black dark:text-white">FPA</p>
//                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
//                     Fuel Adjustment
//                   </p>
//                 </div>
//                 <span className="font-bold text-gray-400">Monthly</span>
//               </div>
//             </div>
//           </div>

//           {/* PROTECTED SLAB INFO */}
//           <div className="bg-brand-gradient p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
//             <LuInfo className="absolute -right-4 -top-4 w-32 h-32 opacity-10" />
//             <h4 className="text-lg font-black mb-4 relative z-10 flex items-center gap-2">
//               <LuCircleAlert /> Protected Status?
//             </h4>
//             <p className="text-sm text-blue-50 font-medium leading-relaxed mb-4 relative z-10">
//               To stay in the **Protected Slab**, your usage must be below **200
//               units** for 6 consecutive months.
//             </p>
//             <a
//               href="https://mepco.com.pk"
//               target="_blank"
//               className="relative z-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 p-3 rounded-xl transition w-fit"
//             >
//               MEPCO Website <LuExternalLink size={14} />
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TariffGuide;

import React, { useState } from "react";
import {
  LuTable,
  LuInfo,
  LuFileText,
  LuCircleAlert,
  LuClock,
  LuExternalLink,
  LuPencilLine,
  LuCheck,
  LuX,
} from "react-icons/lu";
import { useAuth } from "../../hooks/useAuth";

const TariffGuide = () => {
  const { user } = useAuth();
  // console.log(user);
  const isAdmin = user?.role === "admin";
  // isAdmin prop se toggle hoga
  const [slabs, setSlabs] = useState([
    {
      range: "01 - 100",
      rate: "16.48",
      type: "Protected",
      color: "text-emerald-500",
    },
    {
      range: "101 - 200",
      rate: "22.95",
      type: "Protected",
      color: "text-emerald-500",
    },
    {
      range: "201 - 300",
      rate: "34.20",
      type: "Non-Protected",
      color: "text-amber-500",
    },
    {
      range: "301 - 700",
      rate: "39.15",
      type: "Non-Protected",
      color: "text-orange-500",
    },
    {
      range: "Above 700",
      rate: "42.72",
      type: "Non-Protected",
      color: "text-red-500",
    },
  ]);

  const [editingIndex, setEditingIndex] = useState(null);
  const [tempRate, setTempRate] = useState("");

  const handleEdit = (index, currentRate) => {
    setEditingIndex(index);
    setTempRate(currentRate);
  };

  const handleSave = (index) => {
    const newSlabs = [...slabs];
    newSlabs[index].rate = tempRate;
    setSlabs(newSlabs);
    setEditingIndex(null);
    // Yahan Backend API call hogi: axios.put('/api/tariff', newSlabs[index])
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <LuTable className="text-brand-blue" /> MEPCO Tariff Guide 2026
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium italic">
            Official Unit Rates & Slab Information{" "}
            {isAdmin && (
              <span className="text-brand-blue font-black ml-2 text-xs uppercase not-italic">
                [Admin Mode]
              </span>
            )}
          </p>
        </div>
        <div className="bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-2xl border border-brand-blue/20 text-xs font-black uppercase tracking-widest">
          Last Updated: April 2026
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: THE TABLE */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black dark:text-white">
                  Residential Tariff (A-1)
                </h3>
                <p className="text-sm text-gray-500">
                  Household consumer rates management.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[500px] w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                  <tr>
                    <th className="px-8 py-5">Unit Range</th>
                    <th className="px-8 py-5 text-center">Rate (Rs./Unit)</th>
                    <th className="px-8 py-5 text-right">Slab Category</th>
                    {isAdmin && (
                      <th className="px-8 py-5 text-right">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {slabs.map((slab, i) => (
                    <tr
                      key={i}
                      className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
                    >
                      <td className="px-8 py-6 font-black text-gray-700 dark:text-gray-200">
                        {slab.range}
                      </td>
                      <td className="px-8 py-6 text-center">
                        {editingIndex === i ? (
                          <div className="flex items-center justify-center gap-2 animate-in zoom-in-95">
                            <span className="text-brand-blue font-black">
                              Rs.
                            </span>
                            <input
                              type="number"
                              value={tempRate}
                              onChange={(e) => setTempRate(e.target.value)}
                              className="w-20 bg-gray-100 dark:bg-gray-900 border-none rounded-lg px-2 py-1 text-center font-black text-brand-blue outline-none ring-2 ring-brand-blue/30"
                            />
                          </div>
                        ) : (
                          <span className="text-lg font-black text-brand-blue italic">
                            Rs. {slab.rate}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${slab.color} bg-current/10`}
                        >
                          {slab.type}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-8 py-6 text-right">
                          {editingIndex === i ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleSave(i)}
                                className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                              >
                                <LuCheck size={16} />
                              </button>
                              <button
                                onClick={() => setEditingIndex(null)}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition cursor-pointer"
                              >
                                <LuX size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEdit(i, slab.rate)}
                              className="p-2 text-gray-400 hover:text-brand-blue transition cursor-pointer opacity-0 group-hover:opacity-100"
                            >
                              <LuPencilLine size={18} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PEAK HOURS NOTICE (Keep same) */}
          <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 p-8 rounded-[40px] flex items-start gap-6 relative overflow-hidden group">
            <LuClock className="text-amber-500 shrink-0" size={32} />
            <div className="relative z-10">
              <h4 className="text-lg font-black text-amber-900 dark:text-amber-400 mb-2">
                Peak Hours Schedule
              </h4>
              <p className="text-sm text-amber-800/80 dark:text-amber-400/70 leading-relaxed font-medium">
                Current timing: <br />
                <span className="text-amber-600 dark:text-amber-300 font-black text-lg">
                  06:00 PM – 10:00 PM
                </span>
              </p>
            </div>
            <div className="absolute right-0 top-0 p-8 text-amber-500/10 group-hover:scale-110 transition-transform">
              <LuClock size={120} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Keep same) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-black mb-6 dark:text-white flex items-center gap-2">
              <LuFileText className="text-brand-blue" /> Tax Breakdown
            </h3>
            
            <div className="space-y-6">
              <TaxRow label="GST" sub="Sales Tax" val="18%" isAdmin={isAdmin} />
              <TaxRow
                label="ED"
                sub="Electricity Duty"
                val="1.5%"
                isAdmin={isAdmin}
              />
              <TaxRow
                label="IT"
                sub="Income Tax"
                val="Varies"
                isAdmin={isAdmin}
              />
              <TaxRow
                label="FPA"
                sub="Fuel Adjustment"
                val="Monthly"
                isAdmin={isAdmin}
              />
            </div>
          </div>

          <div className="bg-brand-gradient p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
            <LuInfo className="absolute -right-4 -top-4 w-32 h-32 opacity-10" />
            <h4 className="text-lg font-black mb-4 relative z-10 flex items-center gap-2">
              <LuCircleAlert /> Protected Status?
            </h4>
            <p className="text-sm text-blue-50 font-medium leading-relaxed mb-4 relative z-10">
              To stay in the **Protected Slab**, usage must be below **200
              units** for 6 consecutive months.
            </p>
            <a
              href="https://mepco.com.pk"
              target="_blank"
              className="relative z-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 p-3 rounded-xl transition w-fit"
            >
              MEPCO Website <LuExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// const TaxRow = ({ label, sub, val }) => (
//   <div className="flex justify-between items-center group">
//     <div>
//       <p className="text-sm font-black dark:text-white">{label}</p>
//       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
//         {sub}
//       </p>
//     </div>
//     <span className="font-bold text-gray-400">{val}</span>
//   </div>
// );

const TaxRow = ({ label, sub, val, isAdmin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentVal, setCurrentVal] = useState(val);
  const [tempVal, setTempVal] = useState(val);

  const handleSave = () => {
    setCurrentVal(tempVal);
    setIsEditing(false);
    // console.log(`Saving ${label}: ${tempVal}`); // Backend API call here
  };

  return (
    <div className="flex justify-between items-center group h-10">
      <div>
        <p className="text-sm font-black dark:text-white">{label}</p>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
          {sub}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-1 animate-in zoom-in-95">
            <input
              type="text"
              value={tempVal}
              onChange={(e) => setTempVal(e.target.value)}
              className="w-16 bg-gray-50 dark:bg-gray-900 border border-brand-blue/30 rounded px-2 py-0.5 text-right text-xs font-bold text-brand-blue outline-none"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="text-emerald-500 hover:scale-110 transition cursor-pointer"
            >
              <LuCheck size={14} />
            </button>
            <button
              onClick={() => {
                setTempVal(currentVal);
                setIsEditing(false);
              }}
              className="text-red-500 hover:scale-110 transition cursor-pointer"
            >
              <LuX size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-400">{currentVal}</span>
            {isAdmin && (
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-brand-blue transition cursor-pointer"
              >
                <LuPencilLine size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TariffGuide;
