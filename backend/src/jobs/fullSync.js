// src/jobs/fullSync.js
import cron from "node-cron";
import { fetchGitHubProjects } from "../services/github.service.js";

/**
 * Example scheduled job.
 * Runs every day at 2:30 AM server time (adjust as needed).
 * WARNING: This will use GitHub API quota.
 */
export default function startFullSyncJob() {
  // schedule: minute hour day-of-month month day-of-week
  cron.schedule("30 2 * * *", async () => {
    console.log("Scheduled full sync job started at", new Date().toISOString());
    const languages = ["javascript", "python", "java", "go", "ruby"];
    for (const lang of languages) {
      try {
        // fetch e.g., 500 repos per language, perPage 100
        await fetchGitHubProjects(lang, 500, 100, 800);
      } catch (err) {
        console.error(`Scheduled sync failed for ${lang}:`, err.message || err);
      }
    }
    console.log("Scheduled full sync job finished at", new Date().toISOString());
  });
}
