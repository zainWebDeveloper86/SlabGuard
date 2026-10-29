import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { transformWithOxc } from "vite";

// Run the actual page with controlled hooks and HTTP promises, without a
// browser or live backend. Charts are preserved as nodes for data assertions.
const source = await readFile(new URL("../src/pages/User/Usage.jsx", import.meta.url), "utf8");
const { code } = await transformWithOxc(source.replace(/import[\s\S]*?from "[^"]+";\s*/g, ""), "Usage.jsx", { jsx: { runtime: "classic" } });
const executable = code.replace(/export\s*\{[^}]*\};?/g, "").replace(/export default /g, "");
const text = (node) => typeof node === "string" || typeof node === "number" ? String(node) : !node || typeof node !== "object" ? "" : (node.children || []).flat(Infinity).map(text).join(" ");
const nodes = (node) => !node || typeof node !== "object" ? [] : [node, ...(node.children || []).flat(Infinity).flatMap(nodes)];
const chart = (h) => nodes(h.tree).find((node) => node.type === "BarChart");
const dateInput = (h) => nodes(h.tree).find((node) => node.type === "input" && node.props.type === "date");
const button = (h, label) => nodes(h.tree).find((node) => node.type === "button" && text(node).includes(label));
const payload = (units) => ({ data: { success: true, hourlyData: [{ hour: 8, label: "08:00", units }], peakHours: { startHour: 18, endHour: 22 } } });

function mount() {
  const states = [], effects = [], queued = [], requests = [];
  let cursor = 0, effectCursor = 0, tree, dirty = false;
  const deps = {
    React: { Fragment: "fragment", createElement: (type, props, ...children) => ({ type, props: props || {}, children }) },
    useAuth: () => ({ user: { meterType: "three" } }),
    formatPeakHours: (value) => value ? `${value.startHour}:00-${value.endHour}:00` : "Not configured",
    toast: { error() {} },
    useState(initial) {
      const i = cursor++;
      if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial;
      return [states[i], (value) => {
        const next = typeof value === "function" ? value(states[i]) : value;
        if (!Object.is(next, states[i])) { states[i] = next; dirty = true; }
      }];
    },
    useEffect(callback, dependencies) {
      const i = effectCursor++;
      if (!effects[i] || dependencies.some((value, index) => !Object.is(value, effects[i].dependencies[index]))) {
        queued.push(() => { effects[i]?.cleanup?.(); effects[i] = { dependencies, cleanup: callback() }; });
      }
    },
    axiosServerInstance: { get(path, options) {
      if (path === "/billing/history/me") return Promise.resolve({ data: { success: true, billHistory: [] } });
      if (path === "/tariff") return Promise.resolve({ data: { success: true, tariff: { protectedSlabs: [{ rangeTo: 200 }] } } });
      if (path === "/usage/daily/me") return Promise.resolve({ data: { success: true, days: [] } });
      assert.equal(path, "/usage/hourly/me");
      let resolve, reject;
      const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
      requests.push({ date: options.params.date, resolve, reject });
      return promise;
    } },
  };
  for (const name of new Set(source.match(/Lu\w+|AreaChart|Area|XAxis|YAxis|CartesianGrid|Tooltip|ResponsiveContainer|PieChart|Pie|Cell|BarChart|Bar/g))) deps[name] = name;
  const Component = new Function(...Object.keys(deps), `${executable}\nreturn Usage;`)(...Object.values(deps));
  function render() {
    do {
      dirty = false; cursor = effectCursor = 0; tree = Component();
      while (queued.length) queued.shift()();
    } while (dirty);
  }
  render();
  return { render, requests, get tree() { return tree; }, unmount() { effects.forEach((effect) => effect.cleanup?.()); } };
}
async function settle(h) { for (let i = 0; i < 12; i++) await Promise.resolve(); h.render(); }
function selectDate(h, value) { dateInput(h).props.onChange({ target: { value } }); h.render(); }

test("same-date and blank-date events preserve a loaded chart, peak window and request count", async () => {
  const h = mount();
  try {
    h.requests[0].resolve(payload(0)); await settle(h);
    const originalData = chart(h).props.data;
    const selectedDate = dateInput(h).props.value;
    for (const value of [selectedDate, "", selectedDate]) {
      selectDate(h, value); await settle(h);
      assert.equal(h.requests.length, 1);
      assert.equal(dateInput(h).props.value, selectedDate);
      assert.equal(chart(h)?.props.data, originalData);
      assert.equal(chart(h).props.data[0].units, 0);
      assert.match(text(h.tree), /Saved window: 18:00-22:00/);
      assert.doesNotMatch(text(h.tree), /Loading hourly readings/);
    }
  } finally { h.unmount(); }
});

test("a different date still clears old data, loads and displays the new result", async () => {
  const h = mount();
  try {
    h.requests[0].resolve(payload(1)); await settle(h);
    const newDate = dateInput(h).props.value === "2026-10-20" ? "2026-10-21" : "2026-10-20";
    selectDate(h, newDate);
    assert.equal(chart(h), undefined);
    assert.match(text(h.tree), /Loading hourly readings/);
    assert.equal(h.requests.length, 2);
    assert.equal(h.requests[1].date, newDate);
    h.requests[1].resolve(payload(2)); await settle(h);
    assert.equal(chart(h).props.data[0].units, 2);
    assert.doesNotMatch(text(h.tree), /Loading hourly readings/);
  } finally { h.unmount(); }
});

test("same-date events preserve errors; Retry still fetches the same date and recovers", async () => {
  const h = mount();
  try {
    h.requests[0].reject(new Error("Mock network failure")); await settle(h);
    const selectedDate = dateInput(h).props.value;
    selectDate(h, selectedDate); await settle(h);
    assert.match(text(h.tree), /Could not load hourly readings/);
    assert.ok(button(h, "Retry"));
    assert.equal(h.requests.length, 1);
    button(h, "Retry").props.onClick(); h.render();
    assert.equal(h.requests.length, 2);
    assert.equal(h.requests[1].date, selectedDate);
    assert.match(text(h.tree), /Loading hourly readings/);
    h.requests[1].resolve(payload(3)); await settle(h);
    assert.equal(chart(h).props.data[0].units, 3);
    assert.equal(button(h, "Retry"), undefined);
  } finally { h.unmount(); }
});
