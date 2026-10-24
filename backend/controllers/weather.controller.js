import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { dashboardWeatherService } from "../services/weather.service.js";

export const searchWeatherCities = catchAsyncErrors(async (req, res, next) => {
  try {
    const cities = await dashboardWeatherService.searchCities(req.query.q ?? "");
    res.status(200).json({ success: true, cities });
  } catch (error) {
    next(error instanceof ErrorHandler ? error : new ErrorHandler("City search is temporarily unavailable. Please retry.", 503));
  }
});

export const getDashboardWeather = catchAsyncErrors(async (req, res, next) => {
  try {
    const weather = await dashboardWeatherService.currentWeather(req.user.weatherLocation ?? null);
    res.status(200).json({ success: true, weather });
  } catch (error) {
    next(error instanceof ErrorHandler ? error : new ErrorHandler("Weather is temporarily unavailable. Please retry.", 503));
  }
});
