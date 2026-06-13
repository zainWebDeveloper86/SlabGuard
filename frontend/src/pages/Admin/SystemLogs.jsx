// import React, { useState } from "react";
// import {
//   LuFileText,
//   LuActivity,
//   LuShieldAlert,
//   LuTerminal,
//   LuSearch,
//   LuFilter,
//   LuDownload,
//   LuTrash2,
//   LuServer,
//   LuDatabase,
//   LuCpu,
//   LuRefreshCw,
// } from "react-icons/lu";

// const SystemLogs = () => {
//   const [filter, setFilter] = useState("All");

//   // Dummy Logs Data
//   const logs = [
//     {
//       id: 1,
//       type: "Security",
//       event: "Unauthorized access attempt at /admin/settings",
//       user: "IP: 182.164.10.5",
//       time: "2 mins ago",
//       level: "Critical",
//     },
//     {
//       id: 2,
//       type: "System",
//       event: "Meta Prophet Model training completed successfully",
//       user: "System/AI",
//       time: "15 mins ago",
//       level: "Info",
//     },
//     {
//       id: 3,
//       type: "User",
//       event: "User Zain Ahmed updated Slab rates for Non-Protected",
//       user: "Admin",
//       time: "1 hour ago",
//       level: "Warning",
//     },
//     {
//       id: 4,
//       type: "OCR",
//       event: "Scan ID #9920 failed: Confidence score below 40%",
//       user: "Tesseract Engine",
//       time: "3 hours ago",
//       level: "Error",
//     },
//     {
//       id: 5,
//       type: "User",
//       event: "New user registration: Ali Khan",
//       user: "Public",
//       time: "5 hours ago",
//       level: "Info",
//     },
//   ];

//   const getLevelColor = (level) => {
//     switch (level) {
//       case "Critical":
//         return "text-red-500 bg-red-500/10 border-red-500/20";
//       case "Error":
//         return "text-orange-500 bg-orange-500/10 border-orange-500/20";
//       case "Warning":
//         return "text-amber-500 bg-amber-500/10 border-amber-500/20";
//       default:
//         return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
//     }
//   };

//   return (
//     <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
//       {/* ================= LIVE SYSTEM HEALTH ================= */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[35px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
//               <LuServer size={24} />
//             </div>
//             <div>
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                 Server Status
//               </p>
//               <p className="text-lg font-black dark:text-white">
//                 Online / Stable
//               </p>
//             </div>
//           </div>
//           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
//         </div>

//         <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[35px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
//           <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
//             <LuDatabase size={24} />
//           </div>
//           <div>
//             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
//               DB Latency
//             </p>
//             <p className="text-lg font-black dark:text-white">24ms</p>
//           </div>
//         </div>

//         <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[35px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
//           <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
//             <LuCpu size={24} />
//           </div>
//           <div>
//             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
//               AI Engine Load
//             </p>
//             <p className="text-lg font-black dark:text-white">12.5%</p>
//           </div>
//         </div>
//       </div>

