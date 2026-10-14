// backend/scripts/resetTariff.js
import dotenv from "dotenv";
dotenv.config();
import connectDB from "../config/database.js";
import Tariff from "../models/tariff.model.js";

async function run() {
  try {
    await connectDB();
    const result = await Tariff.deleteMany({});
    console.log(`Deleted ${result.deletedCount} old tariff document(s).`);
    console.log(
      "Next GET /api/tariff call will auto-reseed with the current DEFAULT_TARIFF (rangeFrom/rangeTo included).",
    );
    process.exit(0);
  } catch (error) {
    console.error("Reset failed:", error.message);
    process.exit(1);
  }
}

run();
