import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendToken from "../utils/jwtToken.js";
import crypto from "crypto";
import sendMail from "../utils/sendMail.js";
import jwt from "jsonwebtoken";
import { normalizeReadingSchedule } from "../utils/readingSchedule.js";
import { normalizeWeatherLocation } from "../utils/weatherLocation.js";
import { recordSystemEvent } from "../services/systemEvents.service.js";


// =============================================
// Register a new user
// =============================================
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { username, email, password, fullName, role } = req.body;

  if (!username || !email || !password || !fullName) {
    return next(
      new ErrorHandler(
        "All fields (username, email, password, fullName) are required",
        400,
      ),
    );
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return next(new ErrorHandler("Username or email already exists", 400));
  }

  const newUser = await User.create({
    username,
    email,
    password,
    fullName,
    role: "user",
  });

  void recordSystemEvent("user.registered", { actorId: newUser._id });
  sendToken(newUser, 201, res);
});

// =============================================
// Login user
// =============================================
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { usernameOREmail, password, rememberMe } = req.body;

  if (!usernameOREmail || !password) {
    return next(
      new ErrorHandler("Username/Email and password are required", 400),
    );
  }

  const user = await User.findOne({
    $or: [{ username: usernameOREmail }, { email: usernameOREmail }],
  });

  if (!user) {
    return next(new ErrorHandler("Invalid username/email", 401));
  }

  // Check Blocks/deactivated user accounts before password check
  if (!user.isActive) {
    return next(
      new ErrorHandler(
        "This account has been deactivated. Contact support.",
        403,
      ),
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid password", 401));
  }

  sendToken(user, 200, res, { rememberMe });
});


// =============================================
// Forgot password — sends a reset link via email
// =============================================
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Please provide your email", 400));
  }

  const user = await User.findOne({ email });

  // Deliberately vague response even if the email doesn't exist —
  // prevents someone from probing which emails are registered.
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent!",
    });
  }

  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "5m",
  });

  user.resetPasswordToken = resetToken;
  user.resetPasswordTime = Date.now() + 5 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  try {
    await sendMail({
      email: user.email,
      subject: "SlabGuard — Password Reset Request",
      message: `Hello ${user.fullName},\n\nClick the link below to reset your password. This link expires in 5 minutes.\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email!",
    });
  } catch (error) {
    // Best-effort cleanup — don't leave a dangling token if the email failed
    user.resetPasswordToken = null;
    user.resetPasswordTime = null;
    await user.save();
    return next(new ErrorHandler("Failed to send reset email. Please try again.", 500));
  }
});

// =============================================
// Reset password — verifies token & sets new password
// =============================================
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.query;
  const { password, confirmPassword } = req.body;

  if (!token) {
    return next(new ErrorHandler("Reset token is missing", 400));
  }
  if (!password || !confirmPassword) {
    return next(new ErrorHandler("Please provide both password fields", 400));
  }
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }
  if (password.length < 6) {
    return next(new ErrorHandler("Password must be at least 6 characters", 400));
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordTime: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Reset link is invalid or has expired", 400));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    user.resetPasswordToken = null;
    user.resetPasswordTime = null;
    await user.save();
    return next(new ErrorHandler("Reset link is invalid or has expired", 400));
  }

  if (decoded.id !== user._id.toString()) {
    return next(new ErrorHandler("Invalid reset link", 400));
  }

  user.password = password; // pre-save hook hashes this automatically
  user.resetPasswordToken = null; // single-use — invalidated immediately
  user.resetPasswordTime = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful! You can now log in.",
  });
});

// =============================================
// Complete user application/profile
// =============================================
export const completeApplication = catchAsyncErrors(async (req, res, next) => {
  const { meterType, sanctionedLoad, unitTarget } = req.body;
  const referenceNo =
    typeof req.body.referenceNo === "string"
      ? req.body.referenceNo.trim()
      : req.body.referenceNo;
  if (!referenceNo || !meterType || sanctionedLoad === undefined) {
    return next(
      new ErrorHandler(
        "Reference number, meter type and sanctioned load are required",
        400,
      ),
    );
  }

  if (!["single", "three"].includes(meterType)) {
    return next(new ErrorHandler("Meter type must be single or three", 400));
  }

  if (Number(sanctionedLoad) < 0) {
    return next(new ErrorHandler("Sanctioned load cannot be negative", 400));
  }

  const scheduleUpdate = Object.hasOwn(req.body, "readingSchedule")
    ? { readingSchedule: normalizeReadingSchedule(req.body.readingSchedule) }
    : {};

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        referenceNo,
        meterType,
        sanctionedLoad: Number(sanctionedLoad),
        unitTarget: unitTarget !== undefined ? Number(unitTarget) : 300,
        applicationCompleted: true,
        ...scheduleUpdate,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).select("-password");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  res.status(200).json({
    success: true,
    message: "Application submitted successfully!",
    user,
  });
});

// =============================================
// Get login user
// =============================================
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({ success: true, user });
});

// =============================================
// Update basic profile (fullName + email)
// =============================================
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    return next(new ErrorHandler("Full name and email are required", 400));
  }

  const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
  if (existing) {
    return next(
      new ErrorHandler("Email is already in use by another account", 400),
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true, runValidators: true },
  ).select("-password");

  res.status(200).json({
    success: true,
    message: "Profile updated successfully!",
    user,
  });
});

// =============================================
// Update profile avatar
// =============================================
export const updateAvatar = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler("Please upload an image file", 400));
  }

  const user = await User.findById(req.user._id);

  // Best-effort cleanup of the old avatar file so uploads/ doesn't accumulate junk
  if (user.avatar) {
    const oldPath = path.join("uploads", path.basename(user.avatar));
    fs.unlink(oldPath, () => {});
  }

  user.avatar = `/uploads/${req.file.filename}`;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Avatar updated successfully!",
    user,
  });
});

// =============================================
// Change password
// =============================================
export const changePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorHandler("Current and new password are required", 400));
  }
  if (newPassword.length < 6) {
    return next(
      new ErrorHandler("New password must be at least 6 characters", 400),
    );
  }

  const user = await User.findById(req.user._id);
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return next(new ErrorHandler("Current password is incorrect", 401));
  }

  user.password = newPassword; // pre-save hook in the model auto-hashes this
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Password changed successfully!" });
});

// =============================================
// logout user
// =============================================
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out Successfully!" });
});

// =============================================
// Generate/regenerate this user's IoT device API key
// =============================================
export const regenerateDeviceKey = catchAsyncErrors(async (req, res, next) => {
  const newKey = crypto.randomBytes(24).toString("hex"); // 48-char random key

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        deviceApiKey: newKey,
      },
    },
    { new: true },
  );

  if (!user) return next(new ErrorHandler("User not found", 404));

  // Shown ONLY this one time
  // We never return deviceApiKey again in getUser() (schema has select: false).
  res.status(200).json({
    success: true,
    message:
      "Save this key now — it won't be shown again. Flash it into your ESP32 firmware.",
    deviceApiKey: newKey,
  });
});

// =============================================
// Set or clear the user's weather city (dashboard card only)
// =============================================
export const updateWeatherLocation = catchAsyncErrors(async (req, res, next) => {
  let location;
  try {
    // null = clear; anything else must pass strict PK-city validation
    location = normalizeWeatherLocation(req.body.weatherLocation ?? null);
  } catch (error) {
    return next(error);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { weatherLocation: location } },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({
    success: true,
    message: location ? "Weather location updated" : "Weather location cleared",
    user,
  });
});
