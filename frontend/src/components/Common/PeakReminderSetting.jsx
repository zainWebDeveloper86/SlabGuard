import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { axiosServerInstance } from "../../axios.js";

export default function PeakReminderSetting() {
  const { user, login } = useAuth();
  return (
    <ReminderSwitch key={user?._id ?? "guest"} user={user} login={login} />
  );
}

function ReminderSwitch({ user, login }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const requestVersion = useRef(0);
  const eligible = user?.meterType === "three";
  const enabled = user?.peakHourReminderEnabled === true;
  useEffect(
    () => () => {
      requestVersion.current++;
    },
    [],
  );

  const toggle = async () => {
    const version = ++requestVersion.current;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const { data } = await axiosServerInstance.patch("/user/peak-reminder", {
        enabled: !enabled,
      });
      if (version !== requestVersion.current) return;
      if (
        !data?.success ||
        typeof data.user?.peakHourReminderEnabled !== "boolean"
      )
        throw new Error("Save failed");
      login({ ...user, ...data.user });
      setStatus(
        data.user.peakHourReminderEnabled
          ? "Peak-hour reminders enabled and saved."
          : "Peak-hour reminders disabled and saved.",
      );
    } catch (failure) {
      if (version === requestVersion.current)
        setError(
          failure.response?.data?.message ||
            "Could not save your preference. Please retry; your saved setting has not changed.",
        );
    } finally {
      if (version === requestVersion.current) setSaving(false);
    }
  };

  // return (
  //   <section aria-label="Peak Hour Reminder" className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
  //     <div className="flex items-center justify-between gap-4">
  //       <div>
  //         <h4 className="font-bold dark:text-white">Peak Hour Reminder</h4>
  //         <p id="peak-reminder-description" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
  //           An in-app alert up to 15 minutes before the peak window saved by your admin. This switch saves automatically.
  //         </p>
  //       </div>
  //       <button type="button" role="switch" aria-checked={enabled} aria-label="Peak Hour Reminder"
  //         aria-describedby="peak-reminder-description" disabled={saving || (!eligible && !enabled)} onClick={toggle}
  //         className={`w-12 h-6 shrink-0 rounded-full p-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${enabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}>
  //         <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${enabled ? "translate-x-6" : "translate-x-0"}`} />
  //       </button>
  //     </div>
  //     {!eligible && <p className="text-xs text-gray-500 dark:text-gray-400">Reminders apply only to three-phase accounts.{enabled ? " You can turn off your previously saved preference." : ""}</p>}
  //     {saving && <p role="status" className="text-xs text-gray-500">Saving...</p>}
  //     {status && <p role="status" className="text-xs text-emerald-600 dark:text-emerald-400">{status}</p>}
  //     {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>}
  //     <p className="text-[11px] text-gray-500 dark:text-gray-400">Reminders appear on your Alerts page. No email or SMS is sent.</p>
  //   </section>
  // );
  return (
    <div className="p-6 rounded-3xl border border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="font-bold dark:text-white">Peak Hour Reminder</h4>
          <p
            id="peak-reminder-description"
            className="text-xs text-gray-500 dark:text-gray-400 mt-1"
          >
            An in-app alert up to 15 minutes before the peak window saved by
            your admin. Saves automatically.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Peak Hour Reminder"
          aria-describedby="peak-reminder-description"
          disabled={saving || (!eligible && !enabled)}
          onClick={toggle}
          className={`w-12 h-6 shrink-0 rounded-full p-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            enabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <span
            className={`block w-4 h-4 bg-white rounded-full transition-transform ${
              enabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Status & Errors */}
      <div className="mt-2 space-y-1">
        {!eligible && (
          <p className="text-[11px] text-gray-400 italic">
            Reminders apply only to three-phase accounts.
            {enabled
              ? " You can turn off your previously saved preference."
              : ""}
          </p>
        )}
        {saving && <p className="text-[11px] text-gray-500">Saving...</p>}
        {status && (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
            {status}
          </p>
        )}
        {error && (
          <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
