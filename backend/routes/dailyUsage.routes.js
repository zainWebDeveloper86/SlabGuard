import express from "express";
import {
  addHourlyUsage,
  getMyDailyUsage,
  getMyHourlyUsage
} from "../controllers/dailyUsage.controller.js";
import {
  isAuthenticated,
  isDeviceAuthenticated,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/hourlyUsage", isDeviceAuthenticated, addHourlyUsage);
router.get("/daily/me", isAuthenticated, getMyDailyUsage);
router.get("/hourly/me", isAuthenticated, getMyHourlyUsage);


export default router;
