import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { transformWithOxc } from "vite";

const source = await readFile(new URL("../src/pages/common/Settings.jsx", import.meta.url), "utf8");
const { code } = await transformWithOxc(source.replace(/^import[\s\S]*?from "[^"]+";\s*/gm, ""), "Settings.jsx", { jsx: { runtime: "classic" } });
const executable = code.replace(/export\s*\{[^}]*\};?/g, "").replace(/export default /g, "");
const nodes = (node) => !node || typeof node !== "object" ? [] : [node, ...(node.children || []).flat(Infinity).flatMap(nodes)];
const text = (node) => typeof node === "string" || typeof node === "number" ? String(node) : !node || typeof node !== "object" ? "" : (node.children || []).flat(Infinity).map(text).join(" ");
const button = (h, label) => nodes(h.tree).find((node) => node.type === "button" && text(node).includes(label));
const profile = (fridgeQty = 0) => ({ data: { success: true, hasProfile: true, profile: { fridgeQty } } });

function mount() {
  const states = [], refs = [], effects = [], queued = [], requests = [], writes = [], errors = [];
  let cursor = 0, refCursor = 0, effectCursor = 0, tree, dirty = false, alive = true, lateWrites = 0;
  const auth = { user: { _id: "test-account", fullName: "Test", email: "test@example.test", role: "user" }, login() {} };
  const deps = {
    React: { Fragment: "fragment", createElement: (type, props, ...children) => ({ type, props: props || {}, children }) },
    useAuth: () => auth, backend_url: "http://mock.invalid", WeatherLocationCard: "WeatherLocationCard", PeakReminderSetting: "PeakReminderSetting",
    toast: { success() {}, error: (message) => errors.push(message) },
    useState(initial) {
      const i = cursor++;
      if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial;
      return [states[i], (value) => {
        if (!alive) lateWrites++;
        const next = typeof value === "function" ? value(states[i]) : value;
        if (!Object.is(next, states[i])) { states[i] = next; dirty = true; }
      }];
    },
    useRef(initial) { return refs[refCursor++] ??= { current: initial }; },
    useEffect(callback, dependencies) {
      const i = effectCursor++;
      if (!effects[i] || dependencies.some((value, index) => !Object.is(value, effects[i].dependencies[index]))) queued.push(() => { effects[i]?.cleanup?.(); effects[i] = { dependencies, cleanup: callback() }; });
    },
    axiosServerInstance: {
      get(path, options) {
        assert.equal(path, "/appliance-profile/me");
        let resolve, reject;
        const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
        requests.push({ resolve, reject, options }); return promise;
      },
      put: async (path, body) => { assert.equal(path, "/appliance-profile"); writes.push(body); return { data: { success: true } }; },
      post: () => assert.fail("No device-key requests allowed"), patch: () => assert.fail("Unexpected request"),
    },
  };
  for (const icon of new Set(source.match(/Lu\w+|FaHome/g))) deps[icon] = icon;
  const Component = new Function(...Object.keys(deps), `${executable}\nreturn Settings;`)(...Object.values(deps));
  function render() {
    do { dirty = false; cursor = refCursor = effectCursor = 0; tree = Component(); while (queued.length) queued.shift()(); } while (dirty && alive);
  }
  render();
  return { render, requests, writes, errors, get tree() { return tree; }, get lateWrites() { return lateWrites; }, unmount() { alive = false; effects.forEach((effect) => effect.cleanup?.()); } };
}
const tab = (h, label) => { button(h, label).props.onClick(); h.render(); };
async function settle(h) { for (let i = 0; i < 15; i++) await Promise.resolve(); h.render(); }

test("loading blocks the Save button and handler; a loaded zero saves unchanged", async () => {
  const h = mount();
  try {
    tab(h, "Appliances");
    assert.equal(button(h, "Save Changes").props.disabled, true);
    assert.match(text(h.tree), /Loading appliance profile/);
    await button(h, "Save Changes").props.onClick(); assert.equal(h.writes.length, 0);
    h.requests[0].resolve(profile(0)); await settle(h);
    assert.equal(button(h, "Save Changes").props.disabled, false);
    await button(h, "Save Changes").props.onClick(); await settle(h);
    assert.equal(h.writes[0].fridgeQty, 0);
    tab(h, "Profile"); tab(h, "Appliances");
    assert.equal(button(h, "Save Changes").props.disabled, true);
    h.requests[1].resolve(profile(0)); await settle(h);
    await button(h, "Save Changes").props.onClick(); assert.equal(h.writes[1].fridgeQty, 0);
  } finally { h.unmount(); }
});

test("failed profile loading blocks writes; Retry remains available and recovers", async () => {
  const h = mount();
  try {
    tab(h, "Appliances"); h.requests[0].reject(new Error("Mock network failure")); await settle(h);
    assert.match(text(h.tree), /Could not load appliance profile/);
    assert.equal(button(h, "Save Changes").props.disabled, true);
    await button(h, "Save Changes").props.onClick(); assert.equal(h.writes.length, 0);
    assert.equal(!!button(h, "Retry").props.disabled, false);
    button(h, "Retry").props.onClick(); h.render();
    assert.equal(button(h, "Save Changes").props.disabled, true);
    assert.equal(h.requests.length, 2);
    h.requests[1].resolve(profile(0)); await settle(h);
    await button(h, "Save Changes").props.onClick(); assert.equal(h.writes[0].fridgeQty, 0);
  } finally { h.unmount(); }
});

test("confirmed no-profile response permits saving defaults for a new account", async () => {
  const h = mount();
  try {
    tab(h, "Appliances"); h.requests[0].resolve({ data: { success: true, hasProfile: false, profile: null } }); await settle(h);
    assert.equal(button(h, "Save Changes").props.disabled, false);
    await button(h, "Save Changes").props.onClick(); assert.equal(h.writes[0].fridgeQty, 1);
  } finally { h.unmount(); }
});

for (const data of [{ success: false }, { success: true }, { success: true, hasProfile: true, profile: null }]) {
  test(`malformed/unsuccessful response cannot unlock saving: ${JSON.stringify(data)}`, async () => {
    const h = mount();
    try {
      tab(h, "Appliances"); h.requests[0].resolve({ data }); await settle(h);
      assert.equal(button(h, "Save Changes").props.disabled, true);
      assert.ok(button(h, "Retry"));
      await button(h, "Save Changes").props.onClick(); assert.equal(h.writes.length, 0);
    } finally { h.unmount(); }
  });
}

test("late response from a previous tab visit cannot replace the latest loaded profile", async () => {
  const h = mount();
  try {
    tab(h, "Appliances"); tab(h, "Profile"); tab(h, "Appliances");
    h.requests[1].resolve(profile(3)); await settle(h);
    h.requests[0].resolve(profile(0)); await settle(h);
    await button(h, "Save Changes").props.onClick(); assert.equal(h.writes[0].fridgeQty, 3);
  } finally { h.unmount(); }
});

test("pending profile request cannot update state after Settings unmounts", async () => {
  const h = mount(); tab(h, "Appliances"); h.unmount();
  h.requests[0].resolve(profile(0)); for (let i = 0; i < 15; i++) await Promise.resolve();
  assert.equal(h.lateWrites, 0);
});