//       {/* ================= LOGS MAIN SECTION ================= */}
//       <div className="bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
//         {/* LOGS HEADER & FILTERS */}
//         <div className="p-8 border-b border-gray-50 dark:border-gray-800 space-y-6">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//             <div>
//               <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
//                 <LuTerminal className="text-brand-blue" /> System Audit Logs
//               </h1>
//               <p className="text-sm text-gray-500 font-medium">
//                 Monitoring real-time events and security protocols.
//               </p>
//             </div>
//             <div className="flex gap-2">
//               <button className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-xl hover:text-brand-blue transition cursor-pointer">
//                 <LuRefreshCw size={18} />
//               </button>
//               <button className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition">
//                 <LuDownload size={16} /> Export Logs
//               </button>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-3">
//             {["All", "Security", "System", "User", "OCR"].map((cat) => (
//               <button
//                 key={cat}
//                 onClick={() => setFilter(cat)}
//                 className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition cursor-pointer ${
//                   filter === cat
//                     ? "bg-brand-blue text-white"
//                     : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100"
//                 }`}
//               >
//                 {cat}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* LOGS TABLE */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead className="bg-gray-50/50 dark:bg-gray-800/30 text-[10px] uppercase tracking-widest font-black text-gray-400">
//               <tr>
//                 <th className="px-8 py-5">Event Level</th>
//                 <th className="px-8 py-5">Activity Details</th>
//                 <th className="px-8 py-5">Actor / Origin</th>
//                 <th className="px-8 py-5 text-right">Timestamp</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
//               {logs.map((log) => (
//                 <tr
//                   key={log.id}
//                   className="group hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-all"
//                 >
//                   <td className="px-8 py-6">
//                     <span
//                       className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${getLevelColor(log.level)}`}
//                     >
//                       {log.level}
//                     </span>
//                   </td>
//                   <td className="px-8 py-6">
//                     <div className="flex items-center gap-3">
//                       <div className="text-gray-400 group-hover:text-brand-blue transition">
//                         {log.type === "Security" ? (
//                           <LuShieldAlert size={18} />
//                         ) : (
//                           <LuActivity size={18} />
//                         )}
//                       </div>
//                       <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
//                         {log.event}
//                       </p>
//                     </div>
//                   </td>
//                   <td className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-tighter">
//                     {log.user}
//                   </td>
//                   <td className="px-8 py-6 text-right text-xs font-bold text-gray-400 italic">
//                     {log.time}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* FOOTER ACTION */}
//         <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 flex justify-center border-t border-gray-50 dark:border-gray-800">
//           <button className="flex items-center gap-2 text-[10px] font-black uppercase text-red-400 hover:text-red-500 transition cursor-pointer">
//             <LuTrash2 size={14} /> Clear Logs Older than 30 Days
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SystemLogs;

import React, { useState } from "react";
import {
  LuFileText,
  LuActivity,
  LuShieldAlert,
  LuTerminal,
  LuSearch,
  // LuFilter,
  LuDownload,
  LuTrash2,
  LuServer,
  LuDatabase,
  LuCpu,
  LuRefreshCw,
  LuCircleCheck,
  LuCircleX,
  LuClock,
  LuCircleAlert
} from "react-icons/lu";

