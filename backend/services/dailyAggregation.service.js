// backend/services/dailyAggregation.service.js
import HourlyUsage from "../models/hourlyUsage.model.js";
import DailyUsage from "../models/dailyUsage.model.js";
import User from "../models/user.model.js";
import Tariff from "../models/tariff.model.js";
import { getHistoricalTemperature } from "./weather.service.js";

const isWeekend = (date) => [0, 6].includes(date.getDay());

function splitByPeakHours(hourlyLogs, peakHours) {
  let peakUnits = 0;
  let offPeakUnits = 0;

  for (const log of hourlyLogs) {
    const hourOfDay = log.hour.getHours();
    const isPeak =
      hourOfDay >= peakHours.startHour && hourOfDay < peakHours.endHour;
    if (isPeak) peakUnits += log.units;
    else offPeakUnits += log.units;
  }

  return {
    peakUnits: Math.round(peakUnits * 100) / 100,
    offPeakUnits: Math.round(offPeakUnits * 100) / 100,
  };
}

// Aggregates a SPECIFIC date — used by both cron and backfill
export async function aggregateSpecificDate(targetDate) {
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const dateString = dayStart.toISOString().slice(0, 10);
  const temp = await getHistoricalTemperature(dateString);

  const tariff = await Tariff.findOne();
  const peakHours = tariff?.peakHours || { startHour: 18, endHour: 22 };

  // ✅ Fetch users with meterType too
  const users = await User.find({
    referenceNo: { $exists: true, $ne: "" },
  }).select("meterType"); // only fetch what we need

  let processed = 0;

  for (const user of users) {
    const hourlyLogs = await HourlyUsage.find({
      user: user._id,
      hour: { $gte: dayStart, $lte: dayEnd },
    });

    if (hourlyLogs.length === 0) continue;

    const totalUnits = hourlyLogs.reduce((sum, log) => sum + log.units, 0);

    // ✅ Only split by peak hours for Three-Phase users
    let peakUnits = 0;
    let offPeakUnits = 0;

    if (user.meterType === "three") {
      const split = splitByPeakHours(hourlyLogs, peakHours);
      peakUnits = split.peakUnits;
      offPeakUnits = split.offPeakUnits;
    }

    await DailyUsage.findOneAndUpdate(
      { user: user._id, date: dayStart },
      {
        user: user._id,
        date: dayStart,
        totalUnits: Math.round(totalUnits * 100) / 100,
        peakUnits,
        offPeakUnits,
        avgTemp: temp,
        isHoliday: isWeekend(dayStart),
        hoursLogged: hourlyLogs.length,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    processed++;
  }

  return processed;
}

// Now calls aggregateSpecificDate
export async function aggregateYesterdayForAllUsers() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const processed = await aggregateSpecificDate(yesterday);
  console.log(
    `[Aggregation] Processed ${processed} user(s) for ${yesterday.toDateString()}`,
  );
  return processed;
}

// Loops over a range of past days
export async function aggregateBackfillRange(days) {
  const now = new Date();
  let totalProcessed = 0;

  for (let d = days; d >= 1; d--) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - d);
    const processed = await aggregateSpecificDate(targetDate);
    console.log(
      `  Day -${d} (${targetDate.toDateString()}): ${processed} user(s)`,
    );
    totalProcessed += processed;
  }

  return totalProcessed;
}
