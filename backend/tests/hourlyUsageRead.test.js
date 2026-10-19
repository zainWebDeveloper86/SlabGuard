import assert from "node:assert/strict";
import test from "node:test";
import HourlyUsage from "../models/hourlyUsage.model.js";
import { getMyHourlyUsage } from "../controllers/dailyUsage.controller.js";

function readHours() {
  return new Promise((resolve, reject) => {
    const res = {
      status(code) { this.code = code; return this; },
      json(data) { resolve({ status: this.code, data }); },
    };
    getMyHourlyUsage(
      { query: { date: "2026-10-20" }, user: { _id: "test-user" } },
      res,
      reject,
    );
  });
}

function mockReadings(t, readings) {
  t.mock.method(HourlyUsage, "find", () => ({ sort: async () => readings }));
}

function readingAt(hour, units) {
  const date = new Date("2026-10-20");
  date.setHours(hour, 0, 0, 0);
  return { hour: date, units };
}

test("a day without readings returns 24 missing values, not zeroes", async (t) => {
  mockReadings(t, []);
  const { status, data } = await readHours();
  assert.equal(status, 200);
  assert.equal(data.hourlyData.length, 24);
  assert.ok(data.hourlyData.every((entry) => entry.units === null));
  assert.equal(data.hourlyData[0].label, "00:00");
  assert.equal(data.hourlyData[23].label, "23:00");
});

test("a recorded zero remains zero while an absent reading is null", async (t) => {
  mockReadings(t, [readingAt(8, 0)]);
  const { data } = await readHours();
  assert.equal(data.hourlyData[8].units, 0);
  assert.equal(data.hourlyData[9].units, null);
});

test("recorded consumption retains existing two-decimal rounding", async (t) => {
  mockReadings(t, [readingAt(8, 1.234)]);
  const { data } = await readHours();
  assert.equal(data.hourlyData[8].units, 1.23);
});

test("partial-day data distinguishes consumed, zero and missing hours", async (t) => {
  mockReadings(t, [readingAt(8, 1.25), readingAt(9, 0)]);
  const { data } = await readHours();
  assert.equal(data.hourlyData[8].units, 1.25);
  assert.equal(data.hourlyData[9].units, 0);
  assert.equal(data.hourlyData.filter((entry) => entry.units === null).length, 22);
});
