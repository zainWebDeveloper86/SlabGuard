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
    expectedHour.setMinutes(0, 0, 0);
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
  before.setMinutes(0, 0, 0);
  const result = await invoke({ units: 1 });
  const after = new Date();
  after.setMinutes(0, 0, 0);
  assert.equal(result.status, 200);
  const [, update] = write.mock.calls[0].arguments;
  assert.equal(update.$set.source, "simulator");
  assert.ok(update.$set.hour >= before && update.$set.hour <= after);
});
