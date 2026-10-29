import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { transformWithOxc } from "vite";
import { getPeakCountdown } from "../src/utils/peakCountdown.js";

// Controlled hooks/timers execute the real component without HTTP, credentials,
// a browser or additional test dependencies.
async function mount(meterType, get) {
  const source = await readFile(new URL("../src/components/Common/PeakHoursCountdown.jsx", import.meta.url), "utf8");
  const { code } = await transformWithOxc(source.replace(/import[\s\S]*?from "[^"]+";\s*/g, ""), "PeakHoursCountdown.jsx", { jsx: { runtime: "classic" } });
  let clock = new Date("2026-10-24T17:15:00+05:00").getTime();
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [clock])); }
    static now() { return clock; }
  }
  let state = [], effects = [], cursor = 0, effectCursor = 0, tree = null, nextId = 0, active = true, lateWrites = 0;
  let identity;
  const pending = [], intervals = new Map();
  const auth = { user: { _id: "a", meterType } };
  const element = (type, props, ...children) => ({ type, props: props || {}, children });
  const deps = {
    React: { createElement: element }, LuClock: "icon", Date: Clock, getPeakCountdown,
    useAuth: () => auth, axiosServerInstance: { get },
    useState(initial) {
      const i = cursor++;
      if (!(i in state)) state[i] = typeof initial === "function" ? initial() : initial;
      return [state[i], (value) => { if (!active) lateWrites++; state[i] = typeof value === "function" ? value(state[i]) : value; }];
    },
    useEffect(callback, dependencies) {
      const i = effectCursor++;
      if (!effects[i] || dependencies.some((value, index) => !Object.is(value, effects[i].dependencies[index]))) {
        pending.push(() => { effects[i]?.cleanup?.(); effects[i] = { dependencies, cleanup: callback() }; });
      }
    },
    setInterval(callback, delay) { const id = ++nextId; intervals.set(id, { callback, delay }); return id; },
    clearInterval: (id) => intervals.delete(id),
  };
  const Component = new Function(...Object.keys(deps), `${code.replace("export default ", "")}\nreturn PeakHoursCountdown;`)(...Object.values(deps));
  function render() {
    const root = Component();
    const nextIdentity = root ? root.props.key : null;
    if (identity !== nextIdentity) {
      effects.forEach((effect) => effect.cleanup?.()); state = []; effects = []; identity = nextIdentity;
    }
    cursor = effectCursor = 0;
    tree = root ? root.type(root.props) : null;
    while (pending.length) pending.shift()();
  }
  render();
  return {
    auth, render, intervals,
    get tree() { return tree; }, get lateWrites() { return lateWrites; },
    setClock(value) { clock = new Date(value).getTime(); },
    unmount() { active = false; effects.forEach((effect) => effect.cleanup?.()); },
    runTimer(delay) { return [...intervals.values()].find((timer) => timer.delay === delay).callback(); },
  };
}
const text = (node) => typeof node === "string" || typeof node === "number" ? String(node) : !node || typeof node !== "object" ? "" : node.children.flat(Infinity).map(text).join(" ");
const nodes = (node) => !node || typeof node !== "object" ? [] : [node, ...node.children.flat(Infinity).flatMap(nodes)];
const tick = async (h) => { await Promise.resolve(); await Promise.resolve(); h.render(); };
const response = (startHour = 18, endHour = 22) => ({ data: { success: true, tariff: { peakHours: { startHour, endHour } } } });

test("single-phase/unknown meter hides the countdown and performs no tariff fetch", async () => {
  for (const meterType of ["single", undefined]) {
    let calls = 0;
    const h = await mount(meterType, async () => { calls++; return response(); });
    assert.equal(h.tree, null); assert.equal(calls, 0); assert.equal(h.intervals.size, 0);
  }
});
test("three-phase countdown ticks, switches at boundaries and recovers from a suspended tab", async () => {
  const h = await mount("three", async (url) => { assert.equal(url, "/tariff"); return response(); });
  assert.match(text(h.tree), /Loading peak timings/);
  await tick(h);
  assert.match(text(h.tree), /00h 45m 00s/);
  h.setClock("2026-10-24T18:00:00+05:00"); h.runTimer(1000); h.render();
  assert.match(text(h.tree), /Peak hours active/); assert.match(text(h.tree), /Ends in/);
  assert.match(text(h.tree), /04h 00m 00s/);
  h.setClock("2026-10-24T22:00:00+05:00"); h.runTimer(1000); h.render();
  assert.match(text(h.tree), /Next peak window/); assert.match(text(h.tree), /20h 00m 00s/);
  h.unmount(); assert.equal(h.intervals.size, 0);
});
test("admin changes refresh on the configured ten-minute interval; failed refresh hides unconfirmed timings and Retry recovers", async () => {
  let result = response(), fail = false;
  const h = await mount("three", async () => { if (fail) throw new Error("offline"); return result; });
  await tick(h);
  result = response(19, 23); await h.runTimer(600000); h.render();
  assert.match(text(h.tree), /7:00 PM – 11:00 PM/);
  fail = true; await h.runTimer(600000); h.render();
  assert.match(text(h.tree), /unavailable/); assert.doesNotMatch(text(h.tree), /Starts in/);
  fail = false;
  nodes(h.tree).find((node) => node.type === "button").props.onClick(); h.render(); await tick(h);
  assert.match(text(h.tree), /7:00 PM – 11:00 PM/);
  h.unmount();
});
test("invalid or absent peak configuration never displays hardcoded fallback hours", async () => {
  const h = await mount("three", async () => response(18, 18)); await tick(h);
  assert.match(text(h.tree), /not configured correctly/);
  assert.doesNotMatch(text(h.tree), /6:00 PM/);
  h.unmount();
});
test("account changes and unmount discard late tariff responses", async () => {
  const requests = [];
  const h = await mount("three", () => new Promise((resolve) => requests.push(resolve)));
  h.auth.user = { _id: "b", meterType: "three" }; h.render();
  requests[1](response(20, 23)); await tick(h);
  requests[0](response(18, 22)); await tick(h);
  assert.match(text(h.tree), /8:00 PM – 11:00 PM/);
  const refreshing = h.runTimer(600000); h.unmount();
  requests[2](response()); await refreshing;
  assert.equal(h.lateWrites, 0); assert.equal(h.intervals.size, 0);
});
