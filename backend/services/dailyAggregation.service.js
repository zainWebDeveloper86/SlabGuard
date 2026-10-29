// backend/services/dailyAggregation.service.js
import HourlyUsage from "../models/hourlyUsage.model.js";
import DailyUsage from "../models/dailyUsage.model.js";
import User from "../models/user.model.js";
import Tariff from "../models/tariff.model.js";
import { getHistoricalTemperature } from "./weather.service.js";
import { pakistanDayBounds, shiftPakistanDate } from "../utils/pakistanTime.js";
import { isScheduledPeak, resolvePeakHours } from "../../shared/peakSchedule.js";

const isWeekend = (date) => [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay());

function splitByPeakHours(hourlyLogs, tariff) {
  let peakUnits = 0;
  let offPeakUnits = 0;

  for (const log of hourlyLogs) {
    const isPeak = isScheduledPeak(tariff, log.hour);
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
  const { start: dayStart, end: dayEnd, date: dateString } = pakistanDayBounds(targetDate);
  const temp = await getHistoricalTemperature(dateString);

  const tariff = await Tariff.findOne();
  if (!resolvePeakHours(tariff, dateString)) throw new Error("Invalid peak window: no saved schedule for this date");

  // ✅ Fetch users with meterType too
  const users = await User.find({
    referenceNo: { $exists: true, $ne: "" },
  }).select("meterType"); // only fetch what we need

  let processed = 0;

  for (const user of users) {
    const hourlyLogs = await HourlyUsage.find({
      user: user._id,
      hour: { $gte: dayStart, $lt: dayEnd },
    });

    if (hourlyLogs.length === 0) continue;

    const distinctHours = new Set();
    for (const log of hourlyLogs) {
      const time = log.hour?.getTime();
      if (!Number.isFinite(time) || time < dayStart.getTime() || time >= dayEnd.getTime() ||
          time % (60 * 60 * 1000) !== 0 || !Number.isFinite(log.units) || log.units < 0) {
        throw new Error(`Invalid hourly reading for user ${user._id} on ${dateString}`);
      }
      if (distinctHours.has(time)) {
        throw new Error(`Duplicate hourly readings for user ${user._id} on ${dateString}; aggregation stopped`);
      }
      distinctHours.add(time);
    }
    const totalUnits = hourlyLogs.reduce((sum, log) => sum + log.units, 0);

    // Legacy records may use UTC midnight. Match by Pakistan calendar day,
    // preserve their date, and never silently merge ambiguous duplicates.
    const existing = await DailyUsage.find({
      user: user._id, date: { $gte: dayStart, $lt: dayEnd },
    }).limit(2);
    if (existing.length > 1) {
      throw new Error(`Duplicate daily records for user ${user._id} on ${dateString}; review required`);
    }
    const recordDate = existing[0]?.date ?? dayStart;

    // ✅ Only split by peak hours for Three-Phase users
    let peakUnits = 0;
    let offPeakUnits = 0;

    if (user.meterType === "three") {
      const split = splitByPeakHours(hourlyLogs, tariff);
      peakUnits = split.peakUnits;
      offPeakUnits = split.offPeakUnits;
    }

    await DailyUsage.findOneAndUpdate(
      existing.length ? { _id: existing[0]._id, user: user._id } : { user: user._id, date: dayStart },
      {
        user: user._id,
        date: recordDate,
        totalUnits: Math.round(totalUnits * 100) / 100,
        peakUnits,
        offPeakUnits,
        avgTemp: temp,
        isHoliday: isWeekend(dateString),
        hoursLogged: distinctHours.size,
      },
      { upsert: !existing.length, new: true, setDefaultsOnInsert: true, runValidators: true },
    );
    processed++;
  }

  return processed;
}

// Now calls aggregateSpecificDate
export async function aggregateYesterdayForAllUsers(now = new Date()) {
  const yesterday = shiftPakistanDate(now, -1);
  const processed = await aggregateSpecificDate(yesterday);
  console.log(
    `[Aggregation] Processed ${processed} user(s) for ${yesterday} (Pakistan)`,
  );
  return processed;
}

// Loops over a range of past days
export async function aggregateBackfillRange(days, now = new Date()) {
  if (!Number.isInteger(days) || days < 1) throw new Error("Backfill days must be a positive integer");
  let totalProcessed = 0;

  for (let d = days; d >= 1; d--) {
    const targetDate = shiftPakistanDate(now, -d);
    const processed = await aggregateSpecificDate(targetDate);
    console.log(
      `  Day -${d} (${targetDate}, Pakistan): ${processed} user(s)`,
    );
    totalProcessed += processed;
  }

  return totalProcessed;
}
