import assert from "node:assert/strict";
import test from "node:test";
import cron from "node-cron";
import User from "../models/user.model.js";
import Alert from "../models/alert.model.js";
import Tariff from "../models/tariff.model.js";
import userRouter from "../routes/user.routes.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { updatePeakReminder } from "../controllers/preferences.controller.js";
import { getUser } from "../controllers/user.controller.js";
import { getMyAlerts, markAlertRead, deleteAlert, clearMyAlerts } from "../controllers/alert.controller.js";
import { upcomingPeakReminder, peakReminderId, generatePeakReminders } from "../services/peakReminder.service.js";
import { startPeakReminderJob } from "../jobs/peakReminder.job.js";

const window = { startHour: 18, endHour: 22 };
const at = (time) => new Date(`2026-10-24T${time}+05:00`);
function invoke(handler, { id = "a", meterType = "three", body = {}, alertId } = {}) {
  return new Promise((resolve) => {
    const res = { status(code) { this.code = code; return this; }, json(data) { resolve({ code: this.code, data }); } };
    handler({ user: { _id: id, meterType }, body, params: { id: alertId } }, res, (error) => resolve({ error }));
  });
}

for (const [time, expected] of [["17:44:59", false], ["17:45:00", true], ["17:50:00", true], ["17:59:59", true], ["18:00:00", false], ["20:00:00", false], ["22:00:00", false]]) {
  test(`pre-peak eligibility at Pakistan ${time}`, () => assert.equal(Boolean(upcomingPeakReminder(window, at(time))), expected));
}
test("midnight start uses the next Pakistan date; overnight windows have correct end date", () => {
  const midnight = upcomingPeakReminder({ startHour: 0, endHour: 4 }, new Date("2026-12-31T23:45:00+05:00"));
  assert.equal(midnight.date, "2027-01-01");
  assert.equal(midnight.peakStart.toISOString(), "2026-12-31T19:00:00.000Z");
  const overnight = upcomingPeakReminder({ startHour: 23, endHour: 2 }, at("22:45:00"));
  assert.equal(overnight.peakEnd.toISOString(), "2026-10-24T21:00:00.000Z");
  assert.match(overnight.desc, /next day/);
  assert.match(overnight.desc, /PKT/);
});
test("missing/equal/fractional windows never generate made-up reminders", () => {
  for (const value of [undefined, null, {}, { startHour: 18, endHour: 18 }, { startHour: 18.5, endHour: 22 }]) {
    assert.equal(upcomingPeakReminder(value, at("17:45:00")), null);
  }
});

