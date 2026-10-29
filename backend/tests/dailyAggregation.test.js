import assert from "node:assert/strict";
import test from "node:test";
import axios from "axios";
import cron from "node-cron";
import HourlyUsage from "../models/hourlyUsage.model.js";
import DailyUsage from "../models/dailyUsage.model.js";
import User from "../models/user.model.js";
import Tariff from "../models/tariff.model.js";
import BillHistory from "../models/billHistory.model.js";
import Prediction from "../models/prediction.model.js";
import { aggregateSpecificDate, aggregateYesterdayForAllUsers, aggregateBackfillRange } from "../services/dailyAggregation.service.js";
import { getMyDailyUsage, getMyHourlyUsage } from "../controllers/dailyUsage.controller.js";
import { getBillingSummary } from "../controllers/billHistory.controller.js";
import { updateTariff } from "../controllers/tariff.controller.js";
import { startNightlyAggregationJob } from "../jobs/nightlyAggregation.job.js";
import { pakistanDate, pakistanDayBounds, pakistanMonthBounds, shiftPakistanDate, isPakistanPeakHour } from "../utils/pakistanTime.js";

const date = "2026-10-20";
const reading = (hour, units = 1) => ({ hour: new Date(`${date}T${String(hour).padStart(2, "0")}:00:00+05:00`), units });
function fixtures(t, { logs = [], records = [], meterType = "three", peakHours = { startHour: 18, endHour: 22 } } = {}) {
  const saved = [...records], writes = [], weatherDates = [], queries = [];
  t.mock.method(axios, "get", async (_url, options) => {
    weatherDates.push(options.params.start_date);
    return { data: { daily: { temperature_2m_mean: [28] } } };
  });
  t.mock.method(User, "find", () => ({ select: async () => [{ _id: "a", meterType }] }));
  t.mock.method(Tariff, "findOne", async () => ({ peakHours }));
  t.mock.method(HourlyUsage, "find", async (filter) => {
    queries.push(filter);
    return logs.filter((log) => log.hour >= filter.hour.$gte && log.hour < filter.hour.$lt);
  });
  t.mock.method(DailyUsage, "find", (filter) => ({ limit: async (count) =>
    saved.filter((record) => record.date >= filter.date.$gte && record.date < filter.date.$lt).slice(0, count),
  }));
  t.mock.method(DailyUsage, "findOneAndUpdate", async (filter, update, options) => {
    writes.push({ filter, update, options });
    const index = saved.findIndex((record) => filter._id ? record._id === filter._id : record.date.getTime() === filter.date.getTime());
    const record = { _id: index < 0 ? `record-${saved.length}` : saved[index]._id, ...update };
    if (index < 0) saved.push(record); else saved[index] = record;
    return record;
  });
  return { logs, saved, writes, weatherDates, queries };
}

for (const [instant, expected] of [
  ["2026-10-19T18:59:59Z", "2026-10-19"], ["2026-10-19T19:00:00Z", date],
  ["2026-12-31T19:00:00Z", "2027-01-01"], ["2024-02-28T19:00:00Z", "2024-02-29"],
]) {
  test(`Pakistan date at ${instant}`, () => assert.equal(pakistanDate(new Date(instant)), expected));
}
test("day/month boundaries and shifts use the Pakistan calendar", () => {
  const bounds = pakistanDayBounds(date);
  assert.equal(bounds.start.toISOString(), "2026-10-19T19:00:00.000Z");
  assert.equal(bounds.end.toISOString(), "2026-10-20T19:00:00.000Z");
  const month = pakistanMonthBounds(new Date("2026-12-31T19:01:00Z"));
  assert.equal(month.start.toISOString(), "2026-12-31T19:00:00.000Z");
  assert.equal(month.end.toISOString(), "2027-01-31T19:00:00.000Z");
  assert.equal(shiftPakistanDate("2024-03-01", -1), "2024-02-29");
  assert.equal(shiftPakistanDate("2027-01-01", -1), "2026-12-31");
  for (const bad of ["2026-02-29", "2026-02-30", "2026-13-01", "bad", "", null]) assert.throws(() => pakistanDayBounds(bad));
});

