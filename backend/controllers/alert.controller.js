import Alert from "../models/alert.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const getMyAlerts = catchAsyncErrors(async (req, res, next) => {
  const alerts = await Alert.find({ user: req.user._id, dismissedAt: null }).sort({
    createdAt: -1, // newest first
  });
  res.status(200).json({ success: true, alerts });
});

export const markAlertRead = catchAsyncErrors(async (req, res, next) => {
  const alert = await Alert.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, dismissedAt: null }, // only this user's visible alert
    { isRead: true },
    { new: true },
  );
  if (!alert) return next(new ErrorHandler("Alert not found", 404));
  res.status(200).json({ success: true, alert });
});

export const deleteAlert = catchAsyncErrors(async (req, res, next) => {
  const reminder = await Alert.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, kind: "peak-reminder", dismissedAt: null },
    { $set: { dismissedAt: new Date() } }, { new: true },
  );
  if (reminder) return res.status(200).json({ success: true, message: "Alert deleted" });
  const alert = await Alert.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
    kind: { $ne: "peak-reminder" },
  });
  if (!alert) return next(new ErrorHandler("Alert not found", 404));
  res.status(200).json({ success: true, message: "Alert deleted" });
});

export const clearMyAlerts = catchAsyncErrors(async (req, res, next) => {
  await Alert.updateMany(
    { user: req.user._id, kind: "peak-reminder", dismissedAt: null },
    { $set: { dismissedAt: new Date() } },
  );
  await Alert.deleteMany({ user: req.user._id, kind: { $ne: "peak-reminder" } });
  res.status(200).json({ success: true, message: "All alerts cleared" });
});
