import React, { useState, useEffect } from "react";
import {
  LuTable,
  LuInfo,
  LuFileText,
  LuCircleAlert,
  LuExternalLink,
  LuPencilLine,
  LuCheck,
  LuX,
  LuShieldCheck,
  LuShieldX,
  LuHeartHandshake,
} from "react-icons/lu";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { axiosServerInstance } from "../../axios.js";
import SeasonalPeakSchedule from "../../components/Common/SeasonalPeakSchedule";

const lifelineColor = () => "text-emerald-600"; // most-subsidized tier, always this color
const protectedColor = () => "text-emerald-500";
const nonProtectedColor = (index) => {
  if (index < 2) return "text-amber-500";
  if (index < 4) return "text-orange-500";
  return "text-red-500";
};

const TariffGuide = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [lifelineSlabs, setLifelineSlabs] = useState([]); // ✅ new
  const [protectedSlabs, setProtectedSlabs] = useState([]);
  const [nonProtectedSlabs, setNonProtectedSlabs] = useState([]);
  const [fixedCharges, setFixedCharges] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editSlab, setEditSlab] = useState({ type: null, index: null });
  const [tempRate, setTempRate] = useState("");
  const [editFixed, setEditFixed] = useState({ index: null });
  const [tempCharge, setTempCharge] = useState("");
  const [editTax, setEditTax] = useState({ index: null });
  const [tempVal, setTempVal] = useState("");


  useEffect(() => {
    const fetchTariff = async () => {
      try {
        const res = await axiosServerInstance.get("/tariff");
        if (res.data.success) {
          const t = res.data.tariff;
          setLifelineSlabs(t.lifelineSlabs || []); // ✅ new
          setProtectedSlabs(t.protectedSlabs);
          setNonProtectedSlabs(t.nonProtectedSlabs);
          setFixedCharges(t.fixedCharges);
          setTaxes(t.taxes);
        }
      } catch {
        toast.error("Failed to load tariff data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTariff();
  }, []);

  const persist = async (payload) => {
    try {
      await axiosServerInstance.patch("/tariff", payload);
      toast.success("Tariff updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    }
  };

  const handleSlabEdit = (type, index, currentRate) => {
    setEditSlab({ type, index });
    setTempRate(currentRate);
  };

  // ✅ updated — now handles all three slab types, not just two
  const handleSlabSave = (type, index) => {
    const newRate = parseFloat(tempRate);
    if (isNaN(newRate)) return;

    if (type === "lifeline") {
      const updated = [...lifelineSlabs];
      updated[index] = { ...updated[index], rate: newRate };
      setLifelineSlabs(updated);
      persist({ lifelineSlabs: updated });
    } else if (type === "protected") {
      const updated = [...protectedSlabs];
      updated[index] = { ...updated[index], rate: newRate };
      setProtectedSlabs(updated);
      persist({ protectedSlabs: updated });
    } else {
      const updated = [...nonProtectedSlabs];
      updated[index] = { ...updated[index], rate: newRate };
      setNonProtectedSlabs(updated);
      persist({ nonProtectedSlabs: updated });
    }
    setEditSlab({ type: null, index: null });
  };

  const handleFixedEdit = (index, currentCharge) => {
    setEditFixed({ index });
    setTempCharge(currentCharge);
  };

  const handleFixedSave = (index) => {
    const newCharge = parseFloat(tempCharge);
    if (isNaN(newCharge)) return;
    const updated = [...fixedCharges];
    updated[index] = { ...updated[index], charge: newCharge };
    setFixedCharges(updated);
    persist({ fixedCharges: updated });
    setEditFixed({ index: null });
  };

  const handleTaxEdit = (index, currentVal) => {
    setEditTax({ index });
    setTempVal(currentVal);
  };

  const handleTaxSave = (index) => {
    if (!tempVal.trim()) return;
    const updated = [...taxes];
    updated[index] = { ...updated[index], val: tempVal.trim() };
    setTaxes(updated);
    persist({ taxes: updated });
    setEditTax({ index: null });
  };


  // ✅ description is now a parameter, not a hardcoded ternary — supports 3 types cleanly
  const renderSlabTable = (slabs, title, icon, type, colorFn, description) => (
    <div className="bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-xl">{icon}</div>
          <div>
            <h3 className="text-xl font-black dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[400px] w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
            <tr>
              <th className="px-8 py-4">Unit Range</th>
              <th className="px-8 py-4 text-center">Rate (Rs./Unit)</th>
              {isAdmin && <th className="px-8 py-4 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {slabs.map((slab, i) => (
              <tr
                key={i}
                className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
              >
                <td className="px-8 py-5 font-black text-gray-700 dark:text-gray-200">
                  {slab.range}
                </td>
                <td className="px-8 py-5 text-center">
                  {editSlab.type === type && editSlab.index === i ? (
                    <div className="flex items-center justify-center gap-2 animate-in zoom-in-95">
                      <span className="text-brand-blue font-black">Rs.</span>
                      <input
                        type="number"
                        step="0.01"
                        value={tempRate}
                        onChange={(e) => setTempRate(e.target.value)}
                        className="w-24 bg-gray-100 dark:bg-gray-900 border-none rounded-lg px-2 py-1 text-center font-black text-brand-blue outline-none ring-2 ring-brand-blue/30"
                      />
                    </div>
                  ) : (
                    <span className={`text-lg font-black ${colorFn(i)} italic`}>
                      Rs. {slab.rate}
                    </span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-8 py-5 text-right">
                    {editSlab.type === type && editSlab.index === i ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSlabSave(type, i)}
                          className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                        >
                          <LuCheck size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setEditSlab({ type: null, index: null })
                          }
                          className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition cursor-pointer"
                        >
                          <LuX size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSlabEdit(type, i, slab.rate)}
                        className="p-2 text-gray-400 hover:text-brand-blue transition cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <LuPencilLine size={18} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400 font-bold">
        Loading tariff...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <LuTable className="text-brand-blue" /> MEPCO Tariff Guide 2026
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium italic">
            Official Unit Rates & Slab Information{" "}
            {isAdmin && (
              <span className="text-brand-blue font-black ml-2 text-xs uppercase not-italic">
                [Admin Mode]
              </span>
            )}
          </p>
        </div>
        <div className="bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-2xl border border-brand-blue/20 text-xs font-black uppercase tracking-widest">
          Last Updated: August 2026
        </div>
      </div>

      {/* ✅ updated explainer — now covers all three categories, correct rules */}
      <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 p-6 rounded-3xl">
        <div className="flex items-start gap-4">
          <LuInfo className="text-brand-blue shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-black text-gray-900 dark:text-white mb-1">
              Understanding Tariff Classification
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <span className="font-bold text-emerald-600">Lifeline</span>{" "}
              applies if your highest month in the last 12 (including this one)
              never exceeded <strong>100 units</strong>.{" "}
              <span className="font-bold text-emerald-500">Protected</span>{" "}
              applies if every one of your last 6 months stayed at or under{" "}
              <strong>200 units</strong>.{" "}
              <span className="font-bold text-amber-600">Non-Protected</span>{" "}
              applies otherwise. Crossing the threshold in even one month resets
              the streak.
            </p>
          </div>
        </div>
      </div>

      {/* ✅ new table */}
      {renderSlabTable(
        lifelineSlabs,
        "Lifeline Slab",
        <LuHeartHandshake className="text-emerald-600" size={28} />,
        "lifeline",
        lifelineColor,
        "Highest month in the last 12 (incl. current) ≤ 100 units",
      )}

      {renderSlabTable(
        protectedSlabs,
        "Protected Slab",
        <LuShieldCheck className="text-emerald-500" size={28} />,
        "protected",
        protectedColor,
        "Every one of the last 6 months ≤ 200 units",
      )}
      {renderSlabTable(
        nonProtectedSlabs,
        "Non-Protected Slab",
        <LuShieldX className="text-amber-500" size={28} />,
        "non-protected",
        nonProtectedColor,
        "Any month that broke the Lifeline or Protected streak",
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6">
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-black mb-6 dark:text-white flex items-center gap-2">
              <LuFileText className="text-brand-blue" /> Fixed Charges (Monthly)
            </h3>
            <p className="text-xs text-gray-500 mb-4 italic">
              Based on sanctioned load — Lifeline consumers are exempt (a
              minimum monthly charge applies instead).
            </p>
            <div className="space-y-3">
              {fixedCharges.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center group border-b border-gray-50 dark:border-gray-800 pb-3 last:border-0"
                >
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {item.load}
                  </span>
                  <div className="flex items-center gap-2">
                    {editFixed.index === i ? (
                      <div className="flex items-center gap-1 animate-in zoom-in-95">
                        <span className="text-xs font-black text-gray-400">
                          Rs.
                        </span>
                        <input
                          type="number"
                          value={tempCharge}
                          onChange={(e) => setTempCharge(e.target.value)}
                          className="w-20 bg-gray-100 dark:bg-gray-900 border-none rounded-lg px-2 py-1 text-center font-black text-brand-blue outline-none ring-2 ring-brand-blue/30"
                        />
                        <button
                          onClick={() => handleFixedSave(i)}
                          className="text-emerald-500 hover:scale-110 transition cursor-pointer"
                        >
                          <LuCheck size={14} />
                        </button>
                        <button
                          onClick={() => setEditFixed({ index: null })}
                          className="text-red-500 hover:scale-110 transition cursor-pointer"
                        >
                          <LuX size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-black text-brand-blue">
                          Rs. {item.charge}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleFixedEdit(i, item.charge)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-brand-blue transition cursor-pointer"
                          >
                            <LuPencilLine size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-black mb-6 dark:text-white flex items-center gap-2">
              <LuFileText className="text-brand-blue" /> Additional Charges
            </h3>
            <div className="space-y-4">
              {taxes.map((tax, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center group ${i < taxes.length - 1 ? "border-b border-gray-50 dark:border-gray-800 pb-3" : ""}`}
                >
                  <div>
                    <p className="font-bold text-gray-700 dark:text-gray-300">
                      {tax.label}
                    </p>
                    <p className="text-[10px] text-gray-500">{tax.sub}</p>
                  </div>
                  {editTax.index === i ? (
                    <div className="flex items-center gap-1 animate-in zoom-in-95">
                      <input
                        type="text"
                        value={tempVal}
                        onChange={(e) => setTempVal(e.target.value)}
                        className="w-24 bg-gray-100 dark:bg-gray-900 border-none rounded-lg px-2 py-1 text-center font-black text-brand-blue outline-none ring-2 ring-brand-blue/30"
                      />
                      <button
                        onClick={() => handleTaxSave(i)}
                        className="text-emerald-500 hover:scale-110 transition cursor-pointer"
                      >
                        <LuCheck size={14} />
                      </button>
                      <button
                        onClick={() => setEditTax({ index: null })}
                        className="text-red-500 hover:scale-110 transition cursor-pointer"
                      >
                        <LuX size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-black text-brand-blue">
                        {tax.val}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => handleTaxEdit(i, tax.val)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-brand-blue transition cursor-pointer"
                        >
                          <LuPencilLine size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <SeasonalPeakSchedule />
        </div>
      </div>

      {/* ✅ updated to mention Lifeline too */}
      <div className="bg-brand-gradient p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
        <LuInfo className="absolute -right-4 -top-4 w-32 h-32 opacity-10" />
        <h4 className="text-lg font-black mb-3 relative z-10 flex items-center gap-2">
          <LuCircleAlert /> Category Status Check
        </h4>
        <p className="text-sm text-blue-50 font-medium leading-relaxed mb-4 relative z-10 max-w-2xl">
          <strong>Lifeline</strong> needs your highest month (last 12 + current)
          at or under 100 units. <strong>Protected</strong> needs every one of
          your last 6 months at or under 200 units. Crossing the limit in even
          one month moves you to <strong>Non-Protected</strong> rates until you
          rebuild a clean streak.
        </p>
        <a
          href="https://mepco.com.pk"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 p-3 rounded-xl transition"
        >
          MEPCO Website <LuExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

export default TariffGuide;
