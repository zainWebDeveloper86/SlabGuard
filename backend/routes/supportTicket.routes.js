import express from "express";
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicket,
} from "../controllers/supportTicket.controller.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/", isAuthenticated, createTicket);
router.get("/me", isAuthenticated, getMyTickets);
router.get("/", isAuthenticated, isAdmin, getAllTickets);
router.patch("/:id", isAuthenticated, isAdmin, updateTicket);

export default router;