test("daily aggregation includes Pakistan midnight and excludes next midnight", async (t) => {
  const f = fixtures(t, { logs: [reading(0, 2), reading(23, 3), { hour: pakistanDayBounds(date).end, units: 99 }] });
  assert.equal(await aggregateSpecificDate(date), 1);
  assert.deepEqual(f.weatherDates, [date]);
  assert.equal(f.saved[0].date.toISOString(), "2026-10-19T19:00:00.000Z");
  assert.equal(f.saved[0].totalUnits, 5);
  assert.equal(f.saved[0].hoursLogged, 2);
  assert.equal(f.saved[0].isHoliday, false);
});
test("24 distinct hours are complete; zero is a real reading", async (t) => {
  const f = fixtures(t, { logs: Array.from({ length: 24 }, (_, hour) => reading(hour, hour === 0 ? 0 : 1)) });
  await aggregateSpecificDate(date);
  assert.equal(f.saved[0].hoursLogged, 24);
  assert.equal(f.saved[0].totalUnits, 23);
  assert.equal(f.saved[0].peakUnits, 4);
  assert.equal(f.saved[0].offPeakUnits, 19);
});
test("partial and empty days are never padded with invented readings", async (t) => {
  const f = fixtures(t, { logs: [reading(8, 0)] });
  await aggregateSpecificDate(date);
  assert.equal(f.saved[0].hoursLogged, 1);
  assert.equal(f.saved[0].totalUnits, 0);
  f.logs.length = 0;
  assert.equal(await aggregateSpecificDate("2026-10-21"), 0);
  assert.equal(f.writes.length, 1);
});
test("repeated aggregation and a late reading replace totals instead of adding", async (t) => {
  const f = fixtures(t, { logs: [reading(8, 1.25)] });
  await aggregateSpecificDate(date);
  await aggregateSpecificDate(date);
  assert.equal(f.saved.length, 1);
  assert.equal(f.saved[0].totalUnits, 1.25);
  f.logs.push(reading(9, 0.5));
  await aggregateSpecificDate(date);
  assert.equal(f.saved.length, 1);
  assert.equal(f.saved[0].totalUnits, 1.75);
  assert.equal(f.saved[0].hoursLogged, 2);
  assert.equal(f.writes[1].options.upsert, false);
});
test("legacy UTC-midnight record is updated in place without moving its date", async (t) => {
  const oldDate = new Date(`${date}T00:00:00Z`);
  const f = fixtures(t, { logs: [reading(8)], records: [{ _id: "legacy", date: oldDate, totalUnits: 99 }] });
  await aggregateSpecificDate(date);
  assert.equal(f.saved.length, 1);
  assert.equal(f.saved[0]._id, "legacy");
  assert.equal(f.saved[0].date.getTime(), oldDate.getTime());
  assert.equal(f.saved[0].totalUnits, 1);
});
test("ambiguous daily duplicates stop without merging or writing", async (t) => {
  const f = fixtures(t, { logs: [reading(8)], records: [
    { _id: "old", date: new Date(`${date}T00:00:00Z`) },
    { _id: "new", date: pakistanDayBounds(date).start },
  ] });
  await assert.rejects(aggregateSpecificDate(date), /Duplicate daily records.*review required/);
  assert.equal(f.writes.length, 0);
});
test("duplicate hourly data cannot masquerade as a complete day", async (t) => {
  const f = fixtures(t, { logs: Array.from({ length: 24 }, () => reading(8)) });
  await assert.rejects(aggregateSpecificDate(date), /Duplicate hourly readings/);
  assert.equal(f.writes.length, 0);
});
test("invalid historical units stop aggregation instead of corrupting totals", async (t) => {
  const f = fixtures(t, { logs: [reading(8, -1)] });
  await assert.rejects(aggregateSpecificDate(date), /Invalid hourly reading/);
  assert.equal(f.writes.length, 0);
});
test("peak window includes start and excludes end, also across midnight", () => {
  for (const [hour, expected] of [[17, false], [18, true], [21, true], [22, false]]) {
    assert.equal(isPakistanPeakHour(reading(hour).hour, { startHour: 18, endHour: 22 }), expected);
  }
  for (const [hour, expected] of [[21, false], [22, true], [23, true], [0, true], [1, true], [2, false]]) {
    assert.equal(isPakistanPeakHour(reading(hour).hour, { startHour: 22, endHour: 2 }), expected);
  }
  assert.throws(() => isPakistanPeakHour(reading(8).hour, { startHour: 8, endHour: 8 }), /Invalid peak window/);
});
test("overnight peak split uses Pakistan hours", async (t) => {
  const f = fixtures(t, { logs: [reading(0), reading(1), reading(2), reading(22), reading(23)], peakHours: { startHour: 22, endHour: 2 } });
  await aggregateSpecificDate(date);
  assert.equal(f.saved[0].peakUnits, 4);
  assert.equal(f.saved[0].offPeakUnits, 1);
});
test("single-phase consumers keep existing no-ToU split behavior", async (t) => {
  const f = fixtures(t, { logs: [reading(18)], meterType: "single" });
  await aggregateSpecificDate(date);
  assert.equal(f.saved[0].totalUnits, 1);
  assert.equal(f.saved[0].peakUnits, 0);
  assert.equal(f.saved[0].offPeakUnits, 0);
});
test("yesterday and backfill respect Pakistan New Year and weekends", async (t) => {
  const f = fixtures(t);
  const now = new Date("2026-12-31T19:01:00Z");
  await aggregateYesterdayForAllUsers(now);
  await aggregateBackfillRange(2, now);
  assert.deepEqual(f.weatherDates, ["2026-12-31", "2026-12-30", "2026-12-31"]);
  await assert.rejects(aggregateBackfillRange(0, now), /positive integer/);
  f.logs.push({ hour: new Date("2026-10-24T08:00:00+05:00"), units: 1 });
  await aggregateSpecificDate("2026-10-24");
  assert.equal(f.saved[0].isHoliday, true);
});

