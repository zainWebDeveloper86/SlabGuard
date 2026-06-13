// import React, { useEffect, useState } from "react";
// import {
//   LuRefreshCw,
//   LuCamera,
//   LuCircleCheck,
//   LuChevronDown,
//   LuPlus,
//   LuX,
//   LuZap,
//   LuCpu,
//   LuFileText,
//   LuGauge,
// } from "react-icons/lu";
// import { BsUpcScan, BsSpeedometer } from "react-icons/bs";

// const MeterStatusCard = () => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isScanMenuOpen, setIsScanMenuOpen] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // const [meters] = useState([
//   //   {
//   //     id: 1,
//   //     label: "Home",
//   //     refNumber: "MEPCO-12345678901234",
//   //     status: "CONNECTED",
//   //   },
//   //   {
//   //     id: 2,
//   //     label: "Shop",
//   //     refNumber: "MEPCO-98765432109876",
//   //     status: "CONNECTED",
//   //   },
//   // ]);

//   const [activeMeter, setActiveMeter] = useState({
//     id: 1,
//     // label: "Home",
//     refNumber: "MEPCO-12345678901234",
//     status: "CONNECTED",
//   });

//   //   useRef is better, but ok for practice(but use in Topbar component)

//   useEffect(() => {
//     const handleClickOutside = () => {
//       // Close dropdowns only if modal is NOT open
//       if (!isModalOpen) {
//         setIsDropdownOpen(false);
//         setIsScanMenuOpen(false);
//       }
//     };

//     window.addEventListener("click", handleClickOutside);
//     return () => window.removeEventListener("click", handleClickOutside);
//   }, [isModalOpen]); // Add isModalOpen as dependency

//   //   useRef is better, but ok for practice
//   //   close modal, when press escape button

//   useEffect(() => {
//     const handleEsc = (e) => {
//       if (e.key === "Escape" && isModalOpen) {
//         setIsModalOpen(false);
//       }
//     };
//     window.addEventListener("keydown", handleEsc);
//     return () => window.removeEventListener("keydown", handleEsc);
//   }, [isModalOpen]);

//   return (
//     <>
//       <div className="bg-white dark:bg-[#1E293B] p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
//         {/* Mobile Layout (Stacked) */}
//         <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
//           {/* Top Row: Icon + Meter Info */}
//           <div className="flex items-start gap-3 sm:gap-4">
//             <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 dark:bg-blue-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
//               <LuZap size={22} className="sm:w-[26px] sm:h-[26px]" />
//             </div>

//             <div className="flex-1 min-w-0">
//               <div className="flex flex-wrap items-center gap-2 mb-1">
//                 {/* <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                   {activeMeter.label} Meter
//                 </p> */}
//                 <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
//                   <LuCircleCheck size={10} /> {activeMeter.status}
//                 </span>
//               </div>

//               {/* <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setIsDropdownOpen(!isDropdownOpen);
//                 }}
//                 className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight hover:text-blue-600 transition-colors w-full text-left"
//               >
//                 <span className="truncate">{activeMeter.refNumber}</span>
//                 <LuChevronDown
//                   size={16}
//                   className={`shrink-0 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
//                 />
//               </button> */}

//               {/* {isDropdownOpen && (
//                 <div className="absolute left-0 mt-2 mx-4 sm:mx-0 sm:left-auto sm:min-w-[280px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-20 overflow-hidden">
//                   {meters.map((meter) => (
//                     <button
//                       key={meter.id}
//                       onClick={() => {
//                         setActiveMeter(meter);
//                         setIsDropdownOpen(false);
//                       }}
//                       className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col border-b border-gray-50 dark:border-gray-700/50"
//                     >
//                       <span className="text-xs font-bold text-gray-400">
//                         {meter.label}
//                       </span>
//                       <span className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">
//                         {meter.refNumber}
//                       </span>
//                     </button>
//                   ))}
//                   <button
//                     onClick={() => {
//                       setIsModalOpen(true);
//                       setIsDropdownOpen(false);
//                     }}
//                     className="w-full text-left px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold text-sm flex items-center gap-2"
//                   >
//                     <LuPlus size={16} /> Add New Meter
//                   </button>
//                 </div>
//               )} */}
//             </div>
//           </div>

//           {/* Bottom Row: Action Buttons */}
//           <div className="flex flex-col min-[430px]:flex-row gap-4 w-full md:w-90">
//             <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer transition-all duration-200">
//               <LuRefreshCw size={16} className="text-blue-600" />
//               Sync
//             </button>

//             <div className="relative flex-1">
//               <button
//                 onClick={(e) => {
//                   setIsScanMenuOpen(!isScanMenuOpen);
//                   e.stopPropagation();
//                 }}
//                 className="w-full flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
//               >
//                 <LuCamera size={16} />
//                 Smart Scan
//                 <LuChevronDown
//                   size={12}
//                   className={`transition-transform ${isScanMenuOpen ? "rotate-180" : ""}`}
//                 />
//               </button>

