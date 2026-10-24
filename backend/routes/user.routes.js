import express from "express";
import {
  registerUser,
  loginUser,
  getUser,
  logoutUser,
  completeApplication,
  updateProfile,
  changePassword,
  updateAvatar,
  regenerateDeviceKey,
  forgotPassword,
  resetPassword,
  updateWeatherLocation 
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import upload from "../multer.js";
import { updateBudgetGoal } from "../controllers/preferences.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password", resetPassword); // token comes from query string
router.get("/me", isAuthenticated, getUser);
router.patch("/application", isAuthenticated, completeApplication);
router.post("/logout", logoutUser);

router.patch("/profile", isAuthenticated, updateProfile);
router.patch("/budget-goal", isAuthenticated, updateBudgetGoal);
router.patch("/weather-location", isAuthenticated, updateWeatherLocation);
router.patch("/avatar", isAuthenticated, upload.single("avatar"), updateAvatar);
router.patch("/change-password", isAuthenticated, changePassword);

router.post("/device-key/regenerate", isAuthenticated, regenerateDeviceKey);

export default router;
