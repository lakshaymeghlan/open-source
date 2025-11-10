// src/controllers/ai.controller.js
import asyncHandler from "express-async-handler";
import Project from "../models/project.model.js";
import ContributionGuide from "../models/contributionGuide.model.js";
import { fetchRepoReadme, fetchRepoContributing, fetchGoodFirstIssues } from "../services/github.service.js";
import { generateContributionGuide } from "../services/ai.service.js";

const TTL_MS = 1000 * 60 * 60 * 24; // 24 hours cache

export const getContributionGuide = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json({ message: "projectId required" });

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  // If cached & fresh, return cached
  const existing = await ContributionGuide.findOne({ projectId });
  if (existing && existing.generatedAt && (Date.now() - new Date(existing.generatedAt).getTime()) < TTL_MS) {
    return res.json({ cached: true, guide: existing });
  }

  // derive owner/repo
  let owner = project.owner, repo = project.name;
  if ((!owner || !repo) && project.fullName) {
    const parts = project.fullName.split("/");
    owner = owner || parts[0];
    repo = repo || parts[1];
  }
  if (!owner || !repo) return res.status(400).json({ message: "Cannot determine repo owner/name" });

  // fetch artifacts
  const [readme, contributing, issues] = await Promise.all([
    fetchRepoReadme(owner, repo),
    fetchRepoContributing(owner, repo),
    fetchGoodFirstIssues(owner, repo, 6),
  ]);

  // generate via DeepSeek service
  let aiResult;
  try {
    aiResult = await generateContributionGuide({ project, readme, contributing, issues });
  } catch (err) {
    console.error("AI generation failed:", err);
    return res.status(500).json({ message: "AI generation failed", error: err.message });
  }

  // upsert into ContributionGuide collection
  const upserted = await ContributionGuide.findOneAndUpdate(
    { projectId },
    {
      projectId,
      summary: aiResult.markdown,
      meta: aiResult.meta || {},
      generatedAt: new Date(),
      cached: true,
    },
    { upsert: true, new: true }
  );

  res.json({ cached: false, guide: upserted });
});

export const regenerateContributionGuide = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).json({ message: "projectId required" });

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  // same logic to determine owner/repo and fetch artifacts
  let owner = project.owner, repo = project.name;
  if ((!owner || !repo) && project.fullName) {
    const parts = project.fullName.split("/");
    owner = owner || parts[0];
    repo = repo || parts[1];
  }
  if (!owner || !repo) return res.status(400).json({ message: "Cannot determine repo owner/name" });

  const [readme, contributing, issues] = await Promise.all([
    fetchRepoReadme(owner, repo),
    fetchRepoContributing(owner, repo),
    fetchGoodFirstIssues(owner, repo, 8),
  ]);

  let aiResult;
  try {
    aiResult = await generateContributionGuide({ project, readme, contributing, issues });
  } catch (err) {
    console.error("AI regenerate failed:", err);
    return res.status(500).json({ message: "AI regeneration failed", error: err.message });
  }

  const upserted = await ContributionGuide.findOneAndUpdate(
    { projectId },
    {
      projectId,
      summary: aiResult.markdown,
      meta: aiResult.meta || {},
      generatedAt: new Date(),
      cached: false,
    },
    { upsert: true, new: true }
  );

  res.json({ regenerated: true, guide: upserted });
});
