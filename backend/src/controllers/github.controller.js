// src/controllers/github.controller.js
import asyncHandler from "express-async-handler";
import { fetchGitHubProjects } from "../services/github.service.js";

/**
 * Protected endpoint to trigger sync.
 * Accepts { language: "javascript" } in body. If not provided, syncs a default list.
 */
export const syncProjects = asyncHandler(async (req, res) => {
  const { language } = req.body;

  // Optionally check admin permission - for now we allow any authenticated user.
  const langs = language ? [language] : ["javascript", "python", "typescript", "go", "java"];

  for (const lang of langs) {
    // fetchGitHubProjects handles upsert
    // eslint-disable-next-line no-await-in-loop
    await fetchGitHubProjects(lang);
  }

  res.json({ message: "Sync triggered", languages: langs });
});
