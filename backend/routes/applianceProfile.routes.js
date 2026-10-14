// backend/routes/applianceProfile.routes.js
import express from "express";
import {
  saveApplianceProfile,
  getMyApplianceProfile,
} from "../controllers/applianceProfile.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.put("/", isAuthenticated, saveApplianceProfile);
router.get("/me", isAuthenticated, getMyApplianceProfile);

export default router;
