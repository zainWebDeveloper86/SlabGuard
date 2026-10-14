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
  },
  { timestamps: true },
);

export default mongoose.model("Alert", alertSchema);
