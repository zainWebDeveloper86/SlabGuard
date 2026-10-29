import assert from "node:assert/strict";
import test from "node:test";
import axios from "axios";
import Tariff from "../models/tariff.model.js";
import User from "../models/user.model.js";
import HourlyUsage from "../models/hourlyUsage.model.js";
import DailyUsage from "../models/dailyUsage.model.js";
import { updateTariff, getTariff } from "../controllers/tariff.controller.js";
import { getMyHourlyUsage } from "../controllers/dailyUsage.controller.js";
import { aggregateSpecificDate } from "../services/dailyAggregation.service.js";
import { upcomingPeakReminder } from "../services/peakReminder.service.js";
import { getPeakCountdown } from "../../frontend/src/utils/peakCountdown.js";
import { mepcoSeasonalPreset, normalizePeakMonths, resolvePeakHours, validatePeakRevision, isScheduledPeak } from "../../shared/peakSchedule.js";

const legacy = { startHour: 18, endHour: 22, rateMultiplier: 1.25 };
const config = (effectiveFrom = "2026-01-01") => ({ peakHours: { ...legacy }, peakScheduleVersions: [{ effectiveFrom, months: mepcoSeasonalPreset() }] });
test("verified preset covers all twelve months exactly once", () => {
  const rows = normalizePeakMonths(mepcoSeasonalPreset());
  assert.equal(rows.length, 12);
  for (const row of rows) assert.equal(row.startHour, [12, 1, 2].includes(row.month) ? 17 : [6, 7, 8].includes(row.month) ? 19 : 18);
});
test("legacy timing is preserved until the first revision's effective date", () => {
  const tariff = config("2026-06-01");
  assert.equal(resolvePeakHours(tariff, "2026-01-01").startHour, 18);
  assert.equal(resolvePeakHours(tariff, "2026-06-01").startHour, 19);
  assert.equal(resolvePeakHours({ peakHours: legacy }, "2027-01-01").startHour, 18);
  assert.equal(resolvePeakHours({}, "2026-01-01"), null);
});
for (const [instant, startHour] of [
  ["2026-02-28T18:59:59Z", 17], ["2026-02-28T19:00:00Z", 18],
  ["2026-05-31T19:00:00Z", 19], ["2026-08-31T19:00:00Z", 18],
  ["2026-11-30T19:00:00Z", 17], ["2026-12-31T19:00:00Z", 17],
]) {
  test(`Pakistan season boundary ${instant}`, () => assert.equal(resolvePeakHours(config(), new Date(instant)).startHour, startHour));
}
test("new versions preserve historical schedules and select the latest applicable revision", () => {
  const tariff = config();
  const changed = mepcoSeasonalPreset().map((row) => ({ ...row, startHour: 20, endHour: 23 }));
  tariff.peakScheduleVersions = validatePeakRevision(tariff, { effectiveFrom: "2026-11-01", months: changed }, "2026-10-24");
  assert.equal(resolvePeakHours(tariff, "2026-10-31").startHour, 18);
  assert.equal(resolvePeakHours(tariff, "2026-11-01").startHour, 20);
  assert.equal(resolvePeakHours(tariff, "2026-01-01").startHour, 17);
  assert.throws(() => validatePeakRevision(tariff, { effectiveFrom: "2026-01-01", months: changed }, "2026-10-24"), /today or.*future/);
  tariff.peakScheduleVersions = validatePeakRevision(tariff, { effectiveFrom: "2026-11-01", months: mepcoSeasonalPreset() }, "2026-10-24");
  assert.equal(tariff.peakScheduleVersions.length, 2);
});
test("rejects gaps, duplicate months, invalid hours, invalid dates and overlapping month windows", () => {
  const rows = mepcoSeasonalPreset();
  for (const invalid of [rows.slice(1), [...rows.slice(1), rows[1]], rows.map((row) => ({ ...row, endHour: row.startHour })), rows.map((row) => ({ ...row, startHour: 18.5 }))]) {
    assert.throws(() => normalizePeakMonths(invalid));
  }
  const overlap = rows.map((row) => row.month === 1 ? { ...row, startHour: 23, endHour: 20 } : row);
  assert.throws(() => normalizePeakMonths(overlap), /overlap/);
  assert.throws(() => validatePeakRevision(config(), { effectiveFrom: "2026-02-30", months: rows }, "2026-01-01"), /Pakistan date/);
});
test("rejects an overlapping effective-date transition from an overnight legacy window", () => {
  const tariff = { peakHours: { startHour: 23, endHour: 10 } };
  const rows = mepcoSeasonalPreset().map((row) => ({ ...row, startHour: 5, endHour: 9 }));
  assert.throws(() => validatePeakRevision(tariff, { effectiveFrom: "2026-10-24", months: rows }, "2026-10-24"), /revision boundary/);
});
test("countdown and reminder select tomorrow's revision before Pakistan midnight", () => {
  const tariff = config("2026-06-01");
  tariff.peakScheduleVersions[0].months[5] = { month: 6, startHour: 0, endHour: 4 };
  const now = new Date("2026-05-31T23:45:00+05:00");
  const reminder = upcomingPeakReminder(tariff, now);
  const countdown = getPeakCountdown(tariff, now);
  assert.equal(reminder.date, "2026-06-01");
  assert.equal(reminder.peakStart.toISOString(), "2026-05-31T19:00:00.000Z");
  assert.equal(countdown.countdown, "00h 15m 00s");
  assert.equal(countdown.isPeak, false);
  assert.match(countdown.windowLabel, /12:00 AM/);
});
test("overnight peak carries the previous month's schedule into the next day", () => {
  const tariff = config();
  tariff.peakScheduleVersions[0].months[4] = { month: 5, startHour: 23, endHour: 2 };
  const now = new Date("2026-06-01T01:00:00+05:00");
  assert.equal(isScheduledPeak(tariff, now), true);
  assert.equal(getPeakCountdown(tariff, now).countdown, "01h 00m 00s");
  assert.match(getPeakCountdown(tariff, now).windowLabel, /11:00 PM/);
  assert.equal(isScheduledPeak(tariff, new Date("2026-06-01T02:00:00+05:00")), false);
  assert.equal(isScheduledPeak(tariff, new Date("2026-06-01T19:00:00+05:00")), true);
});

