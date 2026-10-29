// import { useEffect, useRef, useState } from "react";
// import { useAuth } from "../../hooks/useAuth";
// import { axiosServerInstance } from "../../axios.js";
// import { PEAK_SCHEDULE_SOURCE, mepcoSeasonalPreset, pakistanPeakDate, resolvePeakHours, formatPeakHours, validatePeakRevision } from "../../../../shared/peakSchedule.js";

// const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// const copyMonths = (rows) => rows.map(({ month, startHour, endHour }) => ({ month, startHour, endHour }));

// export default function SeasonalPeakSchedule() {
//   const { user } = useAuth();
//   return <ScheduleEditor key={user?._id ?? "guest"} isAdmin={user?.role === "admin"} />;
// }

// function ScheduleEditor({ isAdmin }) {
//   const [config, setConfig] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [retry, setRetry] = useState(0);
//   const [now, setNow] = useState(() => Date.now());
//   const [viewDate, setViewDate] = useState("current");
//   const [editing, setEditing] = useState(false);
//   const [effectiveFrom, setEffectiveFrom] = useState(() => pakistanPeakDate());
//   const [draft, setDraft] = useState(() => mepcoSeasonalPreset());
//   const [multiplier, setMultiplier] = useState("");
//   const requestVersion = useRef(0);
//   useEffect(() => () => { requestVersion.current++; }, []);
//   useEffect(() => {
//     let ignore = false;
//     const version = ++requestVersion.current;
//     const load = async () => {
//       try {
//         const { data } = await axiosServerInstance.get("/tariff");
//         if (ignore || version !== requestVersion.current) return;
//         if (!data?.success || !data.tariff) throw new Error("Tariff unavailable");
//         setConfig(data.tariff); setMultiplier(String(data.tariff.peakHours?.rateMultiplier ?? "")); setError("");
//       } catch {
//         if (!ignore && version === requestVersion.current) setError("Could not load the saved peak schedule. Please retry.");
//       } finally { if (!ignore && version === requestVersion.current) setLoading(false); }
//     };
//     load();
//     return () => { ignore = true; };
//   }, [retry]);
//   useEffect(() => {
//     const timer = setInterval(() => setNow(Date.now()), 60000);
//     return () => clearInterval(timer);
//   }, []);

//   const today = pakistanPeakDate(new Date(now));
//   const versions = [...(config?.peakScheduleVersions ?? [])].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
//   const current = resolvePeakHours(config, today);
//   const selectedVersion = versions.find((row) => row.effectiveFrom === (viewDate === "current" ? current?.effectiveFrom : viewDate));
//   const rows = editing ? draft : selectedVersion?.months;
//   const busy = loading || saving;

//   const save = async (payload, message) => {
//     const version = ++requestVersion.current;
//     setSaving(true); setError(""); setNotice("");
//     try {
//       const { data } = await axiosServerInstance.patch("/tariff", payload);
//       if (version !== requestVersion.current) return;
//       if (!data?.success || !data.tariff) throw new Error("Save failed");
//       setConfig(data.tariff); setMultiplier(String(data.tariff.peakHours?.rateMultiplier ?? ""));
//       setNotice(message); setEditing(false); setViewDate("current");
//     } catch (failure) {
//       if (version === requestVersion.current) setError(failure.response?.data?.message || "Could not save. Your draft is still here; retry after checking the connection.");
//     } finally { if (version === requestVersion.current) setSaving(false); }
//   };
//   const saveSchedule = () => {
//     try { validatePeakRevision(config, { effectiveFrom, months: draft }, today); }
//     catch (failure) { setError(failure.message); return; }
//     return save({ peakSchedule: { effectiveFrom, months: draft } }, `Seasonal schedule saved from ${effectiveFrom} (Pakistan date).`);
//   };
//   const beginEdit = () => {
//     setDraft(copyMonths(selectedVersion?.months ?? mepcoSeasonalPreset()));
//     setEffectiveFrom(today); setEditing(true); setError(""); setNotice("");
//   };
//   const changeHour = (month, field, value) => setDraft((previous) => previous.map((row) => row.month === month ? { ...row, [field]: Number(value) } : row));

