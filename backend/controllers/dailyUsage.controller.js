// backend/controllers/usage.controller.js
import DailyUsage from "../models/dailyUsage.model.js";
import HourlyUsage from "../models/hourlyUsage.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";

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

  const readingTime = timestamp === undefined ? new Date() : new Date(timestamp);
  if (!Number.isFinite(readingTime.getTime())) {
    return next(new ErrorHandler("A valid 'timestamp' is required when provided", 400));
  }

  const readingSource = source === undefined ? "simulator" : source;
  if (!["simulator", "esp32"].includes(readingSource)) {
    return next(new ErrorHandler("Source must be simulator or esp32", 400));
  }

  const hour = new Date(readingTime);
  hour.setMinutes(0, 0, 0); // truncate to the top of the hour

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
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);

  // const days = await DailyUsage.find({ user: req.user._id })
  //   .sort({ date: -1 })
  //   .limit(30);
  // res.status(200).json({ success: true, days });

  const days = await DailyUsage.find({
    user: req.user._id,
    date: { $gte: monthStart },
  }).sort({ date: -1 });

  res.status(200).json({ success: true, days });
});

export const getMyHourlyUsage = catchAsyncErrors(async (req, res, next) => {
  const { date } = req.query;
  const targetDate = date ? new Date(date) : new Date();

  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const hourlyLogs = await HourlyUsage.find({
    user: req.user._id,
    hour: { $gte: dayStart, $lte: dayEnd },
  }).sort({ hour: 1 });

  // 24 hours ka array banao (0-23)
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    units: null, // No reading received; an actual zero remains numeric 0.
    label: `${String(i).padStart(2, "0")}:00`,
  }));

  hourlyLogs.forEach((log) => {
    const hourIndex = log.hour.getHours();
    hourlyData[hourIndex].units = Math.round(log.units * 100) / 100;
  });

  res.status(200).json({
    success: true,
    date: dayStart.toISOString().slice(0, 10),
    hourlyData,
  });
});
