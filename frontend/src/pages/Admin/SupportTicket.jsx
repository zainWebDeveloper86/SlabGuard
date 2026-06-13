// import React, { useState } from "react";
// import {
//   LuMessageCircleQuestion,
//   LuClock,
//   LuCheckCircle2,
//   LuAlertCircle,
//   LuUser,
//   LuSend,
//   LuPaperclip,
//   LuMoveVertical,
//   LuSearch,
//   LuFilter,
// } from "react-icons/lu";

// const SupportTickets = () => {
//   const [selectedTicket, setSelectedTicket] = useState(null);

//   // Dummy Tickets Data
//   const tickets = [
//     {
//       id: "TKT-102",
//       user: "Zain Ahmed",
//       subject: "OCR Scan Failure",
//       status: "Open",
//       priority: "High",
//       time: "2h ago",
//       msg: "Mera bill scan nahi ho raha, error 404 aa raha hai.",
//     },
//     {
//       id: "TKT-105",
//       user: "Ali Khan",
//       subject: "Slab Prediction Query",
//       status: "In-Progress",
//       priority: "Medium",
//       time: "5h ago",
//       msg: "AI keh raha hai units 300 cross karein gay lekin mere 250 hain.",
//     },
//     {
//       id: "TKT-108",
//       user: "Sara Malik",
//       subject: "Account Recovery",
//       status: "Resolved",
//       priority: "Low",
//       time: "1d ago",
//       msg: "Password reset link nahi mil raha.",
//     },
//   ];

//   return (
//     <div className="p-4 md:p-8 h-[calc(100vh-120px)] animate-in fade-in duration-700">
//       <div className="flex flex-col md:flex-row h-full gap-6">
//         {/* ================= LEFT: TICKET LIST ================= */}
//         <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4">
//           <div className="flex items-center justify-between px-2">
//             <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
//               <LuMessageCircleQuestion className="text-brand-blue" /> Tickets
//             </h1>
//             <span className="bg-brand-blue text-white text-[10px] font-black px-2 py-1 rounded-full">
//               {tickets.filter((t) => t.status !== "Resolved").length} NEW
//             </span>
//           </div>

//           <div className="relative">
//             <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search tickets..."
//               className="w-full bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 ring-brand-blue/20"
//             />
//           </div>

//           <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
//             {tickets.map((ticket) => (
//               <div
//                 key={ticket.id}
//                 onClick={() => setSelectedTicket(ticket)}
//                 className={`p-4 rounded-[25px] border cursor-pointer transition-all duration-300 ${
//                   selectedTicket?.id === ticket.id
//                     ? "bg-brand-blue border-brand-blue text-white shadow-lg shadow-blue-500/20"
//                     : "bg-white dark:bg-[#1E293B] border-gray-100 dark:border-gray-800 hover:border-brand-blue/30"
//                 }`}
//               >
//                 <div className="flex justify-between items-start mb-2">
//                   <span
//                     className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
//                       selectedTicket?.id === ticket.id
//                         ? "bg-white/20 text-white"
//                         : "bg-gray-100 dark:bg-gray-800 text-gray-500"
//                     }`}
//                   >
//                     {ticket.id}
//                   </span>
//                   <span className="text-[10px] font-bold opacity-60">
//                     {ticket.time}
//                   </span>
//                 </div>
//                 <h4
//                   className={`font-black text-sm mb-1 ${selectedTicket?.id === ticket.id ? "text-white" : "dark:text-white"}`}
//                 >
//                   {ticket.subject}
//                 </h4>
//                 <p
//                   className={`text-xs truncate ${selectedTicket?.id === ticket.id ? "text-blue-100" : "text-gray-500"}`}
//                 >
//                   {ticket.msg}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ================= RIGHT: CONVERSATION ================= */}
//         <div className="w-full flex-1 bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden min-h-[500px] md:min-h-0">
//           {selectedTicket ? (
//             <>
//               {/* CHAT HEADER */}
//               <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
//                     <LuUser size={24} />
//                   </div>
//                   <div>
//                     <h3 className="font-black dark:text-white">
//                       {selectedTicket.user}
//                     </h3>
//                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                       Priority:{" "}
//                       <span className="text-brand-blue">
//                         {selectedTicket.priority}
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <select className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer">
//                     <option>Open</option>
//                     <option>In-Progress</option>
//                     <option>Resolved</option>
//                   </select>
//                   <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition text-gray-400">
//                     <LuMoveVertical />
//                   </button>
//                 </div>
//               </div>