function invoke(handler, query = {}, role = "user", body = {}) {
  return new Promise((resolve) => {
    const res = { status(code) { this.code = code; return this; }, json(data) { resolve({ code: this.code, data }); } };
    handler({ user: { _id: "a", role }, query, body }, res, (error) => resolve({ error }));
  });
}
test("hourly API uses Pakistan day bounds, labels and real zeroes", async (t) => {
  const find = t.mock.method(HourlyUsage, "find", () => ({ sort: async () => [reading(0, 0), reading(23, 2)] }));
  const { data } = await invoke(getMyHourlyUsage, { date });
  const bounds = find.mock.calls[0].arguments[0].hour;
  assert.equal(bounds.$gte.toISOString(), "2026-10-19T19:00:00.000Z");
  assert.equal(bounds.$lt.toISOString(), "2026-10-20T19:00:00.000Z");
  assert.equal(data.date, date);
  assert.equal(data.hourlyData[0].units, 0);
  assert.equal(data.hourlyData[1].units, null);
  assert.equal(data.hourlyData[23].units, 2);
});
test("invalid hourly query dates return 400 before any database query", async (t) => {
  const find = t.mock.method(HourlyUsage, "find", () => { throw new Error("must not query"); });
  for (const date of ["invalid", "2026-02-30", "2026-10-20T00:00:00Z", "", ["2026-10-20"]]) {
    assert.equal((await invoke(getMyHourlyUsage, { date })).error.statusCode, 400);
  }
  assert.equal(find.mock.callCount(), 0);
});
test("daily API and dashboard agree on Pakistan month; saved forecast is read separately", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-12-31T19:01:00Z").getTime() });
  const queries = [];
  t.mock.method(DailyUsage, "find", (filter) => {
    queries.push(filter); const rows = []; rows.sort = async () => []; return rows;
  });
  t.mock.method(Tariff, "findOne", async () => null);
  t.mock.method(BillHistory, "findOne", () => ({ sort: async () => null }));
  const prediction = t.mock.method(Prediction, "findOne", () => ({ sort: async () => null }));
  assert.equal((await invoke(getMyDailyUsage)).code, 200);
  assert.equal((await invoke(getBillingSummary)).code, 200);
  for (const query of queries) {
    assert.equal(query.date.$gte.toISOString(), "2026-12-31T19:00:00.000Z");
    assert.equal(query.date.$lt.toISOString(), "2027-01-31T19:00:00.000Z");
  }
  assert.equal(prediction.mock.calls[0].arguments[0].user, "a");
});
test("nightly job is explicitly scheduled at 00:05 Pakistan time without overlap", (t) => {
  const schedule = t.mock.method(cron, "schedule", () => ({}));
  startNightlyAggregationJob();
  const [expression, , options] = schedule.mock.calls[0].arguments;
  assert.equal(expression, "5 0 * * *");
  assert.deepEqual(options, { timezone: "Asia/Karachi", noOverlap: true });
});
test("admin rejects equal/fractional peak hours and accepts overnight hours", async (t) => {
  let saves = 0;
  t.mock.method(Tariff, "findOne", async () => ({ save: async () => { saves++; } }));
  for (const hours of [{ startHour: 18, endHour: 18 }, { startHour: 18.5, endHour: 22 }]) {
    const result = await invoke(updateTariff, {}, "admin", { peakHours: { ...hours, rateMultiplier: 1.25 } });
    assert.equal(result.error.statusCode, 400);
  }
  assert.equal(saves, 0);
  assert.equal((await invoke(updateTariff, {}, "admin", { peakHours: { startHour: 22, endHour: 2, rateMultiplier: 1.25 } })).code, 200);
  assert.equal(saves, 1);
});
