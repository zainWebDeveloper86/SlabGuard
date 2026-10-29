// backend/controllers/usage.controller.js
import DailyUsage from "../models/dailyUsage.model.js";
import HourlyUsage from "../models/hourlyUsage.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { pakistanDayBounds, pakistanMonthBounds, pakistanHour } from "../utils/pakistanTime.js";
import Tariff from "../models/tariff.model.js";
import { isScheduledPeak, resolvePeakHours } from "../../shared/peakSchedule.js";

// A received reading is evidence of data, not a live device heartbeat.
// Keep simulator and ESP32 evidence separate, including historical uploads.
export const getMyReadingStatus = catchAsyncErrors(async (req, res) => {
  const latest = async (source) => {
    const log = await HourlyUsage.findOne({ user: req.user._id, source })
      .sort({ updatedAt: -1, hour: -1 }).select("hour updatedAt -_id").lean();
    if (!log) return null;
    return {
      readingHour: log.hour?.toISOString() ?? null,
      receivedAt: log.updatedAt?.toISOString() ?? null,
    };
  };
  const [simulator, esp32] = await Promise.all([latest("simulator"), latest("esp32")]);
  res.status(200).json({ success: true, status: { simulator, esp32 } });
});

// This is the ONE endpoint both the simulator and the real ESP32 will
// call. The pipeline downstream (aggregation, weather, future Prophet)
// never needs to know which one sent the data.
export const addHourlyUsage = catchAsyncErrors(async (req, res, next) => {
  const { units, timestamp, source } = req.body ?? {};
  const numericUnits =
    typeof units === "number"
      ? units
      : typeof units === "string" && units.trim() !== ""
        ? Number(units)
        : NaN;

  if (!Number.isFinite(numericUnits) || numericUnits < 0) {
    return next(
      new ErrorHandler("A valid non-negative 'units' value is required", 400),
    );
  }

  if (
    timestamp !== undefined &&
    ((typeof timestamp !== "string" && typeof timestamp !== "number") ||
      (typeof timestamp === "string" && timestamp.trim() === ""))
  ) {
    return next(new ErrorHandler("A valid 'timestamp' is required when provided", 400));
  }

  if (typeof timestamp === "string") {
    // Require an explicit timezone instead of interpreting device time in
    // the backend server's timezone. Minutes-only ISO times are also valid.
    const parts = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/.exec(timestamp);
    if (!parts) {
      return next(new ErrorHandler("Timestamp must be ISO date/time with Z or a timezone offset, e.g. 2026-10-20T13:25:30+05:00", 400));
    }
    const calendarDate = new Date(`${parts[1]}T00:00:00Z`);
    // JavaScript can normalize February 30 into March. Validate the original
    // calendar date before applying an offset, which may legitimately shift it.
    if (!Number.isFinite(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== parts[1] ||
        Number(parts[2]) > 23 || Number(parts[3]) > 59 || Number(parts[4] ?? 0) > 59) {
      return next(new ErrorHandler("Timestamp must contain a real calendar date and valid time", 400));
    }
  }

  const readingTime = timestamp === undefined ? new Date() : new Date(timestamp);
  if (!Number.isFinite(readingTime.getTime())) {
    return next(new ErrorHandler("A valid 'timestamp' is required when provided", 400));
  }

  const readingSource = source === undefined ? "simulator" : source;
  if (!["simulator", "esp32"].includes(readingSource)) {
    return next(new ErrorHandler("Source must be simulator or esp32", 400));
  }

  const hour = new Date(readingTime);
  hour.setUTCMinutes(0, 0, 0); // independent of the server's timezone

  const log = await HourlyUsage.findOneAndUpdate(
    { user: req.user._id, hour },
    {
      $set: {
        user: req.user._id,
        hour,
        units: numericUnits,
        source: readingSource,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  );

  res.status(200).json({ success: true, log });
});

// export const getMyDailyUsage = catchAsyncErrors(async (req, res, next) => {
//   const DailyUsage = (await import("../models/dailyUsage.model.js")).default;
//   const days = await DailyUsage.find({ user: req.user._id })
//     .sort({ date: -1 })
//     .limit(30);
//   res.status(200).json({ success: true, days });
// });

export const getMyDailyUsage = catchAsyncErrors(async (req, res, next) => {
  const { start, end } = pakistanMonthBounds();

  // const days = await DailyUsage.find({ user: req.user._id })
  //   .sort({ date: -1 })
  //   .limit(30);
  // res.status(200).json({ success: true, days });

  const days = await DailyUsage.find({
    user: req.user._id,
    date: { $gte: start, $lt: end },
  }).sort({ date: -1 });

  res.status(200).json({ success: true, days });
});

export const getMyHourlyUsage = catchAsyncErrors(async (req, res, next) => {
  const { date } = req.query;
  let bounds;
  try {
    bounds = pakistanDayBounds(date === undefined ? new Date() : date);
  } catch {
    return next(new ErrorHandler("Date must be a valid YYYY-MM-DD Pakistan date", 400));
  }

  const hourlyLogs = await HourlyUsage.find({
    user: req.user._id,
    hour: { $gte: bounds.start, $lt: bounds.end },
  }).sort({ hour: 1 });
  const tariff = req.user.meterType === "three" ? await Tariff.findOne() : null;

  // 24 hours ka array banao (0-23)
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    units: null, // No reading received; an actual zero remains numeric 0.
    label: `${String(i).padStart(2, "0")}:00`,
    isPeak: req.user.meterType === "three" ? isScheduledPeak(tariff, new Date(bounds.start.getTime() + i * 3600000)) : false,
  }));

  hourlyLogs.forEach((log) => {
    const hourIndex = pakistanHour(log.hour);
    hourlyData[hourIndex].units = Math.round(log.units * 100) / 100;
  });

  res.status(200).json({
    success: true,
    date: bounds.date,
    peakHours: tariff ? resolvePeakHours(tariff, bounds.date) : null,
    hourlyData,
  });
});
