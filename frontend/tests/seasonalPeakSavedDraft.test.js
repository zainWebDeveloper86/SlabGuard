import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { transformWithOxc } from "vite";
import * as schedule from "../../shared/peakSchedule.js";

// Run the current component with mocked HTTP and hooks; never contact the server.
async function mount(config) {
  const source = await readFile(new URL("../src/components/Common/SeasonalPeakSchedule.jsx", import.meta.url), "utf8");
  const { code } = await transformWithOxc(source.replace(/^import[\s\S]*?from "[^"]+";\s*/gm, ""), "SeasonalPeakSchedule.jsx", { jsx: { runtime: "classic" } });
  const state = [], refs = [], effects = [], queued = [], writes = [];
  let cursor = 0, refCursor = 0, effectCursor = 0, tree;
  const deps = {
    ...schedule,
    pakistanPeakDate: (value) => value ? schedule.pakistanPeakDate(value) : "2026-10-29",
    React: { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }) },
    LuClock: "clock", LuInfo: "info", LuPencilLine: "edit", LuCheck: "check", LuX: "close",
    toast: { success() {}, error(message) { assert.fail(message); } },
    useAuth: () => ({ user: { _id: "admin", role: "admin" } }),
    axiosServerInstance: {
      get: async () => ({ data: { success: true, tariff: config } }),
      patch: async (url, body) => {
        writes.push({ url, body });
        return { data: { success: true, tariff: config } };
      },
    },
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
      return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
    },
    useRef(initial) { return refs[refCursor++] ??= { current: initial }; },
    useEffect(callback, dependencies) {
      const index = effectCursor++;
      if (!effects[index] || dependencies.some((value, i) => !Object.is(value, effects[index].dependencies[i]))) {
        queued.push(() => { effects[index]?.cleanup?.(); effects[index] = { dependencies, cleanup: callback() }; });
      }
    },
  };
  const executable = code.replace(/^export\s*\{[^}]*\};?/gm, "").replace(/^export default /gm, "");
  const Component = new Function(...Object.keys(deps), `${executable}\nreturn SeasonalPeakSchedule;`)(...Object.values(deps));
  const render = () => {
    cursor = refCursor = effectCursor = 0;
    const root = Component();
    tree = root.type(root.props);
    while (queued.length) queued.shift()();
  };
  render();
  await Promise.resolve(); await Promise.resolve(); render();
  return { render, writes, get tree() { return tree; }, unmount() { effects.forEach((effect) => effect.cleanup?.()); } };
}

const nodes = (node) => !node || typeof node !== "object" ? [] : [node, ...node.children.flat(Infinity).flatMap(nodes)];
const text = (node) => typeof node === "string" ? node : !node || typeof node !== "object" ? "" : node.children.flat(Infinity).map(text).join(" ");
const button = (h, label) => nodes(h.tree).find((node) => node.type === "button" && text(node).includes(label));
const edit = (h) => { nodes(h.tree).find((node) => node.type === "button" && nodes(node).some((child) => child.type === "edit")).props.onClick(); h.render(); };
const selections = (h) => nodes(h.tree).filter((node) => node.type === "select");
const months = (startHour) => Array.from({ length: 12 }, (_, i) => ({ month: i + 1, startHour: startHour + i % 2, endHour: startHour + i % 2 + 4 }));
const legacy = { peakHours: { startHour: 18, endHour: 22, rateMultiplier: 1.25 } };

test("editor and save preserve all 12 active saved windows, ignoring older and future revisions", async () => {
  const active = months(15);
  const config = { ...legacy, peakScheduleVersions: [
    { effectiveFrom: "2027-01-01", months: months(18) },
    { effectiveFrom: "2026-01-01", months: active },
    { effectiveFrom: "2020-01-01", months: months(14) },
  ] };
  const before = structuredClone(config);
  const h = await mount(config);
  edit(h);
  assert.deepEqual(selections(h).map((node) => node.props.value), active.flatMap((row) => [row.startHour, row.endHour]));
  button(h, "Save Schedule").props.onClick();
  await Promise.resolve(); await Promise.resolve();
  assert.deepEqual(h.writes, [{ url: "/tariff", body: { peakSchedule: { effectiveFrom: "2026-10-29", months: active } } }]);
  assert.deepEqual(config, before);
  h.unmount();
});

test("cancelled edits do not mutate saved months and reopening restores saved values", async () => {
  const active = months(15);
  const h = await mount({ ...legacy, peakScheduleVersions: [{ effectiveFrom: "2026-01-01", months: active }] });
  edit(h);
  selections(h)[0].props.onChange({ target: { value: "10" } }); h.render();
  assert.equal(selections(h)[0].props.value, 10);
  button(h, "Cancel").props.onClick(); h.render(); edit(h);
  assert.equal(selections(h)[0].props.value, 15);
  assert.equal(active[0].startHour, 15);
  assert.equal(h.writes.length, 0);
  h.unmount();
});

test("MEPCO preset replaces the draft only when explicitly selected", async () => {
  const active = months(15);
  const h = await mount({ ...legacy, peakScheduleVersions: [{ effectiveFrom: "2026-01-01", months: active }] });
  edit(h);
  button(h, "Use MEPCO Preset").props.onClick(); h.render();
  assert.deepEqual(selections(h).map((node) => node.props.value), schedule.mepcoSeasonalPreset().flatMap((row) => [row.startHour, row.endHour]));
  assert.equal(active[0].startHour, 15);
  assert.equal(h.writes.length, 0);
  h.unmount();
});

for (const [name, config] of [
  ["legacy flat timing", legacy],
  ["only a future revision", { ...legacy, peakScheduleVersions: [{ effectiveFrom: "2027-01-01", months: months(15) }] }],
]) {
  test(`${name} still starts a new seasonal draft with the preset`, async () => {
    const h = await mount(config);
    edit(h);
    assert.deepEqual(selections(h).map((node) => node.props.value), schedule.mepcoSeasonalPreset().flatMap((row) => [row.startHour, row.endHour]));
    assert.equal(h.writes.length, 0);
    h.unmount();
  });
}
