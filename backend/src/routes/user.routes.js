// src/routes/user.routes.js
import express from "express";
import {
  addBookmark,
  removeBookmark,
  getProfile,
  getUserById,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// profile for logged-in user
router.get("/me", protect, getProfile);

// bookmark endpoints
router.post("/bookmarks", protect, addBookmark);
router.delete("/bookmarks/:projectId", protect, removeBookmark);

// public user profile
router.get("/:id", getUserById);

export default router;
