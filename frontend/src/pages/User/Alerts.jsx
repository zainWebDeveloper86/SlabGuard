import React, { useState, useEffect, useRef } from "react";
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
import { useAuth } from "../../hooks/useAuth";

const Alerts = () => {
  const { user } = useAuth();
  return <AlertsList key={user?._id ?? "guest"} />;
};

const AlertsList = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const requestVersion = useRef(0);
  const mutations = useRef(0);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    let ignore = false, inFlight = false;
    const fetchAlerts = async () => {
      if (inFlight || mutations.current) return;
      inFlight = true;
      const version = ++requestVersion.current;
      try {
        const res = await axiosServerInstance.get("/alerts/me");
        if (ignore || version !== requestVersion.current) return;
        if (!res.data?.success || !Array.isArray(res.data.alerts)) throw new Error("Invalid alerts response");
        setAlerts(res.data.alerts); setLoadError("");
        setNow(Date.now());
      } catch {
        if (!ignore && version === requestVersion.current) setLoadError("Could not refresh alerts. Please retry.");
      } finally {
        inFlight = false;
        if (!ignore) setIsLoading(false);
      }
    };
    fetchAlerts();
    const timer = setInterval(fetchAlerts, 30000);
    return () => { ignore = true; clearInterval(timer); };
  }, [retry]);

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "critical") return alert.type === "critical";
    if (activeTab === "unread") return !alert.isRead;
    return true;
  });

  const markAsRead = async (id) => {
    mutations.current++; requestVersion.current++;
    try {
      await axiosServerInstance.patch(`/alerts/${id}/read`);
      if (!mounted.current) return;
      setAlerts((previous) => previous.map((a) => (a._id === id ? { ...a, isRead: true } : a)));
    } catch {
      if (mounted.current) toast.error("Failed to mark as read");
    } finally { mutations.current--; requestVersion.current++; }
  };

  const deleteAlert = async (id) => {
    mutations.current++; requestVersion.current++;
    try {
      await axiosServerInstance.delete(`/alerts/${id}`);
      if (!mounted.current) return;
      setAlerts((previous) => previous.filter((a) => a._id !== id));
    } catch {
      if (mounted.current) toast.error("Failed to delete alert");
    } finally { mutations.current--; requestVersion.current++; }
  };

  const clearAll = async () => {
    mutations.current++; requestVersion.current++;
    try {
      await axiosServerInstance.delete("/alerts");
      if (!mounted.current) return;
      setAlerts([]);
    } catch {
      if (mounted.current) toast.error("Failed to clear alerts");
    } finally { mutations.current--; requestVersion.current++; }
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
    const diffMs = now - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    return new Date(dateStr).toLocaleDateString("en-GB", {
      timeZone: "Asia/Karachi",
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
      {loadError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{loadError}{" "}<button type="button" onClick={() => setRetry((value) => value + 1)} className="underline cursor-pointer">Retry</button></p>}
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
                {loadError ? "Alerts unavailable" : "All caught up!"}
              </h3>
              <p className="text-gray-500 font-medium italic">
                {loadError ? "Retry to load your notifications." : "No new alerts at the moment."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
