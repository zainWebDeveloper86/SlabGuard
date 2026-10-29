import assert from "node:assert/strict";
import test from "node:test";
import axios from "axios";
import DailyUsage from "../models/dailyUsage.model.js";
import BillHistory from "../models/billHistory.model.js";
import Prediction from "../models/prediction.model.js";
import Tariff from "../models/tariff.model.js";
import User from "../models/user.model.js";
import { generatePrediction, getMyPrediction } from "../controllers/prediction.controller.js";
import { getBillingSummary } from "../controllers/billHistory.controller.js";
import { DEFAULT_TARIFF } from "../controllers/tariff.controller.js";
import { predictCurrentMonthProjection, predictNextMonthUnits } from "../services/predictionEngine.service.js";

const now = new Date("2026-10-20T12:00:00+05:00");
function daily(ds, totalUnits = 2, hoursLogged = 24) {
  return { date: new Date(ds + "T00:00:00+05:00"), totalUnits, hoursLogged, avgTemp: 28 };
}
function october(days = 19) {
  return Array.from({ length: days }, (_, i) => daily(`2026-10-${String(i + 1).padStart(2, "0")}`));
}
function setup(t, records, alter = (points) => points) {
  t.mock.method(DailyUsage, "find", () => ({ sort: async () => records }));
  return t.mock.method(axios, "post", async (_url, body) => {
    const points = [];
    for (let date = new Date(body.forecast_start + "T00:00:00Z");
      date <= new Date(body.forecast_end + "T00:00:00Z");
      date.setUTCDate(date.getUTCDate() + 1)) {
      points.push({ ds: date.toISOString().slice(0, 10), yhat: 10, yhat_lower: 8, yhat_upper: 12 });
    }
    return { data: { forecast: alter(points), modelVersion: "prophet-v1", usedTemperatureRegressor: true } };
  });
}

test("forecasts through month-end and counts actual days only once", async (t) => {
  const request = setup(t, october());
  const result = await predictCurrentMonthProjection("user", now);
  assert.equal(result.predictedUnits, 158); // 19 * 2 actual + 12 * 10 estimated
  assert.equal(result.projection.observedDays, 19);
  assert.equal(result.projection.estimatedDays, 12);
  assert.equal(result.projection.actualUnits, 38);
  assert.equal(result.projection.estimatedUnits, 120);
  assert.equal(result.confidence, 83);
  const body = request.mock.calls[0].arguments[1];
  assert.equal(body.forecast_start, "2026-10-01");
  assert.equal(body.forecast_end, "2026-10-31");
  assert.equal(body.history[0].ds, "2026-10-01"); // no UTC previous-day shift
  assert.equal(request.mock.calls[0].arguments[2].timeout, 60000);
});

test("stale history still estimates all unrecorded days through month-end", async (t) => {
  setup(t, october(10));
  const result = await predictCurrentMonthProjection("user", now);
  assert.equal(result.predictedUnits, 230);
  assert.equal(result.projection.estimatedPastDays, 9);
  assert.equal(result.projection.forecastDays, 12);
});

for (const [label, actualDaily, estimatedDaily, finalEstimate, actual, estimated, expected] of [
  ["below half a unit", 2.14, 7.32, 7.31, 40.66, 87.83, 128],
  ["exactly half a unit", 2.14, 7.32, 7.32, 40.66, 87.84, 129],
  ["above half a unit", 2.14, 7.32, 7.33, 40.66, 87.85, 129],
  ["small decimal readings", 0.02, 0.26, 0.26, 0.38, 3.12, 4],
  ["recorded and estimated zero", 0, 0, 0, 0, 0, 0],
]) {
  test(`rounds the complete-period total correctly: ${label}`, async (t) => {
    setup(t, october().map((record) => ({ ...record, totalUnits: actualDaily })),
      (points) => points.map((point, index) => {
        const value = index === points.length - 1 ? finalEstimate : estimatedDaily;
        return { ...point, yhat: value, yhat_lower: 0, yhat_upper: value + 1 };
      }));
    const result = await predictCurrentMonthProjection("user", now);
    assert.equal(result.predictedUnits, expected);
    assert.equal(result.projection.actualUnits, actual);
    assert.equal(result.projection.estimatedUnits, estimated);
    assert.equal(result.projection.observedDays, 19);
    assert.equal(result.projection.estimatedDays, 12);
    assert.ok(Number.isFinite(result.confidence));
  });
}

test("a missing historical day is estimated rather than silently omitted", async (t) => {
  setup(t, october().filter((_, i) => i !== 4));
  const result = await predictCurrentMonthProjection("user", now);
  assert.equal(result.predictedUnits, 166);
  assert.equal(result.projection.estimatedPastDays, 1);
});

