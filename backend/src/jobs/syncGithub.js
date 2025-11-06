import cron from "node-cron";
import { fetchGitHubProjects } from "../services/github.service.js";

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily GitHub sync...");
  await fetchGitHubProjects("javascript");
  await fetchGitHubProjects("python");
});
