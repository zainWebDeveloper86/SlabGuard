import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true }, // e.g. "after-Jun26" — which upcoming period this predicts
    predictedUnits: { type: Number, required: true },
    predictedBill: { type: Number, required: true },
    confidence: { type: Number, required: true },
    modelVersion: { type: String, required: true },
    category: {
      type: String,
      enum: ["protected", "non-protected", "lifeline"],
    },
    breakdown: { type: mongoose.Schema.Types.Mixed }, // full calculateBill() output, kept for transparency
    savingSuggestion: { type: mongoose.Schema.Types.Mixed, default: null },
    monthsUsed: { type: Number },
    daysUsed: { type: Number },
    projection: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

predictionSchema.index({ user: 1, month: 1 }, { unique: true });

export default mongoose.model("Prediction", predictionSchema);
