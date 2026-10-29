import { useState, useEffect, useRef } from "react";
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
import { axiosServerInstance } from "../../axios.js";

const SystemLogs = () => {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState({ logs: [], total: 0, pageSize: 50 });
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [healthError, setHealthError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const clearLock = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    const timer = setTimeout(() => { setQuery(searchQuery.trim()); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  useEffect(() => {
    let active = true;
    let pending = false;
    const load = async () => {
      if (pending) return;
      pending = true;
      await Promise.resolve();
      if (!active) return;
      setIsLoading(true);
      const [logs, status] = await Promise.allSettled([
        axiosServerInstance.get("/admin/logs", { params: { category: filter, q: query, page }, timeout: 10000 }),
        axiosServerInstance.get("/admin/health", { timeout: 10000 }),
      ]);
      pending = false;
      if (!active) return;
      if (logs.status === "fulfilled" && logs.value.data.success) {
        setResult(logs.value.data); setError(null);
      } else { setError("Logs could not be loaded. Refresh to retry."); }
      if (status.status === "fulfilled" && status.value.data.success) {
        setHealth(status.value.data.health); setHealthError(null);
      } else { setHealth(null); setHealthError("Health check unavailable. Refresh to retry."); }
      setIsLoading(false);
    };
    void load();
    const timer = setInterval(load, 30000);
    return () => { active = false; clearInterval(timer); };
  }, [filter, query, page, refresh]);

  const clearOld = async () => {
    if (clearLock.current || !window.confirm("Delete only event logs older than 30 days? Recent logs will remain.")) return;
    clearLock.current = true; setClearing(true);
    try {
      await axiosServerInstance.delete("/admin/logs/older-than-30-days", { timeout: 10000 });
      if (alive.current) { setPage(1); setRefresh((n) => n + 1); }
    } catch { if (alive.current) setError("Old logs could not be cleared. Try again."); }
    finally { clearLock.current = false; if (alive.current) setClearing(false); }
  };
  const exportPage = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), category: filter, query, page, logs: result.logs }, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `slabguard-events-page-${page}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const filteredLogs = result.logs.map((log) => ({
    id: log._id, type: log.category, event: log.message, level: log.level,
    user: `${log.actorId || "System"}${log.subjectId ? ` → ${log.subjectId}` : ""}`,
    time: new Date(log.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Karachi" }) + " PKT",
  }));

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
                {health?.server === "responding" ? "Responding" : "Not checked / unavailable"}
              </p>
            </div>
          </div>
          <div className={`h-2 w-2 rounded-full ${health?.server === "responding" ? "bg-emerald-500" : "bg-gray-400"}`}></div>
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
              {health?.database?.status === "reachable" ? `${health.database.latencyMs} ms (ping)` : "Unavailable"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3 md:gap-4 group hover:shadow-md transition-all">
          <div className="p-2.5 md:p-3 bg-purple-500/10 text-purple-500 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">
            <LuCpu size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Python Forecast Service
            </p>
            <p className="text-base md:text-lg font-black dark:text-white">
              {health?.prophet === "reachable" ? "Reachable" : "Unavailable / not checked"}
            </p>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        <p>{health ? `Last health check: ${new Date(health.checkedAt).toLocaleString("en-GB", { timeZone: "Asia/Karachi" })} PKT.` : "Checking services..."} Checks refresh every 30 seconds; service reachability does not measure forecast accuracy or CPU load.</p>
        {healthError && <p role="alert" className="text-amber-600">{healthError}</p>}
        <p>Events are recorded from this update onward. This is a selected application-event log, not a complete audit of every request.</p>
        {error && <p role="alert" className="text-red-500">{error}</p>}
      </div>

      {/* ================= LOGS MAIN SECTION ================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* LOGS HEADER & FILTERS */}
        <div className="p-5 md:p-8 border-b border-gray-50 dark:border-gray-800 space-y-5 md:space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 md:gap-3">
                <LuTerminal className="text-brand-blue" /> System Event Logs
              </h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                Saved application events: account changes, billing syncs, forecasts, tariffs and scheduled jobs.
              </p>
            </div>
            <div className="flex gap-2">
              <button aria-label="Refresh logs and health" onClick={() => { setIsLoading(true); setRefresh((n) => n + 1); }} className="p-2.5 md:p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-xl hover:text-brand-blue transition cursor-pointer">
                <LuRefreshCw size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button onClick={exportPage} disabled={isLoading || !!error || !result.logs.length} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-brand-blue text-white rounded-xl font-bold text-[10px] md:text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition disabled:opacity-50">
                <LuDownload size={14} className="md:w-4 md:h-4" /> Export This Page (JSON)
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
              placeholder="Search event text or account ID..."
              value={searchQuery}
              maxLength={100}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 ring-brand-blue/20 transition dark:text-gray-400"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            {["All", "System", "User", "Billing", "Tariff", "Prediction"].map((cat) => (
              <button
                key={cat}
                onClick={() => { setIsLoading(true); setPage(1); setFilter(cat); setRefresh((n) => n + 1); }}
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
              {!isLoading && !error && filteredLogs.length > 0 ? (
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
                    {isLoading ? "Loading logs..." : error ? "Logs unavailable. Use Refresh to retry." : "No saved events match these filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-gray-50 dark:border-gray-800">
          <div className="text-[9px] md:text-[10px] font-medium text-gray-400">
            Page {page} • {result.total} matching events (up to {result.pageSize} per page)
          </div>
          <div className="flex gap-3 text-xs font-bold dark:text-gray-300">
            <button disabled={page <= 1 || isLoading} onClick={() => { setIsLoading(true); setPage((n) => n - 1); }}>Previous</button>
            <button disabled={page * result.pageSize >= result.total || isLoading || !!error} onClick={() => { setIsLoading(true); setPage((n) => n + 1); }}>Next</button>
          </div>
          <button onClick={clearOld} disabled={clearing} className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-red-400 hover:text-red-500 transition cursor-pointer disabled:opacity-50">
            <LuTrash2 size={12} /> {clearing ? "Clearing..." : "Clear Logs Older than 30 Days"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
