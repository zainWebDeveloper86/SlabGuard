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

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function currentMonthLabel() {
  const now = new Date();
  return `${MONTH_ABBR[now.getMonth()]}${String(now.getFullYear()).slice(-2)}`;
}

// const MODEL_VERSION = "moving-average-v1";

export const generatePrediction = catchAsyncErrors(async (req, res, next) => {
  // Tier 1: Prophet, using real daily data — a live mid-cycle projection.
  // Tier 2: moving-average fallback using monthly BillHistory — used when
  // daily data isn't available yet, or the Python service is unreachable.
  let forecast = await predictCurrentMonthProjection(req.user._id);
  let targetMonth;

  if (forecast) {
    targetMonth = currentMonthLabel(); // e.g. "Aug26" — this cycle, live
  } else {
    forecast = await predictNextMonthUnits(req.user._id);
    if (!forecast) {
      return next(
        new ErrorHandler(
          "Not enough history yet — sync at least 2 months of MEPCO data, or let the IoT simulator collect at least 10 days.",
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
      message: `You're projected to use ${unitsToReduce} units above the ${threshold}-unit threshold. Cutting that much before month-end could save you approximately Rs. ${potentialSavings}.`,
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
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res.status(200).json({ success: true, prediction });
});

export const getMyPrediction = catchAsyncErrors(async (req, res, next) => {
  const prediction = await Prediction.findOne({ user: req.user._id }).sort({
    updatedAt: -1,
  });

  if (!prediction) {
    return res.status(200).json({ success: true, hasPrediction: false });
  }
  res.status(200).json({ success: true, hasPrediction: true, prediction });
});
