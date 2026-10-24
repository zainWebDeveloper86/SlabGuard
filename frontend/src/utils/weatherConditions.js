// Open-Meteo WMO weather codes. Icons change with conditions and day/night.
export function describeWeather(code, isDay) {
  if (code === 0) return { label: "Clear sky", icon: isDay ? "sun" : "moon" };
  if (code === 1) return { label: "Mainly clear", icon: isDay ? "partlyDay" : "partlyNight" };
  if (code === 2) return { label: "Partly cloudy", icon: isDay ? "partlyDay" : "partlyNight" };
  if (code === 3) return { label: "Overcast", icon: "cloud" };
  if ([45, 48].includes(code)) return { label: "Fog", icon: "fog" };
  if ([51, 53, 55].includes(code)) return { label: "Drizzle", icon: "drizzle" };
  if ([56, 57].includes(code)) return { label: "Freezing drizzle", icon: "mixed" };
  if ([61, 63, 65].includes(code)) return { label: "Rain", icon: "rain" };
  if ([66, 67].includes(code)) return { label: "Freezing rain", icon: "mixed" };
  if ([71, 73, 75, 77].includes(code)) return { label: "Snow", icon: "snow" };
  if ([80, 81, 82].includes(code)) return { label: "Rain showers", icon: "rain" };
  if ([85, 86].includes(code)) return { label: "Snow showers", icon: "snow" };
  if (code === 95) return { label: "Thunderstorm", icon: "storm" };
  if ([96, 99].includes(code)) return { label: "Thunderstorm with hail", icon: "storm" };
  return { label: "Unknown conditions", icon: "unknown" };
}
