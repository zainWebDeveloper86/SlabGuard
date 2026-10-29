import User from "../models/user.model.js";
import BillHistory from "../models/billHistory.model.js";
import Tariff from "../models/tariff.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { ADMIN_USER_FIELDS } from "./adminMonitoring.controller.js";
import { recordSystemEvent } from "../services/systemEvents.service.js";

// Fine for our current user count, can be optimized later once we're comfortable with aggregation.

// export const getAdminStats = catchAsyncErrors(async (req, res, next) => {
//   const allUsers = await User.find({});

//   let linkedCount = 0;
//   let totalBill = 0;
//   let billCount = 0;
//   let protectedCount = 0;
//   let nonProtectedCount = 0;

//   // Simple threshold — matches the "≤200 units" rule shown on TariffGuide.
//   // (Not the rolling-6-month rule yet — that needs the prediction engine,
//   // which isn't built. This is a single-latest-month snapshot only.)
//   const PROTECTED_THRESHOLD = 200;

//   for (const user of allUsers) {
//     if (user.referenceNo) linkedCount++;

//     const latestBill = await BillHistory.findOne({ user: user._id }).sort({
//       billDate: -1,
//     });
//     if (latestBill) {
//       totalBill += latestBill.billAmount;
//       billCount++;
//       if (latestBill.units <= PROTECTED_THRESHOLD) protectedCount++;
//       else nonProtectedCount++;
//     }
//   }

//   res.status(200).json({
//     success: true,
//     stats: {
//       totalUsers: allUsers.length,
//       linkedUsers: linkedCount, // users who've added a MEPCO reference number
//       avgLatestBill: billCount > 0 ? Math.round(totalBill / billCount) : 0,
//       slabDistribution: {
//         protected: protectedCount,
//         nonProtected: nonProtectedCount,
//       },
//     },
//   });
// });

export const getAdminStats = catchAsyncErrors(async (req, res, next) => {
  const allUsers = await User.find({});
  const tariff = await Tariff.findOne();

  // Derived from Tariff, not hardcoded — matches the principle we already used in billing.controller.js's getBillingSummary()
  const PROTECTED_THRESHOLD = tariff?.protectedSlabs?.length
    ? tariff.protectedSlabs[tariff.protectedSlabs.length - 1].rangeTo
    : 200; // fallback only if Tariff doc is somehow missing

  let linkedCount = 0;
  let totalBill = 0;
  let billCount = 0;
  let protectedCount = 0;
  let nonProtectedCount = 0;

  for (const user of allUsers) {
    if (user.referenceNo) linkedCount++;

    const latestBill = await BillHistory.findOne({ user: user._id }).sort({
      billDate: -1,
    });
    if (latestBill) {
      totalBill += latestBill.billAmount;
      billCount++;
      if (latestBill.units <= PROTECTED_THRESHOLD) protectedCount++;
      else nonProtectedCount++;
    }
  }

  res.status(200).json({
    success: true,
    stats: {
      totalUsers: allUsers.length,
      linkedUsers: linkedCount,
      avgLatestBill: billCount > 0 ? Math.round(totalBill / billCount) : 0,
      slabDistribution: {
        protected: protectedCount,
        nonProtected: nonProtectedCount,
      },
    },
  });
});

export const getAllUsersAdmin = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({}).select(ADMIN_USER_FIELDS).sort({ createdAt: -1 });
  res.status(200).json({ success: true, users });
});

export const toggleUserStatus = catchAsyncErrors(async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return next(
      new ErrorHandler("You cannot deactivate your own account", 400),
    );
  }
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  user.isActive = !user.isActive;
  await user.save();
  void recordSystemEvent(user.isActive ? "user.activated" : "user.deactivated", { actorId: req.user._id, subjectId: user._id });

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? "activated" : "deactivated"}`,
    user: Object.fromEntries(["_id", ...ADMIN_USER_FIELDS.split(" ")].map((key) => [key, user[key]])),
  });
});

// A simple, honest "recent activity" feed built from data we actually
// have — new signups, bill syncs, and tariff edits. No fake OCR/Security
// events (those subsystems don't exist yet).
export const getRecentActivity = catchAsyncErrors(async (req, res, next) => {
  const adminID = req.user.id;
  const recentSignups = await User.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select("fullName email createdAt");

  const recentSyncs = await User.find({ lastSyncedAt: { $ne: null } })
    .sort({ lastSyncedAt: -1 })
    .limit(5)
    .select("fullName email lastSyncedAt");

  const tariff = await Tariff.findOne().populate("lastUpdatedBy", "fullName");

  const events = [];

  recentSignups.forEach((u) => {
    events.push({
      type: "User",
      event: `New user registration: ${u.fullName}`,
      actor: u.email,
      time: u.createdAt,
    });
  });

  recentSyncs.forEach((u) => {
    events.push({
      type: "Billing",
      event: `MEPCO bill synced for ${u.fullName}`,
      actor: u.email,
      time: u.lastSyncedAt,
    });
  });

  if (tariff?.lastUpdatedBy) {
    events.push({
      type: "Tariff",
      event: "Tariff rates updated",
      actor: tariff.lastUpdatedBy.id === adminID ? "Admin": tariff.lastUpdatedBy.fullName,
      time: tariff.updatedAt,
    });
  }

  // Newest first, top 10 overall
  events.sort((a, b) => new Date(b.time) - new Date(a.time));

  res.status(200).json({ success: true, activity: events.slice(0, 10) });
});
