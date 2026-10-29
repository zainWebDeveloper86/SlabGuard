import cron from "node-cron";
import { generatePeakReminders } from "../services/peakReminder.service.js";
import { PAKISTAN_TIME_ZONE } from "../utils/pakistanTime.js";
import { recordSystemEvent } from "../services/systemEvents.service.js";

export function startPeakReminderJob({ runReminders = generatePeakReminders } = {}) {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      const result = await runReminders();
      if (result.failed) void recordSystemEvent("reminder.failed");
      if (result.created) console.log(`[Peak reminders] Created ${result.created} in-app reminder(s)`);
    } catch (error) {
      void recordSystemEvent("reminder.failed");
      console.error("[Peak reminders] Scheduler failed:", error.message);
    } finally { running = false; }
  };
  const task = cron.schedule("* * * * *", run, { timezone: PAKISTAN_TIME_ZONE, noOverlap: true });
  // A restart within the 15-minute reminder window can still deliver it.
  void run();
  return task;
}
