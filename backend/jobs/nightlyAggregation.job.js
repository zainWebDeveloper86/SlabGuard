// backend/jobs/nightlyAggregation.job.js
import cron from "node-cron";
import { aggregateYesterdayForAllUsers } from "../services/dailyAggregation.service.js";
import { PAKISTAN_TIME_ZONE } from "../utils/pakistanTime.js";
import { recordSystemEvent } from "../services/systemEvents.service.js";

// Runs every day at 00:05 — five minutes after midnight, so "yesterday"
// is fully complete before we sum it up.
export function startNightlyAggregationJob() {
  cron.schedule("5 0 * * *", async () => {
    console.log("[Cron] Running nightly usage aggregation...");
    try {
      await aggregateYesterdayForAllUsers();
      void recordSystemEvent("aggregation.completed");
    } catch (error) {
      void recordSystemEvent("aggregation.failed");
      console.error("[Cron] Aggregation job failed:", error.message);
    }
  }, { timezone: PAKISTAN_TIME_ZONE, noOverlap: true });
  console.log("Nightly aggregation job scheduled (00:05 Asia/Karachi daily)");
}
