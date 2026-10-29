import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { transformWithOxc } from "vite";
import { predictionPeriodLabel } from "../src/utils/predictionPeriod.js";

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const nodes = (node) => !node || typeof node !== "object" ? [] : [node, ...(node.children || []).flat(Infinity).flatMap(nodes)];
const text = (node) => typeof node === "string" || typeof node === "number" ? String(node) : !node || typeof node !== "object" ? "" : (node.children || []).flat(Infinity).map(text).join(" ");
const button = (h, label) => nodes(h.tree).find((node) => node.type === "button" && (node.props["aria-label"] === label || text(node).includes(label)));
async function settle(h) { for (let i = 0; i < 15; i++) await Promise.resolve(); h.render(); }

async function mount(file, name, http, initialProps = {}) {
  const source = await readFile(new URL(file, import.meta.url), "utf8");
  const { code } = await transformWithOxc(source.replace(/import[\s\S]*?from "[^"]+";\s*/g, ""), name + ".jsx", { jsx: { runtime: "classic" } });
  const states = [], refs = [], effects = [], queued = [], intervals = new Map(), timeouts = new Map(), events = new Map(), downloads = [];
  let cursor = 0, refCursor = 0, effectCursor = 0, timerId = 0, tree, alive = true, lateWrites = 0, props = initialProps;
  const React = {
    Fragment: "fragment",
    createElement: (type, attributes, ...children) => ({ type, props: { ...(attributes || {}), children }, children }),
    cloneElement: (element, attributes) => ({ ...element, props: { ...element.props, ...attributes } }),
  };
  const deps = {
    React, predictionPeriodLabel, ForecastPeriodDetails: () => React.createElement("p", null, "Forecast period details"),
    axiosServerInstance: http,
    useState(initial) { const index = cursor++; if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial; return [states[index], (value) => { if (!alive) lateWrites++; states[index] = typeof value === "function" ? value(states[index]) : value; }]; },
    useRef(initial) { return refs[refCursor++] ??= { current: initial }; },
    useEffect(callback, dependencies) {
      const index = effectCursor++;
      if (!effects[index] || dependencies.some((value, i) => !Object.is(value, effects[index].dependencies[i]))) queued.push(() => { effects[index]?.cleanup?.(); effects[index] = { dependencies, cleanup: callback() }; });
    },
    document: { addEventListener: (type, callback) => events.set(type, callback), removeEventListener: (type) => events.delete(type), createElement: () => ({ click() { downloads.push(this.download); } }) },
    window: { confirm: () => true }, Blob,
    URL: { createObjectURL: () => "blob:test", revokeObjectURL() {} },
    setInterval: (callback, delay) => { const id = ++timerId; intervals.set(id, { callback, delay }); return id; },
    clearInterval: (id) => intervals.delete(id),
    setTimeout: (callback, delay) => { const id = ++timerId; timeouts.set(id, { callback, delay }); return id; },
    clearTimeout: (id) => timeouts.delete(id),
  };
  for (const icon of new Set(source.match(/Lu\w+/g))) deps[icon] = () => React.createElement("icon", null, icon);
  const Component = new Function(...Object.keys(deps), `${code.replace(/export\s*\{[^}]*\};?/g, "").replace(/export default /g, "")}\nreturn ${name};`)(...Object.values(deps));
  function expand(node) {
    if (!node || typeof node !== "object") return node;
    if (typeof node.type === "function") return expand(node.type(node.props));
    return { ...node, children: node.children.flat(Infinity).map(expand) };
  }
  function render() { cursor = refCursor = effectCursor = 0; tree = expand(Component(props)); while (queued.length) queued.shift()(); }
  render();
  return {
    render, get tree() { return tree; }, get lateWrites() { return lateWrites; }, intervals, timeouts, events, downloads,
    setProps(next) { props = next; render(); },
    unmount() { alive = false; effects.forEach((effect) => effect.cleanup?.()); },
  };
}
const user = { _id: "0123456789abcdef01234567", fullName: "Consumer", email: "consumer@example.test", referenceNo: "123456", meterType: "three", isActive: true };
const emptyDetail = { user, bills: [], readings: { simulator: null, esp32: null }, prediction: null };

test("modal uses real field names, handles empty data, and calls the status action", async () => {
  let toggled;
  const h = await mount("../src/components/Admin/UserDetailModal.jsx", "UserDetailModal", { get: async (path) => { assert.equal(path, `/admin/users/${user._id}`); return { data: { success: true, detail: emptyDetail } }; } }, { user, onClose() {}, onToggleStatus: (id) => { toggled = id; } });
  await settle(h);
  assert.match(text(h.tree), /Consumer/); assert.match(text(h.tree), /123456/); assert.match(text(h.tree), /Three phase/);
  assert.match(text(h.tree), /No synced billing history/); assert.match(text(h.tree), /No current saved prediction/);
  assert.doesNotMatch(text(h.tree), /Android 14|Bill_Sept|Recent OCR Logs/);
  await button(h, "Deactivate account").props.onClick(); assert.equal(toggled, user._id);
  h.setProps({ user: { ...user, isActive: false }, onClose() {}, onToggleStatus() {} });
  assert.ok(button(h, "Activate account"));
  h.unmount(); assert.equal(h.events.size, 0);
});
test("missing name/meter information cannot crash the modal; self action is disabled", async () => {
  const profile = { _id: user._id, isActive: true };
  const h = await mount("../src/components/Admin/UserDetailModal.jsx", "UserDetailModal", { get: async () => ({ data: { success: true, detail: { ...emptyDetail, user: profile } } }) }, { user: profile, currentAdminId: profile._id, onClose() {}, onToggleStatus() {} });
  await settle(h); assert.match(text(h.tree), /Unnamed account/); assert.match(text(h.tree), /Not recorded/);
  assert.equal(button(h, "Deactivate account").props.disabled, true); h.unmount();
});
test("modal displays stored bill/zero-valued forecast and separate ESP32 reading", async () => {
  const h = await mount("../src/components/Admin/UserDetailModal.jsx", "UserDetailModal", { get: async () => ({ data: { success: true, detail: { ...emptyDetail,
    bills: [{ month: "Sep26", units: 0, billAmount: 500 }], prediction: { predictedUnits: 0, predictedBill: 0 },
    readings: { simulator: null, esp32: { hour: "2026-10-25T00:00:00Z", updatedAt: "2026-10-25T00:10:00Z" } },
  } } }) }, { user, onClose() {} });
  await settle(h); assert.match(text(h.tree), /Sep26/); assert.match(text(h.tree), /Rs\.\s*0/); assert.match(text(h.tree), /Reading hour:/); assert.match(text(h.tree), /PKT/); h.unmount();
});
test("modal error is retryable; requests resolving after close cannot update state", async () => {
  const pending = deferred(); let calls = 0;
  const h = await mount("../src/components/Admin/UserDetailModal.jsx", "UserDetailModal", { get: async () => { if (++calls === 1) throw new Error("offline"); return pending.promise; } }, { user, onClose() {} });
  await settle(h); assert.match(text(h.tree), /Could not load/);
  button(h, "Retry").props.onClick(); h.render(); h.unmount();
  pending.resolve({ data: { success: true, detail: emptyDetail } }); await settle(h); assert.equal(h.lateWrites, 0);
});

const healthy = { server: "responding", database: { status: "reachable", latencyMs: 0 }, prophet: "unavailable", checkedAt: "2026-10-25T07:00:00Z" };
const log = { _id: "event-1", category: "Tariff", level: "Info", message: "Tariff configuration updated", actorId: user._id, createdAt: "2026-10-25T07:00:00Z" };
test("logs show real health, server filters/page results, page export and bounded cleanup action", async () => {
  const calls = [], deleted = [];
  const h = await mount("../src/pages/Admin/SystemLogs.jsx", "SystemLogs", {
    get: async (path, options) => { calls.push([path, options]); return { data: path.endsWith("health") ? { success: true, health: healthy } : { success: true, logs: [log], total: 55, pageSize: 50 } }; },
    delete: async (path) => { deleted.push(path); return { data: { success: true } }; },
  });
  await settle(h); assert.match(text(h.tree), /0 ms \(ping\)/); assert.match(text(h.tree), /Tariff configuration updated/); assert.match(text(h.tree), /Unavailable \/ not checked/);
  assert.doesNotMatch(text(h.tree), /24ms|12\.5%|Unauthorized access attempt/);
  button(h, "Export This Page").props.onClick(); assert.deepEqual(h.downloads, ["slabguard-events-page-1.json"]);
  button(h, "Next").props.onClick(); h.render(); await settle(h);
  assert.equal(calls.filter(([path]) => path.endsWith("logs")).at(-1)[1].params.page, 2);
  button(h, "Prediction").props.onClick(); h.render(); await settle(h);
  assert.equal(calls.filter(([path]) => path.endsWith("logs")).at(-1)[1].params.category, "Prediction");
  assert.equal(calls.filter(([path]) => path.endsWith("logs")).at(-1)[1].params.page, 1);
  await button(h, "Clear Logs Older").props.onClick(); h.render(); await settle(h);
  assert.deepEqual(deleted, ["/admin/logs/older-than-30-days"]);
  assert.equal([...h.intervals.values()][0].delay, 30000); h.unmount(); assert.equal(h.intervals.size, 0);
});
test("logs load failure and health failure show unavailable; Refresh retries without fake online status", async () => {
  let fail = true;
  const h = await mount("../src/pages/Admin/SystemLogs.jsx", "SystemLogs", { get: async (path) => {
    if (fail) throw new Error("offline"); return { data: path.endsWith("health") ? { success: true, health: healthy } : { success: true, logs: [], total: 0, pageSize: 50 } };
  } });
  await settle(h); assert.match(text(h.tree), /Logs could not be loaded/); assert.match(text(h.tree), /Not checked \/ unavailable/);
  fail = false; button(h, "Refresh logs and health").props.onClick(); h.render(); await settle(h);
  assert.match(text(h.tree), /No saved events/); assert.doesNotMatch(text(h.tree), /Logs could not be loaded/); h.unmount();
});
test("log filters ignore stale responses; unmount cancels polling and late updates", async () => {
  const first = deferred(), second = deferred(); let calls = 0;
  const h = await mount("../src/pages/Admin/SystemLogs.jsx", "SystemLogs", { get: (path) => path.endsWith("health") ? Promise.resolve({ data: { success: true, health: healthy } }) : (++calls === 1 ? first.promise : second.promise) });
  await settle(h); button(h, "Billing").props.onClick(); h.render(); await settle(h);
  second.resolve({ data: { success: true, logs: [{ ...log, message: "New filter result" }], total: 1, pageSize: 50 } }); await settle(h);
  first.resolve({ data: { success: true, logs: [{ ...log, message: "Old filter result" }], total: 1, pageSize: 50 } }); await settle(h);
  assert.match(text(h.tree), /New filter result/); assert.doesNotMatch(text(h.tree), /Old filter result/);
  h.unmount(); assert.equal(h.intervals.size, 0); assert.equal(h.lateWrites, 0);
});
