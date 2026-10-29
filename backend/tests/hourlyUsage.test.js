import assert from "node:assert/strict";
import test from "node:test";
import HourlyUsage from "../models/hourlyUsage.model.js";
import { addHourlyUsage } from "../controllers/dailyUsage.controller.js";

const timestamp = "2026-10-20T08:25:30.000Z";

function invoke(body) {
  return new Promise((resolve) => {
    const res = {
      status(code) { this.code = code; return this; },
      json(data) { resolve({ status: this.code, data }); },
    };
    addHourlyUsage({ body, user: { _id: "test-user" } }, res, (error) => resolve({ error }));
  });
}

for (const [name, body] of [
  ["missing units", {}],
  ["null units", { units: null }],
  ["empty units", { units: "" }],
  ["whitespace units", { units: "  " }],
  ["boolean units", { units: false }],
  ["array units", { units: [] }],
  ["object units", { units: {} }],
  ["negative units", { units: -0.5 }],
  ["nonnumeric units", { units: "unknown" }],
  ["infinite units", { units: Infinity }],
  ["NaN units", { units: NaN }],
  ["invalid date", { units: 1, timestamp: "invalid" }],
  ["empty date", { units: 1, timestamp: "" }],
  ["null date", { units: 1, timestamp: null }],
  ["boolean date", { units: 1, timestamp: true }],
  ["impossible February date", { units: 1, timestamp: "2026-02-30T08:25:30Z" }],
  ["non-leap February 29", { units: 1, timestamp: "2026-02-29T08:25:30+05:00" }],
  ["April 31", { units: 1, timestamp: "2026-04-31T08:25:30-04:00" }],
  ["zero day", { units: 1, timestamp: "2026-10-00T08:25:30Z" }],
  ["zero month", { units: 1, timestamp: "2026-00-20T08:25:30Z" }],
  ["month 13", { units: 1, timestamp: "2026-13-20T08:25:30Z" }],
  ["timezone-free timestamp", { units: 1, timestamp: "2026-10-20T08:25:30" }],
  ["date only", { units: 1, timestamp: "2026-10-20" }],
  ["numeric timestamp string", { units: 1, timestamp: "1792484730000" }],
  ["24-hour rollover", { units: 1, timestamp: "2026-10-20T24:00:00Z" }],
  ["minute 60", { units: 1, timestamp: "2026-10-20T08:60:00Z" }],
  ["second 60", { units: 1, timestamp: "2026-10-20T08:25:60Z" }],
  ["invalid offset hour", { units: 1, timestamp: "2026-10-20T08:25:30+24:00" }],
  ["invalid offset minute", { units: 1, timestamp: "2026-10-20T08:25:30+05:60" }],
  ["infinite timestamp", { units: 1, timestamp: Infinity }],
  ["out-of-range numeric timestamp", { units: 1, timestamp: 8640000000000001 }],
  ["unknown source", { units: 1, source: "unknown" }],
  ["empty source", { units: 1, source: "" }],
  ["null source", { units: 1, source: null }],
]) {
  test(`rejects ${name} before writing`, async (t) => {
    const write = t.mock.method(HourlyUsage, "findOneAndUpdate", async () => ({}));
    const result = await invoke(body);
    assert.equal(result.error?.statusCode, 400);
    assert.equal(write.mock.callCount(), 0);
  });
}

for (const [name, units, source] of [
  ["zero", 0, "simulator"],
  ["fractional usage", 0.125, "esp32"],
  ["numeric string", "1.25", "simulator"],
]) {
  test(`accepts ${name} and keeps hourly upsert behavior`, async (t) => {
    const write = t.mock.method(HourlyUsage, "findOneAndUpdate", async () => ({ saved: true }));
    const result = await invoke({ units, timestamp, source });
    assert.equal(result.status, 200);
    const [filter, update, options] = write.mock.calls[0].arguments;
    assert.equal(filter.user, "test-user");
    const expectedHour = new Date(timestamp);
    expectedHour.setUTCMinutes(0, 0, 0);
    assert.equal(filter.hour.getTime(), expectedHour.getTime());
    assert.equal(update.$set.units, Number(units));
    assert.equal(update.$set.source, source);
    assert.equal(options.upsert, true);
    assert.equal(options.runValidators, true);
  });
}

test("omitted timestamp and source keep their defaults", async (t) => {
  const write = t.mock.method(HourlyUsage, "findOneAndUpdate", async () => ({}));
  const before = new Date();
  before.setUTCMinutes(0, 0, 0);
  const result = await invoke({ units: 1 });
  const after = new Date();
  after.setUTCMinutes(0, 0, 0);
  assert.equal(result.status, 200);
  const [, update] = write.mock.calls[0].arguments;
  assert.equal(update.$set.source, "simulator");
  assert.ok(update.$set.hour >= before && update.$set.hour <= after);
});

for (const [value, expectedHour] of [
  ["2026-10-20T08:25:30Z", "2026-10-20T08:00:00.000Z"],
  ["2026-10-20T13:25:30+05:00", "2026-10-20T08:00:00.000Z"],
  ["2026-10-20T04:25:30-04:00", "2026-10-20T08:00:00.000Z"],
  ["2026-10-20T08:25Z", "2026-10-20T08:00:00.000Z"],
  ["2024-02-29T00:10:00+05:00", "2024-02-28T19:00:00.000Z"],
  ["2026-12-31T23:59:59-04:00", "2027-01-01T03:00:00.000Z"],
  ["2026-10-20T08:25:30.123456Z", "2026-10-20T08:00:00.000Z"],
  [Date.parse(timestamp), "2026-10-20T08:00:00.000Z"],
  [0, "1970-01-01T00:00:00.000Z"],
]) {
  test(`accepts unambiguous timestamp ${value} at the correct UTC hour`, async (t) => {
    const write = t.mock.method(HourlyUsage, "findOneAndUpdate", async () => ({}));
    const result = await invoke({ units: 1, timestamp: value });
    assert.equal(result.status, 200);
    assert.equal(write.mock.calls[0].arguments[0].hour.toISOString(), expectedHour);
  });
}
