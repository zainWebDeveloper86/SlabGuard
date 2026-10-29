import assert from "node:assert/strict";
import test from "node:test";
import axios from "axios";
import User from "../models/user.model.js";
import { createDashboardWeatherService, dashboardWeatherService, getHistoricalTemperature } from "../services/weather.service.js";
import { normalizeWeatherLocation } from "../utils/weatherLocation.js";
import { getUser, updateWeatherLocation } from "../controllers/user.controller.js";
import { getDashboardWeather, searchWeatherCities } from "../controllers/weather.controller.js";
import userRouter from "../routes/user.routes.js";
import weatherRouter from "../routes/weather.routes.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const city = { id: 1166548, name: "Sahiwal", region: "Punjab", country: "Pakistan", countryCode: "PK", latitude: 30.67, longitude: 73.1 };
const current = {
  temperature_2m: 0, apparent_temperature: -2, relative_humidity_2m: 65,
  wind_speed_10m: 4, weather_code: 0, is_day: 0, time: 1792713600,
};

test("city search filters Pakistan, returns region labels and avoids short searches", async () => {
  const calls = [];
  const service = createDashboardWeatherService({ http: { get: async (url, options) => {
    calls.push({ url, options });
    return { data: { results: [
      { id: city.id, name: city.name, admin1: "Punjab", country_code: "PK", latitude: city.latitude, longitude: city.longitude },
      { id: 2, name: "Other", country_code: "US", latitude: 1, longitude: 1 },
      { id: 3, name: "Missing coordinates", country_code: "PK" },
    ] } };
  } } });
  assert.deepEqual(await service.searchCities("Sa"), []);
  assert.equal(calls.length, 0);
  assert.deepEqual(await service.searchCities(" Sahiwal "), [city]);
  assert.equal(calls[0].options.params.countryCode, "PK");
  assert.equal(calls[0].options.timeout, 5000);
});

test("no city results and malformed search responses", async () => {
  const empty = createDashboardWeatherService({ http: { get: async () => ({ data: {} }) } });
  assert.deepEqual(await empty.searchCities("Unknown"), []);
  for (const data of [null, "invalid", [], { results: null }]) {
    const bad = createDashboardWeatherService({ http: { get: async () => ({ data }) } });
    await assert.rejects(bad.searchCities("Sahiwal"), (error) => error.statusCode === 502);
  }
});

test("current weather preserves zero temperature, night and timestamp", async () => {
  const service = createDashboardWeatherService({ http: { get: async (_url, options) => {
    assert.equal(options.params.timezone, "Asia/Karachi");
    assert.equal(options.params.temperature_unit, "celsius");
    assert.equal(options.params.wind_speed_unit, "kmh");
    assert.equal(options.timeout, 5000);
    return { data: { current } };
  } } });
  const result = await service.currentWeather(city);
  assert.equal(result.temperatureC, 0);
  assert.equal(result.feelsLikeC, -2);
  assert.equal(result.isDay, false);
  assert.equal(result.weatherCode, 0);
  assert.equal(result.observedAt, new Date(current.time * 1000).toISOString());
  assert.deepEqual(result.location, city);
});

test("weather cache expires at ten minutes and keeps each city's label", async () => {
  let clock = Date.UTC(2026, 9, 23), calls = 0;
  const service = createDashboardWeatherService({ now: () => clock, http: { get: async () => { calls++; return { data: { current } }; } } });
  await service.currentWeather(city);
  clock += 599999;
  assert.equal((await service.currentWeather({ ...city, name: "Another label" })).location.name, "Another label");
  assert.equal(calls, 1);
  clock++;
  await service.currentWeather(city);
  assert.equal(calls, 2);
  await service.currentWeather({ ...city, id: 2, latitude: 31 });
  assert.equal(calls, 3);
});

test("simultaneous requests for the same coordinates share one provider call", async () => {
  let finish, calls = 0;
  const gate = new Promise((resolve) => { finish = resolve; });
  const service = createDashboardWeatherService({ http: { get: async () => { calls++; await gate; return { data: { current } }; } } });
  const a = service.currentWeather(city);
  const b = service.currentWeather(city);
  finish();
  assert.equal((await a).temperatureC, 0);
  assert.equal((await b).temperatureC, 0);
  assert.equal(calls, 1);
});

for (const [field, value] of [
  ["temperature_2m", null], ["apparent_temperature", "warm"], ["relative_humidity_2m", 101],
  ["wind_speed_10m", -1], ["is_day", 2], ["weather_code", "rain"], ["time", "bad"],
]) {
  test(`invalid provider ${field} is not cached`, async () => {
    let calls = 0;
    const service = createDashboardWeatherService({ http: { get: async () => {
      calls++; return { data: { current: calls === 1 ? { ...current, [field]: value } : current } };
    } } });
    await assert.rejects(service.currentWeather(city), (error) => error.statusCode === 502);
    assert.equal((await service.currentWeather(city)).temperatureC, 0);
    assert.equal(calls, 2);
  });
}

