import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { getPeakCountdown } from "../src/utils/peakCountdown.js";

const normal = { startHour: 18, endHour: 22 };
for (const [time, active, countdown] of [
  ["17:15:00", false, "00h 45m 00s"],
  ["17:59:59", false, "00h 00m 01s"],
  ["18:00:00", true, "04h 00m 00s"],
  ["21:59:59", true, "00h 00m 01s"],
  ["22:00:00", false, "20h 00m 00s"],
  ["23:59:59", false, "18h 00m 01s"],
  ["00:00:00", false, "18h 00m 00s"],
]) {
  test(`Pakistan ${time}: ${active ? "active" : "upcoming"}`, () => {
    const state = getPeakCountdown(normal, new Date(`2026-10-24T${time}+05:00`));
    assert.equal(state.isPeak, active);
    assert.equal(state.countdown, countdown);
    assert.equal(state.windowLabel, "6:00 PM – 10:00 PM PKT");
  });
}
test("overnight window stays active through midnight and ends exclusively", () => {
  const window = { startHour: 22, endHour: 2 };
  for (const [instant, active, hours] of [
    ["2026-12-31T22:00:00+05:00", true, 4],
    ["2027-01-01T00:00:00+05:00", true, 2],
    ["2027-01-01T01:00:00+05:00", true, 1],
    ["2027-01-01T02:00:00+05:00", false, 20],
  ]) {
    const state = getPeakCountdown(window, new Date(instant));
    assert.equal(state.isPeak, active);
    assert.equal(state.secondsRemaining, hours * 3600);
    assert.match(state.windowLabel, /ends next day/);
  }
});
test("midnight/noon labels and fractional-second boundaries are correct", () => {
  assert.equal(getPeakCountdown({ startHour: 0, endHour: 12 }).windowLabel, "12:00 AM – 12:00 PM PKT");
  assert.equal(getPeakCountdown(normal, new Date("2026-10-24T17:59:59.999+05:00")).secondsRemaining, 1);
  assert.equal(getPeakCountdown(normal, new Date("2026-10-24T18:00:00.001+05:00")).isPeak, true);
});
test("missing or invalid configuration never invents a default schedule", () => {
  for (const window of [null, undefined, {}, { startHour: 18, endHour: 18 },
    { startHour: "18", endHour: 22 }, { startHour: 18.5, endHour: 22 },
    { startHour: -1, endHour: 22 }, { startHour: 18, endHour: 24 }]) {
    assert.equal(getPeakCountdown(window), null);
  }
  assert.equal(getPeakCountdown(normal, new Date("invalid")), null);
});
test("identical Pakistan countdown under UTC, Karachi and New York host timezones", () => {
  const code = `import {getPeakCountdown} from './src/utils/peakCountdown.js';
    console.log(JSON.stringify(getPeakCountdown({startHour:18,endHour:22},new Date('2026-12-31T13:00:00Z'))));`;
  const results = ["UTC", "Asia/Karachi", "America/New_York"].map((TZ) => {
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
      cwd: new URL("../", import.meta.url), env: { ...process.env, TZ }, encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  });
  assert.deepEqual(results[0], results[1]);
  assert.deepEqual(results[1], results[2]);
  assert.equal(results[0].isPeak, true);
});
