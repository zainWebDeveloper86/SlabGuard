import { pakistanDate, shiftPakistanDate } from "./pakistanTime.js";
import { normalizeReadingSchedule } from "./readingSchedule.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function resolveForecastPeriod(schedule = {}, now = new Date()) {
  const today = pakistanDate(now);
  let normalized;
  try { normalized = normalizeReadingSchedule(schedule, now); }
  catch { normalized = null; }
  const scheduleKey = JSON.stringify(normalized ?? { invalid: true });
  const [year, month] = today.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const calendar = (reason) => ({
    periodType: "calendar-month", timeZone: "Asia/Karachi",
    startDate: `${today.slice(0, 7)}-01`,
    endDate: `${today.slice(0, 7)}-${String(lastDay).padStart(2, "0")}`,
    periodKey: `${MONTHS[month - 1]}${String(year).slice(-2)}`,
    scheduleKey, fallbackReason: reason,
  });
  if (!normalized) return calendar("invalid-reading-schedule");
  const { lastConfirmedReadingDate: confirmed, expectedDayFrom: from, expectedDayTo: to } = normalized;
  if (!confirmed || !from || !to) return calendar("missing-reading-schedule");

  // A confirmed reading anchors ONE monthly cycle. Never roll it forward
  // automatically: an expected visit is not proof that a reading happened.
  const [confirmedYear, confirmedMonth] = confirmed.split("-").map(Number);
  const nextMonth = new Date(Date.UTC(confirmedYear, confirmedMonth, 1));
  const prefix = nextMonth.toISOString().slice(0, 7);
  const monthDays = new Date(Date.UTC(confirmedYear, confirmedMonth + 1, 0)).getUTCDate();
  const windowStart = `${prefix}-${String(Math.min(from, monthDays)).padStart(2, "0")}`;
  const windowEnd = `${prefix}-${String(Math.min(to, monthDays)).padStart(2, "0")}`;
  if (today > windowEnd) return calendar("reading-window-passed");

  const startDate = shiftPakistanDate(confirmed, 1);
  return {
    periodType: "reading-cycle", timeZone: "Asia/Karachi",
    startDate, endDate: windowEnd,
    periodKey: `cycle:${startDate}:${windowStart}:${windowEnd}`,
    scheduleKey, lastConfirmedReadingDate: confirmed,
    expectedReadingWindow: { startDate: windowStart, endDate: windowEnd },
    endDateBasis: "expected-window-end",
    // Whole-day records cannot split energy at the reader's unknown visit time.
    dayBoundaryAssumption: "day-after-confirmed-through-full-estimated-end-day",
  };
}

export function isCurrentPrediction(prediction, schedule, now = new Date()) {
  if (!prediction) return false;
  const period = resolveForecastPeriod(schedule, now);
  const context = prediction.forecastContext;
  if (!context || context.periodKey !== period.periodKey || context.scheduleKey !== period.scheduleKey) return false;
  if (prediction.projection) {
    return prediction.projection.startDate === period.startDate &&
      prediction.projection.endDate === period.endDate &&
      prediction.projection.periodType === period.periodType;
  }
  // Monthly-history fallback stays explicitly separate from a cycle projection.
  return prediction.modelVersion === "moving-average-v1";
}
