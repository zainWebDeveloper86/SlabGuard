import BillHistory from "../models/billHistory.model.js";

// (yeh existing imports ke sath — file ke top pe)
import DailyUsage from "../models/dailyUsage.model.js";
import { callProphetService } from "./prophetClient.service.js";

const MIN_DAILY_POINTS_FOR_PROPHET = 10;

/**
 * Tier-1 prediction: uses real daily granularity (DailyUsage, fed by the
 * IoT/simulator pipeline) + the Prophet microservice to project the
 * CURRENT month's total — actual units so far + forecasted remaining days.
 * This is the "mid-cycle warning" feature from the original pitch, and
 * genuinely different from predictNextMonthUnits() below (which guesses
 * next month from monthly BillHistory only).
 *
 * Returns null if we don't have enough daily data yet or the Python
 * service is unreachable — caller should fall back to predictNextMonthUnits.
 */
export async function predictCurrentMonthProjection(userId) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const daysRemaining = daysInMonth - now.getDate();

  // Pull ALL daily history we have — Prophet benefits from more signal,
  // not just the current month's slice.
  const allDaily = await DailyUsage.find({ user: userId }).sort({ date: 1 });

  if (allDaily.length < MIN_DAILY_POINTS_FOR_PROPHET) {
    return null; // not enough daily granularity yet
  }

  const actualSoFarThisMonth = allDaily
    .filter((d) => d.date >= monthStart)
    .reduce((sum, d) => sum + d.totalUnits, 0);

  // Last day of the month — nothing left to forecast, actual IS the answer.
  if (daysRemaining <= 0) {
    return {
      predictedUnits: Math.round(actualSoFarThisMonth),
      confidence: 95,
      daysUsed: allDaily.length,
      modelVersion: "prophet-v1",
    };
  }

  const history = allDaily.map((d) => ({
    ds: d.date.toISOString().slice(0, 10),
    y: d.totalUnits,
    temp: d.avgTemp,
    is_holiday: d.isHoliday,
  }));

  let forecastResult;
  try {
    forecastResult = await callProphetService(history, daysRemaining);
  } catch (error) {
    console.error("[Prophet] Microservice call failed:", error.message);
    return null; // caller falls back to moving-average
  }

  const forecastedRemainingUnits = forecastResult.forecast.reduce(
    (sum, point) => sum + point.yhat,
    0,
  );
  const predictedUnits = Math.round(
    actualSoFarThisMonth + forecastedRemainingUnits,
  );

  // Confidence from Prophet's own uncertainty interval — narrower interval
  // (relative to the forecast size) = higher confidence. Same "don't
  // fabricate a number" principle as the moving-average model's
  // coefficient-of-variation approach.
  const avgIntervalWidth =
    forecastResult.forecast.reduce(
      (s, p) => s + (p.yhat_upper - p.yhat_lower),
      0,
    ) / forecastResult.forecast.length;
  const relativeUncertainty =
    forecastedRemainingUnits > 0
      ? avgIntervalWidth / forecastedRemainingUnits
      : 1;
  const confidence = Math.max(
    50,
    Math.min(95, Math.round(95 - relativeUncertainty * 30)),
  );

  return {
    predictedUnits,
    confidence,
    daysUsed: allDaily.length,
    modelVersion: forecastResult.modelVersion,
    usedTemperatureRegressor: forecastResult.usedTemperatureRegressor,
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
