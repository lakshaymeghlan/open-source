// src/services/github.service.js
import axios from "axios";
import dotenv from "dotenv";
import Project from "../models/project.model.js";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const BASE_URL = "https://api.github.com";
const DEFAULT_HEADERS = {
  Accept: "application/vnd.github+json",
  Authorization: GITHUB_TOKEN ? `Bearer ${GITHUB_TOKEN}` : undefined,
};

// Utility: simple delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * ------------------------------------------------------
 * MAIN FUNCTION: Fetch GitHub repositories for a language
 * ------------------------------------------------------
 * @param {string} language - e.g., "javascript"
 * @param {number} totalToFetch - Total number of repos to fetch (default 300)
 * @param {number} perPage - Per page (default 100)
 * @param {number} delayMs - Delay between requests (default 700ms)
 * @returns {Promise<Array>} Array of synced projects
 */
export async function fetchGitHubProjects(language, totalToFetch = 300, perPage = 100, delayMs = 700) {
  const allProjects = [];
  const totalPages = Math.ceil(totalToFetch / perPage);

  console.log(`🔁 Starting GitHub sync for ${language} (${totalPages} pages)`);

  for (let page = 1; page <= totalPages; page++) {
    const query = `language:${encodeURIComponent(language)}+stars:>100`;
    const url = `${BASE_URL}/search/repositories?q=${query}&sort=stars&order=desc&per_page=${perPage}&page=${page}`;

    try {
      console.log(`📦 Fetching page ${page}/${totalPages} for ${language}`);
      const res = await axios.get(url, { headers: DEFAULT_HEADERS });
      const repos = res.data?.items || [];

      for (const repo of repos) {
        const stars = repo.stargazers_count;
        const forks = repo.forks_count;
        const issues = repo.open_issues_count;

        // Balanced difficulty logic
        let difficulty = "easy";
        if (stars > 20000 || forks > 3000) difficulty = "hard";
        else if (stars > 5000 || forks > 1000) difficulty = "medium";

        const data = {
          githubId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          htmlUrl: repo.html_url,
          description: repo.description || "",
          avatar: repo.owner?.avatar_url || "",
          stars,
          forks,
          openIssues: issues,
          techTags: [language.toLowerCase()],
          topics: repo.topics || [],
          difficulty,
          lastSyncedAt: new Date(),
        };

        await Project.findOneAndUpdate({ githubId: repo.id }, { $set: data }, { upsert: true });
        allProjects.push(data);
      }

      // Avoid rate limits
      if (page < totalPages) await sleep(delayMs);
    } catch (err) {
      console.error(`❌ Error fetching ${language} (page ${page}):`, err.response?.data || err.message);
      await sleep(2000);
    }
  }

  console.log(`✅ Finished syncing ${allProjects.length} projects for ${language}`);
  return allProjects;
}

/* ------------------------------------------------------------------
   Additional Helper Functions for AI Contribution Guide
------------------------------------------------------------------- */

/**
 * Fetch README file content (raw text)
 */
export async function fetchRepoReadme(owner, repo) {
  if (!owner || !repo) return null;
  const url = `${BASE_URL}/repos/${owner}/${repo}/readme`;
  const headers = {
    Accept: "application/vnd.github.v3.raw",
    Authorization: GITHUB_TOKEN ? `Bearer ${GITHUB_TOKEN}` : undefined,
  };

  try {
    const res = await axios.get(url, { headers });
    const text = String(res.data || "").trim();
    return text.length > 20000 ? text.slice(0, 20000) + "\n\n...[truncated]" : text;
  } catch (err) {
    return null; // README might not exist
  }
}

/**
 * Fetch CONTRIBUTING.md content (if exists)
 */
export async function fetchRepoContributing(owner, repo) {
  if (!owner || !repo) return null;

  const paths = [
    `https://api.github.com/repos/${owner}/${repo}/contents/CONTRIBUTING.md`,
    `https://api.github.com/repos/${owner}/${repo}/contents/CONTRIBUTING.MD`,
    `https://api.github.com/repos/${owner}/${repo}/contents/docs/CONTRIBUTING.md`,
  ];

  const headers = {
    Accept: "application/vnd.github.v3.raw",
    Authorization: GITHUB_TOKEN ? `Bearer ${GITHUB_TOKEN}` : undefined,
  };

  for (const url of paths) {
    try {
      const res = await axios.get(url, { headers });
      const text = String(res.data || "").trim();
      return text.length > 8000 ? text.slice(0, 8000) + "\n\n...[truncated]" : text;
    } catch {
      // try next path
    }
  }

  return null;
}

/**
 * Fetch good-first-issue issues from GitHub
 */
export async function fetchGoodFirstIssues(owner, repo, limit = 6) {
  if (!owner || !repo) return [];

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: GITHUB_TOKEN ? `Bearer ${GITHUB_TOKEN}` : undefined,
  };

  const labelVariants = ["good first issue", "good-first-issue"];
  for (const label of labelVariants) {
    try {
      const url = `${BASE_URL}/repos/${owner}/${repo}/issues?labels=${encodeURIComponent(label)}&state=open&per_page=${limit}`;
      const res = await axios.get(url, { headers });
      const issues = (res.data || [])
        .filter((i) => !i.pull_request)
        .slice(0, limit)
        .map((i) => ({
          title: i.title,
          url: i.html_url,
          number: i.number,
          labels: (i.labels || []).map((l) => (typeof l === "string" ? l : l.name || "")),
        }));
      if (issues.length) return issues;
    } catch {
      // try next label
    }
  }

  return [];
}

/* ------------------------------------------------------------------
   Export everything
------------------------------------------------------------------- */
export default {
  fetchGitHubProjects,
  fetchRepoReadme,
  fetchRepoContributing,
  fetchGoodFirstIssues,
};
