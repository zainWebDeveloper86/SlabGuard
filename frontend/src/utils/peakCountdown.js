import { peakWindowsNear, resolvePeakHours, formatPeakHours } from "../../../shared/peakSchedule.js";

export function getPeakCountdown(value, now = new Date()) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) return null;
  const config = value && Object.hasOwn(value, "startHour") ? { peakHours: value } : value;
  if (!resolvePeakHours(config, now)) return null;
  const windows = peakWindowsNear(config, now);
  const active = windows.find((window) => window.start <= now.getTime() && window.end > now.getTime());
  const window = active ?? windows.find((window) => window.start > now.getTime());
  if (!window) return null;
  const isPeak = Boolean(active);
  const secondsRemaining = Math.ceil(((isPeak ? window.end : window.start) - now.getTime()) / 1000);
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const remainingSeconds = secondsRemaining % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return {
    isPeak, secondsRemaining,
    countdown: `${pad(hours)}h ${pad(minutes)}m ${pad(remainingSeconds)}s`,
    windowLabel: formatPeakHours(window),
  };
}
