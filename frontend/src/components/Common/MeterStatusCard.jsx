import React, { useState } from "react";
import {
  LuRefreshCw,
  LuCamera,
  LuCircleCheck,
  LuCircleAlert,
  LuChevronDown,
  LuZap,
} from "react-icons/lu";
import { BsUpcScan, BsSpeedometer } from "react-icons/bs";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { axiosServerInstance } from "../../axios.js";
import ReadingStatus from "./ReadingStatus";

const MeterStatusCard = () => {
  const { user } = useAuth();
  const [isScanMenuOpen, setIsScanMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const hasReference = Boolean(user?.referenceNo);

  const handleSync = async () => {
    if (!hasReference) {
      toast.error("Add your MEPCO reference number in Settings first");
      return;
    }

    setIsSyncing(true);
    try {
      const res = await axiosServerInstance.post("/billing/sync");
      if (res.data.success) {
        toast.success(res.data.message || "Bill history synced!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
        {/* Left side: Icon + Meter info */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 dark:bg-blue-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <LuZap size={22} className="sm:w-[26px] sm:h-[26px]" />
          </div>

          <div className="flex flex-col flex-1 min-w-0 gap-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {hasReference ? (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                  <LuCircleCheck size={10} /> MEPCO REFERENCE SAVED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                  <LuCircleAlert size={10} /> MEPCO NOT LINKED
                </span>
              )}
              {/* <ReadingStatus /> */}
            </div>
            <p className="text-base sm:text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">
              {user?.referenceNo
                ? `MEPCO-${user?.referenceNo}`
                : "No reference number added yet"}
            </p>
          </div>
        </div>

        {/* Right side: Action Buttons */}
        <div className="flex flex-col min-[430px]:flex-row gap-4 w-full md:w-90">
          <button
            onClick={handleSync}
            disabled={isSyncing || !hasReference}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LuRefreshCw
              size={16}
              className={`text-blue-600 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync"}
          </button>

          <div className="relative flex-1">
            <button
              onClick={(e) => {
                setIsScanMenuOpen(!isScanMenuOpen);
                e.stopPropagation();
              }}
              className="w-full flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <LuCamera size={16} />
              Smart Scan
              <LuChevronDown
                size={12}
                className={`transition-transform ${isScanMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isScanMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl z-30 overflow-hidden">
                <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors border-b border-gray-50 dark:border-gray-700/50 cursor-pointer">
                  <BsUpcScan size={16} className="text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      Scan Bill
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Extract Ref No.
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setIsScanMenuOpen(false)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <BsSpeedometer size={16} className="text-emerald-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      Scan Meter
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Get Live Units
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <ReadingStatus />
      </div>
    </div>
  );
};

export default MeterStatusCard;
