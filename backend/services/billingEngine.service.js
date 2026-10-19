import Tariff from "../models/tariff.model.js";
import BillHistory from "../models/billHistory.model.js";
import User from "../models/user.model.js";

// ============================================================
// STATUS DETERMINATION — checks Lifeline first, then Protected
// Confirmed via official NEPRA 2021 determination + PK Laws:
// - Lifeline: max of (last 12 months + current month) must be ≤100 units
// - Protected: EVERY one of the last 6 months must be ≤200 units
// - 5kW+ sanctioned load → ToU mandatory, never lifeline/protected
// ============================================================
export async function determineSlabCategory(
  userId,
  sanctionedLoadKW = 0,
  currentUnits = 0,
) {
  if (sanctionedLoadKW >= 5) return "non-protected";

  const last12 = await BillHistory.find({ user: userId })
    .sort({ billDate: -1 })
    .limit(12);
  if (last12.length >= 12) {
    const maxOfLast12 = Math.max(...last12.map((r) => r.units), currentUnits);
    if (maxOfLast12 <= 100) return "lifeline";
  }

  const recent = await BillHistory.find({ user: userId })
    .sort({ billDate: -1 })
    .limit(6);
  if (recent.length < 6) return "non-protected";

  return recent.every((r) => r.units <= 200) ? "protected" : "non-protected";
}

// ============================================================
// ENERGY CHARGE
// - Protected: telescopic (2 slabs combined) — verified vs a real bill
// - Non-Protected AND Lifeline: landing slab (whole month at one rate) —
//   confirmed by ebillpakistan: "a lifeline consumer gets no [previous
//   slab] benefit at all", same as non-protected mechanism
// ============================================================
function findConsumptionSlab(units, slabs) {
  // Slabs are ordered by increasing upper limit. Display ranges such as
  // 101-200 mean consumption above 100 through 200, including fractions.
  return (
    slabs.find((slab) => slab.rangeTo == null || units <= slab.rangeTo) ||
    slabs[slabs.length - 1]
  );
}

function calculateSlabCost(units, slabs, category) {
  if (category === "protected") {
    let remainingUnits = units;
    let cost = 0;
    let previousBoundary = 0;
    for (const slab of slabs) {
      if (remainingUnits <= 0) break;
      const tierSize =
        slab.rangeTo != null ? slab.rangeTo - previousBoundary : remainingUnits;
      const unitsInThisTier = Math.min(remainingUnits, tierSize);
      cost += unitsInThisTier * slab.rate;
      remainingUnits -= unitsInThisTier;
      previousBoundary = slab.rangeTo ?? previousBoundary;
    }
    return cost;
  }

  // non-protected AND lifeline — landing slab
  const matchedSlab = findConsumptionSlab(units, slabs);
  return units * matchedSlab.rate;
}

export async function calculateBill(userId, units, peakUnits = 0) {
  const tariff = await Tariff.findOne();
  if (!tariff) throw new Error("Tariff configuration not found");

  const user = await User.findById(userId);
  const sanctionedLoadKW = user?.sanctionedLoad || 0;

  let category = await determineSlabCategory(userId, sanctionedLoadKW, units);

  // This month's own units can still break the streak, even if trailing
  // history qualified for a subsidized category.
  if (category === "lifeline" && units > 100) category = "non-protected";
  if (category === "protected" && units > 200) category = "non-protected";

  const slabMap = {
    protected: tariff.protectedSlabs,
    "non-protected": tariff.nonProtectedSlabs,
    lifeline: tariff.lifelineSlabs,
  };
  const slabs = slabMap[category];
  const energyCost = calculateSlabCost(units, slabs, category);

  // Lifeline consumers are exempt from fixed charges AND peak surcharge —
  // confirmed exemption from official sources.
  let peakSurcharge = 0;
  if (
    category !== "lifeline" &&
    user?.meterType === "three" &&
    peakUnits > 0 &&
    tariff.peakHours
  ) {
    const marginalSlab = findConsumptionSlab(units, slabs);
    const extraRatePerUnit =
      marginalSlab.rate * (tariff.peakHours.rateMultiplier - 1);
    peakSurcharge = Math.round(peakUnits * extraRatePerUnit);
  }

  const gstRow = tariff.taxes.find((t) => t.label === "GST");
  const edRow = tariff.taxes.find((t) => t.label === "ED");
  const gstPercent = gstRow ? parseFloat(gstRow.val) : 0;
  const edPercent = edRow ? parseFloat(edRow.val) : 0;

  const gstAmount = (energyCost * gstPercent) / 100;
  const edAmount = (energyCost * edPercent) / 100;
  const totalBill = energyCost + gstAmount + edAmount + peakSurcharge;

  return {
    category,
    units,
    energyCost: Math.round(energyCost),
    peakSurcharge: Math.round(peakSurcharge),
    gstAmount: Math.round(gstAmount),
    edAmount: Math.round(edAmount),
    totalBill: Math.round(totalBill),
    // note: "Fixed charges and WHT not yet included. Protected/Lifeline mechanisms verified against a real MEPCO bill + official NEPRA sources.",
    note: "Fixed charges and WHT not yet included.",
  };
}
