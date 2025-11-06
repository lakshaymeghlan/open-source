// src/routes/project.routes.js
import express from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  searchProjects,
} from "../controllers/project.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// public
router.get("/", getProjects);
router.get("/search", searchProjects);
router.get("/:id", getProjectById);

// admin / protected endpoints (you can protect create/update/delete)
router.post("/", protect, createProject);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

export default router;