//               {/* CHAT MESSAGES */}
//               <div className="flex-1 p-8 overflow-y-auto space-y-6">
//                 <div className="flex flex-col items-start max-w-[80%]">
//                   <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-3xl rounded-tl-none text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {selectedTicket.msg}
//                   </div>
//                   <span className="text-[10px] font-bold text-gray-400 mt-2 ml-2">
//                     USER • 10:45 AM
//                   </span>
//                 </div>

//                 <div className="flex flex-col items-end max-w-[80%] ml-auto">
//                   <div className="bg-brand-blue p-4 rounded-3xl rounded-tr-none text-sm font-medium text-white shadow-md shadow-blue-500/10">
//                     Aslam o Alaikum Zain! Hum ne aapka account check kar liya
//                     hai. Aap please app ko update karein aur dubara photo
//                     kheenchein.
//                   </div>
//                   <span className="text-[10px] font-bold text-gray-400 mt-2 mr-2">
//                     ADMIN (YOU) • 11:02 AM
//                   </span>
//                 </div>
//               </div>

//               {/* CHAT INPUT */}
//               <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-50 dark:border-gray-800">
//                 <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
//                   <button className="p-2 text-gray-400 hover:text-brand-blue transition">
//                     <LuPaperclip size={20} />
//                   </button>
//                   <input
//                     type="text"
//                     placeholder="Type your reply here..."
//                     className="flex-1 bg-transparent border-none outline-none text-sm font-bold p-2 text-gray-700 dark:text-white"
//                   />
//                   <button className="bg-brand-blue text-white p-3 rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-500/20">
//                     <LuSend size={18} />
//                   </button>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
//               <LuMessageCircleQuestion
//                 size={80}
//                 className="text-gray-300 mb-4"
//               />
//               <h3 className="text-xl font-black dark:text-white">
//                 Select a ticket to respond
//               </h3>
//               <p className="text-sm font-medium text-gray-500">
//                 Pick any active support request from the list on the left.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SupportTickets;


import React, { useState } from "react";
import {
  LuMessageCircleQuestion,
  LuClock,
  LuCircleCheck,
  LuCircleAlert,
  LuUser,
  LuSend,
  LuPaperclip,
  LuMoveVertical,
  LuSearch,
  LuFilter,
  LuCircleX,
} from "react-icons/lu";

