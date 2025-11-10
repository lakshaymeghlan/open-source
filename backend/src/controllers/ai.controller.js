// src/controllers/ai.controller.js
import asyncHandler from "express-async-handler";
import Project from "../models/project.model.js";
import { fetchRepoReadme, fetchRepoContributing, fetchGoodFirstIssues } from "../services/github.service.js";
import { generateContributionGuide } from "../services/ai.service.js";

/**
 * GET /api/ai/contribution?projectId=xxxxx
 * Protected? You can keep public or protected — depends on costs / abuse risk.
 *
 * Behavior:
 * - If project.contributionGuide exists and generatedAt within TTL -> return cached
 * - Else: fetch readme/contributing/issues, call OpenAI, store in project.contributionGuide, and return.
 */
export const getContributionGuide = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json({ message: "projectId required" });

  const TTL_MS = 1000 * 60 * 60 * 24; // 24 hours cache

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  // return cached if fresh
  if (project.contributionGuide?.generatedAt) {
    const age = Date.now() - new Date(project.contributionGuide.generatedAt).getTime();
    if (age < TTL_MS && project.contributionGuide.summary) {
      return res.json({ cached: true, guide: project.contributionGuide });
    }
  }

  // determine owner/name from fullName or htmlUrl
  let owner = null, repo = null;
  if (project.fullName && project.fullName.includes("/")) {
    [owner, repo] = project.fullName.split("/");
  } else if (project.htmlUrl) {
    try {
      const parts = new URL(project.htmlUrl).pathname.split("/").filter(Boolean);
      owner = parts[0]; repo = parts[1];
    } catch (e) {}
  }

  if (!owner || !repo) {
    return res.status(400).json({ message: "Cannot determine repo owner/name for this project" });
  }

  // fetch artifacts from GitHub
  const [readme, contributing, issues] = await Promise.all([
    fetchRepoReadme(owner, repo),
    fetchRepoContributing(owner, repo),
    fetchGoodFirstIssues(owner, repo, 6)
  ]);

  // call OpenAI
  let aiResult;
  try {
    aiResult = await generateContributionGuide({ project, readme, contributing, issues });
  } catch (err) {
    console.error("AI generation failed:", err);
    return res.status(500).json({ message: "AI generation failed", error: err.message });
  }

  // store into project
  project.contributionGuide = {
    summary: aiResult.markdown,
    meta: aiResult.meta || {},
    generatedAt: new Date()
  };
  await project.save();

  res.json({ cached: false, guide: project.contributionGuide });
});
