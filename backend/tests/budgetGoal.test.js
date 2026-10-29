import assert from "node:assert/strict";
import test from "node:test";
import User from "../models/user.model.js";
import { updateBudgetGoal } from "../controllers/preferences.controller.js";
import { getUser } from "../controllers/user.controller.js";

function invoke(handler, id, body = {}) {
  return new Promise((resolve) => {
    const res = { status(code) { this.code = code; return this; }, json(data) { resolve({ status: this.code, data }); } };
    handler({ user: { _id: id }, body }, res, (error) => resolve({ error }));
  });
}

test("budget saves, reloads, clears and stays isolated between accounts", async (t) => {
  const accounts = new Map([["a", { _id: "a", budgetGoal: null }], ["b", { _id: "b", budgetGoal: 9000 }]]);
  t.mock.method(User, "findByIdAndUpdate", (id, update, options) => ({ select: async (fields) => {
    assert.equal(options.runValidators, true);
    assert.ok(fields.includes("-password"));
    const updated = { ...accounts.get(id), ...update.$set };
    accounts.set(id, updated);
    return updated;
  } }));
  t.mock.method(User, "findById", (id) => ({ select: async () => accounts.get(id) }));
  assert.equal((await invoke(updateBudgetGoal, "a", { budgetGoal: 21500 })).status, 200);
  assert.equal((await invoke(getUser, "a")).data.user.budgetGoal, 21500);
  assert.equal((await invoke(getUser, "b")).data.user.budgetGoal, 9000);
  await invoke(updateBudgetGoal, "a", { budgetGoal: null });
  assert.equal((await invoke(getUser, "a")).data.user.budgetGoal, null);
});

for (const value of [undefined, "5000", "", true, 0, -1, 499, 50001, 100000, 100001, 500.5, Infinity, NaN, {}]) {
  test(`invalid budget ${String(value)} is rejected before any write`, async (t) => {
    const write = t.mock.method(User, "findByIdAndUpdate", () => assert.fail("Unexpected write"));
    const result = await invoke(updateBudgetGoal, "a", { budgetGoal: value });
    assert.equal(result.error.statusCode, 400);
    assert.equal(result.error.message, "Budget goal must be whole rupees from Rs. 500 to Rs. 50,000, or null to clear");
    assert.equal(write.mock.callCount(), 0);
  });
}

for (const budgetGoal of [500, 50000]) {
  test(`budget boundary ${budgetGoal} is accepted`, async (t) => {
    t.mock.method(User, "findByIdAndUpdate", (_id, update) => ({ select: async () => update.$set }));
    const result = await invoke(updateBudgetGoal, "a", { budgetGoal });
    assert.equal(result.data.user.budgetGoal, budgetGoal);
  });
}

test("missing account returns 404", async (t) => {
  t.mock.method(User, "findByIdAndUpdate", () => ({ select: async () => null }));
  assert.equal((await invoke(updateBudgetGoal, "missing", { budgetGoal: 5000 })).error.statusCode, 404);
});

test("database failure is forwarded without returning a successful save", async (t) => {
  const failure = new Error("Database unavailable");
  t.mock.method(User, "findByIdAndUpdate", () => ({ select: async () => { throw failure; } }));
  assert.equal((await invoke(updateBudgetGoal, "a", { budgetGoal: 5000 })).error, failure);
});

test("existing accounts have no assumed saved budget", () => {
  assert.equal(User.hydrate({ fullName: "Test" }).budgetGoal, null);
});
