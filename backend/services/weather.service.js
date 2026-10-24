import axios from "axios";
import ErrorHandler from "../utils/ErrorHandler.js";
import { normalizeWeatherLocation } from "../utils/weatherLocation.js";

const DEFAULT_LAT = "30.6667";
const DEFAULT_LON = "73.1";

const lat = process.env.WEATHER_LAT || DEFAULT_LAT; // Multan, MEPCO's service area
const lon = process.env.WEATHER_LON || DEFAULT_LON;

// Dashboard-only weather. Existing temperature functions below retain their
// configured coordinates and remain independent from the user's selected city.
export function createDashboardWeatherService({ http = axios, now = () => Date.now() } = {}) {
  const cache = new Map();
  const pending = new Map();
  const cacheDuration = 10 * 60 * 1000;

  async function searchCities(query) {
    if (typeof query !== "string" || query.trim().length > 100) {
      throw new ErrorHandler("City search must contain 3 to 100 characters", 400);
    }
    const name = query.trim();
    if (name.length < 3) return [];
    const response = await http.get("https://geocoding-api.open-meteo.com/v1/search", {
      params: { name, count: 8, language: "en", format: "json", countryCode: "PK" }, timeout: 5000,
    });
    if (!response.data || typeof response.data !== "object" || Array.isArray(response.data) ||
        (response.data.results !== undefined && !Array.isArray(response.data.results))) {
      throw new ErrorHandler("Weather location search returned invalid data", 502);
    }
    return (response.data.results || []).filter((city) => city?.country_code === "PK").flatMap((city) => {
      try {
        return [normalizeWeatherLocation({
          id: city.id, name: city.name, region: city.admin1, countryCode: city.country_code,
          latitude: city.latitude, longitude: city.longitude,
        })];
      } catch { return []; }
    });
  }

  async function currentWeather(value) {
    const location = normalizeWeatherLocation(value);
    if (!location) throw new ErrorHandler("Choose your weather city first", 400);
    const key = `${location.latitude},${location.longitude}`;
    const cached = cache.get(key);
    if (cached && now() - cached.cachedAt < cacheDuration) return { ...cached.weather, location };
    if (cached) cache.delete(key);
    if (!pending.has(key)) {
      const request = (async () => {
        const response = await http.get("https://api.open-meteo.com/v1/forecast", {
          params: {
            latitude: location.latitude, longitude: location.longitude,
            current: "temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m",
            temperature_unit: "celsius", wind_speed_unit: "kmh", timezone: "Asia/Karachi", timeformat: "unixtime",
          }, timeout: 5000,
        });
        const current = response.data?.current;
        if (!current || !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.apparent_temperature) ||
            !Number.isFinite(current.relative_humidity_2m) || current.relative_humidity_2m < 0 || current.relative_humidity_2m > 100 ||
            !Number.isFinite(current.wind_speed_10m) || current.wind_speed_10m < 0 ||
            !Number.isInteger(current.weather_code) || ![0, 1].includes(current.is_day) ||
            !Number.isFinite(current.time) || !Number.isFinite(new Date(current.time * 1000).getTime())) {
          throw new ErrorHandler("Weather provider returned invalid current conditions", 502);
        }
        const weather = {
          temperatureC: current.temperature_2m, feelsLikeC: current.apparent_temperature,
          humidityPercent: current.relative_humidity_2m, windKph: current.wind_speed_10m,
          weatherCode: current.weather_code, isDay: current.is_day === 1,
          observedAt: new Date(current.time * 1000).toISOString(), fetchedAt: new Date(now()).toISOString(),
          provider: "Open-Meteo",
        };
        if (cache.size >= 100) cache.delete(cache.keys().next().value);
        cache.set(key, { weather, cachedAt: now() });
        return weather;
      })();
      pending.set(key, request);
    }
    try { return { ...await pending.get(key), location }; }
    finally { pending.delete(key); }
  }
  return { searchCities, currentWeather };
}

export const dashboardWeatherService = createDashboardWeatherService();

// export async function getCurrentTemperature() {
//   try {
//     const res = await axios.get("https://api.open-meteo.com/v1/forecast", {
//       params: { latitude: lat, longitude: lon, current: "temperature_2m" },
//       timeout: 5000,
//     });
//     return res.data.current.temperature_2m; // °C
//   } catch (error) {
//     console.error("Weather fetch failed:", error.message);
//     return null;
//   }
// }

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
