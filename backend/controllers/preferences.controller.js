import User from "../models/user.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
// import { normalizeWeatherLocation } from "../utils/weatherLocation.js";

export const updatePeakReminder = catchAsyncErrors(async (req, res, next) => {
  const enabled = req.body?.enabled;
  if (typeof enabled !== "boolean") return next(new ErrorHandler("Enabled must be true or false", 400));
  if (enabled && req.user.meterType !== "three") {
    return next(new ErrorHandler("Peak-hour reminders are available for three-phase accounts", 400));
  }
  const user = await User.findByIdAndUpdate(
    req.user._id, { $set: { peakHourReminderEnabled: enabled } }, { new: true, runValidators: true },
  ).select("-password -resetPasswordToken -resetPasswordTime");
  if (!user) return next(new ErrorHandler("User not found", 404));
  res.status(200).json({ success: true, user });
});

export const updateBudgetGoal = catchAsyncErrors(async (req, res, next) => {
  const value = req.body?.budgetGoal;
  if (value !== null && (typeof value !== "number" || !Number.isInteger(value) || value < 500 || value > 50000)) {
    return next(new ErrorHandler("Budget goal must be whole rupees from Rs. 500 to Rs. 50,000, or null to clear", 400));
  }
  const user = await User.findByIdAndUpdate(
    req.user._id, { $set: { budgetGoal: value } }, { new: true, runValidators: true },
  ).select("-password -resetPasswordToken -resetPasswordTime");
  if (!user) return next(new ErrorHandler("User not found", 404));
  res.status(200).json({ success: true, user });
});

// export const updateWeatherLocation = catchAsyncErrors(async (req, res, next) => {
//   const weatherLocation = normalizeWeatherLocation(req.body?.weatherLocation);
//   const user = await User.findByIdAndUpdate(
//     req.user._id, { $set: { weatherLocation } }, { new: true, runValidators: true },
//   ).select("-password -resetPasswordToken -resetPasswordTime");
//   if (!user) return next(new ErrorHandler("User not found", 404));
//   res.status(200).json({ success: true, user });
// });
