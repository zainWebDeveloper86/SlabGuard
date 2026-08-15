import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Account related information
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // SlabGuard specific fields
    referenceNo: {
      type: String,
      unique: true,
      sparse: true, // allows multiple nulls
      required: false, // user can add later
    },
    meterType: {
      type: String,
      enum: ["single", "three"],
      default: "single",
    },
    sanctionedLoad: {
      type: Number, // in kW – important for three-phase MDI penalty
      default: 0,
    },
    unitTarget: {
      type: Number, // user's monthly target (e.g., 300 units)
      default: 300,
    },
    applianceProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApplianceProfile", // separate model for appliances
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);
export default User;
