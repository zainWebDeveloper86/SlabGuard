import React from "react";
import {
  LuFileText,
  LuScan,
  LuClock,
  LuTriangleAlert,
  LuCircleCheck,
  LuEye,
  LuMousePointerClick,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const OCRValidations = () => {

  const navigate = useNavigate();
  // Recent Scan Logs (Dummy Data)
  const scanLogs = [
    {
      id: "OCR-9921",
      date: "14 April, 2026",
      status: "Success",
      confidence: "98%",
      manual: "No",
    },
    {
      id: "OCR-9920",
      date: "13 April, 2026",
      status: "Flagged",
      confidence: "62%",
      manual: "Yes",
    },
    {
      id: "OCR-9919",
      date: "13 April, 2026",
      status: "Success",
      confidence: "94%",
      manual: "No",
    },
    {
      id: "OCR-9918",
      date: "12 April, 2026",
      status: "Failed",
      confidence: "12%",
      manual: "N/A",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <LuScan className="text-brand-blue" /> OCR Validations
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium italic">
            Monitoring Tesseract.js Text Extraction & Image Quality
          </p>
        </div>
      </div>

      {/* ================= OCR PERFORMANCE STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[35px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-500">
            <LuCircleCheck size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase">
              Successful Scans
            </p>
            <p className="text-2xl font-black dark:text-white">842</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[35px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-500">
            <LuMousePointerClick size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase">
              Manual Corrections
            </p>
            <p className="text-2xl font-black dark:text-white">12%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[35px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-500">
            <LuClock size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase">
              Avg. Scan Time
            </p>
            <p className="text-2xl font-black dark:text-white">1.8s</p>
          </div>
        </div>
      </div>

      {/* ================= SCAN LOGS TABLE ================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-xl font-black dark:text-white flex items-center gap-2">
            <LuFileText className="text-brand-blue" /> Recent Scan History
          </h3>
          <button onClick={() => navigate("/admin/logs")} className="text-xs font-black text-brand-blue uppercase tracking-widest hover:underline cursor-pointer">
            View All Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
              <tr>
                <th className="px-8 py-5">Scan ID</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Confidence</th>
                <th className="px-8 py-5">Manual Edit</th>
                {/* uncomment this */}
                {/* <th className="px-8 py-5 text-right">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {scanLogs.map((log) => (
                <tr
                  key={log.id}
                  className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
                >
                  <td className="px-8 py-6 font-black text-gray-700 dark:text-gray-200">
                    {log.id}
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                    {log.date}
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${
                        log.status === "Success"
                          ? "bg-emerald-100 text-emerald-600"
                          : log.status === "Flagged"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-black text-brand-blue italic">
                    {log.confidence}
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-400">
                    {log.manual}
                  </td>
                  {/* uncomment this */}
                  {/* <td className="px-8 py-6 text-right">
                    <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-brand-blue rounded-xl transition cursor-pointer">
                      <LuEye size={18} />
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= OPTIMIZATION ADVICE ================= */}
      <div className="bg-brand-gradient p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
            <LuTriangleAlert size={32} />
          </div>
          <div>
            <h4 className="text-xl font-black">Quality Control Alert</h4>
            <p className="text-blue-50 text-sm font-medium">
              Lower confidence scores detected in night-time uploads. <br />
              Consider enabling "Flash Suggestion" on user-side camera.
            </p>
          </div>
        </div>
        {/* uncomment this */}
        {/* <button className="px-6 py-3 bg-white text-brand-blue rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition shadow-lg">
          Configure OCR Tresholds
        </button> */}
      </div>
    </div>
  );
};

export default OCRValidations;
