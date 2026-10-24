import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  WiDaySunny, WiNightClear, WiDayCloudy, WiNightAltCloudy, WiCloudy,
  WiFog, WiSprinkle, WiRain, WiRainMix, WiSnow, WiThunderstorm, WiNa,
} from "react-icons/wi";
import { LuMapPin, LuRefreshCw } from "react-icons/lu";
import { useAuth } from "../../hooks/useAuth";
import { axiosServerInstance } from "../../axios.js";
import { describeWeather } from "../../utils/weatherConditions";

const icons = {
  sun: WiDaySunny, moon: WiNightClear, partlyDay: WiDayCloudy,
  partlyNight: WiNightAltCloudy, cloud: WiCloudy, fog: WiFog,
  drizzle: WiSprinkle, rain: WiRain, mixed: WiRainMix, snow: WiSnow,
  storm: WiThunderstorm, unknown: WiNa,
};

export default function DashboardWeather() {
  const { user } = useAuth();
  const savedLocation = user?.weatherLocation ?? null;
  const locationKey = savedLocation
    ? `${savedLocation.id}:${savedLocation.latitude}:${savedLocation.longitude}`
    : "";

  const [state, setState] = useState({
    key: "",
    data: null,
    loading: false,
    error: "",
  });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!locationKey) return;

    let ignore = false;
    let inFlight = false;

    const load = async () => {
      if (inFlight) return;
      inFlight = true;
      setState((prev) => ({
        key: locationKey,
        data: prev.key === locationKey ? prev.data : null,
        loading: true,
        error: "",
      }));
      try {
        const res = await axiosServerInstance.get("/weather/current");
        if (ignore) return;
        if (!res.data?.success || !res.data.weather) {
          throw new Error("Weather unavailable");
        }
        setState({ key: locationKey, data: res.data.weather, loading: false, error: "" });
      } catch {
        if (!ignore) {
          setState((prev) => ({
            key: locationKey,
            data: prev.key === locationKey ? prev.data : null,
            loading: false,
            error: "Weather unavailable",
          }));
        }
      } finally {
        inFlight = false;
      }
    };

    load();
    return () => { ignore = true; };
  }, [locationKey, retry]);

  // No city chosen yet → small prompt, dashboard layout intact
  if (!savedLocation) {
    return (
      <div className="flex flex-col lg:items-end lg:px-6">
        <Link
          to="/settings"
          className="flex flex-row items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-brand-blue transition"
        >
          <LuMapPin size={14} />
          Set your city
        </Link>
      </div>
    );
  }

  const current = state.key === locationKey ? state : { data: null, loading: true, error: "" };
  const weather = current.data;

  if (weather) {
    const condition = describeWeather(weather.weatherCode, weather.isDay);
    const Icon = icons[condition.icon] ?? icons.unknown;
    const cityName = weather.location?.name || savedLocation.name;

    return (
      <div className="flex flex-col lg:items-end lg:px-6">
        <div className="flex flex-row items-center">
          <Icon size={56} className="text-brand-blue" aria-hidden="true" />
          <p className="text-2xl font-black text-gray-900 dark:text-white">
            {Math.round(weather.temperatureC)}°C
          </p>
        </div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1 max-lg:pl-2">
          <LuMapPin size={12} />
          {cityName}
          {current.loading && <span className="opacity-60">· updating…</span>}
        </p>
      </div>
    );
  }

  // Loading / failed state — keep same footprint
  return (
    <div className="flex flex-col lg:items-end lg:px-6">
      <div className="flex flex-row items-center gap-2">
        <WiNa size={56} className="text-gray-300 dark:text-gray-600" aria-hidden="true" />
        <p className="text-2xl font-black text-gray-300 dark:text-gray-600">—°C</p>
      </div>
      <p className="text-xs font-bold text-gray-400 flex items-center gap-1 max-lg:pl-2">
        <LuMapPin size={12} />
        {savedLocation.name}
        {current.loading ? (
          <span className="opacity-60">· loading…</span>
        ) : (
          <button
            type="button"
            onClick={() => setRetry((v) => v + 1)}
            className="ml-1 inline-flex items-center gap-1 underline cursor-pointer"
          >
            <LuRefreshCw size={10} /> retry
          </button>
        )}
      </p>
    </div>
  );
}