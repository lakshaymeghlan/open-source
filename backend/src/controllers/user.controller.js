// src/controllers/user.controller.js
import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";

// POST /api/users/bookmarks  { projectId }
export const addBookmark = asyncHandler(async (req, res) => {
  const user = req.user;
  const { projectId } = req.body;
  if (!projectId) {
    res.status(400);
    throw new Error("projectId required");
  }

  // ensure project exists
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (!user.bookmarks.map(String).includes(String(projectId))) {
    user.bookmarks.push(projectId);
    await user.save();
  }

  const populated = await User.findById(user._id).populate("bookmarks");
  res.json({ bookmarks: populated.bookmarks });
});

// DELETE /api/users/bookmarks/:projectId
export const removeBookmark = asyncHandler(async (req, res) => {
  const user = req.user;
  const { projectId } = req.params;

  user.bookmarks = user.bookmarks.filter((b) => String(b) !== String(projectId));
  await user.save();
  const populated = await User.findById(user._id).populate("bookmarks");
  res.json({ bookmarks: populated.bookmarks });
});

// GET /api/users/me
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("bookmarks");
  res.json(user);
});

// GET /api/users/:id (public)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("bookmarks");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({
    id: user._id,
    name: user.name,
    avatar: user.avatar,
    bookmarks: user.bookmarks,
    createdAt: user.createdAt,
  });
});
