import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { transformWithOxc } from "vite";
import * as budget from "../src/utils/budgetGoal.js";
import { describeWeather } from "../src/utils/weatherConditions.js";

// Execute the actual components with controlled hooks, HTTP promises and timers.
// This checks request lifecycles without a browser, a database or new dependencies.
async function mount(name, user, http) {
  const source = await readFile(new URL(`../src/components/Common/${name}.jsx`, import.meta.url), "utf8");
  const iconNames = [...source.matchAll(/import \{([^}]+)\} from "react-icons\//g)]
    .flatMap((match) => match[1].split(",").map((value) => value.trim()).filter(Boolean));
  const { code } = await transformWithOxc(source.replace(/^import[\s\S]*?from "[^"]+";\s*/gm, ""), `${name}.jsx`, { jsx: { runtime: "classic" } });
  const state = [], refs = [], effects = [], scheduled = [];
  const timers = new Map(), intervals = new Map();
  let cursor = 0, effectCursor = 0, refCursor = 0, timerId = 0, tree, alive = true, writesAfterUnmount = 0;
  const auth = { user, login(value) { auth.user = value; } };
  const deps = {
    ...budget, describeWeather, Link: "Link", toast: { success() {} },
    ...Object.fromEntries(iconNames.map((icon) => [icon, icon])),
    React: { createElement: (type, props, ...children) => ({ type, props: props || {}, children }), Fragment: "fragment" },
    useAuth: () => auth, axiosServerInstance: http,
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
      return [state[index], (value) => {
        if (!alive) writesAfterUnmount++;
        state[index] = typeof value === "function" ? value(state[index]) : value;
      }];
    },
    useRef(initial) { const index = refCursor++; return refs[index] ??= { current: initial }; },
    useEffect(callback, dependencies) {
      const index = effectCursor++;
      if (!effects[index] || dependencies.some((value, i) => !Object.is(value, effects[index].dependencies[i]))) {
        scheduled.push(() => {
          effects[index]?.cleanup?.();
          effects[index] = { dependencies, cleanup: callback() };
        });
      }
    },
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout: (id) => timers.delete(id),
    setInterval(callback, delay) { const id = ++timerId; intervals.set(id, { callback, delay }); return id; },
    clearInterval: (id) => intervals.delete(id),
  };
  const componentCode = code.replace(/export\s*\{[^}]*\};?/g, "").replace("export default ", "");
  const Component = new Function(...Object.keys(deps), `${componentCode}\nreturn ${name};`)(...Object.values(deps));
  function render(props = {}) {
    cursor = effectCursor = refCursor = 0;
    const inner = Component(props);
    tree = typeof inner.type === "function" ? inner.type(inner.props) : inner;
    while (scheduled.length) scheduled.shift()();
    return tree;
  }
  render();
  return {
    auth, render, timers, intervals,
    get tree() { return tree; },
    get writesAfterUnmount() { return writesAfterUnmount; },
    unmount() { alive = false; effects.forEach((effect) => effect.cleanup?.()); },
    async runDebounce() { const entries = [...timers.values()]; timers.clear(); await Promise.all(entries.map(({ callback, delay }) => { assert.equal(delay, 350); return callback(); })); },
  };
}

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const tick = async () => { await Promise.resolve(); await Promise.resolve(); };
const nodes = (tree) => !tree || typeof tree !== "object" ? [] : [tree, ...(tree.children || []).flat(Infinity).flatMap(nodes)];
const find = (harness, predicate) => nodes(harness.tree).find(predicate);
const text = (tree) => typeof tree === "string" || typeof tree === "number" ? String(tree) : !tree || typeof tree !== "object" ? "" : (tree.children || []).flat(Infinity).map(text).join(" ");
const button = (harness, label) => find(harness, (node) => node.type === "button" && text(node).includes(label));
const city = { id: 1, name: "Sahiwal", region: "Punjab", country: "Pakistan", countryCode: "PK", latitude: 30.67, longitude: 73.1 };
const weather = (temperatureC) => ({ temperatureC, feelsLikeC: temperatureC, humidityPercent: 50, windKph: 4, weatherCode: 0, isDay: false, observedAt: "2026-10-23T00:00:00Z" });

