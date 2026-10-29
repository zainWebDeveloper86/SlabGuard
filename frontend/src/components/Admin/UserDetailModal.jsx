import { useEffect, useState } from "react";
import { LuX, LuRefreshCw } from "react-icons/lu";
import { axiosServerInstance } from "../../axios.js";
import ForecastPeriodDetails from "../Common/ForecastPeriodDetails";
import { predictionPeriodLabel } from "../../utils/predictionPeriod.js";

const dateLabel = (value) => value ? new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Karachi" }) + " PKT" : "Not recorded";

export default function UserDetailModal({ user, ...props }) {
  if (!user) return null;
  return <UserDetailContent key={user._id} user={user} {...props} />;
}

function UserDetailContent({ user, onClose, onToggleStatus, statusBusy = false, currentAdminId }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    axiosServerInstance.get(`/admin/users/${user._id}`, { timeout: 10000 }).then(({ data }) => {
      if (!data.success) throw new Error("Details unavailable");
      if (active) { setDetail(data.detail); setError(null); }
    }).catch(() => { if (active) setError("Could not load account details. Try again."); });
    return () => { active = false; };
  }, [user._id, retry]);
  useEffect(() => {
    const handleKey = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const profile = detail?.user ?? user;
  const name = profile.fullName?.trim() || "Unnamed account";
  const prediction = detail?.prediction;
  const cell = "px-3 py-3 text-left";
  return <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
    <section role="dialog" aria-modal="true" aria-labelledby="user-detail-title" className="relative w-full max-w-4xl bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-800 dark:text-gray-200">
      <header className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-3">
        <div className="min-w-0 flex gap-3 items-center">
          <span className="rounded-2xl bg-brand-gradient text-white p-4 font-black">{name[0]}</span>
          <div className="min-w-0"><h2 id="user-detail-title" className="text-xl font-black break-words">{name}</h2>
            <p className="text-xs text-gray-500 break-all">{profile.role || "Role unavailable"} • ID: {profile._id || "Unavailable"}</p>
          </div>
        </div>
        <button autoFocus onClick={onClose} aria-label="Close user details" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><LuX size={22} /></button>
      </header>
      <div className="p-6 overflow-y-auto space-y-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Info label="Email" value={profile.email || "Not provided"} />
          <Info label="Reference No" value={profile.referenceNo || "Not linked"} />
          <Info label="Meter Type" value={profile.meterType === "three" ? "Three phase" : profile.meterType === "single" ? "Single phase" : "Not recorded"} />
          <Info label="Account status" value={user.isActive === true ? "Active" : user.isActive === false ? "Inactive" : "Unknown"} />
          <Info label="Joined" value={dateLabel(profile.createdAt)} />
          <Info label="Last bill sync" value={dateLabel(profile.lastSyncedAt)} />
        </dl>
        {error ? <div role="alert" className="text-amber-600"><p>{error}</p><button onClick={() => { setError(null); setRetry((n) => n + 1); }} className="mt-2 font-bold flex items-center gap-2"><LuRefreshCw /> Retry</button></div> : !detail ? <p role="status">Loading bills, prediction and readings...</p> : <>
          <section><h3 className="font-black mb-3">Last recorded readings</h3>
            <div className="grid sm:grid-cols-2 gap-4">{["simulator", "esp32"].map((source) => <div key={source} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 text-sm">
              <p className="font-bold uppercase">{source}</p>
              {detail.readings[source] ? <><p>Reading hour: {dateLabel(detail.readings[source].hour)}</p><p>Received/updated: {dateLabel(detail.readings[source].updatedAt)}</p></> : <p>No readings received.</p>}
            </div>)}</div><p className="text-xs text-gray-500 mt-2">A recorded reading does not confirm that a device is online now.</p>
          </section>
          <section><h3 className="font-black mb-3">Recent synced bills</h3>
            {detail.bills.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className={cell}>Month</th><th className={cell}>Units (kWh)</th><th className={cell}>Billed amount (Rs.)</th></tr></thead><tbody>{detail.bills.map((bill) => <tr key={bill.month} className="border-t border-gray-100 dark:border-gray-700"><td className={cell}>{bill.month}</td><td className={cell}>{bill.units}</td><td className={cell}>{bill.billAmount}</td></tr>)}</tbody></table></div> : <p className="text-sm text-gray-500">No synced billing history.</p>}
          </section>
          <section><h3 className="font-black">Saved prediction</h3>
            {prediction ? <><p className="text-sm mt-2">{predictionPeriodLabel(prediction)}: <strong>Rs. {prediction.predictedBill}</strong> • {prediction.predictedUnits} kWh</p><ForecastPeriodDetails prediction={prediction} /><p className="text-xs text-gray-500 mt-2">Saved: {dateLabel(prediction.updatedAt)}. This is an estimate, separate from the billed amounts above.</p></> : <p className="text-sm text-gray-500 mt-2">No current saved prediction. Older periods or changed reading schedules require a fresh prediction.</p>}
          </section>
        </>}
        <footer className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
          <button disabled={statusBusy || !onToggleStatus || currentAdminId === user._id || typeof user.isActive !== "boolean"} onClick={() => onToggleStatus(user._id)} className="rounded-xl px-5 py-3 bg-brand-blue text-white font-bold text-sm disabled:opacity-50">
            {statusBusy ? "Updating..." : user.isActive ? "Deactivate account" : "Activate account"}
          </button>
          {currentAdminId === user._id && <p className="text-xs text-gray-500">You cannot deactivate your own account.</p>}
          <p className="text-xs text-gray-500">Password recovery is handled through the existing Forgot Password flow.</p>
        </footer>
      </div>
    </section>
  </div>;
}

function Info({ label, value }) {
  return <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl min-w-0"><dt className="text-xs text-gray-500 mb-1">{label}</dt><dd className="text-sm font-bold break-words">{value}</dd></div>;
}
