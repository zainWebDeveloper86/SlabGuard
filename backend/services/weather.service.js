import axios from "axios";

const DEFAULT_LAT = "30.6667";
const DEFAULT_LON = "73.1";

const lat = process.env.WEATHER_LAT || DEFAULT_LAT; // Multan, MEPCO's service area
const lon = process.env.WEATHER_LON || DEFAULT_LON;

export async function getCurrentTemperature() {
  try {
    const res = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: { latitude: lat, longitude: lon, current: "temperature_2m" },
      timeout: 5000,
    });
    return res.data.current.temperature_2m; // °C
  } catch (error) {
    console.error("Weather fetch failed:", error.message);
    return null;
  }
}

// Fetches actual historical temperature for a specific past date
export async function getHistoricalTemperature(dateString) {
  // dateString format: "YYYY-MM-DD"
  try {
    const res = await axios.get(
      "https://archive-api.open-meteo.com/v1/archive",
      {
        params: {
          latitude: lat,
          longitude: lon,
          start_date: dateString,
          end_date: dateString,
          daily: "temperature_2m_mean",
          timezone: "auto",
        },
        timeout: 8000,
      },
    );
    return res.data.daily.temperature_2m_mean[0] ?? null;
  } catch (error) {
    console.error(
      `Historical weather fetch failed for ${dateString}:`,
      error.message,
    );
    return null;
  }
}