const SystemLogs = () => {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy Logs Data
  const logs = [
    {
      id: 1,
      type: "Security",
      event: "Unauthorized access attempt at /admin/settings",
      user: "IP: 182.164.10.5",
      time: "2 mins ago",
      level: "Critical",
    },
    {
      id: 2,
      type: "System",
      event: "Meta Prophet Model training completed successfully",
      user: "System/AI",
      time: "15 mins ago",
      level: "Info",
    },
    {
      id: 3,
      type: "User",
      event: "User Zain Ahmed updated Slab rates for Non-Protected",
      user: "Admin",
      time: "1 hour ago",
      level: "Warning",
    },
    {
      id: 4,
      type: "OCR",
      event: "Scan ID #9920 failed: Confidence score below 40%",
      user: "Tesseract Engine",
      time: "3 hours ago",
      level: "Error",
    },
    {
      id: 5,
      type: "User",
      event: "New user registration: Ali Khan",
      user: "Public",
      time: "5 hours ago",
      level: "Info",
    },
  ];

  // Filter logs based on type and search
  const filteredLogs = logs.filter((log) => {
    const matchesType = filter === "All" || log.type === filter;
    const matchesSearch =
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case "Critical":
        return {
          bg: "bg-red-500/10",
          text: "text-red-500",
          border: "border-red-500/20",
          icon: LuCircleX,
        };
      case "Error":
        return {
          bg: "bg-orange-500/10",
          text: "text-orange-500",
          border: "border-orange-500/20",
          icon: LuCircleX,
        };
      case "Warning":
        return {
          bg: "bg-amber-500/10",
          text: "text-amber-500",
          border: "border-amber-500/20",
          icon: LuCircleAlert,
        };
      default:
        return {
          bg: "bg-emerald-500/10",
          text: "text-emerald-500",
          border: "border-emerald-500/20",
          icon: LuCircleCheck,
        };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Security":
        return <LuShieldAlert size={18} />;
      case "System":
        return <LuServer size={18} />;
      case "User":
        return <LuActivity size={18} />;
      case "OCR":
        return <LuFileText size={18} />;
      default:
        return <LuTerminal size={18} />;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* ================= LIVE SYSTEM HEALTH ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white dark:bg-[#1E293B] p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2.5 md:p-3 bg-emerald-500/10 text-emerald-500 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">
              <LuServer size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Server Status
              </p>
              <p className="text-base md:text-lg font-black dark:text-white">
                Online / Stable
              </p>
            </div>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3 md:gap-4 group hover:shadow-md transition-all">
          <div className="p-2.5 md:p-3 bg-blue-500/10 text-blue-500 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">
            <LuDatabase size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
              DB Latency
            </p>
            <p className="text-base md:text-lg font-black dark:text-white">
              24ms
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3 md:gap-4 group hover:shadow-md transition-all">
          <div className="p-2.5 md:p-3 bg-purple-500/10 text-purple-500 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">
            <LuCpu size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
              AI Engine Load
            </p>
            <p className="text-base md:text-lg font-black dark:text-white">
              12.5%
            </p>
          </div>
        </div>
      </div>

      {/* ================= LOGS MAIN SECTION ================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* LOGS HEADER & FILTERS */}
        <div className="p-5 md:p-8 border-b border-gray-50 dark:border-gray-800 space-y-5 md:space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 md:gap-3">
                <LuTerminal className="text-brand-blue" /> System Audit Logs
              </h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                Monitoring real-time events and security protocols.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="p-2.5 md:p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-xl hover:text-brand-blue transition cursor-pointer">
                <LuRefreshCw size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-brand-blue text-white rounded-xl font-bold text-[10px] md:text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition">
                <LuDownload size={14} className="md:w-4 md:h-4" /> Export Logs
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <LuSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search logs by event or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 ring-brand-blue/20 transition"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            {["All", "Security", "System", "User", "OCR"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition cursor-pointer ${
                  filter === cat
                    ? "bg-brand-blue text-white"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* LOGS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-gray-50/50 dark:bg-gray-800/30 text-[9px] md:text-[10px] uppercase tracking-widest font-black text-gray-400">
              <tr>
                <th className="px-4 md:px-8 py-4 md:py-5">Event Level</th>
                <th className="px-4 md:px-8 py-4 md:py-5">Activity Details</th>
                <th className="px-4 md:px-8 py-4 md:py-5">Actor / Origin</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-right">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const LevelIcon = getLevelColor(log.level).icon;
                  const levelStyle = getLevelColor(log.level);

                  return (
                    <tr
                      key={log.id}
                      className="group hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-all"
                    >
                      <td className="px-4 md:px-8 py-5 md:py-6">
                        <div className="flex items-center gap-2">
                          <LevelIcon size={12} className={levelStyle.text} />
                          <span
                            className={`px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase border ${levelStyle.bg} ${levelStyle.text} ${levelStyle.border}`}
                          >
                            {log.level}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-5 md:py-6">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="text-gray-400 group-hover:text-brand-blue transition">
                            {getTypeIcon(log.type)}
                          </div>
                          <p className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200">
                            {log.event}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-5 md:py-6">
                        <div className="flex items-center gap-1">
                          <LuClock size={10} className="text-gray-400" />
                          <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-tighter">
                            {log.user}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-5 md:py-6 text-right text-[10px] md:text-xs font-bold text-gray-400 italic">
                        {log.time}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-8 py-12 text-center text-gray-400"
                  >
                    <LuTerminal size={40} className="mx-auto mb-3 opacity-30" />
                    No logs found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-gray-50 dark:border-gray-800">
          <div className="text-[9px] md:text-[10px] font-medium text-gray-400">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
          <button className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-red-400 hover:text-red-500 transition cursor-pointer">
            <LuTrash2 size={12} md:size-14 /> Clear Logs Older than 30 Days
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
