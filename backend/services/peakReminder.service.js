import { createHash } from "node:crypto";
import Alert from "../models/alert.model.js";
import User from "../models/user.model.js";
import Tariff from "../models/tariff.model.js";
import { pakistanDate, PAKISTAN_TIME_ZONE } from "../utils/pakistanTime.js";
import { peakWindowsNear } from "../../shared/peakSchedule.js";

const LEAD_MS = 15 * 60000;
const formatTime = (date) => new Intl.DateTimeFormat("en-GB", {
  timeZone: PAKISTAN_TIME_ZONE, hour: "numeric", minute: "2-digit", hour12: true,
}).format(date);

export function upcomingPeakReminder(value, now = new Date()) {
  const config = value && (Object.hasOwn(value, "startHour")) ? { peakHours: value } : value;
  const event = peakWindowsNear(config, now).find((window) => window.start > now.getTime() && window.start - now.getTime() <= LEAD_MS);
  if (!event) return null;
  const peakStart = new Date(event.start), peakEnd = new Date(event.end);
  const date = pakistanDate(peakStart);
  return {
    date, peakStart, peakEnd,
    title: "Peak hours starting soon",
    desc: `Peak hours start at ${formatTime(peakStart)} PKT on ${date} and end at ${formatTime(peakEnd)} PKT${pakistanDate(peakEnd) !== date ? " the next day" : ""}. Shift flexible heavy loads outside this window where possible.`,
  };
}

export function peakReminderId(userId, date) {
  // MongoDB's existing unique _id makes delivery safe across ticks/restarts
  // and multiple server instances, without a new index or data migration.
  return createHash("sha256").update(`peak-reminder:${userId}:${date}`).digest("hex").slice(0, 24);
}

export async function generatePeakReminders(now = new Date()) {
  const tariff = await Tariff.findOne();
  const event = upcomingPeakReminder(tariff, now);
  if (!event) return { created: 0, failed: 0 };
  const users = await User.find({
    role: "user", isActive: true, meterType: "three", peakHourReminderEnabled: true,
  }).select("_id");
  let created = 0, failed = 0;
  for (const user of users) {
    try {
      const result = await Alert.updateOne(
        { _id: peakReminderId(user._id, event.date) },
        { $setOnInsert: {
          user: user._id, kind: "peak-reminder", source: "system", type: "warning",
          title: event.title, desc: event.desc, isRead: false, dismissedAt: null,
        } },
        { upsert: true, runValidators: true },
      );
      created += result.upsertedCount ?? 0;
    } catch (error) {
      // Another process can win an upsert race on the deterministic _id.
      if (error.code === 11000) continue;
      failed++;
      console.error(`[Peak reminders] Could not create alert for user ${user._id}:`, error.message);
    }
  }
  return { created, failed };
}
