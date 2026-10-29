import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Evaluate the actual startup body with isolated dependencies. Imports and
// import.meta are supplied by the harness; dotenv, sockets, DB, jobs and disk
// writes never run. No experimental VM flags or extra dependencies required.
const moduleUrl = new URL("../index.js", import.meta.url).href;
const source = (await readFile(new URL(moduleUrl), "utf8"))
  .replace(/^import\s+.*?\s+from\s+["'][^"']+["'];?\r?$/gm, "")
  .replaceAll("import.meta.url", "moduleUrl");
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
async function settle() { for (let i = 0; i < 20; i++) await Promise.resolve(); }
async function boot() {
  const events = [], messages = [], database = deferred(), lookup = deferred(), creation = deferred();
  let onListen;
  const context = {
    moduleUrl, path, fileURLToPath,
    dotenv: { config() {} },
    process: { env: { PORT: "8080" }, on() {}, exit: (code) => events.push(["exit", code]) },
    console: { log: (...args) => messages.push(args.join(" ")) },
    fs: { existsSync: () => true, mkdirSync: () => assert.fail("Unexpected disk write") },
    connectDB: () => { events.push(["database"]); return database.promise; },
    Tariff: {
      findOne: () => { events.push(["tariff.lookup"]); return lookup.promise; },
      create: () => { events.push(["tariff.create"]); return creation.promise; },
    },
    DEFAULT_TARIFF: {},
    app: { listen: (_port, callback) => { events.push(["listen.requested"]); onListen = callback; return {}; } },
    recordSystemEvent: async (code) => { events.push([code]); },
    startNightlyAggregationJob: () => events.push(["nightly.started"]),
    startPeakReminderJob: () => events.push(["reminders.started"]),
  };
  vm.runInNewContext(source, context, { filename: "index.js", timeout: 1000 });
  await settle();
  return { events, messages, database, lookup, creation,
    listenResult(error) { assert.equal(typeof onListen, "function"); onListen(error); },
    has: (event) => events.some(([name]) => name === event),
  };
}

test("jobs wait for listening success, then each starts once", async () => {
  const h = await boot();
  assert.equal(h.has("tariff.lookup"), false);
  h.database.resolve(); await settle();
  assert.equal(h.has("listen.requested"), false);
  h.lookup.resolve({ existing: true }); await settle();
  assert.equal(h.has("tariff.create"), false);
  assert.equal(h.has("listen.requested"), true);
  for (const event of ["nightly.started", "reminders.started", "server.started"]) assert.equal(h.has(event), false);
  h.listenResult(); await settle();
  for (const event of ["nightly.started", "reminders.started", "server.started"]) assert.equal(h.events.filter(([name]) => name === event).length, 1);
});

test("new tariff creation must finish before listen is requested or jobs start", async () => {
  const h = await boot(); h.database.resolve(); await settle(); h.lookup.resolve(null); await settle();
  assert.equal(h.has("tariff.create"), true);
  assert.equal(h.has("listen.requested"), false);
  assert.equal(h.has("nightly.started"), false);
  h.creation.resolve({}); await settle();
  assert.equal(h.has("listen.requested"), true);
  assert.equal(h.has("reminders.started"), false);
  h.listenResult(); await settle();
  assert.equal(h.has("nightly.started"), true); assert.equal(h.has("reminders.started"), true);
});

test("Express listen failure never logs startup success or starts either job", async () => {
  const h = await boot(); h.database.resolve(); await settle(); h.lookup.resolve({ existing: true }); await settle();
  const error = new Error("Mock port already occupied"); error.code = "EADDRINUSE";
  h.listenResult(error); await settle();
  for (const event of ["nightly.started", "reminders.started", "server.started"]) assert.equal(h.has(event), false);
  assert.ok(h.events.some(([event, code]) => event === "exit" && code === 1));
  assert.ok(h.messages.some((message) => message.includes("Server startup failed")));
  assert.equal(h.messages.some((message) => message.includes("Server is running")), false);
});

for (const stage of ["database", "lookup", "creation"]) {
  test(`${stage} failure stops before listening and background jobs`, async () => {
    const h = await boot();
    if (stage === "database") h.database.reject(new Error("Mock failure"));
    else {
      h.database.resolve(); await settle();
      if (stage === "lookup") h.lookup.reject(new Error("Mock failure"));
      else { h.lookup.resolve(null); await settle(); h.creation.reject(new Error("Mock failure")); }
    }
    await settle();
    for (const event of ["listen.requested", "nightly.started", "reminders.started", "server.started"]) assert.equal(h.has(event), false);
    assert.ok(h.events.some(([event, code]) => event === "exit" && code === 1));
  });
}
