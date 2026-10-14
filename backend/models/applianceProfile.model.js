// backend/models/applianceProfile.model.js
import mongoose from "mongoose";

const applianceProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    acQty: { type: Number, default: 0 },
    acType: {
      type: String,
      enum: ["Inverter", "Non-Inverter"],
      default: "Inverter",
    },
    acTonnage: { type: Number, default: 1.5 },
    fridgeQty: { type: Number, default: 1 },
    ovenType: { type: String, default: "None" },
    waterPumpHours: { type: String, default: "1-2 Hours" },
    geyserType: { type: String, default: "Gas" },
    washingMachineFreq: { type: String, default: "2-3 times a week" },
    occupancy: {
      type: String,
      enum: ["Empty", "Occupied"],
      default: "Occupied",
    },
    consentToAlerts: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("ApplianceProfile", applianceProfileSchema);
