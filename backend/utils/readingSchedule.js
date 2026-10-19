import ErrorHandler from "./ErrorHandler.js";

const pakistanDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit",
});

// A supplied schedule replaces the optional fields; null/blank clears them.
// Dates are calendar strings so a timezone conversion cannot shift the day.
export function normalizeReadingSchedule(schedule, now = new Date()) {
  if (schedule === null) schedule = {};
  if (typeof schedule !== "object" || Array.isArray(schedule)) {
    throw new ErrorHandler("Reading schedule must be an object", 400);
  }

  const rawDate = schedule.lastConfirmedReadingDate;
  let lastConfirmedReadingDate = null;
  if (rawDate !== undefined && rawDate !== null && rawDate !== "") {
    if (typeof rawDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      throw new ErrorHandler("Last confirmed reading date must use YYYY-MM-DD", 400);
    }
    const parsed = new Date(rawDate + "T00:00:00Z");
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== rawDate) {
      throw new ErrorHandler("Last confirmed reading date is invalid", 400);
    }
    if (rawDate > pakistanDay.format(now)) {
      throw new ErrorHandler("Last confirmed reading date cannot be in the future", 400);
    }
    lastConfirmedReadingDate = rawDate;
  }

  const normalizeDay = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const day = typeof value === "number" ? value
      : typeof value === "string" && /^\d+$/.test(value) ? Number(value) : NaN;
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      throw new ErrorHandler("Expected reading days must be whole numbers from 1 to 31", 400);
    }
    return day;
  };
  const expectedDayFrom = normalizeDay(schedule.expectedDayFrom);
  const expectedDayTo = normalizeDay(schedule.expectedDayTo);
  if ((expectedDayFrom === null) !== (expectedDayTo === null)) {
    throw new ErrorHandler("Enter both expected reading days, or leave both blank", 400);
  }
  if (expectedDayFrom !== null && expectedDayFrom > expectedDayTo) {
    throw new ErrorHandler("Expected reading window start must not exceed its end", 400);
  }
  return { lastConfirmedReadingDate, expectedDayFrom, expectedDayTo };
}
