import mongoose from "mongoose";

const billHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: { type: String, required: true }, // e.g. "Jul25"
    billDate: { type: Date, required: true },
    units: { type: Number, required: true },
    billAmount: { type: Number, required: true },
    paymentAmount: { type: Number, required: true },
    source: {
      type: String,
      enum: ["puppeteer", "ocr", "manual"],
      default: "puppeteer",
    },
    scrapedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Prevents duplicate rows for the same user+month when re-syncing
billHistorySchema.index({ user: 1, month: 1 }, { unique: true });

const BillHistory = mongoose.model("BillHistory", billHistorySchema);
export default BillHistory;
