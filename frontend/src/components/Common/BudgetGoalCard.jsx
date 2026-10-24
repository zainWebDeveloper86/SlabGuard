import { useEffect, useRef, useState } from "react";
import { LuWallet } from "react-icons/lu";
import { useAuth } from "../../hooks/useAuth";
import { axiosServerInstance } from "../../axios";
import { budgetComparison, parseBudgetDraft, MIN_BUDGET, MAX_BUDGET } from "../../utils/budgetGoal";

export default function BudgetGoalCard({ predictedBill = null }) {
  const { user, login } = useAuth();
  return <BudgetGoalEditor key={user?._id ?? "guest"} user={user} login={login} predictedBill={predictedBill} />;
}

function BudgetGoalEditor({ user, login, predictedBill }) {
  const savedGoal = user?.budgetGoal ?? null;
  const [previousGoal, setPreviousGoal] = useState(savedGoal);
  const [draft, setDraft] = useState(String(savedGoal ?? 5000));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const requestVersion = useRef(0);

  if (previousGoal !== savedGoal) {
    setPreviousGoal(savedGoal);
    setDraft(String(savedGoal ?? 5000));
    setSaving(false);
    setError("");
  }

  useEffect(() => () => { requestVersion.current += 1; }, []);

  const parsed = parseBudgetDraft(draft);
  const dirty = savedGoal === null || parsed !== savedGoal;
  const comparison = budgetComparison(parsed, predictedBill);
  const changeDraft = (value) => { setDraft(value); setError(""); setStatus(""); };

  const save = async (value) => {
    if (value !== null && parsed === null) {
      setError("Enter whole rupees from Rs. 500 to Rs. 50,000.");
      return;
    }
    const version = ++requestVersion.current;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const res = await axiosServerInstance.patch("/user/budget-goal", { budgetGoal: value });
      if (version !== requestVersion.current) return;
      if (!res.data.success || !res.data.user) throw new Error("Budget could not be saved.");
      login({ ...user, ...res.data.user });
      setDraft(String(res.data.user.budgetGoal ?? 5000));
      setStatus(value === null ? "Budget goal cleared." : "Budget goal saved to your account.");
    } catch (failure) {
      if (version === requestVersion.current) {
        setError(failure.response?.data?.message || "Could not save your budget. Your changes are still here; please retry.");
      }
    } finally {
      if (version === requestVersion.current) setSaving(false);
    }
  };

  return (
    <section aria-label="My Budget Goal" className="bg-white dark:bg-[#1E293B] p-6 md:p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4">
      <h3 className="text-lg font-black dark:text-white flex items-center gap-2">
        <LuWallet className="text-emerald-500" aria-hidden="true" /> My Budget Goal
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {savedGoal === null ? "No goal saved. Rs. 5,000 is a suggested starting point." : `Saved goal: Rs. ${savedGoal.toLocaleString("en-PK")}`}
      </p>
      <label htmlFor="budget-goal-amount" className="text-sm font-bold dark:text-white">Bill budget (Rs.)</label>
      <input id="budget-goal-amount" type="number" min={MIN_BUDGET} max={MAX_BUDGET} step="1"
        value={draft} disabled={saving} onChange={(event) => changeDraft(event.target.value)}
        aria-invalid={draft !== "" && parsed === null}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 dark:text-white" />
      <input type="range" aria-label="Adjust budget goal" min={MIN_BUDGET} max={MAX_BUDGET} step="1"
        value={parsed ?? savedGoal ?? 5000} disabled={saving} onChange={(event) => changeDraft(event.target.value)}
        className="w-full accent-brand-blue" />
      {parsed === null && <p className="text-xs text-red-600 dark:text-red-400">Enter whole rupees from Rs. 500 to Rs. 50,000.</p>}
      <div className="flex justify-between text-xs text-gray-500"><span>Rs. 500</span><span>Rs. 50,000</span></div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {dirty ? "Preview — changes are not saved yet." : "Your saved goal is used for this comparison."}
      </p>
      <div className={`p-4 rounded-2xl text-sm ${comparison.tone === "over" ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400" : comparison.tone === "within" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-300"}`}>
        {comparison.message}
      </div>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {status && <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">{status}</p>}
      <div className="flex flex-wrap gap-3 mt-auto">
        <button type="button" disabled={saving || parsed === null || !dirty} onClick={() => save(parsed)}
          className="px-5 py-3 rounded-2xl bg-brand-blue text-white font-bold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
          {saving ? "Saving..." : "Save Goal"}
        </button>
        {savedGoal !== null && <button type="button" disabled={saving} onClick={() => save(null)}
          className="text-sm text-gray-600 dark:text-gray-300 underline cursor-pointer disabled:opacity-50">Clear saved goal</button>}
      </div>
    </section>
  );
}
