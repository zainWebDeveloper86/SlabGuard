export const PAKISTAN_TIME_ZONE = "Asia/Karachi";
const DAY_MS = 24 * 60 * 60 * 1000;
const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: PAKISTAN_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
});
const hourFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: PAKISTAN_TIME_ZONE, hour: "2-digit", hourCycle: "h23",
});

// A date-only string is a Pakistan calendar label, not a UTC instant.
export function pakistanDate(value = new Date()) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
      throw new Error("Invalid Pakistan calendar date");
    }
    return value;
  }
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new Error("Expected a valid Date or YYYY-MM-DD Pakistan date");
  }
  return dateFormatter.format(value);
}

export function pakistanDayBounds(value = new Date()) {
  const date = pakistanDate(value);
  const start = new Date(`${date}T00:00:00+05:00`);
  return { date, start, end: new Date(start.getTime() + DAY_MS) };
}

export function pakistanMonthBounds(value = new Date()) {
  const date = pakistanDate(value);
  const start = new Date(`${date.slice(0, 7)}-01T00:00:00+05:00`);
  const next = new Date(`${date.slice(0, 7)}-01T00:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  const end = new Date(`${next.toISOString().slice(0, 10)}T00:00:00+05:00`);
  return { start, end };
}

export function shiftPakistanDate(value, days) {
  const date = new Date(`${pakistanDate(value)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function pakistanHour(value) { return Number(hourFormatter.format(value)); }

export function validPeakWindow({ startHour, endHour } = {}) {
  return Number.isInteger(startHour) && startHour >= 0 && startHour <= 23 &&
    Number.isInteger(endHour) && endHour >= 0 && endHour <= 23 && startHour !== endHour;
}

export function isPakistanPeakHour(value, window) {
  if (!validPeakWindow(window)) throw new Error("Invalid peak window: use distinct whole hours from 0 to 23");
  const hour = pakistanHour(value);
  return window.startHour < window.endHour
    ? hour >= window.startHour && hour < window.endHour
    : hour >= window.startHour || hour < window.endHour;
}
