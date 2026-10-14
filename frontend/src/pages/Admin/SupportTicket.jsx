import React, { useState, useEffect } from "react";
import {
  LuMessageCircleQuestion,
  LuClock,
  LuCircleCheck,
  LuCircleAlert,
  LuUser,
  LuSend,
  LuMoveVertical,
  LuSearch,
  LuCircleX,
} from "react-icons/lu";
import toast from "react-hot-toast";
import { axiosServerInstance } from "../../axios.js";

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");

  const fetchTickets = async () => {
    try {
      const res = await axiosServerInstance.get("/support-tickets");
      if (res.data.success) setTickets(res.data.tickets);
    } catch (error) {
      toast.error("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    const matchesSearch =
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return {
          icon: LuCircleAlert,
          color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10",
        };
      case "In-Progress":
        return {
          icon: LuClock,
          color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
        };
      case "Resolved":
        return {
          icon: LuCircleCheck,
          color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
        };
      default:
        return {
          icon: LuCircleX,
          color: "text-gray-500 bg-gray-50 dark:bg-gray-500/10",
        };
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await axiosServerInstance.patch(`/support-tickets/${id}`, {
        status,
      });
      console.log(res.data)
      if (res.data.success) {
        toast.success("Status updated");
        setSelectedTicket(res.data.ticket);
        fetchTickets();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    try {
      const res = await axiosServerInstance.patch(
        `/support-tickets/${selectedTicket._id}`,
        {
          adminReply: replyText,
        },
      );
      if (res.data.success) {
        toast.success("Reply sent");
        setReplyText("");
        setSelectedTicket(res.data.ticket);
        fetchTickets();
      }
    } catch (error) {
      toast.error("Failed to send reply");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400 font-bold">
        Loading tickets...
      </div>
    );
  }
  console.log()

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

          <div className="relative">
            <LuSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold outline-none focus:ring-2 ring-brand-blue/20"
            />
          </div>

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

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredTickets.length === 0 ? (
              <p className="text-center text-gray-400 font-bold text-sm py-10">
                No tickets found.
              </p>
            ) : (
              filteredTickets.map((ticket) => {
                const StatusIcon = getStatusBadge(ticket.status).icon;
                return (
                  <div
                    key={ticket._id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 rounded-[25px] border cursor-pointer transition-all duration-300 ${
                      selectedTicket?._id === ticket._id
                        ? "bg-brand-blue border-brand-blue text-white shadow-lg shadow-blue-500/20"
                        : "bg-white dark:bg-[#1E293B] border-gray-100 dark:border-gray-800 hover:border-brand-blue/30"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                            selectedTicket?._id === ticket._id
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                          }`}
                        >
                          {ticket.category}
                        </span>
                        <StatusIcon
                          size={12}
                          className={
                            selectedTicket?._id === ticket._id
                              ? "text-white/80"
                              : ""
                          }
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <LuClock size={10} className="opacity-60" />
                        <span className="text-[10px] font-bold opacity-60">
                          {new Date(ticket.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )}
                        </span>
                      </div>
                    </div>

                    <h4
                      className={`font-black text-sm mb-1 line-clamp-1 ${
                        selectedTicket?._id === ticket._id
                          ? "text-white"
                          : "dark:text-white"
                      }`}
                    >
                      {ticket.message}
                    </h4>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-gray-400">
                        {ticket.user?.fullName || "Unknown user"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
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
                      {selectedTicket.user?.fullName || "Unknown user"}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {selectedTicket.user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) =>
                      handleStatusChange(selectedTicket._id, e.target.value)
                    }
                    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
                  >
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
                    {selectedTicket.message}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-2 ml-2 flex items-center gap-1">
                    <LuUser size={10} /> USER •{" "}
                    {new Date(selectedTicket.createdAt).toLocaleString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>

                {selectedTicket.adminReply && (
                  <div className="flex flex-col items-end max-w-[80%] ml-auto">
                    <div className="bg-brand-blue p-4 rounded-3xl rounded-tr-none text-sm font-medium text-white shadow-md shadow-blue-500/10">
                      {selectedTicket.adminReply}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 mt-2 mr-2 flex items-center gap-1">
                      <LuUser size={10} /> ADMIN •{" "}
                      {new Date(selectedTicket.repliedAt).toLocaleString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* CHAT INPUT */}
              <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReply()}
                    placeholder="Type your reply here..."
                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold p-2 text-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleReply}
                    className="bg-brand-blue text-white p-3 rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-500/20"
                  >
                    <LuSend size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
              <LuMessageCircleQuestion
                size={80}
                className="text-gray-300 mb-4"
              />
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