test("timeout does not poison the cache and a retry can recover", async () => {
  let calls = 0;
  const service = createDashboardWeatherService({ http: { get: async () => {
    if (++calls === 1) throw new Error("timeout");
    return { data: { current } };
  } } });
  await assert.rejects(service.currentWeather(city), /timeout/);
  assert.equal((await service.currentWeather(city)).temperatureC, 0);
});

for (const value of [undefined, [], { ...city, latitude: "30" }, { ...city, latitude: 91 },
  { ...city, longitude: 181 }, { ...city, countryCode: "US" }, { ...city, name: " " }, { ...city, id: -1 }]) {
  test(`invalid selected location ${JSON.stringify(value)} is rejected`, () => {
    assert.throws(() => normalizeWeatherLocation(value), (error) => error.statusCode === 400);
  });
}

function invoke(handler, id = "a", body = {}, query = {}, weatherLocation = city) {
  return new Promise((resolve) => {
    const res = { status(code) { this.code = code; return this; }, json(data) { resolve({ status: this.code, data }); } };
    handler({ user: { _id: id, weatherLocation }, body, query }, res, (error) => resolve({ error }));
  });
}

test("city saves, reloads and stays separate per account; null clears selection", async (t) => {
  const accounts = new Map([["a", { weatherLocation: null }], ["b", { weatherLocation: null }]]);
  t.mock.method(User, "findByIdAndUpdate", (id, update, options) => ({ select: async () => {
    assert.equal(options.runValidators, true);
    const value = { ...accounts.get(id), ...update.$set }; accounts.set(id, value); return value;
  } }));
  t.mock.method(User, "findById", (id) => ({ select: async () => accounts.get(id) }));
  assert.equal((await invoke(updateWeatherLocation, "a", { weatherLocation: city })).status, 200);
  assert.deepEqual((await invoke(getUser, "a")).data.user.weatherLocation, city);
  assert.equal((await invoke(getUser, "b")).data.user.weatherLocation, null);
  await invoke(updateWeatherLocation, "a", { weatherLocation: null });
  assert.equal((await invoke(getUser, "a")).data.user.weatherLocation, null);
});

test("invalid save performs no write; missing account returns 404", async (t) => {
  const write = t.mock.method(User, "findByIdAndUpdate", () => ({ select: async () => null }));
  for (const value of [{}, [], "Sahiwal", { ...city, countryCode: "US" }]) {
    assert.equal((await invoke(updateWeatherLocation, "a", { weatherLocation: value })).error.statusCode, 400);
  }
  assert.equal(write.mock.callCount(), 0);
  assert.equal((await invoke(updateWeatherLocation, "missing", { weatherLocation: city })).error.statusCode, 404);
});

test("explicit null and an omitted city field both clear the location in the current controller", async (t) => {
  const writes = [];
  t.mock.method(User, "findByIdAndUpdate", (id, update) => ({ select: async () => {
    writes.push({ id, location: update.$set.weatherLocation });
    return { _id: id, ...update.$set };
  } }));
  for (const body of [{ weatherLocation: null }, {}]) {
    const result = await invoke(updateWeatherLocation, "a", body);
    assert.equal(result.status, 200);
    assert.equal(result.data.success, true);
    assert.equal(result.data.user.weatherLocation, null);
  }
  assert.deepEqual(writes, [{ id: "a", location: null }, { id: "a", location: null }]);
});

test("provider failures return useful 503 responses", async (t) => {
  t.mock.method(dashboardWeatherService, "currentWeather", async () => { throw new Error("timeout"); });
  t.mock.method(dashboardWeatherService, "searchCities", async () => { throw new Error("offline"); });
  assert.equal((await invoke(getDashboardWeather)).error.statusCode, 503);
  assert.equal((await invoke(searchWeatherCities, "a", {}, { q: "Sahiwal" })).error.statusCode, 503);
});

test("no selected city is a clear 400 and old accounts start unset", async () => {
  assert.equal((await invoke(getDashboardWeather, "a", {}, {}, null)).error.statusCode, 400);
  assert.equal(User.hydrate({ fullName: "Test" }).weatherLocation, null);
});

test("new endpoints retain authentication middleware", () => {
  assert.equal(weatherRouter.stack[0].handle, isAuthenticated);
  for (const path of ["/budget-goal", "/weather-location"]) {
    const route = userRouter.stack.find((layer) => layer.route?.path === path).route;
    assert.equal(route.stack[0].handle, isAuthenticated);
  }
  const locationRoute = userRouter.stack.find((layer) => layer.route?.path === "/weather-location").route;
  assert.equal(locationRoute.stack.at(-1).handle, updateWeatherLocation);
});

test("historical temperature helper keeps its API contract", async (t) => {
  const calls = [];
  t.mock.method(axios, "get", async (url, options) => {
    calls.push({ url, options });
    return { data: { daily: { temperature_2m_mean: [27] } } };
  });
  assert.equal(await getHistoricalTemperature("2026-10-20"), 27);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://archive-api.open-meteo.com/v1/archive");
  assert.equal(calls[0].options.params.start_date, "2026-10-20");
  assert.equal(calls[0].options.params.end_date, "2026-10-20");
  assert.equal(calls[0].options.timeout, 8000);
});
