// backend/scripts/simulateIotData.js
/**
 * Simulates what the real ESP32 will eventually send — hourly usage
 * readings, POSTed to the exact same /api/usage/hourlyUsage endpoint.
 * When real hardware arrives, its firmware just needs to hit this same
 * URL — nothing downstream changes.
 *
 * Two modes:
 *   node scripts/simulateIotData.js --backfill=14   → generates 14 past days at once (for quick testing)
 *   node scripts/simulateIotData.js --live           → generates just the CURRENT hour (run this on a schedule)
 */
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";

const API_BASE = process.env.SIMULATOR_API_BASE || "http://localhost:8080/api";

function getDeviceKey() {
  if (!fs.existsSync("./.device-key.json")) {
    console.error(
      "❌ No device key found. Run: node scripts/setupDevice.js first (one time only).",
    );
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync("./.device-key.json")).deviceApiKey;
}
const DEVICE_KEY = getDeviceKey();

// Realistic-ish hourly usage curve: low at night, spikes in peak hours (6-10 PM)
function simulateHourlyUnits(hour) {
  const base = 0.3 + Math.random() * 0.3; // baseline household draw
  const isPeakHour = hour >= 18 && hour <= 22;
  const isDayHour = hour >= 9 && hour <= 17;
  const multiplier = isPeakHour ? 2.5 : isDayHour ? 1.3 : 1;
  const noise = (Math.random() - 0.5) * 0.2;
  return Math.max(0.1, Math.round((base * multiplier + noise) * 100) / 100);
}

async function sendReading(units, timestamp) {
  await axios.post(
    `${API_BASE}/usage/hourlyUsage`,
    { units, timestamp, source: "simulator" },
    { headers: { "x-device-key": DEVICE_KEY } }, // adjust if your auth uses headers instead of cookies
  );
}

async function backfill(days) {
  console.log(`Backfilling ${days} days of simulated hourly data...`);
  const now = new Date();
  let count = 0;

  for (let d = days; d >= 0; d--) {
    for (let h = 0; h < 24; h++) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - d);
      timestamp.setHours(h, 0, 0, 0);
      if (timestamp > now) continue; // don't simulate the future

      try {
        await sendReading(simulateHourlyUnits(h), timestamp.toISOString());
        count++;
      } catch (err) {
        console.error(
          `Failed at day -${d} hour ${h}:`,
          err.response?.data?.message || err.message,
        );
      }
    }
  }
  console.log(`✅ Backfilled ${count} hourly readings.`);
}

async function liveTick() {
  const now = new Date();
  const units = simulateHourlyUnits(now.getHours());
  await sendReading(units, now.toISOString());
  console.log(`✅ Sent ${units} units for hour ${now.getHours()}:00`);
}

const arg = process.argv.find(
  (a) => a.startsWith("--backfill=") || a === "--live",
);

if (arg?.startsWith("--backfill=")) {
  backfill(Number(arg.split("=")[1]));
} else if (arg === "--live") {
  liveTick();
} else {
  console.log(
    "Usage: node scripts/simulateIotData.js --backfill=14  OR  --live",
  );
}
