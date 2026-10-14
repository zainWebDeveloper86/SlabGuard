import express from "express";
import { getTariff, updateTariff } from "../controllers/tariff.controller.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", isAuthenticated, getTariff);
router.patch("/", isAuthenticated, isAdmin, updateTariff);

export default router;
