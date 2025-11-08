// src/controllers/github.controller.js
import asyncHandler from "express-async-handler";
import { fetchGitHubProjects } from "../services/github.service.js";

/**
 * Protected endpoint to trigger GitHub sync.
 *
 * Body:
 *  { languages: ["javascript", "python"], totalToFetch: 500, perPage: 100, delayMs: 700 }
 *
 * Loops through languages sequentially and returns results.
 */
export const syncProjects = asyncHandler(async (req, res) => {
  const { languages, language, totalToFetch = 300, perPage = 100, delayMs = 700 } = req.body;

  const langs = Array.isArray(languages) ? languages : language ? [language] : ["javascript"];
  const results = [];

  for (const lang of langs) {
    try {
      console.log(`Triggering full sync for language=${lang} totalToFetch=${totalToFetch}`);
      // eslint-disable-next-line no-await-in-loop
      const synced = await fetchGitHubProjects(lang, Number(totalToFetch), Number(perPage), Number(delayMs));
      results.push({ language: lang, status: "ok", syncedCount: synced.length });
    } catch (err) {
      console.error(`Sync error for ${lang}:`, err.message || err);
      results.push({ language: lang, status: "error", message: err.message || String(err) });
    }
  }

  res.json({ message: "Full sync finished", results });
});
