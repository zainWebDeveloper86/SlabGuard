export function getLatestReadingStatus(status) {
  if (!status) return null;

  // Prefer ESP32 data, fallback to simulator
  const reading = status.esp32 || status.simulator;
  if (!reading) return null;

  // API upload times are strings. Reject missing values before Date can
  // coerce null/false into the Unix epoch and display a misleading January date.
  if (typeof reading.receivedAt !== "string" || !reading.receivedAt.trim()) {
    return "Sync time unavailable";
  }
  const date = new Date(reading.receivedAt);
  if (!Number.isFinite(date.getTime())) return "Sync time unavailable";

  const timeString = date.toLocaleString("en-GB", {
    timeZone: "Asia/Karachi", 
    day: "2-digit", 
    month: "short",
    hour: "2-digit", 
    minute: "2-digit", 
    hourCycle: "h23",
  });

  // Return a clean single line
  return `Last synced: ${timeString} PKT`;
}
