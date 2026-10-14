import express from "express";
import { generatePrediction, getMyPrediction } from "../controllers/prediction.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", isAuthenticated, getMyPrediction);
router.post("/generate", isAuthenticated, generatePrediction);

export default router;