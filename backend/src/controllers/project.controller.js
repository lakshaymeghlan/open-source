// src/controllers/project.controller.js
import asyncHandler from "express-async-handler";
import Project from "../models/project.model.js";

/**
 * Helper: escape regex special characters for safe regex building
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/projects?tech=nodejs&difficulty=easy&page=1&limit=12
export const getProjects = asyncHandler(async (req, res) => {
  const { tech, difficulty, page = 1, limit = 12, sort = "stars" } = req.query;
  const filter = {};

  // Normalize pagination inputs
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 12);

  // Tech filter: support comma-separated, case-insensitive matching against techTags, topics or fullName
  if (tech) {
    const requested = tech
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (requested.length > 0) {
      filter.$or = [
        { techTags: { $in: requested } },
        { topics: { $in: requested } },
        { fullName: { $regex: requested.map(escapeRegex).join("|"), $options: "i" } },
      ];
    }
  }

  if (difficulty) {
    // allow case-insensitive difficulty matching too
    filter.difficulty = typeof difficulty === "string" ? difficulty.toLowerCase() : difficulty;
  }

  const sortObj =
    sort === "stars" ? { stars: -1 } : sort === "new" ? { createdAt: -1 } : { stars: -1 };

  const projects = await Project.find(filter)
    .sort(sortObj)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const total = await Project.countDocuments(filter);
  res.json({ projects, total, page: pageNum, limit: limitNum });
});

// GET /api/projects/search?q=react
export const searchProjects = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 12 } = req.query;
  if (!q) return res.status(400).json({ projects: [] });

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 12);

  // basic text search: requires a text index on name, description, fullName, topics
  const filter = { $text: { $search: q } };
  const projects = await Project.find(filter, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const total = await Project.countDocuments(filter);
  res.json({ projects, total, page: pageNum, limit: limitNum });
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
