import express from "express";
import {
  getAdminStats,
  getAllUsersAdmin,
  toggleUserStatus,
  getRecentActivity,
} from "../controllers/admin.controller.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Every route here needs BOTH a valid login AND admin role
router.get("/stats", isAuthenticated, isAdmin, getAdminStats);
router.get("/users", isAuthenticated, isAdmin, getAllUsersAdmin);
router.patch("/users/:id/status", isAuthenticated, isAdmin, toggleUserStatus);
router.get("/activity", isAuthenticated, isAdmin, getRecentActivity);

export default router;
