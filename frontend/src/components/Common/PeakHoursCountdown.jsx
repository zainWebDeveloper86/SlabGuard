import { useEffect, useState } from "react";
import { LuClock } from "react-icons/lu";
import { useAuth } from "../../hooks/useAuth";
import { axiosServerInstance } from "../../axios.js";
import { getPeakCountdown } from "../../utils/peakCountdown.js";

export default function PeakHoursCountdown() {
  const { user } = useAuth();
  return user?.meterType === "three" ? <PeakTimer key={user._id} /> : null;
}

function PeakTimer() {
  const [snapshot, setSnapshot] = useState({ window: null, loading: true, error: "" });
  const [now, setNow] = useState(() => Date.now());
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let ignore = false;
    let inFlight = false;
    const load = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const { data } = await axiosServerInstance.get("/tariff");
        if (ignore) return;
        const window = data?.tariff;
        if (!data?.success) throw new Error("Could not load timings");
        if (!getPeakCountdown(window)) {
          setSnapshot({ window: null, loading: false, error: "Peak timings are not configured correctly. Ask your admin to update them." });
          return;
        }
        setSnapshot({ window, loading: false, error: "" });
      } catch {
        if (!ignore) setSnapshot({ window: null, loading: false, error: "Peak timings are unavailable. Please retry." });
      } finally { inFlight = false; }
    };
    load();
    const refresh = setInterval(load, 600000);
    return () => { ignore = true; clearInterval(refresh); };
  }, [retry]);

  useEffect(() => {
    // Re-read the clock on every tick so suspended/background tabs do not drift.
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const state = getPeakCountdown(snapshot.window, new Date(now));
  return (
    <section aria-label="Peak hours countdown" className={`border p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${state?.isPeak ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" : "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900"}`}>
      {snapshot.loading ? <p role="status" className="text-sm text-gray-500 dark:text-gray-400">Loading peak timings...</p>
        : snapshot.error ? <div role="alert" className="text-sm text-gray-600 dark:text-gray-300">
          {snapshot.error}{" "}<button type="button" className="text-brand-blue underline cursor-pointer" onClick={() => {
            setSnapshot({ window: null, loading: true, error: "" });
            setRetry((value) => value + 1);
          }}>Retry</button>
        </div>
        : state && <>
          <div className="flex items-start gap-3">
            <LuClock size={22} className="shrink-0 mt-1 text-brand-blue" aria-hidden="true" />
            <div>
              <p aria-live="polite" className="text-sm font-black text-gray-900 dark:text-white">{state.isPeak ? "Peak hours active" : "Next peak window"}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{state.windowLabel}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{state.isPeak ? "Shift flexible heavy loads until after peak hours where possible." : "Plan flexible heavy loads outside this window."}</p>
            </div>
          </div>
          <div className="text-xs font-bold text-gray-600 dark:text-gray-300">
            {state.isPeak ? "Ends in:" : "Starts in:"}{" "}
            <span role="timer" aria-live="off" className="inline-block mt-1 md:mt-0 ml-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl text-gray-900 dark:text-white font-mono tabular-nums">{state.countdown}</span>
          </div>
        </>}
    </section>
  );
}
