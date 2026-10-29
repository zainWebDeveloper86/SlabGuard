import assert from "node:assert/strict";
import test from "node:test";
import { getLatestReadingStatus } from "../src/utils/readingStatus.js";

for (const status of [undefined, null, {}, { simulator: null, esp32: null }]) {
  test(`no readings return no sync label: ${JSON.stringify(status)}`, () => {
    assert.equal(getLatestReadingStatus(status), null);
  });
}

for (const source of ["esp32", "simulator"]) {
  for (const receivedAt of [undefined, null, "", " ", "bad", 0, false, [], {}]) {
    test(`${source} missing/invalid upload time: ${JSON.stringify(receivedAt)}`, () => {
      assert.equal(getLatestReadingStatus({ [source]: { receivedAt } }), "Sync time unavailable");
    });
  }
}

test("historical uploads use the upload time in Pakistan, not the reading hour", () => {
  const result = getLatestReadingStatus({ simulator: {
    receivedAt: "2026-10-23T20:00:00Z", readingHour: "2026-09-01T19:00:00Z",
  } });
  assert.match(result, /^Last synced: 24 Oct,? 01:00 PKT$/);
  assert.doesNotMatch(result, /Sep|connected|online/i);
});

test("existing ESP32 preference remains even when simulator uploaded more recently", () => {
  assert.match(getLatestReadingStatus({
    esp32: { receivedAt: "2025-01-01T00:00:00Z" },
    simulator: { receivedAt: "2026-10-23T20:00:00Z" },
  }), /^Last synced: 01 Jan,? 05:00 PKT$/);
});

test("an unknown ESP32 upload time is not replaced with simulator's time", () => {
  assert.equal(getLatestReadingStatus({ esp32: { receivedAt: null },
    simulator: { receivedAt: "2026-10-23T20:00:00Z" },
  }), "Sync time unavailable");
});

test("Pakistan midnight crosses the year correctly", () => {
  assert.match(getLatestReadingStatus({ esp32: { receivedAt: "2026-12-31T19:00:00Z" } }),
    /^Last synced: 01 Jan,? 00:00 PKT$/);
});
