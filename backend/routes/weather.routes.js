import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { searchWeatherCities, getDashboardWeather } from "../controllers/weather.controller.js";

const router = express.Router();
router.use(isAuthenticated);
router.get("/cities", searchWeatherCities);
router.get("/current", getDashboardWeather);
export default router;
