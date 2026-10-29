import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { transformWithOxc } from "vite";
import * as schedule from "../../shared/peakSchedule.js";

async function mount(role, http) {
  const source = await readFile(new URL("../src/components/Common/SeasonalPeakSchedule.jsx", import.meta.url), "utf8");
  const { code } = await transformWithOxc(source.replace(/^import[\s\S]*?from "[^"]+";\s*/gm, ""), "SeasonalPeakSchedule.jsx", { jsx: { runtime: "classic" } });
  const states = [], effects = [], refs = [], queued = [], messages = [], timers = new Map();
  let cursor = 0, effectCursor = 0, refCursor = 0, nextId = 0, tree, alive = true, lateWrites = 0;
  const deps = {
    ...schedule,
    pakistanPeakDate: (value) => value ? schedule.pakistanPeakDate(value) : "2026-10-29",
    LuClock: "clock", LuInfo: "info", LuPencilLine: "edit", LuCheck: "check", LuX: "close",
    toast: { success: (message) => messages.push({ type: "success", message }), error: (message) => messages.push({ type: "error", message }) },
    React: { createElement: (type, props, ...children) => ({ type, props: props || {}, children }) },
    useAuth: () => ({ user: { _id: "a", role } }), axiosServerInstance: http,
    useState(initial) {
      const i = cursor++;
      if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial;
      return [states[i], (value) => { if (!alive) lateWrites++; states[i] = typeof value === "function" ? value(states[i]) : value; }];
    },
    useRef(initial) { return refs[refCursor++] ??= { current: initial }; },
    useEffect(callback, dependencies) {
      const i = effectCursor++;
      if (!effects[i] || dependencies.some((value, index) => !Object.is(value, effects[i].dependencies[index]))) {
        queued.push(() => { effects[i]?.cleanup?.(); effects[i] = { dependencies, cleanup: callback() }; });
      }
    },
    setInterval(callback, delay) { const id = ++nextId; timers.set(id, { callback, delay }); return id; },
    clearInterval: (id) => timers.delete(id),
  };
  const executable = code.replace(/^export\s*\{[^}]*\};?/gm, "").replace(/^export default /gm, "");
  const Component = new Function(...Object.keys(deps), `${executable}\nreturn SeasonalPeakSchedule;`)(...Object.values(deps));
  function render() {
    cursor = effectCursor = refCursor = 0;
    const root = Component(); tree = root.type(root.props);
    while (queued.length) queued.shift()();
  }
  render();
  return {
    render, messages, get tree() { return tree; }, get lateWrites() { return lateWrites; },
    unmount() { alive = false; effects.forEach((effect) => effect.cleanup?.()); assert.equal(timers.size, 0); },
  };
}
const text = (node) => typeof node === "string" || typeof node === "number" ? String(node) : !node || typeof node !== "object" ? "" : node.children.flat(Infinity).map(text).join(" ");
const nodes = (node) => !node || typeof node !== "object" ? [] : [node, ...node.children.flat(Infinity).flatMap(nodes)];
const button = (h, label) => nodes(h.tree).find((node) => node.type === "button" && text(node).includes(label));
const edit = (h) => nodes(h.tree).find((node) => node.type === "button" && nodes(node).some((child) => child.type === "edit"));
const monthStart = (h, month) => nodes(h.tree).filter((node) => node.type === "select")[(month - 1) * 2];
const multiplierSave = (h) => nodes(h.tree).find((node) => node.type === "button" && nodes(node).some((child) => child.type === "check"));
const tick = async (h) => { await Promise.resolve(); await Promise.resolve(); h.render(); };
const legacy = { peakHours: { startHour: 18, endHour: 22, rateMultiplier: 1.25 } };


