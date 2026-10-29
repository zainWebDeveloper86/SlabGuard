import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { transformWithOxc } from "vite";

// Run the actual UI's requests/effects with controlled hooks, no network or DOM.
async function mount(name, user, http) {
  const path = name === "Alerts" ? "pages/User/Alerts.jsx" : "components/Common/PeakReminderSetting.jsx";
  const source = await readFile(new URL(`../src/${path}`, import.meta.url), "utf8");
  const icons = [...source.matchAll(/import \{([^}]+)\} from "react-icons\//g)]
    .flatMap((match) => match[1].split(",").map((value) => value.trim()).filter(Boolean));
  const { code } = await transformWithOxc(source.replace(/import[\s\S]*?from "[^"]+";\s*/g, ""), `${name}.jsx`, { jsx: { runtime: "classic" } });
  let states = [], effects = [], refs = [], cursor = 0, effectCursor = 0, refCursor = 0, tree, identity, timerId = 0;
  let alive = true, lateWrites = 0;
  const scheduled = [], timers = new Map(), messages = [];
  const auth = { user, login(value) { auth.user = value; } };
  const deps = {
    React: { createElement: (type, props, ...children) => ({ type, props: props || {}, children }) },
    ...Object.fromEntries(icons.map((icon) => [icon, icon])),
    toast: { error: (message) => messages.push(message) },
    useAuth: () => auth, axiosServerInstance: http,
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial;
      return [states[index], (value) => {
        if (!alive) lateWrites++;
        states[index] = typeof value === "function" ? value(states[index]) : value;
      }];
    },
    useRef(initial) { return refs[refCursor++] ??= { current: initial }; },
    useEffect(callback, dependencies) {
      const index = effectCursor++;
      if (!effects[index] || dependencies.some((value, i) => !Object.is(value, effects[index].dependencies[i]))) {
        scheduled.push(() => { effects[index]?.cleanup?.(); effects[index] = { dependencies, cleanup: callback() }; });
      }
    },
    setInterval(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearInterval: (id) => timers.delete(id),
  };
  const Component = new Function(...Object.keys(deps), `${code.replace(/export default /g, "")}\nreturn ${name};`)(...Object.values(deps));
  function render() {
    const root = Component();
    if (identity !== root.props.key) {
      effects.forEach((effect) => effect.cleanup?.()); states = []; effects = []; refs = []; identity = root.props.key;
    }
    cursor = effectCursor = refCursor = 0;
    tree = root.type(root.props);
    while (scheduled.length) scheduled.shift()();
  }
  render();
  return {
    auth, render, timers, messages,
    get tree() { return tree; }, get lateWrites() { return lateWrites; },
    unmount() { alive = false; effects.forEach((effect) => effect.cleanup?.()); },
    poll() { const timer = [...timers.values()][0]; assert.equal(timer.delay, 30000); return timer.callback(); },
  };
}
const text = (node) => typeof node === "string" || typeof node === "number" ? String(node) : !node || typeof node !== "object" ? "" : node.children.flat(Infinity).map(text).join(" ");
const nodes = (node) => !node || typeof node !== "object" ? [] : [node, ...node.children.flat(Infinity).flatMap(nodes)];
const button = (h, label) => nodes(h.tree).find((node) => node.type === "button" && text(node).includes(label));
const toggle = (h) => nodes(h.tree).find((node) => node.props.role === "switch");
const tick = async (h) => { await Promise.resolve(); await Promise.resolve(); h.render(); };
const deferred = () => { let resolve; const promise = new Promise((yes) => { resolve = yes; }); return { resolve, promise }; };
const user = { _id: "a", meterType: "three", peakHourReminderEnabled: false };
const reminder = { _id: "reminder", title: "Peak hours starting soon", desc: "Starts at 6 PM PKT", isRead: false, type: "warning", createdAt: new Date().toISOString() };
const list = (alerts) => ({ data: { success: true, alerts } });

test("reminder switch starts Off, preserves the saved state on failure and retries On/Off", async () => {
  let fail = true;
  const h = await mount("PeakReminderSetting", user, { patch: async (path, body) => {
    assert.equal(path, "/user/peak-reminder");
    if (fail) throw new Error("offline");
    return { data: { success: true, user: { ...user, peakHourReminderEnabled: body.enabled } } };
  } });
  assert.equal(toggle(h).props["aria-checked"], false);
  await toggle(h).props.onClick(); h.render();
  assert.equal(toggle(h).props["aria-checked"], false);
  assert.match(text(h.tree), /Could not save/); assert.doesNotMatch(text(h.tree), /enabled and saved/);
  fail = false; await toggle(h).props.onClick(); h.render();
  assert.equal(h.auth.user.peakHourReminderEnabled, true); assert.equal(toggle(h).props["aria-checked"], true);
  await toggle(h).props.onClick(); h.render();
  assert.equal(h.auth.user.peakHourReminderEnabled, false); assert.match(text(h.tree), /disabled and saved/);
  h.unmount();
});
test("single-phase accounts cannot enable reminders", async () => {
  const h = await mount("PeakReminderSetting", { ...user, meterType: "single" }, {});
  assert.equal(toggle(h).props.disabled, true);
  assert.match(text(h.tree), /only to three-phase/); h.unmount();
});
test("completion after leaving Settings cannot update the account or UI", async () => {
  const request = deferred();
  const h = await mount("PeakReminderSetting", user, { patch: () => request.promise });
  const saving = toggle(h).props.onClick(); h.unmount();
  request.resolve({ data: { success: true, user: { ...user, peakHourReminderEnabled: true } } }); await saving;
  assert.equal(h.auth.user.peakHourReminderEnabled, false); assert.equal(h.lateWrites, 0);
});
test("Alerts page automatically receives new reminders and cleans up polling on unmount", async () => {
  let rows = [];
  const h = await mount("Alerts", user, { get: async () => list(rows) }); await tick(h);
  assert.match(text(h.tree), /All caught up/);
  rows = [reminder]; await h.poll(); h.render();
  assert.match(text(h.tree), /Peak hours starting soon/);
  h.unmount(); assert.equal(h.timers.size, 0); assert.equal(h.lateWrites, 0);
});
test("late poll cannot undo Mark as Read or restore a deleted reminder", async () => {
  let slow = null;
  const h = await mount("Alerts", user, {
    get: async () => slow ? slow.promise : list([reminder]),
    patch: async () => ({ data: { success: true } }), delete: async () => ({ data: { success: true } }),
  }); await tick(h);
  slow = deferred(); const reading = h.poll();
  await button(h, "Mark as Read").props.onClick(); h.render();
  slow.resolve(list([reminder])); await reading; h.render();
  assert.equal(button(h, "Mark as Read"), undefined);
  slow = deferred(); const deleting = h.poll();
  await button(h, "Delete").props.onClick(); h.render();
  slow.resolve(list([reminder])); await deleting; h.render();
  assert.doesNotMatch(text(h.tree), /Peak hours starting soon/); h.unmount();
});
test("refresh failure retains the last list and offers Retry", async () => {
  let fail = false;
  const h = await mount("Alerts", user, { get: async () => {
    if (fail) throw new Error("offline"); return list([reminder]);
  } }); await tick(h);
  fail = true; await h.poll(); h.render();
  assert.match(text(h.tree), /Could not refresh/); assert.match(text(h.tree), /Peak hours starting soon/);
  fail = false; button(h, "Retry").props.onClick(); h.render(); await tick(h);
  assert.doesNotMatch(text(h.tree), /Could not refresh/); h.unmount();
});
test("account changes and unmount discard pending alert responses", async () => {
  const requests = [];
  const h = await mount("Alerts", user, { get: () => new Promise((resolve) => requests.push(resolve)) });
  h.auth.user = { ...user, _id: "b" }; h.render();
  requests[1](list([])); await tick(h);
  requests[0](list([reminder])); await tick(h);
  assert.doesNotMatch(text(h.tree), /Peak hours starting soon/);
  const polling = h.poll(); h.unmount(); requests[2](list([reminder])); await polling;
  assert.equal(h.lateWrites, 0); assert.equal(h.timers.size, 0);
});
