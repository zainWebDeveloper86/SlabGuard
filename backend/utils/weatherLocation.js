import ErrorHandler from "./ErrorHandler.js";

export function normalizeWeatherLocation(value) {
  if (value === null) return null;
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      !Number.isInteger(value.id) || value.id <= 0 || value.countryCode !== "PK" ||
      typeof value.name !== "string" || !value.name.trim() || value.name.length > 100 ||
      (value.region !== undefined && (typeof value.region !== "string" || value.region.length > 100)) ||
      !Number.isFinite(value.latitude) || Math.abs(value.latitude) > 90 ||
      !Number.isFinite(value.longitude) || Math.abs(value.longitude) > 180) {
    throw new ErrorHandler("Select a valid Pakistani city from the search results", 400);
  }
  return {
    id: value.id, name: value.name.trim(), region: value.region?.trim() || "",
    country: "Pakistan", countryCode: "PK", latitude: value.latitude, longitude: value.longitude,
  };
}
