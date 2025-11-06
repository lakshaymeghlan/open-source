// src/services/github.service.js
import axios from "axios";
import Project from "../models/project.model.js";

/**
 * Basic GitHub fetch + difficulty heuristic
 * - language: GitHub language to query
 * - perPage: how many repos per language to fetch
 */
export const fetchGitHubProjects = async (language = "javascript", perPage = 30) => {
  const url = `https://api.github.com/search/repositories?q=language:${encodeURIComponent(
    language
  )}+stars:>50&sort=stars&order=desc&per_page=${perPage}`;

  const headers = {};
  if (process.env.GITHUB_TOKEN) headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;

  const { data } = await axios.get(url, { headers });

  if (!data?.items) return;

  for (const repo of data.items) {
    // simple heuristic for difficulty
    let difficulty = "medium";
    const stars = repo.stargazers_count ?? 0;
    if (stars < 300) difficulty = "easy";
    else if (stars >= 2000) difficulty = "hard";

    const techTags = [];
    if (repo.language) techTags.push(repo.language.toLowerCase());
    // include topics if available (GitHub v3 requires separate call, but search may include 'topics' if accepted)
    const topics = repo.topics || [];

    const update = {
      githubId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || "",
      htmlUrl: repo.html_url,
      avatar: repo.owner?.avatar_url || "",
      techTags,
      topics,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      openIssues: repo.open_issues_count || 0,
      difficulty,
      lastSyncedAt: new Date(),
    };

    await Project.findOneAndUpdate({ githubId: repo.id }, update, { upsert: true, new: true });
  }
};
