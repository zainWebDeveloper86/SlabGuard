import mongoose from "mongoose";
import User from "../models/user.model.js";
import BillHistory from "../models/billHistory.model.js";
import Prediction from "../models/prediction.model.js";
import HourlyUsage from "../models/hourlyUsage.model.js";
import SystemEvent from "../models/systemEvent.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { isCurrentPrediction } from "../utils/forecastPeriod.js";
import { checkProphetHealth } from "../services/prophetClient.service.js";
import { recordSystemEvent } from "../services/systemEvents.service.js";

export const ADMIN_USER_FIELDS = "fullName username email role referenceNo meterType sanctionedLoad isActive createdAt lastSyncedAt unitTarget budgetGoal readingSchedule";

export const getUserDetail = catchAsyncErrors(async (req, res, next) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) return next(new ErrorHandler("Invalid user ID", 400));
  const user = await User.findById(req.params.id).select(ADMIN_USER_FIELDS).lean();
  if (!user) return next(new ErrorHandler("User not found", 404));
  const reading = (source) => HourlyUsage.findOne({ user: user._id, source })
    .sort({ hour: -1 }).select("hour updatedAt source -_id").lean();
  const [bills, savedPrediction, simulator, esp32] = await Promise.all([
    BillHistory.find({ user: user._id }).sort({ billDate: -1 }).limit(6).select("month units billAmount billDate -_id").lean(),
    Prediction.findOne({ user: user._id }).sort({ updatedAt: -1 })
      .select("predictedUnits predictedBill modelVersion projection forecastContext updatedAt").lean(),
    reading("simulator"), reading("esp32"),
  ]);
  res.status(200).json({ success: true, detail: {
    user, bills, prediction: isCurrentPrediction(savedPrediction, user.readingSchedule) ? savedPrediction : null,
    readings: { simulator, esp32 },
  } });
});

const CATEGORIES = ["System", "User", "Billing", "Tariff", "Prediction"];
export function eventLogFilter(query = {}) {
  const filter = {};
  if (query.category && query.category !== "All") {
    if (!CATEGORIES.includes(query.category)) throw new ErrorHandler("Invalid event category", 400);
    filter.category = query.category;
  }
  if (query.q !== undefined) {
    if (typeof query.q !== "string" || query.q.length > 100) throw new ErrorHandler("Search must be at most 100 characters", 400);
    const text = query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (text) filter.$or = ["message", "code", "actorId", "subjectId"].map((field) => ({ [field]: { $regex: text, $options: "i" } }));
  }
  return filter;
}
export const getSystemEvents = catchAsyncErrors(async (req, res) => {
  const filter = eventLogFilter(req.query);
  const page = Number(req.query.page ?? 1);
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) throw new ErrorHandler("Invalid page number", 400);
  const limit = 50;
  const [logs, total] = await Promise.all([
    SystemEvent.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    SystemEvent.countDocuments(filter),
  ]);
  res.status(200).json({ success: true, logs, total, page, pageSize: limit });
});

export const clearOldSystemEvents = catchAsyncErrors(async (req, res) => {
  const cutoff = new Date(Date.now() - 30 * 86400000);
  const result = await SystemEvent.deleteMany({ createdAt: { $lt: cutoff } });
  void recordSystemEvent("logs.cleaned", { actorId: req.user._id });
  res.status(200).json({ success: true, deletedCount: result.deletedCount, cutoff });
});

export async function readSystemHealth({ connection = mongoose.connection, prophet = checkProphetHealth, clock = Date.now } = {}) {
  let database = { status: "unavailable", latencyMs: null };
  if (connection.readyState === 1 && connection.db) {
    const start = clock();
    try {
      await connection.db.admin().ping({ timeoutMS: 2000 });
      database = { status: "reachable", latencyMs: Math.max(0, clock() - start) };
    } catch { /* Return unavailable; never expose connection/error details. */ }
  }
  return { server: "responding", database, prophet: await prophet(), checkedAt: new Date(clock()).toISOString() };
}
export const getSystemHealth = catchAsyncErrors(async (_req, res) => {
  res.status(200).json({ success: true, health: await readSystemHealth() });
});
