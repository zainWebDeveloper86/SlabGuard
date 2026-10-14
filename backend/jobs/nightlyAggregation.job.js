// backend/jobs/nightlyAggregation.job.js
import cron from "node-cron";
import { aggregateYesterdayForAllUsers } from "../services/dailyAggregation.service.js";

// Runs every day at 00:05 — five minutes after midnight, so "yesterday"
// is fully complete before we sum it up.
export function startNightlyAggregationJob() {
  cron.schedule("5 0 * * *", async () => {
    console.log("[Cron] Running nightly usage aggregation...");
    try {
      await aggregateYesterdayForAllUsers();
    } catch (error) {
      console.error("[Cron] Aggregation job failed:", error.message);
    }
  });
  console.log("Nightly aggregation job scheduled (00:05 daily)");
}
