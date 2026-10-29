import assert from "node:assert/strict";
import test from "node:test";
import { predictionPeriodLabel, predictionPeriodNotes } from "../src/utils/predictionPeriod.js";

test("cycle display distinguishes confirmed reading, expected window and whole-day assumption", () => {
  const prediction = { projection: {
    periodType: "reading-cycle", startDate: "2026-09-23", endDate: "2026-10-24",
    lastConfirmedReadingDate: "2026-09-22",
    expectedReadingWindow: { startDate: "2026-10-20", endDate: "2026-10-24" },
  } };
  assert.match(predictionPeriodLabel(prediction), /Reading-Cycle/);
  const notes = predictionPeriodNotes(prediction).join(" ");
  assert.match(notes, /Last confirmed reading: 2026-09-22/);
  assert.match(notes, /Expected next visit: 2026-10-20 to 2026-10-24/);
  assert.match(notes, /next reading date is not confirmed/);
  assert.match(notes, /excludes the confirmed reading day/);
});
test("calendar and monthly-history fallbacks never claim cycle alignment", () => {
  const expired = { projection: { periodType: "calendar-month", startDate: "2026-10-01", endDate: "2026-10-31", fallbackReason: "reading-window-passed" } };
  assert.match(predictionPeriodLabel(expired), /Calendar-Month/);
  assert.match(predictionPeriodNotes(expired).join(" "), /window has passed/);
  assert.match(predictionPeriodNotes({ projection: { ...expired.projection, fallbackReason: "missing-reading-schedule" } }).join(" "), /Add a confirmed reading date/);
  assert.equal(predictionPeriodLabel({}), "Monthly History Estimate");
  assert.match(predictionPeriodNotes({}).join(" "), /not aligned/);
});
