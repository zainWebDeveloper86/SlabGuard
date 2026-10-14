// backend/models/broadcast.model.js
import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    category: { type: String, default: "Update" },
    targetAudience: {
      type: String,
      enum: ["all", "protected", "non-protected"],
      default: "all",
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reach: { type: Number, required: true }, // how many users actually received it
  },
  { timestamps: true },
);

export default mongoose.model("Broadcast", broadcastSchema);
