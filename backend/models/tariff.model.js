import mongoose from "mongoose";

const slabSchema = new mongoose.Schema(
  {
    range: { type: String, required: true }, // display label, e.g. "01 - 100"
    rangeFrom: { type: Number, required: true }, // inclusive lower bound
    rangeTo: { type: Number, default: null }, // inclusive upper bound; null = open-ended
    rate: { type: Number, required: true },
  },
  { _id: false },
);

const fixedChargeSchema = new mongoose.Schema(
  {
    load: { type: String, required: true },
    charge: { type: Number, required: true },
  },
  { _id: false },
);

const taxRowSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    sub: { type: String, required: true },
    val: { type: String, required: true },
  },
  { _id: false },
);

const peakHoursSchema = new mongoose.Schema(
  {
    startHour: { type: Number, required: true, min: 0, max: 23 }, // 24hr format, 18 = 6 PM
    endHour: { type: Number, required: true, min: 0, max: 23 }, // 22 = 10 PM
    rateMultiplier: { type: Number, required: true, default: 1.25 }, // 1.25 = 25% surcharge during peak
  },
  { _id: false },
);

const tariffSchema = new mongoose.Schema(
  {
    // singleton doc — always exactly one "current" tariff config
    lifelineSlabs: [slabSchema],
    protectedSlabs: [slabSchema],
    nonProtectedSlabs: [slabSchema],
    fixedCharges: [fixedChargeSchema],
    taxes: [taxRowSchema],
    peakHours: { type: peakHoursSchema },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("Tariff", tariffSchema);
