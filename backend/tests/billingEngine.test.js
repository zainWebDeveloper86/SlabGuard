import assert from "node:assert/strict";
import test from "node:test";
import Tariff from "../models/tariff.model.js";
import BillHistory from "../models/billHistory.model.js";
import User from "../models/user.model.js";
import { calculateBill } from "../services/billingEngine.service.js";
import { DEFAULT_TARIFF } from "../controllers/tariff.controller.js";

// Synthetic rates test the calculation, not official utility tariffs.
const tariff = {
  nonProtectedSlabs: [
    { rangeFrom: 1, rangeTo: 100, rate: 10 },
    { rangeFrom: 101, rangeTo: 200, rate: 20 },
    { rangeFrom: 201, rangeTo: 300, rate: 30 },
    { rangeFrom: 301, rangeTo: null, rate: 40 },
  ],
  protectedSlabs: [
    { rangeFrom: 1, rangeTo: 100, rate: 10 },
    { rangeFrom: 101, rangeTo: 200, rate: 20 },
  ],
  lifelineSlabs: [
    { rangeFrom: 1, rangeTo: 50, rate: 4 },
    { rangeFrom: 51, rangeTo: 100, rate: 8 },
  ],
  taxes: [],
  peakHours: { rateMultiplier: 1.25 },
};

function mockData(t, { history = [], meterType = "single" } = {}) {
  t.mock.method(Tariff, "findOne", async () => tariff);
  t.mock.method(User, "findById", async () => ({ meterType, sanctionedLoad: 0 }));
  t.mock.method(BillHistory, "find", () => ({
    sort: () => ({ limit: async (count) => history.slice(0, count) }),
  }));
}

test("464 units reproduce the screenshot amount using source-code default tariffs", async (t) => {
  t.mock.method(Tariff, "findOne", async () => DEFAULT_TARIFF);
  t.mock.method(User, "findById", async () => ({ meterType: "single", sanctionedLoad: 0 }));
  t.mock.method(BillHistory, "find", () => ({ sort: () => ({ limit: async () => [] }) }));
  const bill = await calculateBill("test-user", 464);
  assert.equal(bill.energyCost, 18073);
  assert.equal(bill.gstAmount, 3253);
  assert.equal(bill.edAmount, 271);
  assert.equal(bill.totalBill, 21597);
});

for (const [units, rate] of [
  [0, 10], [0.5, 10], [99.5, 10], [100, 10],
  [100.5, 20], [101, 20], [200, 20], [200.5, 30],
  [300, 30], [300.5, 40], [900, 40],
]) {
  test(`non-protected: ${units} kWh uses rate ${rate}`, async (t) => {
    mockData(t);
    const bill = await calculateBill("test-user", units);
    assert.equal(bill.category, "non-protected");
    assert.equal(bill.energyCost, Math.round(units * rate));
    assert.equal(bill.totalBill, bill.energyCost);
  });
}

for (const [units, rate] of [[50, 4], [50.5, 8], [51, 8], [100, 8]]) {
  test(`lifeline: ${units} kWh uses rate ${rate}`, async (t) => {
    mockData(t, { history: Array.from({ length: 12 }, () => ({ units: 20 })) });
    const bill = await calculateBill("test-user", units);
    assert.equal(bill.category, "lifeline");
    assert.equal(bill.energyCost, Math.round(units * rate));
  });
}

test("protected: fractional usage preserves tier-by-tier billing", async (t) => {
  mockData(t, { history: Array.from({ length: 6 }, () => ({ units: 120 })) });
  const bill = await calculateBill("test-user", 100.5);
  assert.equal(bill.category, "protected");
  assert.equal(bill.energyCost, 1010);
});

for (const [units, surcharge] of [[100, 25], [100.5, 50], [200.5, 75]]) {
  test(`three-phase: ${units} kWh selects the correct peak-surcharge rate`, async (t) => {
    mockData(t, { meterType: "three" });
    const bill = await calculateBill("test-user", units, 10);
    assert.equal(bill.peakSurcharge, surcharge);
  });
}
