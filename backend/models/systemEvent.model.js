import mongoose from "mongoose";

const schema = new mongoose.Schema({
  code: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, enum: ["Info", "Warning", "Error"], required: true },
  message: { type: String, required: true },
  actorId: { type: String, default: null },
  subjectId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
}, { bufferCommands: false });

export default mongoose.model("SystemEvent", schema);