test("incomplete days and today's partial record are excluded from training and actuals", async (t) => {
  const records = october();
  records[4] = daily("2026-10-05", 500, 1);
  records.push(daily("2026-10-20", 999, 24));
  records.push(daily("2026-10-21", 999, 24));
  const request = setup(t, records);
  const result = await predictCurrentMonthProjection("user", now);
  assert.equal(result.predictedUnits, 166);
  assert.equal(result.daysUsed, 18);
  assert.equal(request.mock.calls[0].arguments[1].history.length, 18);
});

test("last day still forecasts the uncompleted current day", async (t) => {
  const request = setup(t, october(30));
  const result = await predictCurrentMonthProjection("user", new Date("2026-10-31T12:00:00+05:00"));
  assert.equal(request.mock.callCount(), 1);
  assert.equal(result.predictedUnits, 70);
  assert.equal(result.projection.forecastDays, 1);
});

for (const [instant, prefix, days] of [
  ["2026-09-30T19:30:00Z", "2026-10", 31],
  ["2024-02-15T12:00:00+05:00", "2024-02", 29],
  ["2026-12-31T19:30:00Z", "2027-01", 31],
]) {
  test(`Pakistan calendar handles ${instant}`, async (t) => {
    const records = Array.from({ length: 10 }, (_, i) => daily(`2023-12-${i + 10}`));
    setup(t, records);
    const result = await predictCurrentMonthProjection("user", new Date(instant));
    assert.equal(result.projection.startDate, `${prefix}-01`);
    assert.equal(result.projection.endDate, `${prefix}-${days}`);
    assert.equal(result.predictedUnits, days * 10);
  });
}

test("insufficient complete history does not call Python", async (t) => {
  const request = setup(t, october(9));
  assert.equal(await predictCurrentMonthProjection("user", now), null);
  assert.equal(request.mock.callCount(), 0);
});

test("duplicate Pakistan dates do not double-count usage", async (t) => {
  const request = setup(t, [...october(), daily("2026-10-01")]);
  assert.equal(await predictCurrentMonthProjection("user", now), null);
  assert.equal(request.mock.callCount(), 0);
});

for (const [name, alter] of [
  ["missing final date", (points) => points.slice(0, -1)],
  ["duplicate date", (points) => [...points.slice(0, -1), points[0]]],
  ["negative estimate", (points) => points.map((point, i) => i ? point : { ...point, yhat: -1 })],
  ["invalid interval", (points) => points.map((point, i) => i ? point : { ...point, yhat_upper: 1 })],
]) {
  test(`rejects Python response with ${name}`, async (t) => {
    setup(t, october(), alter);
    assert.equal(await predictCurrentMonthProjection("user", now), null);
  });
}

test("Python failure allows the existing monthly-history fallback", async (t) => {
  const request = setup(t, october());
  request.mock.mockImplementation(async () => { throw new Error("unavailable"); });
  t.mock.method(console, "error", () => {});
  assert.equal(await predictCurrentMonthProjection("user", now), null);
  t.mock.method(BillHistory, "find", () => ({
    sort: () => ({ limit: async () => [{ units: 200 }, { units: 100 }] }),
  }));
  const fallback = await predictNextMonthUnits("user");
  assert.equal(fallback.modelVersion, "moving-average-v1");
  assert.equal(fallback.predictedUnits, 167);
});

function generate(readingSchedule) {
  return new Promise((resolve, reject) => {
    const res = {
      status(code) { this.code = code; return this; },
      json(data) { resolve({ status: this.code, data }); },
    };
    generatePrediction({ user: { _id: "user", readingSchedule } }, res, reject);
  });
}

test("controller persists the projection dates, coverage and training days", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: now.getTime() });
  setup(t, october());
  t.mock.method(Tariff, "findOne", async () => DEFAULT_TARIFF);
  t.mock.method(User, "findById", async () => ({ meterType: "single", sanctionedLoad: 0 }));
  t.mock.method(BillHistory, "find", () => ({ sort: () => ({ limit: async () => [] }) }));
  t.mock.method(Prediction, "findOneAndUpdate", async (_filter, update) => update.$set);
  const { status, data } = await generate();
  assert.equal(status, 200);
  assert.equal(data.prediction.month, "Oct26");
  assert.equal(data.prediction.daysUsed, 19);
  assert.equal(data.prediction.projection.endDate, "2026-10-31");
  assert.equal(data.prediction.projection.estimatedDays, 12);
});

