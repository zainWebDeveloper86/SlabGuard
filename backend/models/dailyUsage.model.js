// backend/models/dailyUsage.model.js
import mongoose from "mongoose";

const dailyUsageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true }, // new aggregates use Pakistan midnight; legacy dates remain readable
    totalUnits: { type: Number, required: true }, // this is Prophet's "y"
    peakUnits: { type: Number, default: 0 }, // units consumed during Tariff's peak window
    offPeakUnits: { type: Number, default: 0 }, // everything else
    avgTemp: { type: Number, default: null }, // null if weather wasn't available that day
    isHoliday: { type: Boolean, default: false },
    hoursLogged: { type: Number, required: true }, // how many hourly readings went into this — data-quality signal
  },
  { timestamps: true },
);

dailyUsageSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyUsage", dailyUsageSchema);
