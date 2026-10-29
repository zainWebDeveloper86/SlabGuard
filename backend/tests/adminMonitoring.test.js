import assert from "node:assert/strict";
import test from "node:test";
import axios from "axios";
import User from "../models/user.model.js";
import BillHistory from "../models/billHistory.model.js";
import Prediction from "../models/prediction.model.js";
import HourlyUsage from "../models/hourlyUsage.model.js";
import SystemEvent from "../models/systemEvent.model.js";
import { createEventRecorder } from "../services/systemEvents.service.js";
import { checkProphetHealth } from "../services/prophetClient.service.js";
import { getUserDetail, getSystemEvents, clearOldSystemEvents, eventLogFilter, readSystemHealth, ADMIN_USER_FIELDS } from "../controllers/adminMonitoring.controller.js";
import { toggleUserStatus } from "../controllers/admin.controller.js";
import { resolveForecastPeriod } from "../utils/forecastPeriod.js";
import adminRouter from "../routes/admin.routes.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware.js";

const id = "0123456789abcdef01234567", adminId = "abcdef0123456789abcdef01";
function invoke(handler, req = {}) {
  return new Promise((resolve) => handler({ user: { _id: adminId }, params: {}, query: {}, ...req }, {
    status(status) { this.code = status; return this; }, json(data) { resolve({ code: this.code, data }); },
  }, (error) => resolve({ error })));
}
function chain(value, track = []) {
  const query = {};
  for (const method of ["select", "sort", "skip", "limit"]) query[method] = (...args) => { track.push([method, ...args]); return query; };
  query.lean = async () => value;
  return query;
}

test("events store predefined messages and IDs, never arbitrary supplied secrets", async () => {
  const entries = [];
  const record = createEventRecorder({ write: async (event) => entries.push(event) });
  assert.equal(await record("tariff.updated", { actorId: id, password: "test-secret", message: "test-secret", body: { token: "test-secret" } }), true);
  assert.deepEqual(entries[0], { code: "tariff.updated", category: "Tariff", level: "Info", message: "Tariff configuration updated", actorId: id, subjectId: null });
  await record("user.deactivated", { actorId: "invalid-sensitive-value", subjectId: id });
  assert.equal(entries[1].actorId, null);
  assert.equal(entries[1].subjectId, id);
  assert.equal(await record("test-secret"), false);
  assert.equal(JSON.stringify(entries).includes("test-secret"), false);
});
test("logging failure is best-effort; unavailable storage does not attempt a write", async (t) => {
  t.mock.method(console, "warn", () => {});
  const record = createEventRecorder({ write: async () => { throw new Error("private connection details"); } });
  assert.equal(await record("prediction.saved"), false);
  const offline = createEventRecorder({ available: () => false, write: () => assert.fail("Unexpected write") });
  assert.equal(await offline("server.started"), false);
});
test("filters validate categories and search literal text instead of interpreting regex", () => {
  assert.deepEqual(eventLogFilter({ category: "All", q: " " }), {});
  const filter = eventLogFilter({ category: "Prediction", q: "a.*(b)" });
  assert.equal(filter.category, "Prediction");
  assert.equal(new RegExp(filter.$or[0].message.$regex).test("a.*(b)"), true);
  assert.equal(new RegExp(filter.$or[0].message.$regex).test("anything-b"), false);
  for (const query of [{ category: "OCR" }, { q: {} }, { q: "x".repeat(101) }]) assert.throws(() => eventLogFilter(query));
});
test("event listing paginates newest first with consistent total and filters", async (t) => {
  const calls = [], entries = [{ _id: id, message: "Tariff configuration updated" }];
  t.mock.method(SystemEvent, "find", (filter) => { assert.equal(filter.category, "Tariff"); return chain(entries, calls); });
  t.mock.method(SystemEvent, "countDocuments", async (filter) => { assert.equal(filter.category, "Tariff"); return 74; });
  const response = await invoke(getSystemEvents, { query: { category: "Tariff", page: "2" } });
  assert.equal(response.data.total, 74);
  assert.equal(response.data.pageSize, 50);
  assert.deepEqual(response.data.logs, entries);
  assert.deepEqual(calls, [["sort", { createdAt: -1, _id: -1 }], ["skip", 50], ["limit", 50]]);
});
test("invalid log pages do not query storage; DB errors do not return success", async (t) => {
  const read = t.mock.method(SystemEvent, "find", () => assert.fail("Unexpected query"));
  for (const page of ["0", "-1", "1.5", "10001", "bad"]) assert.equal((await invoke(getSystemEvents, { query: { page } })).error.statusCode, 400);
  assert.equal(read.mock.callCount(), 0);
  read.mock.mockImplementation(() => { throw new Error("Storage unavailable"); });
  assert.ok((await invoke(getSystemEvents)).error);
});
test("cleanup deletes strictly older-than-30-day records, never all records", async (t) => {
  const now = new Date("2026-10-25T12:00:00+05:00");
  t.mock.timers.enable({ apis: ["Date"], now: now.getTime() });
  t.mock.method(SystemEvent, "deleteMany", async (filter) => {
    assert.deepEqual(Object.keys(filter), ["createdAt"]);
    assert.equal(filter.createdAt.$lt.toISOString(), "2026-09-25T07:00:00.000Z");
    return { deletedCount: 3 };
  });
  const response = await invoke(clearOldSystemEvents);
  assert.equal(response.data.deletedCount, 3);
});
test("health uses an actual bounded DB ping and reports independent Python availability", async () => {
  let time = Date.parse("2026-10-25T07:00:00Z");
  const health = await readSystemHealth({
    clock: () => time, prophet: async () => "unavailable",
    connection: { readyState: 1, db: { admin: () => ({ ping: async (options) => { assert.equal(options.timeoutMS, 2000); time += 7; } }) } },
  });
  assert.deepEqual(health.database, { status: "reachable", latencyMs: 7 });
  assert.equal(health.prophet, "unavailable");
  assert.equal(health.server, "responding");
  assert.equal("cpuLoad" in health, false);
});
test("health DB failures/absent connections give unavailable without error details", async () => {
  for (const connection of [{ readyState: 0 }, { readyState: 1, db: { admin: () => ({ ping: async () => { throw new Error("private connection"); } }) } }]) {
    const health = await readSystemHealth({ connection, prophet: async () => "reachable" });
    assert.equal(health.database.status, "unavailable");
    assert.equal(JSON.stringify(health).includes("private"), false);
  }
});
test("Python health probe has a 3-second timeout and handles malformed/offline responses", async (t) => {
  const get = t.mock.method(axios, "get", async (url, options) => {
    assert.ok(url.endsWith("/health")); assert.equal(options.timeout, 3000); return { data: { status: "ok" } };
  });
  assert.equal(await checkProphetHealth(), "reachable");
  get.mock.mockImplementation(async () => ({ data: {} }));
  assert.equal(await checkProphetHealth(), "unavailable");
  get.mock.mockImplementation(async () => { throw new Error("timeout"); });
  assert.equal(await checkProphetHealth(), "unavailable");
});

