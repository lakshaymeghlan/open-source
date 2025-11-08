// src/services/github.service.js
import axios from "axios";
import Project from "../models/project.model.js";
import dotenv from "dotenv";
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.warn("Warning: GITHUB_TOKEN not set — GitHub API requests will likely be rate-limited.");
}

const GH_HEADERS = {
  Accept: "application/vnd.github+json",
  Authorization: GITHUB_TOKEN ? `Bearer ${GITHUB_TOKEN}` : undefined,
  "X-GitHub-Api-Version": "2022-11-28",
};

/**
 * sleep milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Basic exponential backoff retry for axios requests.
 * - fn should be an async function returning axios result
 */
async function withRetry(fn, { retries = 3, baseDelay = 700 } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > retries) throw err;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(`Request failed (attempt ${attempt}/${retries}). Retrying after ${delay}ms. Error: ${err.message || err}`);
      await sleep(delay);
    }
  }
}

/**
 * Upsert single repo payload into MongoDB (normalizes techTags & topics).
 */
async function upsertRepo(repo, language) {
  const techTags = new Set();
  if (language) techTags.add(language.toLowerCase());
  if (repo.language) techTags.add(String(repo.language).toLowerCase());
  if (Array.isArray(repo.topics)) {
    repo.topics.forEach((t) => techTags.add(String(t).toLowerCase()));
  }

  const stars = repo.stargazers_count ?? 0;
  const forks = repo.forks_count ?? 0;
  const issues = repo.open_issues_count ?? 0;

  // Difficulty heuristic (balanced)
  let difficulty = "easy";
  if (stars > 20000 || forks > 3000) difficulty = "hard";
  else if (stars > 5000 || forks > 1000) difficulty = "medium";

  const payload = {
    githubId: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    htmlUrl: repo.html_url,
    description: repo.description || "",
    avatar: repo.owner?.avatar_url || "",
    stars,
    forks,
    openIssues: issues,
    techTags: Array.from(techTags),
    topics: Array.isArray(repo.topics) ? repo.topics.map((t) => String(t).toLowerCase()) : [],
    difficulty,
    lastSyncedAt: new Date(),
  };

  // upsert
  await Project.findOneAndUpdate({ githubId: repo.id }, { $set: payload }, { upsert: true, new: true });
}

/**
 * Fetch GitHub repositories for a language and upsert into DB.
 *
 * @param {string} language - GitHub language token (e.g., "javascript")
 * @param {number} totalToFetch - how many repos total to fetch (default 300)
 * @param {number} perPage - per_page param for GitHub (max 100)
 * @param {number} delayMs - delay between page requests (ms)
 * @returns {object[]} array of repo summaries upserted (returns minimal payloads)
 */
export const fetchGitHubProjects = async (language = "javascript", totalToFetch = 300, perPage = 100, delayMs = 700) => {
  if (!language) throw new Error("language required");
  perPage = Math.min(100, Math.max(10, Number(perPage) || 100));
  totalToFetch = Math.max(0, Number(totalToFetch) || 0);
  if (totalToFetch === 0) totalToFetch = 300; // default

  const pages = Math.ceil(totalToFetch / perPage);
  const synced = [];

  console.log(`Starting full sync: language=${language}, totalToFetch=${totalToFetch}, perPage=${perPage}, pages=${pages}`);

  for (let page = 1; page <= pages; page++) {
    const url = `https://api.github.com/search/repositories?q=language:${encodeURIComponent(
      language
    )}+stars:>10&sort=stars&order=desc&page=${page}&per_page=${perPage}`;

    // use retry for network errors / transient rate issues
    const response = await withRetry(() => axios.get(url, { headers: GH_HEADERS }), { retries: 4, baseDelay: delayMs });

    if (!response?.data?.items?.length) {
      console.log(`No items returned for ${language} page ${page} — stopping early.`);
      break;
    }

    for (const repo of response.data.items) {
      try {
        // upsert into DB
        // eslint-disable-next-line no-await-in-loop
        await upsertRepo(repo, language);
        synced.push({ id: repo.id, fullName: repo.full_name });
      } catch (err) {
        console.warn(`Failed to upsert ${repo.full_name}: ${err.message || err}`);
      }
    }

    // small delay between page requests to reduce burst and be nicer to API
    if (page < pages) {
      await sleep(delayMs);
    }
  }

  console.log(`Finished sync for ${language}. Synced ${synced.length} repos.`);
  return synced;
};
