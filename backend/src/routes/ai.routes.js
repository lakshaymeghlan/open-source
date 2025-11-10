// src/routes/ai.routes.js
import express from "express";
import { getContributionGuide } from "../controllers/ai.controller.js";
// import { protect } from "../middlewares/auth.middleware.js"; // optional
const router = express.Router();

// GET /api/ai/contribution?projectId=...
router.get("/contribution", getContributionGuide);

export default router;