//   return (
//     <section aria-label="Seasonal peak schedule" className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 p-6 rounded-[40px] space-y-4">
//       <h3 className="text-lg font-black text-amber-900 dark:text-amber-400">Peak Hours Schedule</h3>
//       <p className="text-xs text-gray-600 dark:text-gray-400">Pakistan time · Applies to three-phase peak-hour features.</p>
//       {loading && <p role="status" className="text-sm text-gray-500">Loading saved schedule...</p>}
//       {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}{" "}
//         {!editing && <button type="button" disabled={busy} className="underline cursor-pointer" onClick={() => { setLoading(true); setRetry((value) => value + 1); }}>Reload</button>}
//       </p>}
//       {notice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{notice}</p>}
//       {config && <>
//         <p className="text-sm font-bold dark:text-white">Current window: {formatPeakHours(current)}</p>
//         <p className="text-xs text-gray-500 dark:text-gray-400">{current?.effectiveFrom ? `Schedule effective from ${current.effectiveFrom}.` : "Using the previously saved flat timing. Seasonal timings are not active until an admin saves them."}</p>
//         {versions.length > 0 && !editing && <label className="block text-xs font-bold dark:text-white">View saved schedule
//           <select aria-label="View saved schedule" value={viewDate} onChange={(event) => setViewDate(event.target.value)} className="block mt-1 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
//             <option value="current">Currently applicable</option>
//             {versions.map((version) => <option key={version.effectiveFrom} value={version.effectiveFrom}>From {version.effectiveFrom}</option>)}
//           </select>
//         </label>}
//         {editing && <>
//           <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Unsaved preview — existing timings remain in use until Save.</p>
//           <label className="block text-xs font-bold dark:text-white">Effective Pakistan date
//             <input aria-label="Effective Pakistan date" type="date" min={today} value={effectiveFrom} disabled={saving} onChange={(event) => setEffectiveFrom(event.target.value)} className="block mt-1 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" />
//           </label>
//           <p className="text-xs text-gray-500 dark:text-gray-400">Past revisions are preserved. Saving again for today or the same future date replaces only that day's revision.</p>
//           <button type="button" disabled={saving} onClick={() => setDraft(mepcoSeasonalPreset())} className="text-xs text-brand-blue underline cursor-pointer">Use verified MEPCO preset</button>
//         </>}
//         {rows && <div className="overflow-x-auto"><table className="w-full text-left text-xs">
//           <thead><tr className="text-gray-500"><th className="py-2">Month</th><th className="py-2">{editing ? "Start / End (24-hour)" : "Saved window"}</th></tr></thead>
//           <tbody>{rows.map((row) => <tr key={row.month} className="border-t border-amber-100 dark:border-gray-800">
//             <th className="py-2 font-bold dark:text-white">{monthNames[row.month - 1]}</th>
//             <td className="py-2 text-gray-700 dark:text-gray-300">{editing ? <div className="flex gap-2">
//               {["startHour", "endHour"].map((field) => <select key={field} aria-label={`${monthNames[row.month - 1]} ${field === "startHour" ? "start" : "end"}`} disabled={saving} value={row[field]} onChange={(event) => changeHour(row.month, field, event.target.value)} className="p-1 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
//                 {Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{String(hour).padStart(2, "0")}:00</option>)}
//               </select>)}
//             </div> : formatPeakHours(row)}</td>
//           </tr>)}</tbody>
//         </table></div>}
//         {isAdmin && <div className="flex flex-wrap gap-3">
//           {editing ? <>
//             <button type="button" disabled={saving} onClick={saveSchedule} className="px-4 py-2 bg-brand-blue text-white rounded-xl font-bold text-sm cursor-pointer disabled:opacity-50">{saving ? "Saving..." : "Save seasonal schedule"}</button>
//             <button type="button" disabled={saving} onClick={() => { setEditing(false); setError(""); }} className="underline text-sm text-gray-500 cursor-pointer">Cancel</button>
//           </> : <button type="button" disabled={busy} onClick={beginEdit} className="px-4 py-2 bg-brand-blue text-white rounded-xl font-bold text-sm cursor-pointer disabled:opacity-50">{versions.length ? "Create / update revision" : "Set seasonal schedule"}</button>}
//         </div>}
//         <details className="text-xs text-gray-500 dark:text-gray-400">
//           <summary className="cursor-pointer">Existing billing multiplier: {config.peakHours?.rateMultiplier ?? "not configured"}</summary>
//           <p className="mt-2">This schedule changes timings. The existing bill-calculation multiplier remains separate.</p>
//           {isAdmin && !editing && config.peakHours && <div className="flex flex-wrap gap-2 mt-2">
//             <input aria-label="Billing multiplier" type="number" step="0.05" min="0.01" value={multiplier} disabled={busy} onChange={(event) => setMultiplier(event.target.value)} className="w-24 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" />
//             <button type="button" disabled={busy || !Number.isFinite(Number(multiplier)) || Number(multiplier) <= 0} onClick={() => save({ peakHours: { ...config.peakHours, rateMultiplier: Number(multiplier) } }, "Billing multiplier saved.")} className="underline cursor-pointer">Save multiplier</button>
//           </div>}
//         </details>
//       </>}
//       <a href={PEAK_SCHEDULE_SOURCE} target="_blank" rel="noreferrer" className="inline-block text-xs underline text-brand-blue">MEPCO seasonal reference — NEPRA, 7 Jan 2026, page 64</a>
//     </section>
//   );
// }


