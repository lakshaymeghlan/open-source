import express from "express";
import { getContributionGuide, regenerateContributionGuide } from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public: anyone can read guides
router.get("/contribution", getContributionGuide);

// Protected: only logged-in users can regenerate new ones
router.post("/contribution/regenerate", protect, regenerateContributionGuide);

export default router;
