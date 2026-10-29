import User from "../models/user.model.js";
import BillHistory from "../models/billHistory.model.js";
import DailyUsage from "../models/dailyUsage.model.js";
import Prediction from "../models/prediction.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { fetchMepcoBill } from "../services/mepcoScraper.service.js";
import { calculateBill } from "../services/billingEngine.service.js";
import Tariff from "../models/tariff.model.js";
import { pakistanDate, pakistanMonthBounds } from "../utils/pakistanTime.js";
import { isCurrentPrediction } from "../utils/forecastPeriod.js";
import { recordSystemEvent } from "../services/systemEvents.service.js";

const MONTH_MAP = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};
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

// Converts "Jul25" → an actual Date, so MongoDB can sort chronologically
// instead of alphabetically (which puts "Jan26" before "Jul25").
function monthStringToDate(monthStr) {
  const monthIndex = MONTH_MAP[monthStr.slice(0, 3)];
  const year = 2000 + parseInt(monthStr.slice(3), 10);
  return new Date(year, monthIndex, 1);
}

// Calendar-month label for recorded dashboard usage. A saved forecast can
// cover a different period and carries its own explicit dates.
function currentMonthLabel(now = new Date()) {
  const [year, month] = pakistanDate(now).split("-");
  return `${MONTH_ABBR[Number(month) - 1]}${year.slice(-2)}`;
}

const SYNC_COOLDOWN_MS = 2 * 60 * 1000; // basic anti-abuse guard: 2 min between syncs

export const syncBilling = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user.referenceNo) {
    return next(
      new ErrorHandler(
        "Please add your MEPCO reference number in Settings before syncing.",
        400,
      ),
    );
  }

  if (
    user.lastSyncedAt &&
    Date.now() - user.lastSyncedAt.getTime() < SYNC_COOLDOWN_MS
  ) {
    const waitSeconds = Math.ceil(
      (SYNC_COOLDOWN_MS - (Date.now() - user.lastSyncedAt.getTime())) / 1000,
    );
    return next(
      new ErrorHandler(
        `Please wait ${waitSeconds}s before syncing again.`,
        429,
      ),
    );
  }

  let parsed;
  try {
    parsed = await fetchMepcoBill(user.referenceNo);
    // console.log(parsed);
  } catch (error) {
    void recordSystemEvent("billing.sync-failed", { actorId: user._id });
    return next(new ErrorHandler(`Bill sync failed: ${error.message}`, 502));
  }

  // Upsert per month so re-syncing updates existing months instead of duplicating
  const savedRecords = await Promise.all(
    parsed.billHistory.map((entry) =>
      BillHistory.findOneAndUpdate(
        { user: user._id, month: entry.month },
        {
          $set: {
            user: user._id,
            month: entry.month,
            billDate: monthStringToDate(entry.month),
            units: entry.units,
            billAmount: entry.billAmount,
            paymentAmount: entry.paymentAmount,
            source: "puppeteer",
            scrapedAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    ),
  );

  user.lastSyncedAt = new Date();
  await user.save();
  void recordSystemEvent("billing.synced", { actorId: user._id });

  res.status(200).json({
    success: true,
    message: `Synced ${savedRecords.length} months of billing history.`,
    billHistory: savedRecords,
  });
});

export const getMyBillHistory = catchAsyncErrors(async (req, res, next) => {
  const history = await BillHistory.find({ user: req.user._id }).sort({
    billDate: 1,
  });
  res.status(200).json({ success: true, billHistory: history });
});

export const getBillingSummary = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const tariff = await Tariff.findOne();

  const protectedThreshold = tariff?.protectedSlabs?.length
    ? tariff.protectedSlabs[tariff.protectedSlabs.length - 1].rangeTo
    : 200;

  // ---- 1. LAST CONFIRMED BILL — historical, from Puppeteer sync ----
  // "What MEPCO actually charged you last time." Kept for context, but
  // NEVER again presented as "your current status" — that's the whole bug
  // we're fixing here.
  const lastBilled = await BillHistory.findOne({ user: userId }).sort({
    billDate: -1,
  });

  let lastBilledSummary = null;
  if (lastBilled) {
    const calculated = await calculateBill(userId, lastBilled.units);
    lastBilledSummary = {
      month: lastBilled.month,
      actualUnits: lastBilled.units,
      actualBillAmount: lastBilled.billAmount,
      calculatedBill: calculated,
    };
  }

  // ---- 2. LIVE THIS-MONTH USAGE — from DailyUsage (IoT/simulator) ----
  // Cheap DB read, no ML call. This is what makes the dashboard actually
  // "live" — units already consumed in the CURRENT calendar month so far.
  const now = new Date();
  const { start, end } = pakistanMonthBounds(now);
  const daysThisMonth = await DailyUsage.find({
    user: userId,
    date: { $gte: start, $lt: end },
  });

  const actualUnitsSoFar =
    Math.round(daysThisMonth.reduce((sum, d) => sum + d.totalUnits, 0) * 100) /
    100;

  // sum this month's peak-hour units — only matters for Three-Phase users,
  // calculateBill() checks meterType itself before applying any surcharge
  const peakUnitsSoFar =
    Math.round(
      daysThisMonth.reduce((sum, d) => sum + (d.peakUnits || 0), 0) * 100,
    ) / 100;

  let liveCalculated = null;
  if (daysThisMonth.length > 0) {
    liveCalculated = await calculateBill(
      userId,
      actualUnitsSoFar,
      peakUnitsSoFar,
    );
  }
  // ---- 3. LATEST SAVED PREDICTION for this cycle, if one exists ----
  // READ ONLY. Prophet is only ever triggered by the "Generate" button on
  // PredictionBill.jsx — never automatically on a dashboard page load.
  const liveMonthLabel = currentMonthLabel(now);
  const savedPrediction = await Prediction.findOne({
    user: userId,
  }).sort({ updatedAt: -1 });
  const livePrediction = isCurrentPrediction(savedPrediction, req.user.readingSchedule, now) ? savedPrediction : null;

  const hasData = !!lastBilledSummary || daysThisMonth.length > 0 || !!livePrediction;

  if (!hasData) {
    return res.status(200).json({
      success: true,
      hasData: false,
      message:
        "No billing data yet — sync your MEPCO account, or run the IoT simulator, to see your dashboard.",
    });
  }

  // const calculated = await calculateBill(req.user._id, latest.units);

  // // Derived from the actual Tariff config, not hardcoded — if an admin
  // // changes the protected slab range, this automatically follows.
  // const protectedThreshold = tariff?.protectedSlabs?.length
  //   ? tariff.protectedSlabs[tariff.protectedSlabs.length - 1].rangeTo
  //   : 200; // fallback only if tariff document is somehow missing

  res.status(200).json({
    success: true,
    hasData,
    protectedThreshold,
    unitTarget: req.user.unitTarget,

    lastBilled: lastBilledSummary, // null if the user has never synced

    liveMonth: {
      monthLabel: liveMonthLabel,
      actualUnitsSoFar,
      peakUnitsSoFar,
      daysLogged: daysThisMonth.length,
      calculatedBill: liveCalculated,
      prediction: livePrediction || null,
    },
  });
});
