export function predictionPeriodLabel(prediction) {
  if (prediction?.projection?.periodType === "reading-cycle") return "Estimated Reading-Cycle Bill";
  if (prediction?.projection?.periodType === "calendar-month") return "Estimated Calendar-Month Bill";
  return "Monthly History Estimate";
}

export function predictionPeriodNotes(prediction) {
  const period = prediction?.projection;
  if (!period) return ["Monthly-history fallback; this estimate is not aligned to your meter-reading cycle."];
  const notes = [`${period.startDate} to ${period.endDate} (Pakistan time).`];
  if (period.periodType === "reading-cycle") {
    notes.push(`Last confirmed reading: ${period.lastConfirmedReadingDate}. Expected next visit: ${period.expectedReadingWindow.startDate} to ${period.expectedReadingWindow.endDate}.`);
    notes.push("Estimate uses the last day of that window; the next reading date is not confirmed.");
    notes.push("Whole-day approximation: excludes the confirmed reading day and includes the full estimated end day. The reader's actual visit time can change the result.");
  } else if (period.fallbackReason === "reading-window-passed") {
    notes.push("Your expected reading window has passed. Update the confirmed reading date in Settings after the reader visits. Calendar-month fallback is shown meanwhile.");
  } else {
    notes.push("Calendar-month fallback. Add a confirmed reading date and expected reading window in Settings for a cycle estimate.");
  }
  return notes;
}