const readingSchedule = { lastConfirmedReadingDate: "2026-09-22", expectedDayFrom: 20, expectedDayTo: 24 };

test("cycle forecasts cross calendar boundaries and exclude confirmed reading day", async (t) => {
  const request = setup(t, [daily("2026-09-22", 999), daily("2026-09-23", 0), ...october()]);
  const result = await predictCurrentMonthProjection("user", now, readingSchedule);
  // Sep 23 zero + Oct 1–19 at 2/day; 12 other days estimated at 10/day.
  assert.equal(result.predictedUnits, 158);
  assert.equal(result.projection.observedDays, 20);
  assert.equal(result.projection.actualUnits, 38);
  assert.equal(result.projection.estimatedDays, 12);
  assert.equal(result.projection.estimatedPastDays, 7);
  const body = request.mock.calls[0].arguments[1];
  assert.equal(body.forecast_start, "2026-09-23");
  assert.equal(body.forecast_end, "2026-10-24");
  assert.equal(body.days_to_forecast, 32);
});

test("cycle repeated forecasts do not add old totals; a late complete day replaces an estimate", async (t) => {
  const records = october();
  setup(t, records);
  const first = await predictCurrentMonthProjection("user", now, readingSchedule);
  assert.equal((await predictCurrentMonthProjection("user", now, readingSchedule)).predictedUnits, first.predictedUnits);
  records.push(daily("2026-09-23", 3));
  assert.equal((await predictCurrentMonthProjection("user", now, readingSchedule)).predictedUnits, first.predictedUnits - 7);
});

function invoke(handler, user) {
  return new Promise((resolve, reject) => handler({ user }, {
    status() { return this; }, json: resolve,
  }, reject));
}

test("saved cycle survives reload and dashboard while calendar actual totals stay separate", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: now.getTime() });
  setup(t, october());
  t.mock.method(Tariff, "findOne", async () => DEFAULT_TARIFF);
  t.mock.method(User, "findById", async () => ({ meterType: "single", sanctionedLoad: 0 }));
  t.mock.method(BillHistory, "find", () => ({ sort: () => ({ limit: async () => [] }) }));
  t.mock.method(BillHistory, "findOne", () => ({ sort: async () => null }));
  const writes = [];
  t.mock.method(Prediction, "findOneAndUpdate", async (filter, update) => { writes.push(filter); return update.$set; });
  const { data } = await generate(readingSchedule);
  assert.equal(data.prediction.month, "cycle:2026-09-23:2026-10-20:2026-10-24");
  assert.equal(data.prediction.projection.periodType, "reading-cycle");
  const user = { _id: "user", readingSchedule };
  const read = t.mock.method(Prediction, "findOne", () => ({ sort: async () => data.prediction }));
  const reloaded = await invoke(getMyPrediction, user);
  assert.equal(reloaded.hasPrediction, true);
  assert.equal(read.mock.calls[0].arguments[0].user, "user");
  t.mock.method(DailyUsage, "find", async (filter) => {
    assert.equal(filter.date.$gte.toISOString(), "2026-09-30T19:00:00.000Z");
    return october();
  });
  const dashboard = await invoke(getBillingSummary, user);
  assert.equal(dashboard.liveMonth.actualUnitsSoFar, 38);
  assert.equal(dashboard.liveMonth.prediction.month, data.prediction.month);
  const changed = { ...user, readingSchedule: { ...readingSchedule, expectedDayTo: 25 } };
  assert.equal((await invoke(getMyPrediction, changed)).hasPrediction, false);
  assert.equal((await invoke(getBillingSummary, changed)).liveMonth.prediction, null);
  assert.equal(writes.length, 1); // read endpoints never trigger forecasting/writes
});

test("monthly fallback clears calendar-projection metadata", async (t) => {
  setup(t, []);
  t.mock.method(Tariff, "findOne", async () => DEFAULT_TARIFF);
  t.mock.method(User, "findById", async () => ({ meterType: "single", sanctionedLoad: 0 }));
  t.mock.method(BillHistory, "find", () => ({
    sort: () => ({ limit: async () => [{ units: 200 }, { units: 100 }] }),
  }));
  t.mock.method(BillHistory, "findOne", () => ({ sort: async () => ({ month: "Sep26" }) }));
  t.mock.method(Prediction, "findOneAndUpdate", async (_filter, update) => update.$set);
  const { data } = await generate();
  assert.equal(data.prediction.modelVersion, "moving-average-v1");
  assert.equal(data.prediction.month, "after-Sep26");
  assert.equal(data.prediction.projection, null);
  assert.equal(data.prediction.daysUsed, null);
  assert.equal(data.prediction.monthsUsed, 2);
});
