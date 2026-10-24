import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const readingScheduleSchema = new mongoose.Schema(
  {
    lastConfirmedReadingDate: { type: String, default: null },
    expectedDayFrom: { type: Number, min: 1, max: 31, default: null },
    expectedDayTo: { type: Number, min: 1, max: 31, default: null },
  },
  { _id: false },
);

const weatherLocationSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    region: { type: String, default: "" },
    country: { type: String, default: "Pakistan" },
    countryCode: { type: String, default: "PK" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
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
    avatar: {
      type: String,
      default: null,
    },
    weatherLocation: { type: weatherLocationSchema, default: null },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordTime: {
      type: Date,
      default: null,
    },
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
      default: 200,
    },
    budgetGoal: {
      type: Number,
      default: null,
      min: 500,
      max: 50000,
      validate: {
        validator: (value) => value === null || Number.isInteger(value),
        message: "Budget goal must be whole rupees",
      },
    },
    applianceProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApplianceProfile", // separate model for appliances
    },
    applicationCompleted: {
      type: Boolean,
      default: false,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    readingSchedule: { type: readingScheduleSchema, default: () => ({}) },
    deviceApiKey: {
      type: String,
      unique: true,
      sparse: true,
      select: false, // never leaks in normal responses
    },
  },
  { timestamps: true },
);

// password modified(like update password case) or not, if not modified then just hashing password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);
export default User;
