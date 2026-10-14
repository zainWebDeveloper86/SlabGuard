import express from "express";
import {
  sendBroadcast,
  getBroadcastHistory,
} from "../controllers/broadcast.controller.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/send", isAuthenticated, isAdmin, sendBroadcast);
router.get("/history", isAuthenticated, isAdmin, getBroadcastHistory);

export default router;
