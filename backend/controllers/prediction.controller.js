import BillHistory from "../models/billHistory.model.js";
import Prediction from "../models/prediction.model.js";
import Tariff from "../models/tariff.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import {
  predictNextMonthUnits,
  predictCurrentMonthProjection,
} from "../services/predictionEngine.service.js";
import { calculateBill } from "../services/billingEngine.service.js";
import { resolveForecastPeriod, isCurrentPrediction } from "../utils/forecastPeriod.js";
import { recordSystemEvent } from "../services/systemEvents.service.js";

export const generatePrediction = catchAsyncErrors(async (req, res, next) => {
  // Tier 1: Prophet, using real daily data — a live mid-cycle projection.
  // Tier 2: moving-average fallback using monthly BillHistory — used when
  // daily data isn't available yet, or the Python service is unreachable.
  const now = new Date();
  const period = resolveForecastPeriod(req.user.readingSchedule, now);
  let forecast = await predictCurrentMonthProjection(req.user._id, now, req.user.readingSchedule);
  let targetMonth;

  if (forecast) {
    targetMonth = period.periodKey;
  } else {
    forecast = await predictNextMonthUnits(req.user._id);
    if (!forecast) {
      void recordSystemEvent("prediction.unavailable", { actorId: req.user._id });
      return next(
        new ErrorHandler(
          "Prediction unavailable. Prophet needs at least 10 complete past days (24 hourly readings per day) and a working forecasting service; the fallback needs at least 2 months of synced MEPCO history.",
          400,
        ),
      );
    }
    const latestBilled = await BillHistory.findOne({ user: req.user._id }).sort(
      {
        billDate: -1,
      },
    );
    targetMonth = latestBilled ? `after-${latestBilled.month}` : "next";
  }

  const { predictedUnits, confidence, modelVersion  } = forecast;
  const predictedBillResult = await calculateBill(req.user._id, predictedUnits);

  const tariff = await Tariff.findOne();
  const threshold = tariff?.protectedSlabs?.length
    ? tariff.protectedSlabs[tariff.protectedSlabs.length - 1].rangeTo
    : 200;

  // The core "quantify the savings" feature — real numbers from the
  // same rules engine, not invented advice.
  let savingSuggestion = null;
  if (predictedUnits > threshold) {
    const cappedBillResult = await calculateBill(req.user._id, threshold);
    const potentialSavings = Math.max(
      predictedBillResult.totalBill - cappedBillResult.totalBill,
      0,
    );
    const unitsToReduce = predictedUnits - threshold;

    savingSuggestion = {
      unitsToReduce,
      potentialSavings,
      message: `You're projected to use ${unitsToReduce} units above the ${threshold}-unit threshold for this estimate. Using that many fewer units could reduce the estimated bill by approximately Rs. ${potentialSavings}. This is a scenario, not a guaranteed saving.`,
    };
  }

  // const latestBilled = await BillHistory.findOne({ user: req.user._id }).sort({
  //   billDate: -1,
  // });
  // const targetMonth = latestBilled ? `after-${latestBilled.month}` : "next";

  const prediction = await Prediction.findOneAndUpdate(
    { user: req.user._id, month: targetMonth },
    {
      $set: {
        user: req.user._id,
        month: targetMonth,
        predictedUnits,
        predictedBill: predictedBillResult.totalBill,
        confidence,
        modelVersion,
        category: predictedBillResult.category,
        breakdown: predictedBillResult,
        savingSuggestion,
        monthsUsed: forecast.monthsUsed ?? forecast.daysUsed ?? null,
        daysUsed: forecast.daysUsed ?? null,
        projection: forecast.projection ?? null,
        forecastContext: {
          periodKey: period.periodKey, scheduleKey: period.scheduleKey,
          fallbackReason: forecast.projection ? period.fallbackReason ?? null : "daily-forecast-unavailable",
        },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  void recordSystemEvent("prediction.saved", { actorId: req.user._id });
  res.status(200).json({ success: true, prediction });
});

export const getMyPrediction = catchAsyncErrors(async (req, res, next) => {
  const prediction = await Prediction.findOne({ user: req.user._id }).sort({
    updatedAt: -1,
  });

  if (!isCurrentPrediction(prediction, req.user.readingSchedule)) {
    return res.status(200).json({ success: true, hasPrediction: false,
      message: prediction ? "Your reading schedule or forecast period changed. Generate a fresh prediction." : null });
  }
  res.status(200).json({ success: true, hasPrediction: true, prediction });
});
