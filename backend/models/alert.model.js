// backend/models/alert.model.js
import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["critical", "warning", "info"],
      default: "info",
    },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    source: { type: String, enum: ["system", "broadcast"], default: "system" },
    kind: { type: String, enum: ["peak-reminder"], default: undefined },
    // Retain a dismissed reminder as a delivery receipt, so the next scheduler
    // tick cannot recreate a notification the user has already deleted.
    dismissedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Alert", alertSchema);
