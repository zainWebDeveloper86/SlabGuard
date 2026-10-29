import assert from "node:assert/strict";
import test from "node:test";
import HourlyUsage from "../models/hourlyUsage.model.js";
import { getMyReadingStatus } from "../controllers/dailyUsage.controller.js";
import router from "../routes/dailyUsage.routes.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

function invoke(id = "a") {
  return new Promise((resolve) => {
    const res = { status(code) { this.code = code; return this; }, json(data) { resolve({ code: this.code, data }); } };
    getMyReadingStatus({ user: { _id: id } }, res, (error) => resolve({ error }));
  });
}

function mockReadings(t, records) {
  const queries = [];
  t.mock.method(HourlyUsage, "findOne", (filter) => ({ sort(order) {
    queries.push({ filter, order });
    assert.deepEqual(order, { updatedAt: -1, hour: -1 });
    return { select(fields) {
      assert.equal(fields, "hour updatedAt -_id");
      return { lean: async () => records.filter((row) => row.user === filter.user && row.source === filter.source)
        .sort((a, b) => b.updatedAt - a.updatedAt || b.hour - a.hour)[0] ?? null };
    } };
  } }));
  return queries;
}

const upload = (source, hour, updatedAt, user = "a") => ({ source, user, hour: new Date(hour), updatedAt: new Date(updatedAt) });

test("no readings stays empty, regardless of a saved reference number", async (t) => {
  mockReadings(t, []);
  const { code, data } = await invoke();
  assert.equal(code, 200);
  assert.deepEqual(data.status, { simulator: null, esp32: null });
});
test("simulator backfill is not reported as ESP32 evidence", async (t) => {
  mockReadings(t, [upload("simulator", "2026-09-01T00:00:00Z", "2026-10-24T01:00:00Z")]);
  const { data } = await invoke();
  assert.equal(data.status.esp32, null);
  assert.equal(data.status.simulator.readingHour, "2026-09-01T00:00:00.000Z");
  assert.equal(data.status.simulator.receivedAt, "2026-10-24T01:00:00.000Z");
  assert.equal(Object.hasOwn(data.status, "online"), false);
});
test("separate sources are ordered by receipt time, not the historical reading hour", async (t) => {
  mockReadings(t, [
    upload("esp32", "2026-10-24T00:00:00Z", "2026-10-24T00:05:00Z"),
    upload("esp32", "2026-10-23T00:00:00Z", "2026-10-24T00:10:00Z"),
    upload("simulator", "2026-10-22T00:00:00Z", "2026-10-24T00:20:00Z"),
  ]);
  const { data } = await invoke();
  assert.equal(data.status.esp32.receivedAt, "2026-10-24T00:10:00.000Z");
  assert.equal(data.status.esp32.readingHour, "2026-10-23T00:00:00.000Z");
  assert.equal(data.status.simulator.receivedAt, "2026-10-24T00:20:00.000Z");
});
test("each query is restricted to the authenticated account", async (t) => {
  const queries = mockReadings(t, [upload("esp32", "2026-10-24T00:00:00Z", "2026-10-24T00:05:00Z", "b")]);
  assert.equal((await invoke("a")).data.status.esp32, null);
  assert.ok((await invoke("b")).data.status.esp32);
  assert.deepEqual(queries.map(({ filter }) => filter.user), ["a", "a", "b", "b"]);
});
test("legacy records without a receipt timestamp never invent one", async (t) => {
  mockReadings(t, [{ user: "a", source: "esp32", hour: new Date("2026-10-20T00:00:00Z") }]);
  assert.equal((await invoke()).data.status.esp32.receivedAt, null);
});
test("read failure is forwarded instead of returning empty/successful status", async (t) => {
  t.mock.method(HourlyUsage, "findOne", () => { throw new Error("database unavailable"); });
  assert.match((await invoke()).error.message, /database unavailable/);
});
test("status route requires the existing authenticated session", () => {
  const route = router.stack.find((layer) => layer.route?.path === "/status/me").route;
  assert.equal(route.stack[0].handle, isAuthenticated);
  assert.equal(route.stack[1].handle, getMyReadingStatus);
});
