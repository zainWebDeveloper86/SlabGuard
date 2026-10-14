import Broadcast from "../models/broadcast.model.js";
import Alert from "../models/alert.model.js";
import User from "../models/user.model.js";
import BillHistory from "../models/billHistory.model.js";
import Tariff from "../models/tariff.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";

// Same threshold logic we already use in getAdminStats — keeps "who counts as protected" consistent across the whole app.
async function resolveTargetUserIds(targetAudience) {
  const allUsers = await User.find({ role: "user" }).select("_id");

  if (targetAudience === "all") {
    return allUsers.map((u) => u._id);
  }

  const tariff = await Tariff.findOne();
  const threshold = tariff?.protectedSlabs?.length
    ? tariff.protectedSlabs[tariff.protectedSlabs.length - 1].rangeTo
    : 200;

  const targetIds = [];
  for (const user of allUsers) {
    const latestBill = await BillHistory.findOne({ user: user._id }).sort({
      billDate: -1,
    });
    if (!latestBill) continue; // skip users with no billing data — can't classify them

    const isProtected = latestBill.units <= threshold;
    if (
      (targetAudience === "protected" && isProtected) ||
      (targetAudience === "non-protected" && !isProtected)
    ) {
      targetIds.push(user._id);
    }
  }
  return targetIds;
}

export const sendBroadcast = catchAsyncErrors(async (req, res, next) => {
  const { title, body, category, targetAudience } = req.body;

  if (!title || !body) {
    return next(new ErrorHandler("Title and body are required", 400));
  }

  const targetUserIds = await resolveTargetUserIds(targetAudience || "all");

  if (targetUserIds.length === 0) {
    return next(new ErrorHandler("No users match this target audience", 400));
  }

  // Creates one Alert per target user — this is what makes the broadcast actually show up on each user's Alerts page.
  await Alert.insertMany(
    targetUserIds.map((userId) => ({
      user: userId,
      type: category === "Alert" ? "warning" : "info",
      title,
      desc: body,
      source: "broadcast",
    })),
  );

  const broadcast = await Broadcast.create({
    title,
    body,
    category: category || "Update",
    targetAudience: targetAudience || "all",
    sentBy: req.user._id,
    reach: targetUserIds.length,
  });

  res.status(200).json({
    success: true,
    message: `Sent to ${targetUserIds.length} users`,
    broadcast,
  });
});

export const getBroadcastHistory = catchAsyncErrors(async (req, res, next) => {
  const history = await Broadcast.find({}).sort({ createdAt: -1 }).limit(20);
  res.status(200).json({ success: true, history });
});
