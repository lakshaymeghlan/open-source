// src/controllers/project.controller.js
import asyncHandler from "express-async-handler";
import Project from "../models/project.model.js";

// GET /api/projects?tech=nodejs&difficulty=easy&page=1&limit=12
export const getProjects = asyncHandler(async (req, res) => {
  const { tech, difficulty, page = 1, limit = 12, sort = "stars" } = req.query;
  const filter = {};
  if (tech) filter.techTags = { $in: tech.split(",") };
  if (difficulty) filter.difficulty = difficulty;

  const sortObj = sort === "stars" ? { stars: -1 } : sort === "new" ? { createdAt: -1 } : { stars: -1 };

  const projects = await Project.find(filter)
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Project.countDocuments(filter);
  res.json({ projects, total, page: Number(page), limit: Number(limit) });
});

// GET /api/projects/search?q=react
export const searchProjects = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 12 } = req.query;
  if (!q) return res.status(400).json({ projects: [] });

  // basic text search: requires a text index on name, description
  const filter = { $text: { $search: q } };
  const projects = await Project.find(filter, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Project.countDocuments(filter);
  res.json({ projects, total, page: Number(page), limit: Number(limit) });
});

// GET /api/projects/:id
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json(project);
});

// POST /api/projects (create) - protected
export const createProject = asyncHandler(async (req, res) => {
  const payload = req.body;
  const proj = await Project.create(payload);
  res.status(201).json(proj);
});

// PUT /api/projects/:id - protected
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  Object.assign(project, req.body);
  await project.save();
  res.json(project);
});

// DELETE /api/projects/:id - protected
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  await project.remove();
  res.json({ message: "Project removed" });
});
