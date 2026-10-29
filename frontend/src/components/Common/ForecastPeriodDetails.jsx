import { predictionPeriodNotes } from "../../utils/predictionPeriod.js";

export default function ForecastPeriodDetails({ prediction }) {
  return <div className="mt-3 text-xs space-y-1">
    {predictionPeriodNotes(prediction).map((note) => <p key={note}>{note}</p>)}
  </div>;
}