test("budget failed save preserves an explicitly unsaved draft; retry saves and clear works", async () => {
  let fail = true;
  const h = await mount("BudgetGoalCard", { _id: "a", budgetGoal: null }, { patch: async (_url, body) => {
    if (fail) throw new Error("offline");
    return { data: { success: true, user: { _id: "a", budgetGoal: body.budgetGoal } } };
  } });
  assert.match(text(h.tree), /No goal saved/);
  assert.match(text(h.tree), /Generate a prediction/);
  find(h, (node) => node.props.id === "budget-goal-amount").props.onChange({ target: { value: "7400" } });
  h.render({ predictedBill: 7400 });
  assert.match(text(h.tree), /exactly on budget/);
  await button(h, "Save Goal").props.onClick(); h.render();
  assert.equal(find(h, (node) => node.props.id === "budget-goal-amount").props.value, "7400");
  assert.match(text(h.tree), /not saved yet/);
  assert.match(text(h.tree), /Could not save/);
  assert.doesNotMatch(text(h.tree), /saved to your account/);
  fail = false;
  await button(h, "Save Goal").props.onClick(); h.render(); h.render();
  assert.equal(h.auth.user.budgetGoal, 7400);
  assert.match(text(h.tree), /Saved goal: Rs. 7,400/);
  await button(h, "Clear saved goal").props.onClick(); h.render(); h.render();
  assert.equal(h.auth.user.budgetGoal, null);
  assert.match(text(h.tree), /Budget goal cleared/);
});

test("budget completion after unmount cannot update auth or state", async () => {
  const request = deferred();
  const h = await mount("BudgetGoalCard", { _id: "a", budgetGoal: null }, { patch: () => request.promise });
  const save = button(h, "Save Goal").props.onClick();
  h.unmount();
  request.resolve({ data: { success: true, user: { _id: "a", budgetGoal: 5000 } } });
  await save;
  assert.equal(h.auth.user.budgetGoal, null);
  assert.equal(h.writesAfterUnmount, 0);
});

test("rapid location changes discard old weather and unmount discards pending results", async () => {
  const requests = [];
  const h = await mount("DashboardWeather", { _id: "a", weatherLocation: city }, { get: () => { const request = deferred(); requests.push(request); return request.promise; } });
  h.auth.user = { ...h.auth.user, weatherLocation: { ...city, id: 2, name: "Lahore", latitude: 31.5 } }; h.render();
  requests[1].resolve({ data: { success: true, weather: weather(0) } }); await tick(); h.render();
  requests[0].resolve({ data: { success: true, weather: weather(99) } }); await tick(); h.render();
  assert.match(text(h.tree), /Lahore/);
  assert.match(text(h.tree), /0\s*°C/);
  assert.ok(find(h, (node) => node.type === "WiNightClear"));
  assert.doesNotMatch(text(h.tree), /99/);
  h.auth.user = { ...h.auth.user, weatherLocation: { ...city, id: 3, name: "Multan", latitude: 30.2 } }; h.render();
  assert.doesNotMatch(text(h.tree), /0\s*°C/);
  h.unmount();
  requests[2].resolve({ data: { success: true, weather: weather(12) } }); await tick();
  assert.equal(h.writesAfterUnmount, 0);
});

test("dashboard with no city links to Settings without requesting weather", async () => {
  const h = await mount("DashboardWeather", { _id: "a", weatherLocation: null }, {
    get() { assert.fail("Weather must not be fetched without a selected city"); },
  });
  assert.match(text(h.tree), /Set your city/);
  assert.equal(find(h, (node) => node.type === "Link").props.to, "/settings");
  assert.equal(find(h, (node) => node.type === "input"), undefined);
  h.unmount();
});

