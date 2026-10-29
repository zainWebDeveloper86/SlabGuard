// import { useEffect, useState } from "react";
// import { axiosServerInstance } from "../../axios.js";
// import { useAuth } from "../../hooks/useAuth";
// import { readingStatusRows } from "../../utils/readingStatus.js";

// export default function ReadingStatus() {
//   const { user } = useAuth();
//   return <AccountReadingStatus key={user?._id ?? "guest"} />;
// }

// function AccountReadingStatus() {
//   const [snapshot, setSnapshot] = useState({ data: null, loading: true, error: false });
//   const [retry, setRetry] = useState(0);

//   useEffect(() => {
//     let ignore = false;
//     let inFlight = false;
//     const load = async () => {
//       if (inFlight) return;
//       inFlight = true;
//       try {
//         const { data } = await axiosServerInstance.get("/usage/status/me");
//         if (!data?.success || !data.status ||
//             !Object.hasOwn(data.status, "simulator") || !Object.hasOwn(data.status, "esp32")) {
//           throw new Error("Invalid reading status");
//         }
//         if (!ignore) setSnapshot({ data: data.status, loading: false, error: false });
//       } catch {
//         if (!ignore) setSnapshot((previous) => ({ ...previous, loading: false, error: true }));
//       } finally { inFlight = false; }
//     };
//     load();
//     const timer = setInterval(load, 60000);
//     return () => { ignore = true; clearInterval(timer); };
//   }, [retry]);

//   return (
//     <div aria-label="Reading sources" aria-live="polite" className="mt-2 space-y-2 text-xs text-gray-500 dark:text-gray-400">
//       {snapshot.loading && <p>Checking readings...</p>}
//       {snapshot.data && readingStatusRows(snapshot.data).map((row) => (
//         <div key={row.source}>
//           <p className="font-bold text-gray-700 dark:text-gray-300">{row.label}</p>
//           {row.detail && <p className="text-[11px] mt-2 text-center">{row.detail}</p>}
//         </div>
//       ))}
//       {snapshot.error && <p role="alert">
//         {snapshot.data ? "Could not refresh; showing the last checked readings." : "Reading status unavailable."}{" "}
//         <button type="button" onClick={() => setRetry((value) => value + 1)} className="underline cursor-pointer text-brand-blue">Retry</button>
//       </p>}
//       {/* {snapshot.data && <p className="text-[10px]">Reading history does not confirm that a device is online now.</p>} */}
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { axiosServerInstance } from "../../axios.js";
import { useAuth } from "../../hooks/useAuth";
import { getLatestReadingStatus } from "../../utils/readingStatus.js";

export default function ReadingStatus() {
  const { user } = useAuth();
  return <AccountReadingStatus key={user?._id ?? "guest"} />;
}

function AccountReadingStatus() {
  const [statusText, setStatusText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let ignore = false;
    let inFlight = false;
    
    const load = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const { data } = await axiosServerInstance.get("/usage/status/me");
        if (ignore) return;
        
        const text = getLatestReadingStatus(data?.status);
        setStatusText(text || "No data received yet");
        setError(false);
      } catch {
        if (!ignore) setError(true);
      } finally {
        if (!ignore) setLoading(false);
        inFlight = false;
      }
    };
    
    load();
    const timer = setInterval(load, 60000);
    return () => { ignore = true; clearInterval(timer); };
  }, [retry]);

  if (loading) return <span className="text-[10px] text-gray-400">Checking status...</span>;
  if (error) return <span className="text-[10px] text-red-400">Status unavailable</span>;

  return (
    <span className="text-[12px] font-bold text-gray-400">
      {statusText}
    </span>
  );
}