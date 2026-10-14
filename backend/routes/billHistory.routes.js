import express from "express";
import {
  syncBilling,
  getMyBillHistory,
  getBillingSummary,
} from "../controllers/billHistory.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/sync", isAuthenticated, syncBilling);
router.get("/history/me", isAuthenticated, getMyBillHistory);
router.get("/summary", isAuthenticated, getBillingSummary);
export default router;