import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { axiosServerInstance } from "../../axios.js";
import {
  PEAK_SCHEDULE_SOURCE,
  mepcoSeasonalPreset,
  pakistanPeakDate,
  resolvePeakHours,
  formatPeakHours,
  validatePeakRevision,
} from "../../../../shared/peakSchedule.js";
import { LuClock, LuInfo, LuPencilLine, LuCheck, LuX } from "react-icons/lu";
import toast from "react-hot-toast";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const copyMonths = (rows) => rows.map(({ month, startHour, endHour }) => ({ month, startHour, endHour }));

export default function SeasonalPeakSchedule() {
  const { user } = useAuth();
  return <ScheduleEditor key={user?._id ?? "guest"} isAdmin={user?.role === "admin"} />;
}

function ScheduleEditor({ isAdmin }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState(() => pakistanPeakDate());
  const [draft, setDraft] = useState(() => mepcoSeasonalPreset());
  const [multiplier, setMultiplier] = useState("");
  
  const requestVersion = useRef(0);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const { data } = await axiosServerInstance.get("/tariff");
        if (ignore) return;
        if (!data?.success || !data.tariff) throw new Error("Tariff unavailable");
        setConfig(data.tariff);
        setMultiplier(String(data.tariff.peakHours?.rateMultiplier ?? "1.25"));
      } catch {
        if (!ignore) toast.error("Could not load the saved peak schedule.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; requestVersion.current++; };
  }, []);

  const today = pakistanPeakDate();
  const current = resolvePeakHours(config, today);

  const save = async (payload, message) => {
    const version = ++requestVersion.current;
    setSaving(true);
    try {
      const { data } = await axiosServerInstance.patch("/tariff", payload);
      if (version !== requestVersion.current) return;
      if (!data?.success) throw new Error("Save failed");
      setConfig(data.tariff);
      toast.success(message);
      setEditing(false);
    } catch (err) {
      if (version === requestVersion.current) toast.error(err.response?.data?.message || "Could not save.");
    } finally {
      if (version === requestVersion.current) setSaving(false);
    }
  };

  const saveSchedule = () => {
    try { validatePeakRevision(config, { effectiveFrom, months: draft }, today); }
    catch (err) { return toast.error(err.message); }
    return save({ peakSchedule: { effectiveFrom, months: draft } }, "Seasonal schedule saved!");
  };

  const saveMultiplier = () => {
    if (!Number.isFinite(Number(multiplier)) || Number(multiplier) <= 0) return toast.error("Enter a valid multiplier");
    return save({ peakHours: { ...config.peakHours, rateMultiplier: Number(multiplier) } }, "Billing multiplier updated!");
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading schedule...</div>;

  return (
    <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 p-6 md:p-8 rounded-[40px] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-amber-900 dark:text-amber-400 flex items-center gap-2">
          <LuClock size={24} /> Peak Hours Schedule
        </h3>
        {isAdmin && !editing && (
          <button onClick={() => {
            const savedRevision = config?.peakScheduleVersions?.find((version) => version.effectiveFrom === current?.effectiveFrom);
            setDraft(copyMonths(savedRevision?.months ?? mepcoSeasonalPreset()));
            setEditing(true);
          }} className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded-xl hover:bg-amber-200 transition cursor-pointer">
            <LuPencilLine size={16} />
          </button>
        )}
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400">
        Pakistan time · Applies to three-phase (ToU) consumers.
      </p>

      {/* Current Active Window */}
      {!editing && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-amber-100 dark:border-amber-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Active Window</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{formatPeakHours(current)}</p>
        </div>
      )}

      {/* Editor Mode */}
      {editing ? (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">Effective Date</label>
              <input type="date" min={today} value={effectiveFrom} disabled={saving} onChange={(e) => setEffectiveFrom(e.target.value)} className="p-2 rounded-xl bg-white dark:text-gray-300 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-bold scheme-light dark:scheme-dark" />
            </div>
            <button onClick={() => setDraft(mepcoSeasonalPreset())} className="mt-4 text-xs text-brand-blue underline font-bold">Use MEPCO Preset</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {draft.map((row) => (
              <div key={row.month} className="p-3 bg-white dark:bg-gray-900 dark:text-gray-300 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-xs font-black mb-2 dark:text-white">{monthNames[row.month - 1]}</p>
                <select value={row.startHour} onChange={(e) => setDraft(prev => prev.map(r => r.month === row.month ? { ...r, startHour: Number(e.target.value) } : r))} className="w-full p-1 mb-1 rounded text-xs bg-gray-50 dark:bg-gray-800 border-none outline-none font-bold">
                  {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
                </select>
                <select value={row.endHour} onChange={(e) => setDraft(prev => prev.map(r => r.month === row.month ? { ...r, endHour: Number(e.target.value) } : r))} className="w-full p-1 rounded text-xs bg-gray-50 dark:bg-gray-800 border-none outline-none font-bold">
                  {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={saveSchedule} disabled={saving} className="px-6 py-2.5 bg-brand-blue text-white rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 cursor-pointer">
              {saving ? "Saving..." : "Save Schedule"}
            </button>
            <button onClick={() => setEditing(false)} disabled={saving} className="px-6 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {current?.effectiveFrom ? `Schedule effective from ${current.effectiveFrom}.` : "Using flat timing."}
          </p>

          {/* Billing Multiplier Editor (Admin) */}
          {isAdmin && (
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <LuInfo className="text-gray-400" size={16} />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400 flex-1">Billing Multiplier (Peak Surcharge)</span>
              <input type="number" step="0.05" min="0.1" value={multiplier} onChange={(e) => setMultiplier(e.target.value)} className="w-20 p-1.5 text-center rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black text-brand-blue" />
              <button onClick={saveMultiplier} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition cursor-pointer"><LuCheck size={16} /></button>
            </div>
          )}
        </div>
      )}

      <a href={PEAK_SCHEDULE_SOURCE} target="_blank" rel="noreferrer" className="inline-block text-[10px] underline text-amber-600 dark:text-amber-400">
        Reference: NEPRA 7 Jan 2026 Notification
      </a>
    </div>
  );
}
