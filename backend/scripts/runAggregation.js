import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/database.js";
import { aggregateYesterdayForAllUsers } from "../services/dailyAggregation.service.js";

async function run() {
  try {
    await connectDB();
    console.log("Database connected");
    await aggregateYesterdayForAllUsers();
    console.log("✅ Aggregation completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Aggregation failed:", error.message);
    process.exit(1);
  }
}

run();
