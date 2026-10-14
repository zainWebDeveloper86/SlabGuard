import React, { useState, useEffect } from "react";
import {
  LuMegaphone,
  LuSend,
  LuMail,
  LuUsers,
  LuClock,
  LuCircleCheck,
  LuLayoutGrid,
} from "react-icons/lu";
import toast from "react-hot-toast";
import { axiosServerInstance } from "../../axios.js";

const Broadcast = () => {
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [category, setCategory] = useState("Update");
  const [targetAudience, setTargetAudience] = useState("all");
  const [isSending, setIsSending] = useState(false);

  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await axiosServerInstance.get("/broadcast/history");
      if (res.data.success) setHistory(res.data.history);
    } catch (error) {
      toast.error("Failed to load broadcast history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async () => {
    if (!msgTitle.trim() || !msgBody.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setIsSending(true);
    try {
      const res = await axiosServerInstance.post("/broadcast/send", {
        title: msgTitle,
        body: msgBody,
        category,
        targetAudience,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setMsgTitle("");
        setMsgBody("");
        fetchHistory();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send broadcast");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <LuMegaphone className="text-brand-blue" /> Broadcaster
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium italic">
            Send instant alerts, updates & slab warnings to SlabGuard users.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: COMPOSER */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-black dark:text-white mb-6 flex items-center gap-2">
              <LuLayoutGrid className="text-brand-blue" /> Create Announcement
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Message Title
                </label>
                <input
                  type="text"
                  value={msgTitle}
                  onChange={(e) => setMsgTitle(e.target.value)}
                  placeholder="e.g., Summer Peak Hours Alert"
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold text-gray-700 dark:text-white outline-none ring-2 ring-transparent focus:ring-brand-blue/20 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                    Category
                  </label>
                  <select
                    value={category}
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold text-gray-700 dark:text-white outline-none cursor-pointer"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option>Update</option>
                    <option>Alert</option>
                    <option>Promotion</option>
                    <option>Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold text-gray-700 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="all">All Users</option>
                    <option value="protected">Protected Slabs Only</option>
                    <option value="non-protected">Non-Protected Slabs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
                  Message Body
                </label>
                <textarea
                  rows="4"
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-medium text-gray-700 dark:text-white outline-none ring-2 ring-transparent focus:ring-brand-blue/20 transition"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="relative flex-1 bg-brand-gradient text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 overflow-hidden group shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                >
                  <span className="relative z-10 flex items-center gap-2 text-sm">
                    <LuSend size={18} />{" "}
                    {isSending ? "Sending..." : "Send Broadcast Now"}
                  </span>
                  <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition duration-700"></span>
                </button>
              </div>
            </div>
          </div>

          {/* HISTORY TABLE */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-black dark:text-white">Broadcast History</h3>
              <LuUsers className="text-gray-300" />
            </div>
            <div className="p-0">
              {isLoadingHistory ? (
                <p className="p-6 text-center text-gray-400 font-bold text-sm">
                  Loading...
                </p>
              ) : history.length === 0 ? (
                <p className="p-6 text-center text-gray-400 font-bold text-sm">
                  No broadcasts sent yet.
                </p>
              ) : (
                history.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800 last:border-0 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 text-brand-blue p-2 rounded-xl">
                        <LuCircleCheck size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black dark:text-white">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          {item.targetAudience} •{" "}
                          {new Date(item.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-brand-blue">
                        {item.reach} Reach
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: CHANNEL SELECTION (cosmetic — no backend for email yet) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand-blue/5 border border-brand-blue/10 p-6 rounded-[30px] space-y-4">
            <h4 className="text-xs font-black text-brand-blue uppercase flex items-center gap-2">
              <LuMail size={16} /> Delivery Channels
            </h4>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 accent-brand-blue"
                />
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-brand-blue transition">
                  In-App Push Notification
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group opacity-50">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 accent-brand-blue"
                />
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  Email Broadcast (coming soon)
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Broadcast;
