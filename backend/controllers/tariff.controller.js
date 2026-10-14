import Tariff from "../models/tariff.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";

// Stored here only as the DB's first-run default — after that, the database is the source of truth, and admin edits persist there.

export const DEFAULT_TARIFF = {
  lifelineSlabs: [
    { range: "01 - 50", rangeFrom: 1, rangeTo: 50, rate: 3.95 },
    { range: "51 - 100", rangeFrom: 51, rangeTo: 100, rate: 7.74 },
  ],
  protectedSlabs: [
    { range: "01 - 100", rangeFrom: 1, rangeTo: 100, rate: 10.54 },
    { range: "101 - 200", rangeFrom: 101, rangeTo: 200, rate: 13.01 },
  ],
  nonProtectedSlabs: [
    { range: "01 - 100", rangeFrom: 1, rangeTo: 100, rate: 22.44 },
    { range: "101 - 200", rangeFrom: 101, rangeTo: 200, rate: 28.91 },
    { range: "201 - 300", rangeFrom: 201, rangeTo: 300, rate: 33.1 },
    { range: "301 - 400", rangeFrom: 301, rangeTo: 400, rate: 36.46 },
    { range: "401 - 500", rangeFrom: 401, rangeTo: 500, rate: 38.95 },
    { range: "501 - 600", rangeFrom: 501, rangeTo: 600, rate: 40.22 },
    { range: "601 - 700", rangeFrom: 601, rangeTo: 700, rate: 41.85 },
    { range: "Above 700", rangeFrom: 701, rangeTo: null, rate: 47.2 },
  ],
  fixedCharges: [
    { load: "Up to 5 kW", charge: 500 },
    { load: "5 - 10 kW", charge: 1000 },
    { load: "10 - 15 kW", charge: 1500 },
    { load: "Above 15 kW", charge: 2000 },
  ],
  taxes: [
    { label: "GST", sub: "Sales Tax", val: "18%" },
    { label: "ED", sub: "Electricity Duty", val: "1.5%" },
    { label: "WHT", sub: "Withholding Tax", val: "Varies" },
    { label: "FPA", sub: "Fuel Price Adjustment", val: "Monthly" },
    { label: "QTA", sub: "Quarterly Tariff Adjustment", val: "Quarterly" },
  ],
  peakHours: { startHour: 18, endHour: 22, rateMultiplier: 1.25 },
};

export const getTariff = catchAsyncErrors(async (req, res, next) => {
  let tariff = await Tariff.findOne();
  if (!tariff) {
    tariff = await Tariff.create(DEFAULT_TARIFF); // first-ever call seeds the DB
  }
  res.status(200).json({ success: true, tariff });
});

// Partial update — send only the section(s) you're changing (protectedSlabs, nonProtectedSlabs, fixedCharges, and/or taxes)
export const updateTariff = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Only admins can update tariff rates", 403));
  }

  let tariff = await Tariff.findOne();
  // console.log("tariff: ", tariff);
  if (!tariff) tariff = new Tariff(DEFAULT_TARIFF);

  const editableFields = [
    "lifelineSlabs",
    "protectedSlabs",
    "nonProtectedSlabs",
    "fixedCharges",
    "taxes",
  ];
  for (const field of editableFields) {
    if (Array.isArray(req.body[field])) {
      tariff[field] = req.body[field];
    }
  }

  // peakHours is an object, not an array — handled separately with
  // its own validation (hours must be 0-23, multiplier must be positive)
  if (req.body.peakHours && typeof req.body.peakHours === "object") {
    const { startHour, endHour, rateMultiplier } = req.body.peakHours;
    const validHours =
      typeof startHour === "number" &&
      startHour >= 0 &&
      startHour <= 23 &&
      typeof endHour === "number" &&
      endHour >= 0 &&
      endHour <= 23;
    const validMultiplier =
      typeof rateMultiplier === "number" && rateMultiplier > 0;

    if (!validHours || !validMultiplier) {
      return next(new ErrorHandler("Invalid peak hours values", 400));
    }
    tariff.peakHours = { startHour, endHour, rateMultiplier };
  }

  tariff.lastUpdatedBy = req.user._id;
  await tariff.save({ validateModifiedOnly: true });

  res.status(200).json({ success: true, message: "Tariff updated", tariff });
});
