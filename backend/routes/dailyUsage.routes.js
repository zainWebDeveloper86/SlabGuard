import express from "express";
import {
  addHourlyUsage,
  getMyDailyUsage,
  getMyHourlyUsage,
  getMyReadingStatus,
} from "../controllers/dailyUsage.controller.js";
import {
  isAuthenticated,
  isDeviceAuthenticated,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/hourlyUsage", isDeviceAuthenticated, addHourlyUsage);
router.get("/daily/me", isAuthenticated, getMyDailyUsage);
router.get("/hourly/me", isAuthenticated, getMyHourlyUsage);
router.get("/status/me", isAuthenticated, getMyReadingStatus);


export default router;
