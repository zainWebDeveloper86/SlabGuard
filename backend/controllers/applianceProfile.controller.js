// backend/controllers/applianceProfile.controller.js
import ApplianceProfile from "../models/applianceProfile.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

export const saveApplianceProfile = catchAsyncErrors(async (req, res, next) => {
  const profile = await ApplianceProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: req.body },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );
  res
    .status(200)
    .json({ success: true, message: "Appliance profile saved", profile });
});

export const getMyApplianceProfile = catchAsyncErrors(
  async (req, res, next) => {
    const profile = await ApplianceProfile.findOne({ user: req.user._id });
    res
      .status(200)
      .json({ success: true, hasProfile: !!profile, profile: profile || null });
  },
);
