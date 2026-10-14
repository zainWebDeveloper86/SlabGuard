import Alert from "../models/alert.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const getMyAlerts = catchAsyncErrors(async (req, res, next) => {
  const alerts = await Alert.find({ user: req.user._id }).sort({
    createdAt: -1, // newest first
  });
  res.status(200).json({ success: true, alerts });
});

export const markAlertRead = catchAsyncErrors(async (req, res, next) => {
  const alert = await Alert.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id }, // ensures a user can't mark someone else's alert
    { isRead: true },
    { new: true },
  );
  if (!alert) return next(new ErrorHandler("Alert not found", 404));
  res.status(200).json({ success: true, alert });
});

export const deleteAlert = catchAsyncErrors(async (req, res, next) => {
  const alert = await Alert.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!alert) return next(new ErrorHandler("Alert not found", 404));
  res.status(200).json({ success: true, message: "Alert deleted" });
});

export const clearMyAlerts = catchAsyncErrors(async (req, res, next) => {
  await Alert.deleteMany({ user: req.user._id });
  res.status(200).json({ success: true, message: "All alerts cleared" });
});
