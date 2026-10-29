import assert from "node:assert/strict";
import test from "node:test";
import { resolveForecastPeriod, isCurrentPrediction } from "../utils/forecastPeriod.js";

const now = new Date("2026-10-20T12:00:00+05:00");
const schedule = { lastConfirmedReadingDate: "2026-09-22", expectedDayFrom: 20, expectedDayTo: 24 };

test("confirmed date anchors cycle; expected window is not an actual reading", () => {
  const result = resolveForecastPeriod(schedule, now);
  assert.equal(result.periodType, "reading-cycle");
  assert.equal(result.startDate, "2026-09-23");
  assert.equal(result.endDate, "2026-10-24");
  assert.deepEqual(result.expectedReadingWindow, { startDate: "2026-10-20", endDate: "2026-10-24" });
  assert.equal(result.endDateBasis, "expected-window-end");
});

for (const [confirmed, instant, expectedStart, expectedEnd] of [
  ["2026-12-24", "2027-01-01T00:01:00+05:00", "2026-12-25", "2027-01-24"],
  ["2024-01-31", "2024-02-01T00:01:00+05:00", "2024-02-01", "2024-02-29"],
  ["2025-01-31", "2025-02-01T00:01:00+05:00", "2025-02-01", "2025-02-28"],
]) {
  test(`cycle rollover and short-month clamping after ${confirmed}`, () => {
    const day = confirmed.endsWith("31") ? 31 : 24;
    const result = resolveForecastPeriod({ lastConfirmedReadingDate: confirmed, expectedDayFrom: day, expectedDayTo: day }, new Date(instant));
    assert.equal(result.startDate, expectedStart);
    assert.equal(result.endDate, expectedEnd);
    assert.equal(result.expectedReadingWindow.startDate, expectedEnd);
  });
}

test("cycle is valid through Pakistan window-end day, then falls back without inventing a reading", () => {
  assert.equal(resolveForecastPeriod(schedule, new Date("2026-10-24T18:59:59Z")).periodType, "reading-cycle");
  const result = resolveForecastPeriod(schedule, new Date("2026-10-24T19:00:00Z"));
  assert.equal(result.periodType, "calendar-month");
  assert.equal(result.fallbackReason, "reading-window-passed");
  assert.equal(result.startDate, "2026-10-01");
  assert.equal(result.endDate, "2026-10-31");
});

for (const value of [{}, { expectedDayFrom: 20, expectedDayTo: 24 }, { lastConfirmedReadingDate: "2026-09-22" }]) {
  test(`incomplete schedule uses calendar fallback: ${JSON.stringify(value)}`, () => {
    assert.equal(resolveForecastPeriod(value, now).fallbackReason, "missing-reading-schedule");
  });
}
test("invalid and future dates do not become a cycle", () => {
  for (const date of ["2026-09-31", "2026-10-21", "garbage"]) {
    assert.equal(resolveForecastPeriod({ ...schedule, lastConfirmedReadingDate: date }, now).fallbackReason, "invalid-reading-schedule");
  }
});

test("saved forecasts require matching schedule and period; old unlabelled forecasts need regeneration", () => {
  const period = resolveForecastPeriod(schedule, now);
  const saved = { projection: period, forecastContext: { periodKey: period.periodKey, scheduleKey: period.scheduleKey } };
  assert.equal(isCurrentPrediction(saved, schedule, now), true);
  assert.equal(isCurrentPrediction(saved, { ...schedule, expectedDayFrom: 21 }, now), false);
  assert.equal(isCurrentPrediction(saved, { ...schedule, lastConfirmedReadingDate: "2026-09-23" }, now), false);
  assert.equal(isCurrentPrediction(saved, schedule, new Date("2026-10-25T00:00:00+05:00")), false);
  assert.equal(isCurrentPrediction({ projection: period }, schedule, now), false);
  assert.equal(isCurrentPrediction({ ...saved, projection: { ...period, startDate: "2026-10-01" } }, schedule, now), false);
});

test("monthly-history fallback stays distinct and expires when its context changes", () => {
  const period = resolveForecastPeriod({}, now);
  const saved = { projection: null, modelVersion: "moving-average-v1", forecastContext: period };
  assert.equal(isCurrentPrediction(saved, {}, now), true);
  assert.equal(isCurrentPrediction(saved, schedule, now), false);
  assert.equal(isCurrentPrediction(saved, {}, new Date("2026-11-01T00:00:00+05:00")), false);
});
