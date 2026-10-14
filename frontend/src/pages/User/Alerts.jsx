import React, { useState, useEffect } from "react";
import {
  LuBell,
  LuTriangleAlert,
  LuZap,
  LuInfo,
  LuCheckCheck,
  LuTrash2,
  LuBellOff,
} from "react-icons/lu";
import toast from "react-hot-toast";
import { axiosServerInstance } from "../../axios.js";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchAlerts = async () => {
    try {
      const res = await axiosServerInstance.get("/alerts/me");
      if (res.data.success) setAlerts(res.data.alerts);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load alerts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "critical") return alert.type === "critical";
    if (activeTab === "unread") return !alert.isRead;
    return true;
  });

  const markAsRead = async (id) => {
    try {
      await axiosServerInstance.patch(`/alerts/${id}/read`);
      setAlerts(alerts.map((a) => (a._id === id ? { ...a, isRead: true } : a)));
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const deleteAlert = async (id) => {
    try {
      await axiosServerInstance.delete(`/alerts/${id}`);
      setAlerts(alerts.filter((a) => a._id !== id));
    } catch (error) {
      toast.error("Failed to delete alert");
    }
  };

  const clearAll = async () => {
    try {
      await axiosServerInstance.delete("/alerts");
      setAlerts([]);
    } catch (error) {
      toast.error("Failed to clear alerts");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "critical":
        return <LuTriangleAlert className="text-red-500" size={24} />;
      case "warning":
        return <LuZap className="text-amber-500" size={24} />;
      default:
        return <LuInfo className="text-brand-blue" size={24} />;
    }
  };

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400 font-bold">
        Loading alerts...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <LuBell className="text-brand-blue" /> Alerts & Notifications
          </h1>
          <p className="text-gray-500 font-medium">
            Actionable insights to save your bill
          </p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs font-bold text-gray-400 hover:text-red-500 transition flex items-center gap-1"
          >
            <LuTrash2 size={14} /> Clear All
          </button>
        )}
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit">
        {["all", "critical", "unread"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "bg-white dark:bg-gray-700 text-brand-blue shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert._id}
              className={`group relative bg-white dark:bg-[#1E293B] p-6 rounded-[30px] border transition-all duration-300 ${
                alert.isRead
                  ? "border-gray-100 dark:border-gray-800 opacity-70"
                  : "border-brand-blue/20 shadow-md ring-1 ring-brand-blue/5"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-2xl ${alert.type === "critical" ? "bg-red-50" : alert.type === "warning" ? "bg-amber-50" : "bg-blue-50"} dark:bg-gray-800`}
                >
                  {getIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3
                      className={`font-black text-lg ${alert.isRead ? "text-gray-600" : "text-gray-900 dark:text-white"}`}
                    >
                      {alert.title}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {timeAgo(alert.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">
                    {alert.desc}
                  </p>
                  <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!alert.isRead && (
                      <button
                        onClick={() => markAsRead(alert._id)}
                        className="text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg"
                      >
                        <LuCheckCheck size={12} /> Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert._id)}
                      className="text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg"
                    >
                      <LuTrash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-full text-gray-300">
              <LuBellOff size={60} />
            </div>
            <div>
              <h3 className="text-xl font-black dark:text-white">
                All caught up!
              </h3>
              <p className="text-gray-500 font-medium italic">
                No new alerts at the moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