function invoke(handler, body = {}, role = "admin", query = {}) {
  return new Promise((resolve) => {
    const res = { status(code) { this.code = code; return this; }, json(data) { resolve({ code: this.code, data }); } };
    handler({ body, query, user: { _id: "admin", role, meterType: "three" } }, res, (error) => resolve({ error }));
  });
}
test("admin saves/reloads seasonal revisions without changing legacy timing or rates", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-24T12:00:00+05:00").getTime() });
  let saves = 0;
  const tariff = { peakHours: { ...legacy }, taxes: [{ label: "GST", val: "18%" }], save: async () => { saves++; } };
  t.mock.method(Tariff, "findOne", async () => tariff);
  const payload = { peakSchedule: { effectiveFrom: "2026-10-24", months: mepcoSeasonalPreset() } };
  assert.equal((await invoke(updateTariff, payload)).code, 200);
  assert.equal(saves, 1);
  assert.deepEqual(tariff.peakHours, legacy);
  assert.equal(tariff.taxes[0].val, "18%");
  const loaded = (await invoke(getTariff)).data.tariff;
  assert.equal(loaded.peakScheduleVersions[0].months[11].startHour, 17);
  assert.equal(loaded.currentPeakHours.startHour, 18);
  assert.equal((await invoke(updateTariff, { peakHours: { ...legacy, startHour: 19 } })).error.statusCode, 400);
  assert.equal((await invoke(updateTariff, { peakHours: { ...legacy, rateMultiplier: 1.5 } })).code, 200);
  assert.equal(tariff.peakHours.rateMultiplier, 1.5);
});
test("invalid/past revision cannot save; non-admin cannot write; concurrent edit returns 409", async (t) => {
  let saves = 0;
  const tariff = { ...config(), save: async () => { saves++; } };
  t.mock.method(Tariff, "findOne", async () => tariff);
  assert.equal((await invoke(updateTariff, { peakSchedule: { effectiveFrom: "2020-01-01", months: mepcoSeasonalPreset() } })).error.statusCode, 400);
  assert.equal((await invoke(updateTariff, { peakSchedule: null })).error.statusCode, 400);
  assert.equal((await invoke(updateTariff, {}, "user")).error.statusCode, 403);
  assert.equal(saves, 0);
  tariff.save = async () => { throw Object.assign(new Error("changed"), { name: "VersionError" }); };
  assert.equal((await invoke(updateTariff, {})).error.statusCode, 409);
});
test("hourly chart and daily aggregation agree at a seasonal/overnight boundary", async (t) => {
  const tariff = config();
  tariff.peakScheduleVersions[0].months[4] = { month: 5, startHour: 23, endHour: 2 };
  const hours = [0, 1, 2, 18, 19, 22, 23];
  const logs = hours.map((hour) => ({ hour: new Date(`2026-06-01T${String(hour).padStart(2, "0")}:00:00+05:00`), units: 1 }));
  t.mock.method(Tariff, "findOne", async () => tariff);
  t.mock.method(HourlyUsage, "find", () => {
    const result = Promise.resolve(logs); result.sort = async () => logs; return result;
  });
  t.mock.method(User, "find", () => ({ select: async () => [{ _id: "admin", meterType: "three" }] }));
  t.mock.method(DailyUsage, "find", () => ({ limit: async () => [] }));
  const write = t.mock.method(DailyUsage, "findOneAndUpdate", async () => ({}));
  t.mock.method(axios, "get", async () => ({ data: { daily: { temperature_2m_mean: [30] } } }));
  const chart = (await invoke(getMyHourlyUsage, {}, "user", { date: "2026-06-01" })).data;
  assert.equal(chart.peakHours.startHour, 19);
  assert.deepEqual(chart.hourlyData.filter((row) => row.isPeak).map((row) => row.hour), [0, 1, 19, 20, 21, 22]);
  await aggregateSpecificDate("2026-06-01");
  const saved = write.mock.calls[0].arguments[1];
  assert.equal(saved.peakUnits, 4); assert.equal(saved.offPeakUnits, 3); assert.equal(saved.totalUnits, 7);
});
