import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/database.js";
import { aggregateBackfillRange } from "../services/dailyAggregation.service.js";

async function run() {
  const days = Number(process.argv[2]) || 30;

  try {
    await connectDB();
    console.log(`Database connected — backfilling ${days} days of aggregation...`);
    const total = await aggregateBackfillRange(days);
    console.log(`✅ Backfill aggregation complete. ${total} daily record(s) created/updated.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Backfill aggregation failed:", error.message);
    process.exit(1);
  }
}

run();