//               {isScanMenuOpen && (
//                 <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl z-30 overflow-hidden">
//                   <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors border-b border-gray-50 dark:border-gray-700/50 cursor-pointer">
//                     <BsUpcScan size={16} className="text-blue-500" />
//                     <div className="flex flex-col">
//                       <span className="text-sm font-bold text-gray-900 dark:text-white">
//                         Scan Bill
//                       </span>
//                       <span className="text-[10px] text-gray-400">
//                         Extract Ref No.
//                       </span>
//                     </div>
//                   </button>
//                   <button
//                     onClick={() => setIsScanMenuOpen(false)}
//                     className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors cursor-pointer"
//                   >
//                     <BsSpeedometer size={16} className="text-emerald-500" />
//                     <div className="flex flex-col">
//                       <span className="text-sm font-bold text-gray-900 dark:text-white">
//                         Scan Meter
//                       </span>
//                       <span className="text-[10px] text-gray-400">
//                         Get Live Units
//                       </span>
//                     </div>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MODAL - Same as before, just responsive */}
//       {isModalOpen && (
//         <div
//           className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md my-0"
//           onClick={() => setIsModalOpen(false)}
//         >
//           <div
//             className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative mx-4"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               onClick={() => setIsModalOpen(false)}
//               className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full"
//             >
//               <LuX size={20} />
//             </button>

//             <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
//               Setup New Meter
//             </h2>
//             <p className="text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6 font-medium">
//               Add details for precise AI-powered slab prediction.
//             </p>

//             <form
//               className="space-y-4 sm:space-y-5"
//               onSubmit={(e) => e.preventDefault()}
//             >
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
//                     Reference No.
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="14-digit No."
//                     className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 dark:text-white rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 outline-none transition-all text-sm"
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
//                     Meter Label
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="e.g. My Shop"
//                     className="w-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 dark:text-white rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 outline-none transition-all text-sm"
//                   />
//                 </div>
//               </div>

//               <div className="bg-blue-50/50 dark:bg-blue-500/5 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-blue-100 dark:border-blue-500/10">
//                 <div className="flex items-center gap-2 mb-3 sm:mb-4">
//                   <LuCpu size={14} className="text-blue-600" />
//                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
//                     Load Profile Settings
//                   </span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-2 sm:gap-3">
//                   {[
//                     "Air Conditioner",
//                     "Electric Heater",
//                     "Water Pump",
//                     "Electric Oven",
//                   ].map((item) => (
//                     <label
//                       key={item}
//                       className="group flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:shadow-md border border-transparent hover:border-blue-500/30 transition-all"
//                     >
//                       <input
//                         type="checkbox"
//                         className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded accent-blue-600"
//                       />
//                       <span className="text-[11px] sm:text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-blue-600 transition-colors truncate">
//                         {item}
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-600/30 active:scale-95 transition-all text-sm sm:text-base"
//               >
//                 Add & Analyze Meter
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default MeterStatusCard;

import React, { useState } from "react";
import {
  LuRefreshCw,
  LuCamera,
  LuCircleCheck,
  LuChevronDown,
  LuZap,
} from "react-icons/lu";
import { BsUpcScan, BsSpeedometer } from "react-icons/bs";

const MeterStatusCard = () => {
  const [isScanMenuOpen, setIsScanMenuOpen] = useState(false);

  // Single meter (no dropdown, no modal)
  const meter = {
    refNumber: "MEPCO-12345678901234",
    status: "CONNECTED",
  };

  return (
    <>
      <div className="bg-white dark:bg-[#1E293B] p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
          {/* Left side: Icon + Meter info */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 dark:bg-blue-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
              <LuZap size={22} className="sm:w-[26px] sm:h-[26px]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                  <LuCircleCheck size={10} /> {meter.status}
                </span>
              </div>
              <p className="text-base sm:text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {meter.refNumber}
              </p>
            </div>
          </div>

          {/* Right side: Action Buttons */}
          <div className="flex flex-col min-[430px]:flex-row gap-4 w-full md:w-90">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer transition-all duration-200">
              <LuRefreshCw size={16} className="text-blue-600" />
              Sync
            </button>

            <div className="relative flex-1">
              <button
                onClick={(e) => {
                  setIsScanMenuOpen(!isScanMenuOpen);
                  e.stopPropagation();
                }}
                className="w-full flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <LuCamera size={16} />
                Smart Scan
                <LuChevronDown
                  size={12}
                  className={`transition-transform ${isScanMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isScanMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl z-30 overflow-hidden">
                  <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors border-b border-gray-50 dark:border-gray-700/50 cursor-pointer">
                    <BsUpcScan size={16} className="text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        Scan Bill
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Extract Ref No.
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsScanMenuOpen(false)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <BsSpeedometer size={16} className="text-emerald-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        Scan Meter
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Get Live Units
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MeterStatusCard;
