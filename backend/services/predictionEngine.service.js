import BillHistory from "../models/billHistory.model.js";

import DailyUsage from "../models/dailyUsage.model.js";
import { callProphetService } from "./prophetClient.service.js";
import { resolveForecastPeriod } from "../utils/forecastPeriod.js";
import { shiftPakistanDate } from "../utils/pakistanTime.js";
import { recordSystemEvent } from "./systemEvents.service.js";

const MIN_DAILY_POINTS_FOR_PROPHET = 10;

// DailyUsage dates are interpreted in the consumer's timezone, independent
// of the server's timezone.
const pakistanDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit",
});

export async function predictCurrentMonthProjection(userId, now = new Date(), schedule = {}) {
  const today = pakistanDay.format(now);
  const period = resolveForecastPeriod(schedule, now);
  const targetDates = [];
  for (let ds = period.startDate; ds <= period.endDate; ds = shiftPakistanDate(ds, 1)) {
    targetDates.push(ds);
  }
  const allDaily = await DailyUsage.find({ user: userId }).sort({ date: 1 });

  // Today's daily aggregate can be partial. Incomplete past days are also
  // excluded from training/actual totals and estimated as whole days instead.
  const observed = new Map();
  for (const daily of allDaily) {
    if (!(daily.date instanceof Date) || !Number.isFinite(daily.date.getTime())) continue;
    const ds = pakistanDay.format(daily.date);
    if (ds >= today || daily.hoursLogged !== 24 ||
        !Number.isFinite(daily.totalUnits) || daily.totalUnits < 0) continue;
    // Ambiguous duplicate calendar dates must not silently double-count energy.
    if (observed.has(ds)) return null;
    const weekday = new Date(ds + "T00:00:00Z").getUTCDay();
    observed.set(ds, {
      ds, y: daily.totalUnits,
      temp: Number.isFinite(daily.avgTemp) ? daily.avgTemp : null,
      is_holiday: weekday === 0 || weekday === 6,
    });
  }
  if (observed.size < MIN_DAILY_POINTS_FOR_PROPHET) return null;
  const history = [...observed.values()].sort((a, b) => a.ds.localeCompare(b.ds));

  let forecastResult;
  try {
    forecastResult = await callProphetService(history, targetDates.length, {
      forecastStart: targetDates[0], forecastEnd: targetDates.at(-1),
    });
  } catch (error) {
    void recordSystemEvent("forecast.failed", { actorId: userId });
    console.error("[Prophet] Microservice call failed:", error.message);
    return null;
  }

  // Reject incomplete or incompatible responses instead of presenting a
  // short forecast as a complete period. This also detects an old Python server.
  const points = forecastResult?.forecast;
  if (!Array.isArray(points) || points.length !== targetDates.length) return null;
  const byDate = new Map();
  for (const point of points) {
    if (!targetDates.includes(point.ds) || byDate.has(point.ds) ||
        !Number.isFinite(point.yhat) || point.yhat < 0 ||
        !Number.isFinite(point.yhat_lower) || point.yhat_lower < 0 ||
        !Number.isFinite(point.yhat_upper) || point.yhat_upper < point.yhat_lower) return null;
    byDate.set(point.ds, point);
  }

  const measuredDates = targetDates.filter((ds) => observed.has(ds));
  const estimatedDates = targetDates.filter((ds) => !observed.has(ds));
  const actualUnits = measuredDates.reduce((sum, ds) => sum + observed.get(ds).y, 0);
  const estimatedPoints = estimatedDates.map((ds) => byDate.get(ds));
  const estimatedUnits = estimatedPoints.reduce((sum, point) => sum + point.yhat, 0);
  // Daily aggregates and Python estimates use two decimal places. Restore
  // that precision before whole-unit rounding so 128.50 cannot become 128
  // because floating-point addition produced 128.49999999999997.
  const totalUnits = Math.round((actualUnits + estimatedUnits) * 100) / 100;
  const predictedUnits = Math.round(totalUnits);

  // This is a heuristic uncertainty score, not a measured accuracy percentage.
  // Compare daily width with daily predicted usage so a longer horizon does
  // not automatically inflate the score.
  const avgIntervalWidth = estimatedPoints.reduce(
    (sum, point) => sum + point.yhat_upper - point.yhat_lower, 0,
  ) / estimatedPoints.length;
  const avgEstimatedUnits = estimatedUnits / estimatedPoints.length;
  const relativeUncertainty = avgEstimatedUnits > 0 ? avgIntervalWidth / avgEstimatedUnits : 1;
  const confidence = Math.max(50, Math.min(95, Math.round(95 - relativeUncertainty * 30)));

  return {
    predictedUnits, confidence, daysUsed: history.length,
    modelVersion: forecastResult.modelVersion,
    usedTemperatureRegressor: forecastResult.usedTemperatureRegressor,
    projection: {
      ...period,
      observedDays: measuredDates.length, estimatedDays: estimatedDates.length,
      estimatedPastDays: estimatedDates.filter((ds) => ds < today).length,
      forecastDays: estimatedDates.filter((ds) => ds >= today).length,
      actualUnits: Math.round(actualUnits * 100) / 100,
      estimatedUnits: Math.round(estimatedUnits * 100) / 100,
    },
  };
}

const MIN_MONTHS_REQUIRED = 2;

/**
 * MVP forecasting method — a weighted moving average over the last few
 * months, more recent months weighted higher. This is intentionally NOT
 * Meta Prophet — it's a documented placeholder (see FYP engineering
 * notes, "MVP fallback" decision) that keeps the prediction pipeline
 * architecturally correct (a distinct, cacheable step with a
 * modelVersion tag) so it can be swapped for a real Prophet microservice
 * later without touching the controller or frontend contract.
 */
export async function predictNextMonthUnits(userId) {
  const recent = await BillHistory.find({ user: userId })
    .sort({ billDate: -1 })
    .limit(6);

  if (recent.length < MIN_MONTHS_REQUIRED) {
    return null; // not enough history to say anything meaningful
  }

  const chronological = [...recent].reverse(); // oldest → newest
  const weights = chronological.map((_, i) => i + 1); // recent months weigh more
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const weightedUnits = chronological.reduce(
    (sum, entry, i) => sum + entry.units * weights[i],
    0,
  );
  const predictedUnits = Math.round(weightedUnits / weightSum);

  // Confidence reflects how consistent recent usage has actually been —
  // NOT a fabricated number. Low variance → higher confidence.
  const mean =
    chronological.reduce((s, e) => s + e.units, 0) / chronological.length;
  const variance =
    chronological.reduce((s, e) => s + (e.units - mean) ** 2, 0) /
    chronological.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? stdDev / mean : 1;

  const confidence = Math.max(
    50,
    Math.min(95, Math.round(95 - coefficientOfVariation * 100)),
  );

  return {
    predictedUnits,
    confidence,
    monthsUsed: chronological.length,
    modelVersion: "moving-average-v1",
  };
}