test("user detail uses correct fields, account-scoped history, distinct reading sources and current forecast", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-10-25T07:00:00Z") });
  const period = resolveForecastPeriod({});
  const prediction = { predictedUnits: 200, predictedBill: 9000, projection: period, forecastContext: period };
  const user = { _id: id, fullName: "Consumer", meterType: "three", readingSchedule: {} };
  const userCalls = [], billCalls = [], sources = [];
  t.mock.method(User, "findById", (userId) => { assert.equal(userId, id); return chain(user, userCalls); });
  t.mock.method(BillHistory, "find", (filter) => { assert.equal(filter.user, id); return chain([{ month: "Sep26", units: 180, billAmount: 7000 }], billCalls); });
  t.mock.method(Prediction, "findOne", (filter) => { assert.equal(filter.user, id); return chain(prediction); });
  t.mock.method(HourlyUsage, "findOne", (filter) => { assert.equal(filter.user, id); sources.push(filter.source); return chain(filter.source === "esp32" ? null : { hour: new Date() }); });
  const response = await invoke(getUserDetail, { params: { id } });
  assert.equal(response.data.detail.user.fullName, "Consumer");
  assert.equal(response.data.detail.prediction.predictedBill, 9000);
  assert.equal(response.data.detail.readings.esp32, null);
  assert.deepEqual(sources.sort(), ["esp32", "simulator"]);
  assert.ok(billCalls.some(([method, limit]) => method === "limit" && limit === 6));
  assert.equal(userCalls[0][1], ADMIN_USER_FIELDS);
  for (const field of ["password", "deviceApiKey", "resetPasswordToken"]) assert.equal(ADMIN_USER_FIELDS.split(" ").includes(field), false);
  prediction.forecastContext = null;
  assert.equal((await invoke(getUserDetail, { params: { id } })).data.detail.prediction, null);
});
test("missing/invalid user returns clear errors without querying unrelated data", async (t) => {
  const lookup = t.mock.method(User, "findById", () => chain(null));
  assert.equal((await invoke(getUserDetail, { params: { id: "bad" } })).error.statusCode, 400);
  assert.equal(lookup.mock.callCount(), 0);
  assert.equal((await invoke(getUserDetail, { params: { id } })).error.statusCode, 404);
});
test("account status persists and returns profile fields only; self-deactivation stays blocked", async (t) => {
  let saves = 0;
  const account = { _id: id, fullName: "Consumer", isActive: true, password: "not-a-real-password", save: async () => { saves++; } };
  t.mock.method(User, "findById", async () => account);
  const response = await invoke(toggleUserStatus, { params: { id } });
  assert.equal(response.data.user.isActive, false);
  assert.equal(response.data.user.password, undefined);
  assert.equal(saves, 1);
  assert.equal((await invoke(toggleUserStatus, { params: { id: adminId } })).error.statusCode, 400);
  assert.equal(saves, 1);
});
test("all new admin routes require login and admin role", async () => {
  for (const path of ["/users/:id", "/logs", "/logs/older-than-30-days", "/health"]) {
    const route = adminRouter.stack.find((layer) => layer.route?.path === path).route;
    assert.equal(route.stack[0].handle, isAuthenticated);
    assert.equal(route.stack[1].handle, isAdmin);
  }
  assert.equal((await invoke(isAuthenticated, { cookies: {} })).error.statusCode, 401);
  assert.equal((await invoke(isAdmin, { user: { role: "user" } })).error.statusCode, 403);
});
