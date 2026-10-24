export const MIN_BUDGET = 500;
export const MAX_BUDGET = 50000;

export function parseBudgetDraft(draft) {
  if (typeof draft !== "string" || !/^\d+$/.test(draft)) return null;
  const value = Number(draft);
  return Number.isInteger(value) && value >= MIN_BUDGET && value <= MAX_BUDGET ? value : null;
}

export function budgetComparison(budget, predictedBill) {
  if (budget == null) return { tone: "neutral", message: "Enter a valid budget to preview the comparison." };
  if (typeof predictedBill !== "number" || !Number.isFinite(predictedBill) || predictedBill < 0) {
    return { tone: "neutral", message: "Generate a prediction to compare your estimated bill with this goal." };
  }
  const difference = budget - predictedBill;
  if (difference === 0) return { tone: "within", message: "Your estimated bill is exactly on budget." };
  const amount = Math.abs(difference).toLocaleString("en-PK", { maximumFractionDigits: 2 });
  return difference > 0
    ? { tone: "within", message: `Your estimated bill is Rs. ${amount} under budget.` }
    : { tone: "over", message: `Your estimated bill is Rs. ${amount} over budget.` };
}
