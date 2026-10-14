// backend/services/prophetClient.service.js
import axios from "axios";

const PROPHET_SERVICE_URL = process.env.PROPHET_SERVICE_URL || "http://localhost:8000";

// Thin wrapper around the Python microservice — keeps the HTTP details
// (URL, timeout) in one place, not scattered across the prediction engine.
export async function callProphetService(history, daysToForecast) {
  const res = await axios.post(
    `${PROPHET_SERVICE_URL}/forecast`,
    { history, days_to_forecast: daysToForecast },
    { timeout: 15000 },
  );
  return res.data;
}