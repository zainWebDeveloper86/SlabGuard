// backend/models/supportTicket.model.js
import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["Open", "In-Progress", "Resolved"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    adminReply: { type: String, default: null },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("SupportTicket", supportTicketSchema);
