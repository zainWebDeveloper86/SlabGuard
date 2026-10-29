import SystemEvent from "../models/systemEvent.model.js";

// Only predefined messages and account IDs are stored. Never pass request
// bodies, URLs, credentials, provider errors or stack traces into this log.
const EVENTS = {
  "user.registered": ["User", "Info", "Account registered"],
  "user.activated": ["User", "Info", "Account activated"],
  "user.deactivated": ["User", "Warning", "Account deactivated"],
  "billing.synced": ["Billing", "Info", "Billing history synced"],
  "billing.sync-failed": ["Billing", "Error", "Utility portal sync failed"],
  "tariff.updated": ["Tariff", "Info", "Tariff configuration updated"],
  "prediction.saved": ["Prediction", "Info", "Prediction generated and saved"],
  "prediction.unavailable": ["Prediction", "Warning", "Prediction unavailable; insufficient data or forecasting service unavailable"],
  "forecast.failed": ["Prediction", "Warning", "Forecasting service request failed; monthly fallback may be used"],
  "aggregation.completed": ["System", "Info", "Nightly daily-usage aggregation completed"],
  "aggregation.failed": ["System", "Error", "Nightly daily-usage aggregation failed"],
  "reminder.failed": ["System", "Error", "Peak reminder scheduler failed"],
  "server.started": ["System", "Info", "Backend started"],
  "request.failed": ["System", "Error", "Backend request failed with a server error"],
  "logs.cleaned": ["System", "Info", "Admin cleared event logs older than 30 days"],
};
const safeId = (value) => /^[a-f\d]{24}$/i.test(String(value ?? "")) ? String(value) : null;

export function createEventRecorder({ write, available = () => true }) {
  return async (code, { actorId, subjectId } = {}) => {
    if (!Object.hasOwn(EVENTS, code) || !available()) return false;
    const [category, level, message] = EVENTS[code];
    try {
      await write({ code, category, level, message, actorId: safeId(actorId), subjectId: safeId(subjectId) });
      return true;
    } catch {
      // Logging must not undo a successful operation or create log recursion.
      console.warn("[System events] Could not save an event");
      return false;
    }
  };
}

export const recordSystemEvent = createEventRecorder({
  available: () => SystemEvent.db.readyState === 1,
  write: (event) => SystemEvent.create(event),
});
