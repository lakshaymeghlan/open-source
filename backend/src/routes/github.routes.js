// src/routes/github.routes.js
import express from "express";
import { syncProjects } from "../controllers/github.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Trigger a sync (protected; for admin - simple protection now)
router.post("/sync", protect, syncProjects);

export default router;