const account = (id, extra = {}) => ({ _id: id, role: "user", isActive: true, meterType: "three", peakHourReminderEnabled: true, ...extra });
function matches(row, filter) {
  return Object.entries(filter).every(([field, expected]) => {
    if (expected && typeof expected === "object" && "$ne" in expected) return row[field] !== expected.$ne;
    return expected === null ? row[field] == null : row[field] === expected;
  });
}
function store(t, { users = [account("a")], peakHours = window, rows = [] } = {}) {
  const alerts = new Map(rows.map((row) => [row._id, row]));
  t.mock.method(Tariff, "findOne", async () => ({ peakHours }));
  const userRead = t.mock.method(User, "find", (filter) => ({ select: async () => users.filter((user) => matches(user, filter)) }));
  const write = t.mock.method(Alert, "updateOne", async (filter, update) => {
    if (alerts.has(filter._id)) return { upsertedCount: 0 };
    alerts.set(filter._id, { _id: filter._id, ...update.$setOnInsert }); return { upsertedCount: 1 };
  });
  t.mock.method(Alert, "find", (filter) => ({ sort: async () => [...alerts.values()].filter((row) => matches(row, filter)) }));
  t.mock.method(Alert, "findOneAndUpdate", async (filter, update) => {
    const row = [...alerts.values()].find((row) => matches(row, filter));
    if (!row) return null;
    Object.assign(row, update.$set ?? update); return row;
  });
  t.mock.method(Alert, "findOneAndDelete", async (filter) => {
    const row = [...alerts.values()].find((row) => matches(row, filter));
    if (row) alerts.delete(row._id); return row ?? null;
  });
  t.mock.method(Alert, "updateMany", async (filter, update) => {
    for (const row of alerts.values()) if (matches(row, filter)) Object.assign(row, update.$set);
  });
  t.mock.method(Alert, "deleteMany", async (filter) => {
    for (const [id, row] of alerts) if (matches(row, filter)) alerts.delete(id);
  });
  return { alerts, users, write, userRead };
}
test("only active opted-in three-phase users receive reminders", async (t) => {
  const f = store(t, { users: [account("a"), account("off", { peakHourReminderEnabled: false }),
    account("old", { peakHourReminderEnabled: undefined }), account("single", { meterType: "single" }),
    account("inactive", { isActive: false }), account("admin", { role: "admin" })] });
  assert.deepEqual(await generatePeakReminders(at("17:45:00")), { created: 1, failed: 0 });
  assert.equal(f.alerts.size, 1);
  const row = [...f.alerts.values()][0];
  assert.equal(row.user, "a"); assert.equal(row.source, "system"); assert.equal(row.type, "warning");
  assert.match(row.desc, /2026-10-24/);
});
test("outside reminder window never queries recipients or writes alerts", async (t) => {
  const f = store(t);
  await generatePeakReminders(at("18:01:00"));
  assert.equal(f.userRead.mock.callCount(), 0); assert.equal(f.write.mock.callCount(), 0);
});
test("ticks, restarts and timing edits do not reset read state or duplicate the daily reminder", async (t) => {
  const f = store(t);
  await generatePeakReminders(at("17:45:00"));
  const id = peakReminderId("a", "2026-10-24");
  assert.equal((await invoke(markAlertRead, { alertId: id })).code, 200);
  await generatePeakReminders(at("17:50:00"));
  assert.equal(f.alerts.size, 1); assert.equal(f.alerts.get(id).isRead, true);
  t.mock.method(Tariff, "findOne", async () => ({ peakHours: { startHour: 19, endHour: 23 } }));
  await generatePeakReminders(at("18:45:00")); assert.equal(f.alerts.size, 1);
  assert.notEqual(peakReminderId("a", "2026-10-24"), peakReminderId("b", "2026-10-24"));
  assert.notEqual(peakReminderId("a", "2026-10-24"), peakReminderId("a", "2026-10-25"));
});
test("deleting a reminder hides it without letting the next tick recreate it", async (t) => {
  const f = store(t); await generatePeakReminders(at("17:45:00"));
  const id = peakReminderId("a", "2026-10-24");
  assert.equal((await invoke(deleteAlert, { alertId: id })).code, 200);
  await generatePeakReminders(at("17:46:00"));
  assert.equal((await invoke(getMyAlerts)).data.alerts.length, 0);
  assert.ok(f.alerts.get(id).dismissedAt);
  assert.equal((await invoke(markAlertRead, { alertId: id })).error.statusCode, 404);
});
test("Clear removes broadcasts, hides reminders and leaves other accounts alone", async (t) => {
  const f = store(t, { users: [account("a"), account("b")], rows: [
    { _id: "broadcast-a", user: "a", source: "broadcast" },
    { _id: "broadcast-b", user: "b", source: "broadcast" },
  ] });
  await generatePeakReminders(at("17:45:00")); await invoke(clearMyAlerts);
  await generatePeakReminders(at("17:46:00"));
  assert.equal((await invoke(getMyAlerts)).data.alerts.length, 0);
  assert.equal((await invoke(getMyAlerts, { id: "b" })).data.alerts.length, 2);
  assert.equal(f.alerts.has("broadcast-a"), false);
  assert.equal((await invoke(deleteAlert, { alertId: "broadcast-b" })).error.statusCode, 404);
});
test("ordinary broadcasts still support physical deletion", async (t) => {
  const f = store(t, { rows: [{ _id: "broadcast", user: "a", source: "broadcast" }] });
  assert.equal((await invoke(deleteAlert, { alertId: "broadcast" })).code, 200);
  assert.equal(f.alerts.size, 0);
});
test("duplicate-key races are harmless; other write failures retry on the next tick", async (t) => {
  const f = store(t);
  const realWrite = Alert.updateOne;
  let mode = "duplicate";
  t.mock.method(console, "error", () => {});
  t.mock.method(Alert, "updateOne", async (...args) => {
    if (mode === "duplicate") throw Object.assign(new Error("race"), { code: 11000 });
    if (mode === "error") throw new Error("write failed");
    return realWrite(...args);
  });
  assert.deepEqual(await generatePeakReminders(at("17:45:00")), { created: 0, failed: 0 });
  mode = "error"; assert.equal((await generatePeakReminders(at("17:46:00"))).failed, 1);
  mode = "ok"; assert.equal((await generatePeakReminders(at("17:47:00"))).created, 1);
  assert.equal(f.alerts.size, 1);
});
test("reminders recur on a new day and Off stops future delivery", async (t) => {
  const f = store(t);
  await generatePeakReminders(at("17:45:00"));
  f.users[0].peakHourReminderEnabled = false;
  await generatePeakReminders(new Date("2026-10-25T17:45:00+05:00")); assert.equal(f.alerts.size, 1);
  f.users[0].peakHourReminderEnabled = true;
  await generatePeakReminders(new Date("2026-10-25T17:46:00+05:00")); assert.equal(f.alerts.size, 2);
});
test("saved reminder preference reloads through /me and accounts stay isolated", async (t) => {
  const accounts = new Map([["a", { peakHourReminderEnabled: false }], ["b", { peakHourReminderEnabled: false }]]);
  t.mock.method(User, "findByIdAndUpdate", (id, update) => ({ select: async () => {
    accounts.set(id, { ...accounts.get(id), ...update.$set }); return accounts.get(id);
  } }));
  t.mock.method(User, "findById", (id) => ({ select: async () => accounts.get(id) }));
  assert.equal((await invoke(updatePeakReminder, { body: { enabled: true } })).code, 200);
  assert.equal((await invoke(getUser)).data.user.peakHourReminderEnabled, true);
  assert.equal((await invoke(getUser, { id: "b" })).data.user.peakHourReminderEnabled, false);
  await invoke(updatePeakReminder, { body: { enabled: false } });
  assert.equal((await invoke(getUser)).data.user.peakHourReminderEnabled, false);
});
test("invalid preference and single-phase opt-in perform no write", async (t) => {
  const write = t.mock.method(User, "findByIdAndUpdate", () => { throw new Error("should not write"); });
  for (const enabled of [undefined, "true", 1, null]) assert.equal((await invoke(updatePeakReminder, { body: { enabled } })).error.statusCode, 400);
  assert.equal((await invoke(updatePeakReminder, { meterType: "single", body: { enabled: true } })).error.statusCode, 400);
  assert.equal(write.mock.callCount(), 0);
});
test("missing account/write failure cannot claim preference success; default is Off", async (t) => {
  t.mock.method(User, "findByIdAndUpdate", () => ({ select: async () => null }));
  assert.equal((await invoke(updatePeakReminder, { body: { enabled: true } })).error.statusCode, 404);
  t.mock.method(User, "findByIdAndUpdate", () => { throw new Error("offline"); });
  assert.match((await invoke(updatePeakReminder, { body: { enabled: true } })).error.message, /offline/);
  assert.equal(User.hydrate({ fullName: "Old account" }).peakHourReminderEnabled, false);
  assert.equal(userRouter.stack.find((layer) => layer.route?.path === "/peak-reminder").route.stack[0].handle, isAuthenticated);
});
test("job checks on startup, every Pakistan minute, and blocks overlapping work", async (t) => {
  let callback, options, calls = 0, finish;
  const gate = new Promise((resolve) => { finish = resolve; });
  t.mock.method(cron, "schedule", (expression, run, opts) => {
    assert.equal(expression, "* * * * *"); callback = run; options = opts; return "task";
  });
  const task = startPeakReminderJob({ runReminders: async () => { calls++; await gate; return { created: 0 }; } });
  assert.equal(task, "task"); assert.equal(calls, 1);
  assert.deepEqual(options, { timezone: "Asia/Karachi", noOverlap: true });
  await callback(); assert.equal(calls, 1);
  finish(); await gate; await Promise.resolve(); await Promise.resolve();
  await callback(); assert.equal(calls, 2);
});
