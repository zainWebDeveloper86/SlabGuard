import express from "express";
import {
  getMyAlerts,
  markAlertRead,
  deleteAlert,
  clearMyAlerts,
} from "../controllers/alert.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/me", isAuthenticated, getMyAlerts);
router.patch("/:id/read", isAuthenticated, markAlertRead);
router.delete("/:id", isAuthenticated, deleteAlert);
router.delete("/", isAuthenticated, clearMyAlerts);

export default router;
