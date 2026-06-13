import React, { useState } from "react";
import {
  LuMegaphone,
  LuSend,
  LuSmartphone,
  LuMail,
  LuUsers,
  LuClock,
  LuCircleCheck,
  LuLayoutGrid,
  LuTrash2,
} from "react-icons/lu";

const Broadcast = () => {
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [category, setCategory] = useState("Update");

  // History Data
  const history = [
    {
      id: 1,
      title: "Peak Hours Update",
      target: "All Users",
      date: "10 April",
      status: "Sent",
      reach: "1,240",
    },
    {
      id: 2,
      title: "Slab Alert",
      target: "200-300 Slab",
      date: "08 April",
      status: "Sent",
      reach: "450",
    },
  ];

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
                  <select className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 font-bold text-gray-700 dark:text-white outline-none cursor-pointer">
                    <option>All Users</option>
                    <option>Protected Slabs Only</option>
                    <option>Non-Protected Slabs</option>
                    <option>High Usage Users</option>
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
                <button className="flex-1 bg-brand-blue text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-600 transition shadow-lg shadow-blue-500/20">
                  <LuSend size={18} /> Send Broadcast Now
                </button>
                <button className="px-6 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl hover:bg-gray-200 transition">
                  <LuClock size={20} />
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
              {history.map((item) => (
                <div
                  key={item.id}
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
                        {item.target} • {item.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-brand-blue">
                      {item.reach} Reach
                    </p>
                    <button className="text-red-400 hover:text-red-500 mt-1">
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="lg:col-span-5 space-y-6">
          {/* uncomment */}
          {/* <div className="bg-gray-900 p-8 rounded-[50px] border-[8px] border-gray-800 shadow-2xl sticky top-8">
            <div className="flex justify-between items-center mb-8 text-white/50 px-2">
              <span className="text-xs font-bold">9:41</span>
              <div className="flex gap-1.5">
                <div className="w-4 h-4 rounded-full border-2 border-white/20"></div>
                <div className="w-4 h-4 rounded-full border-2 border-white/20"></div>
              </div>
            </div>

            <h3 className="text-center text-white/40 text-[10px] font-black uppercase tracking-widest mb-6">
              Mobile Preview
            </h3>

            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/10 animate-in zoom-in-95">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-brand-blue p-1.5 rounded-lg text-white">
                  <LuSmartphone size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                      SlabGuard
                    </span>
                    <span className="text-[8px] text-white/40 font-bold">
                      NOW
                    </span>
                  </div>
                  <p className="text-xs font-black text-white truncate w-32">
                    {msgTitle || "Announcement Title"}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed line-clamp-2">
                {msgBody ||
                  "Your message body will appear here for the user to read..."}
              </p>
            </div>

            <div className="mt-20 flex justify-center">
              <div className="w-32 h-1 bg-white/10 rounded-full"></div>
            </div>
          </div> */}

          {/* CHANNEL SELECTION */}
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
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 accent-brand-blue" />
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-brand-blue transition">
                  Email Broadcast
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
