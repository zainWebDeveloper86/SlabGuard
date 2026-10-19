// backend/services/prophetClient.service.js
import axios from "axios";

const PROPHET_SERVICE_URL = process.env.PROPHET_SERVICE_URL || "http://localhost:8000";

// Thin wrapper around the Python microservice — keeps the HTTP details
// (URL, timeout) in one place, not scattered across the prediction engine.
export async function callProphetService(history, daysToForecast, { forecastStart, forecastEnd } = {}) {
  const res = await axios.post(
    `${PROPHET_SERVICE_URL}/forecast`,
    {
      history, days_to_forecast: daysToForecast,
      forecast_start: forecastStart, forecast_end: forecastEnd,
    },
    // Real fitting can approach 15 seconds on the local Windows setup.
    { timeout: 60000 },
  );
  return res.data;
}
