import { useEffect, useState } from "react";
import { LuMapPin, LuSearch } from "react-icons/lu";
import toast from "react-hot-toast";
import { axiosServerInstance } from "../../axios.js";
import { useAuth } from "../../hooks/useAuth";

export default function WeatherLocationCard() {
  const { user, login } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const current = user?.weatherLocation ?? null;

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }
    let ignore = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      setError("");
      try {
        const res = await axiosServerInstance.get("/weather/cities", { params: { q } });
        if (ignore) return;
        setResults(Array.isArray(res.data?.cities) ? res.data.cities : []);
      } catch {
        if (!ignore) {
          setResults([]);
          setError("City search failed. Please retry.");
        }
      } finally {
        if (!ignore) setSearching(false);
      }
    }, 350);
    return () => { ignore = true; clearTimeout(timer); };
  }, [query]);

  const save = async (city) => {
    setSaving(true);
    setError("");
    try {
      const res = await axiosServerInstance.patch("/user/weather-location", {
        weatherLocation: city,
      });
      if (!res.data?.success) throw new Error(res.data?.message || "Failed");
      login({ ...user, weatherLocation: res.data.user.weatherLocation });
      setQuery("");
      setResults([]);
      toast.success("Weather location updated!");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save city.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black dark:text-white flex items-center gap-2">
          <LuMapPin className="text-brand-blue" size={16} /> Weather Location
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {current ? "Saved" : "Not set"}
        </span>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Used only for the dashboard weather card. Search a Pakistani city and pick
        the correct result.
      </p>

      {current && (
        <p className="text-sm font-bold dark:text-white">
          {[current.name, current.region].filter(Boolean).join(", ")}
        </p>
      )}

      <div className="relative">
        <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city (e.g. Sahiwal)"
          maxLength={100}
          disabled={saving}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
        />
      </div>

      {query.trim().length > 0 && query.trim().length < 3 && (
        <p className="text-xs text-gray-400">Type at least 3 characters.</p>
      )}
      {searching && <p className="text-xs text-gray-400">Searching…</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {results.length > 0 && (
        <ul className="space-y-1 max-h-48 overflow-auto rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          {results.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                disabled={saving}
                onClick={() => save(city)}
                className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
              >
                {[city.name, city.region, city.country].filter(Boolean).join(", ")}
              </button>
            </li>
          ))}
        </ul>
      )}

      {saving && <p className="text-xs text-gray-400">Saving…</p>}
    </div>
  );
}