const SupportTickets = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy Tickets Data
  const tickets = [
    {
      id: "TKT-102",
      user: "Zain Ahmed",
      subject: "OCR Scan Failure",
      status: "Open",
      priority: "High",
      time: "2h ago",
      msg: "Mera bill scan nahi ho raha, error 404 aa raha hai.",
    },
    {
      id: "TKT-105",
      user: "Ali Khan",
      subject: "Slab Prediction Query",
      status: "In-Progress",
      priority: "Medium",
      time: "5h ago",
      msg: "AI keh raha hai units 300 cross karein gay lekin mere 250 hain.",
    },
    {
      id: "TKT-108",
      user: "Sara Malik",
      subject: "Account Recovery",
      status: "Resolved",
      priority: "Low",
      time: "1d ago",
      msg: "Password reset link nahi mil raha.",
    },
  ];

  // Filter tickets based on status and search
  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return { icon: LuCircleAlert, color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10" };
      case "In-Progress":
        return { icon: LuClock, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" };
      case "Resolved":
        return { icon: LuCircleCheck, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" };
      default:
        return { icon: LuCircleX, color: "text-gray-500 bg-gray-50 dark:bg-gray-500/10" };
    }
  };

  // Priority badge color
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400";
      case "Medium":
        return "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400";
      case "Low":
        return "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-120px)] animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row h-full gap-6">
        {/* ================= LEFT: TICKET LIST ================= */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
              <LuMessageCircleQuestion className="text-brand-blue" /> Tickets
            </h1>
            <span className="bg-brand-blue text-white text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
              <LuCircleAlert size={10} />
              {tickets.filter((t) => t.status !== "Resolved").length} OPEN
            </span>
          </div>

          {/* Search Bar with Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold outline-none focus:ring-2 ring-brand-blue/20"
              />
            </div>
            
            {/* Filter Button with Icon */}
            <button className="p-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-brand-blue transition">
              <LuFilter size={18} />
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 px-1">
            {["all", "Open", "In-Progress", "Resolved"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-[10px] font-black px-3 py-1.5 rounded-full transition-all ${
                  statusFilter === status
                    ? "bg-brand-blue text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {status === "all" ? "ALL" : status}
              </button>
            ))}
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredTickets.map((ticket) => {
              const StatusIcon = getStatusBadge(ticket.status).icon;
              const priorityClass = getPriorityBadge(ticket.priority);
              
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-[25px] border cursor-pointer transition-all duration-300 ${
                    selectedTicket?.id === ticket.id
                      ? "bg-brand-blue border-brand-blue text-white shadow-lg shadow-blue-500/20"
                      : "bg-white dark:bg-[#1E293B] border-gray-100 dark:border-gray-800 hover:border-brand-blue/30"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                          selectedTicket?.id === ticket.id
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                        }`}
                      >
                        {ticket.id}
                      </span>
                      {/* ✅ Status Icon - Now Used */}
                      <StatusIcon size={12} className={selectedTicket?.id === ticket.id ? "text-white/80" : ""} />
                    </div>
                    <div className="flex items-center gap-1">
                      {/* ✅ Clock Icon - Now Used */}
                      <LuClock size={10} className="opacity-60" />
                      <span className="text-[10px] font-bold opacity-60">
                        {ticket.time}
                      </span>
                    </div>
                  </div>
                  
                  <h4
                    className={`font-black text-sm mb-1 ${selectedTicket?.id === ticket.id ? "text-white" : "dark:text-white"}`}
                  >
                    {ticket.subject}
                  </h4>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {/* ✅ Priority Badge */}
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${priorityClass}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {ticket.user}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT: CONVERSATION ================= */}
        <div className="w-full flex-1 bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden min-h-[500px] md:min-h-0">
          {selectedTicket ? (
            <>
              {/* CHAT HEADER */}
              <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                    <LuUser size={24} />
                  </div>
                  <div>
                    <h3 className="font-black dark:text-white">
                      {selectedTicket.user}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Priority:
                      </span>
                      {/* ✅ Priority Badge with Alert Icon */}
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${getPriorityBadge(selectedTicket.priority)} flex items-center gap-1`}>
                        <LuCircleAlert size={8} />
                        {selectedTicket.priority}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer">
                    <option>Open</option>
                    <option>In-Progress</option>
                    <option>Resolved</option>
                  </select>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition text-gray-400">
                    <LuMoveVertical size={18} />
                  </button>
                </div>
              </div>

              {/* CHAT MESSAGES */}
              <div className="flex-1 p-8 overflow-y-auto space-y-6">
                <div className="flex flex-col items-start max-w-[80%]">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-3xl rounded-tl-none text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedTicket.msg}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-2 ml-2 flex items-center gap-1">
                    <LuUser size={10} /> USER • 10:45 AM
                  </span>
                </div>

                <div className="flex flex-col items-end max-w-[80%] ml-auto">
                  <div className="bg-brand-blue p-4 rounded-3xl rounded-tr-none text-sm font-medium text-white shadow-md shadow-blue-500/10">
                    Aslam o Alaikum Zain! Hum ne aapka account check kar liya
                    hai. Aap please app ko update karein aur dubara photo
                    kheenchein.
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-2 mr-2 flex items-center gap-1">
                    <LuUser size={10} /> ADMIN (YOU) • 11:02 AM
                  </span>
                </div>
              </div>

              {/* CHAT INPUT */}
              <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <button className="p-2 text-gray-400 hover:text-brand-blue transition">
                    <LuPaperclip size={20} />
                  </button>
                  <input
                    type="text"
                    placeholder="Type your reply here..."
                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold p-2 text-gray-700 dark:text-white"
                  />
                  <button className="bg-brand-blue text-white p-3 rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-500/20">
                    <LuSend size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
              <LuMessageCircleQuestion size={80} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-black dark:text-white">
                Select a ticket to respond
              </h3>
              <p className="text-sm font-medium text-gray-500">
                Pick any active support request from the list on the left.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTickets;