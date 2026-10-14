import mongoose from "mongoose";

const hourlyUsageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hour: { type: Date, required: true }, // truncated to the top of the hour
    units: { type: Number, required: true }, // kWh consumed in that hour
    source: {
      type: String,
      enum: ["simulator", "esp32"],
      default: "simulator",
    },
  },
  { timestamps: true },
);

// One reading per user per hour — re-sending the same hour overwrites, doesn't duplicate
hourlyUsageSchema.index({ user: 1, hour: 1 }, { unique: true });

export default mongoose.model("HourlyUsage", hourlyUsageSchema);
