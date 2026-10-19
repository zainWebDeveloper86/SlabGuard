import assert from "node:assert/strict";
import test from "node:test";
import { normalizeReadingSchedule } from "../utils/readingSchedule.js";
import User from "../models/user.model.js";
import { completeApplication, getUser } from "../controllers/user.controller.js";

const now = new Date("2026-10-20T12:00:00+05:00");
const blank = { lastConfirmedReadingDate: null, expectedDayFrom: null, expectedDayTo: null };
const schedule = { lastConfirmedReadingDate: "2026-10-10", expectedDayFrom: 20, expectedDayTo: 24 };

test("valid 20-24 window and confirmed date normalize without changing the date", () => {
  assert.deepEqual(normalizeReadingSchedule({ ...schedule, expectedDayFrom: "20", expectedDayTo: "24" }, now), schedule);
});

for (const value of [null, {}, { lastConfirmedReadingDate: "", expectedDayFrom: "", expectedDayTo: "" }]) {
  test(`optional empty schedule ${JSON.stringify(value)} stays blank`, () => {
    assert.deepEqual(normalizeReadingSchedule(value, now), blank);
  });
}

for (const [name, value] of [
  ["reversed range", { expectedDayFrom: 24, expectedDayTo: 20 }],
  ["missing end", { expectedDayFrom: 20 }],
  ["missing start", { expectedDayTo: 24 }],
  ["day zero", { expectedDayFrom: 0, expectedDayTo: 24 }],
  ["day above 31", { expectedDayFrom: 20, expectedDayTo: 32 }],
  ["fractional day", { expectedDayFrom: 20.5, expectedDayTo: 24 }],
  ["boolean day", { expectedDayFrom: true, expectedDayTo: 24 }],
  ["whitespace day", { expectedDayFrom: " ", expectedDayTo: 24 }],
  ["nonnumeric day", { expectedDayFrom: "twenty", expectedDayTo: 24 }],
  ["future confirmed date", { lastConfirmedReadingDate: "2026-10-21" }],
  ["impossible date", { lastConfirmedReadingDate: "2026-02-30" }],
  ["non-leap February 29", { lastConfirmedReadingDate: "2025-02-29" }],
  ["ambiguous date format", { lastConfirmedReadingDate: "10/10/2026" }],
  ["timestamp instead of date", { lastConfirmedReadingDate: "2026-10-10T00:00:00Z" }],
  ["boolean date", { lastConfirmedReadingDate: false }],
  ["string schedule", "20-24"],
  ["array schedule", []],
]) {
  test(`rejects ${name}`, () => {
    assert.throws(() => normalizeReadingSchedule(value, now), (error) => error.statusCode === 400);
  });
}

test("boundary days and same-day window are allowed", () => {
  for (const [from, to] of [[1, 31], [20, 20]]) {
    const result = normalizeReadingSchedule({ expectedDayFrom: from, expectedDayTo: to }, now);
    assert.equal(result.expectedDayFrom, from);
    assert.equal(result.expectedDayTo, to);
  }
});

test("confirmed date alone and window alone are independent optional settings", () => {
  assert.deepEqual(normalizeReadingSchedule({ lastConfirmedReadingDate: "2024-02-29" }, now), {
    ...blank, lastConfirmedReadingDate: "2024-02-29",
  });
  assert.deepEqual(normalizeReadingSchedule({ expectedDayFrom: 20, expectedDayTo: 24 }, now), {
    ...blank, expectedDayFrom: 20, expectedDayTo: 24,
  });
});

test("today means Pakistan date at the UTC date boundary", () => {
  assert.equal(normalizeReadingSchedule(
    { lastConfirmedReadingDate: "2026-10-21" }, new Date("2026-10-20T20:00:00Z"),
  ).lastConfirmedReadingDate, "2026-10-21");
});

test("old user records receive blank defaults without a data migration", () => {
  const user = User.hydrate({ fullName: "Test User", referenceNo: "test-reference" });
  assert.deepEqual(user.readingSchedule.toObject(), blank);
});

function invoke(handler, body = {}) {
  return new Promise((resolve) => {
    const res = {
      status(code) { this.code = code; return this; },
      json(data) { resolve({ status: this.code, data }); },
    };
    handler({ body, user: { _id: "test-user" } }, res, (error) => resolve({ error }));
  });
}
const baseBody = { referenceNo: "test-reference", meterType: "single", sanctionedLoad: 0, unitTarget: 200 };

test("schedule saves, reloads through /me, and clears through the existing application endpoint", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: now.getTime() });
  let stored = { readingSchedule: { ...blank } };
  const update = t.mock.method(User, "findByIdAndUpdate", (_id, operation, options) => {
    assert.equal(options.runValidators, true);
    return { select: async () => { stored = { ...stored, ...operation.$set }; return stored; } };
  });
  t.mock.method(User, "findById", () => ({ select: async () => stored }));
  const saved = await invoke(completeApplication, { ...baseBody, readingSchedule: schedule });
  assert.equal(saved.status, 200);
  assert.deepEqual(saved.data.user.readingSchedule, schedule);
  const reloaded = await invoke(getUser);
  assert.deepEqual(reloaded.data.user.readingSchedule, schedule);
  await invoke(completeApplication, { ...baseBody, readingSchedule: {} });
  assert.deepEqual(stored.readingSchedule, blank);
  assert.equal(update.mock.callCount(), 2);
});

test("onboarding or old clients omitting the schedule preserve an existing schedule", async (t) => {
  const update = t.mock.method(User, "findByIdAndUpdate", (_id, operation) => ({
    select: async () => ({ ...operation.$set, readingSchedule: schedule }),
  }));
  const result = await invoke(completeApplication, baseBody);
  assert.equal(result.status, 200);
  assert.equal(Object.hasOwn(update.mock.calls[0].arguments[1].$set, "readingSchedule"), false);
});

test("invalid schedules return 400 without writing to the database", async (t) => {
  const update = t.mock.method(User, "findByIdAndUpdate", () => assert.fail("Unexpected write"));
  const result = await invoke(completeApplication, {
    ...baseBody, readingSchedule: { expectedDayFrom: 24, expectedDayTo: 20 },
  });
  assert.equal(result.error.statusCode, 400);
  assert.equal(update.mock.callCount(), 0);
});
