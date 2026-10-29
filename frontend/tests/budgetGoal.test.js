import assert from "node:assert/strict";
import test from "node:test";
import { parseBudgetDraft, budgetComparison } from "../src/utils/budgetGoal.js";

test("whole-rupee bounds and exact numeric input", () => {
  assert.equal(parseBudgetDraft("500"), 500);
  assert.equal(parseBudgetDraft("21597"), 21597);
  assert.equal(parseBudgetDraft("50000"), 50000);
  for (const value of ["", "499", "100001", "500.5", "-500", "Infinity", "five", " "]) {
    assert.equal(parseBudgetDraft(value), null);
  }
});
test("under, equal, over and zero-valued estimated bills", () => {
  assert.equal(budgetComparison(5000, 4000).tone, "within");
  assert.match(budgetComparison(5000, 5000).message, /exactly on budget/);
  assert.equal(budgetComparison(5000, 21597).tone, "over");
  assert.match(budgetComparison(5000, 21597).message, /16,597/);
  assert.match(budgetComparison(5000, 0).message, /5,000 under/);
});
test("missing prediction and invalid draft never imply an under-budget bill", () => {
  assert.equal(budgetComparison(5000, null).tone, "neutral");
  assert.equal(budgetComparison(5000, NaN).tone, "neutral");
  assert.equal(budgetComparison(null, 1000).tone, "neutral");
});