test("current compact dashboard fetches on open without scheduling automatic refresh", async () => {
  let calls = 0;
  const h = await mount("DashboardWeather", { _id: "a", weatherLocation: city }, { get: async () => {
    calls++;
    return { data: { success: true, weather: weather(20) } };
  } });
  await tick(); h.render();
  assert.match(text(h.tree), /20\s*°C/);
  assert.equal(calls, 1);
  assert.equal(h.intervals.size, 0);
  h.render();
  assert.equal(calls, 1);
  h.unmount();
});

test("first weather failure offers Retry without inventing a temperature", async () => {
  let fail = true;
  const h = await mount("DashboardWeather", { _id: "a", weatherLocation: city }, { get: async () => {
    if (fail) throw new Error("timeout");
    return { data: { success: true, weather: weather(0) } };
  } });
  await tick(); h.render();
  assert.match(text(h.tree), /—\s*°C/);
  assert.ok(button(h, "retry"));
  assert.doesNotMatch(text(h.tree), /0\s*°C/);
  fail = false; button(h, "retry").props.onClick(); h.render(); await tick(); h.render();
  assert.match(text(h.tree), /0\s*°C/);
  h.unmount();
});

test("city selection failure stays retryable; success updates the account", async () => {
  let fail = true;
  const h = await mount("WeatherLocationCard", { _id: "a", weatherLocation: null }, {
    get: async (url, options) => {
      assert.equal(url, "/weather/cities");
      assert.equal(options.params.q, "Sahiwal");
      return { data: { success: true, cities: [city] } };
    },
    patch: async (url, body) => {
      assert.equal(url, "/user/weather-location");
      assert.deepEqual(body, { weatherLocation: city });
      if (fail) throw new Error("offline");
      return { data: { success: true, user: { _id: "a", weatherLocation: body.weatherLocation } } };
    },
  });
  find(h, (node) => node.type === "input").props.onChange({ target: { value: "Sahiwal" } });
  h.render(); await h.runDebounce(); h.render();
  await button(h, "Sahiwal").props.onClick(); h.render();
  assert.equal(h.auth.user.weatherLocation, null);
  assert.match(text(h.tree), /Could not save city/);
  fail = false; await button(h, "Sahiwal").props.onClick(); h.render(); await tick(); h.render();
  assert.deepEqual(h.auth.user.weatherLocation, city);
  assert.match(text(h.tree), /Saved/);
  assert.doesNotMatch(text(h.tree), /Could not save city/);
  assert.equal(find(h, (node) => node.type === "input").props.value, "");
  h.unmount();
});

test("city search debounces, ignores old responses and cancels timers on unmount", async () => {
  const requests = [];
  const h = await mount("WeatherLocationCard", { _id: "a", weatherLocation: null }, { get: () => { const request = deferred(); requests.push(request); return request.promise; } });
  const input = () => find(h, (node) => node.type === "input");
  input().props.onChange({ target: { value: "Sa" } }); h.render(); assert.equal(h.timers.size, 0);
  input().props.onChange({ target: { value: "Sah" } }); h.render();
  const first = h.runDebounce();
  input().props.onChange({ target: { value: "Lah" } }); h.render();
  const second = h.runDebounce();
  requests[1].resolve({ data: { success: true, cities: [{ ...city, id: 2, name: "Lahore" }] } }); await second; h.render();
  requests[0].resolve({ data: { success: true, cities: [city] } }); await first; h.render();
  assert.match(text(h.tree), /Lahore/);
  assert.doesNotMatch(text(h.tree), /Sahiwal/);
  input().props.onChange({ target: { value: "Multan" } }); h.render(); assert.equal(h.timers.size, 1);
  h.unmount(); assert.equal(h.timers.size, 0); assert.equal(h.writesAfterUnmount, 0);
});