test("admin validation and failed-save draft survive; retry reports success using current toasts", async () => {
  let fail = true, calls = 0, saved = legacy;
  const h = await mount("admin", {
    get: async () => ({ data: { success: true, tariff: saved } }),
    patch: async (url, body) => {
      assert.equal(url, "/tariff"); calls++;
      if (fail) throw new Error("offline");
      saved = { ...saved, peakScheduleVersions: [body.peakSchedule] };
      return { data: { success: true, tariff: saved } };
    },
  }); await tick(h);
  assert.match(text(h.tree), /Using flat timing/);
  edit(h).props.onClick(); h.render();
  assert.match(text(h.tree), /Jan/); assert.match(text(h.tree), /Dec/);
  monthStart(h, 6).props.onChange({ target: { value: "23" } }); h.render();
  button(h, "Save Schedule").props.onClick(); await tick(h);
  assert.equal(calls, 0); assert.match(h.messages.at(-1).message, /distinct whole/);
  monthStart(h, 6).props.onChange({ target: { value: "20" } }); h.render();
  button(h, "Save Schedule").props.onClick(); await tick(h);
  assert.equal(monthStart(h, 6).props.value, 20);
  assert.deepEqual(h.messages.at(-1), { type: "error", message: "Could not save." });
  assert.ok(h.messages.every((entry) => entry.type !== "success"));
  fail = false; button(h, "Save Schedule").props.onClick(); await tick(h);
  assert.equal(saved.peakScheduleVersions[0].months.length, 12);
  assert.equal(saved.peakScheduleVersions[0].months[5].startHour, 20);
  assert.deepEqual(h.messages.at(-1), { type: "success", message: "Seasonal schedule saved!" });
  assert.equal(saved.peakHours.rateMultiplier, 1.25);
  assert.equal(button(h, "Save Schedule"), undefined);
  h.unmount();
});

test("ordinary users see the active window with no edit or save controls", async () => {
  const h = await mount("user", { get: async () => ({ data: { success: true, tariff: {
    ...legacy, peakScheduleVersions: [{ effectiveFrom: "2020-01-01", months: schedule.mepcoSeasonalPreset() }],
  } } }) }); await tick(h);
  assert.match(text(h.tree), /Active Window/);
  assert.match(text(h.tree), /Schedule effective from 2020-01-01/);
  assert.equal(nodes(h.tree).filter((node) => node.type === "button" || node.type === "input" || node.type === "select").length, 0);
  h.unmount();
});

for (const target of ["schedule", "multiplier"]) {
  for (const outcome of ["success", "failure"]) {
    test('pending ' + target + ' save ' + outcome + ' after leaving does not write state or show a toast', async () => {
      let finish, fail;
      const h = await mount("admin", {
        get: async () => ({ data: { success: true, tariff: legacy } }),
        patch: () => new Promise((resolve, reject) => { finish = resolve; fail = reject; }),
      }); await tick(h);
      if (target === "schedule") { edit(h).props.onClick(); h.render(); }
      const saving = (target === "schedule" ? button(h, "Save Schedule") : multiplierSave(h)).props.onClick();
      h.render();
      if (target === "schedule") assert.equal(button(h, "Saving...").props.disabled, true);
      const previousMessages = h.messages.length;
      h.unmount();
      if (outcome === "success") finish({ data: { success: true, tariff: legacy } });
      else fail(new Error("offline"));
      await saving; await Promise.resolve(); await Promise.resolve();
      assert.equal(h.lateWrites, 0);
      assert.equal(h.messages.length, previousMessages);
    });
  }
}

test("multiplier save still reports success while the editor remains mounted", async () => {
  let payload;
  const h = await mount("admin", {
    get: async () => ({ data: { success: true, tariff: legacy } }),
    patch: async (_url, body) => { payload = body; return { data: { success: true, tariff: { ...legacy, ...body } } }; },
  }); await tick(h);
  nodes(h.tree).find((node) => node.type === "input" && node.props.type === "number").props.onChange({ target: { value: "1.5" } }); h.render();
  multiplierSave(h).props.onClick(); await tick(h);
  assert.equal(payload.peakHours.rateMultiplier, 1.5);
  assert.deepEqual(h.messages.at(-1), { type: "success", message: "Billing multiplier updated!" });
  h.unmount();
});
