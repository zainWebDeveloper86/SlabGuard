// Pure ESM shared by Node and the browser. Times are Pakistan civil time.
export const PEAK_SCHEDULE_SOURCE = "https://www.nepra.org.pk/tariff/Tariff/DISCOs/Rebasing%20Decisions/TRF-625%20MEPCO%20FOR%20DETERMINATION%20OF%20SUPPLY%20TARIFF%2007-01-2026%20255-62.PDF#page=64";
const DAY = 86400000;
const dates = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" });
export const pakistanPeakDate = (value = new Date()) => typeof value === "string" && validPeakDate(value) ? value : dates.format(value);
export function validPeakDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function shiftPeakDate(value, days) {
  const date = new Date(`${pakistanPeakDate(value)}T00:00:00Z`);
  return new Date(date.getTime() + days * DAY).toISOString().slice(0, 10);
}
export function validPeakHours(value) {
  return value && Number.isInteger(value.startHour) && Number.isInteger(value.endHour) &&
    value.startHour >= 0 && value.startHour <= 23 && value.endHour >= 0 && value.endHour <= 23 && value.startHour !== value.endHour;
}
export function mepcoSeasonalPreset() {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const startHour = [12, 1, 2].includes(month) ? 17 : [6, 7, 8].includes(month) ? 19 : 18;
    return { month, startHour, endHour: startHour + 4 };
  });
}
export function normalizePeakMonths(value) {
  if (!Array.isArray(value) || value.length !== 12) throw new Error("Provide exactly one peak window for each of the 12 months");
  const months = value.map((row) => {
    if (!row || !Number.isInteger(row.month) || row.month < 1 || row.month > 12 || !validPeakHours(row)) {
      throw new Error("Each month needs distinct whole start/end hours from 0 to 23");
    }
    return { month: row.month, startHour: row.startHour, endHour: row.endHour };
  }).sort((a, b) => a.month - b.month);
  if (new Set(months.map((row) => row.month)).size !== 12) throw new Error("Months must not be duplicated or missing");
  for (let i = 0; i < 12; i++) {
    const previous = months[(i + 11) % 12], current = months[i];
    if (previous.startHour > previous.endHour && previous.endHour > current.startHour) {
      throw new Error("Peak windows overlap across a month boundary");
    }
  }
  return months;
}
export function resolvePeakHours(config, value = new Date()) {
  const date = pakistanPeakDate(value);
  const versions = config?.peakScheduleVersions ?? [];
  if (!Array.isArray(versions)) return null;
  const version = versions.filter((row) => validPeakDate(row.effectiveFrom) && row.effectiveFrom <= date)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
  const month = Number(date.slice(5, 7));
  const window = version ? version.months?.find((row) => row.month === month) : config?.peakHours;
  if (!validPeakHours(window)) return null;
  return { startHour: window.startHour, endHour: window.endHour, effectiveFrom: version?.effectiveFrom ?? null, month };
}
export function validatePeakRevision(config, revision, today = pakistanPeakDate()) {
  if (!revision || !validPeakDate(revision.effectiveFrom) || revision.effectiveFrom < today) {
    throw new Error("A peak schedule revision must start today or on a future Pakistan date");
  }
  const normalized = { effectiveFrom: revision.effectiveFrom, months: normalizePeakMonths(revision.months) };
  const versions = [...(config.peakScheduleVersions ?? []).filter((row) => row.effectiveFrom !== normalized.effectiveFrom), normalized]
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  const candidate = { ...config, peakScheduleVersions: versions };
  for (const version of versions) {
    const previous = resolvePeakHours(candidate, shiftPeakDate(version.effectiveFrom, -1));
    const current = resolvePeakHours(candidate, version.effectiveFrom);
    if (previous && current && previous.startHour > previous.endHour && previous.endHour > current.startHour) {
      throw new Error("Peak windows overlap at a schedule revision boundary");
    }
  }
  return versions;
}
export function peakWindowsNear(config, now = new Date()) {
  const date = pakistanPeakDate(now);
  return [-1, 0, 1].flatMap((offset) => {
    const day = shiftPeakDate(date, offset);
    const window = resolvePeakHours(config, day);
    if (!window) return [];
    const start = new Date(`${day}T00:00:00+05:00`).getTime() + window.startHour * 3600000;
    const end = start + ((window.endHour - window.startHour + 24) % 24) * 3600000;
    return [{ ...window, date: day, start, end }];
  });
}
export function isScheduledPeak(config, instant) {
  const active = peakWindowsNear(config, instant).some((window) => instant.getTime() >= window.start && instant.getTime() < window.end);
  return active ? true : resolvePeakHours(config, instant) ? false : null;
}
export const formatPeakHours = (window) => {
  if (!validPeakHours(window)) return "Not configured";
  const hour = (value) => `${value % 12 || 12}:00 ${value < 12 ? "AM" : "PM"}`;
  return `${hour(window.startHour)} – ${hour(window.endHour)} PKT${window.startHour > window.endHour ? " (ends next day)" : ""}`;
};
