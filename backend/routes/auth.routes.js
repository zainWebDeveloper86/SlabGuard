import express from "express";
import { login, register, getMe, logout } from "../controllers/users.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me",authMiddleware, getMe); // protected
router.post("/logout", logout);

export default router;
