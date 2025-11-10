// src/services/ai.service.js
import axios from "axios";
import dotenv from "dotenv";
import { stripHtml } from "./utils_text.js"; // optional helper below; if you don't want to import, the file includes fallback impl

dotenv.config();

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE = process.env.DEEPSEEK_BASE || "https://api.deepseek.com/v1";

/**
 * generateContributionGuide
 * - inputs: { project, readme, contributing, issues }
 * - returns: { markdown, meta }
 *
 * Behavior:
 * - If DEEPSEEK_API_KEY is present, attempt call.
 * - On any failure (402, 429, network error, parsing), fall back to local generator.
 */
export async function generateContributionGuide({ project, readme, contributing, issues }) {
  // Normalize inputs
  const trimmedReadme = readme ? String(readme).slice(0, 15000) : "";
  const trimmedContrib = contributing ? String(contributing).slice(0, 8000) : "";
  const issuesList = Array.isArray(issues) ? issues.slice(0, 8) : [];

  // If DEEPSEEK configured -> try remote generation
  if (DEEPSEEK_KEY) {
    try {
      const system = `You are an expert developer and teacher. Produce a short, actionable "Contribution Guide" for the given GitHub repository.
Return the answer as MARKDOWN text suitable to show in UI. Also append a JSON block at the end with a "quick" object that includes keys: difficulty_suggestion, estimated_setup_minutes, suggested_tasks (array of {title, est_minutes, link?}), and tags (array of strings).`;
      const userPrompt = `
Repository: ${project.fullName || project.name}
Description: ${project.description || "No description provided."}
Stars: ${project.stars || 0} | Forks: ${project.forks || 0} | Open issues: ${project.openIssues || 0}

README (truncated):
${trimmedReadme}

CONTRIBUTING.md (truncated):
${trimmedContrib}

Top open issues (if any):
${(issuesList || []).map((it, i) => `${i + 1}. ${it.title} ${it.url ? `(${it.url})` : ""}`).join("\n") || "No labeled issues found."}

Please generate the guide as described.
`;

      const payload = {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1200,
        temperature: 0.25,
      };

      const url = `${DEEPSEEK_BASE}/chat/completions`;
      const res = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 120000,
      });

      const content = res.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from DeepSeek");

      // try to parse JSON block
      let jsonMeta = null;
      const jsonMatch = String(content).match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          jsonMeta = JSON.parse(jsonMatch[1]);
        } catch (e) {
          jsonMeta = null;
        }
      }

      return { markdown: String(content), meta: jsonMeta };
    } catch (err) {
      // log the exact error and fall through to fallback generator
      console.error("DeepSeek generation failed:", err?.response?.status, err?.response?.data || err.message || err);
      // Continue to fallback below
    }
  }

  // FALLBACK: local deterministic generator (no external API)
  try {
    const fallback = generateLocalGuide({ project, readme: trimmedReadme, contributing: trimmedContrib, issues: issuesList });
    return fallback;
  } catch (err) {
    // Shouldn't happen, but ensure we always return something
    console.error("Local fallback generation failed:", err);
    return {
      markdown: `## Contribution Guide\n\nUnable to generate guide at the moment.`,
      meta: { quick: { difficulty_suggestion: project.difficulty || "medium", suggested_tasks: [] } },
    };
  }
}

/* -------------------------
   Local Guide Generator
   - Produces a helpful guide from README + CONTRIBUTING + issues
   - Returns { markdown, meta }
----------------------------*/
function generateLocalGuide({ project, readme, contributing, issues }) {
  // small helpers
  const short = (s, n = 220) => (s ? (s.length > n ? s.slice(0, n).trim() + "…" : s) : "");
  const firstNonEmptyLine = (text) => {
    if (!text) return null;
    const lines = String(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    return lines.length ? lines[0] : null;
  };

  // Summary: prefer explicit project.description, else first non-empty readme line
  const summary = project.description || firstNonEmptyLine(readme) || `A ${project.techTags?.[0] || "project"} repository`;

  // Try to find quick setup hints from README: take first heading block or first 6 lines
  const readmePreview = (function () {
    if (!readme) return "No README available. Visit the repository on GitHub for details.";
    // pull first section (until first H2/H3 or two newlines)
    const parts = readme.split(/\r?\n\r?\n/);
    return short(parts[0].replace(/[#>*`]/g, " ").replace(/\s+/g, " ").trim(), 1200);
  })();

  // Generate suggested tasks from issues (prefer issue link/title), else naive tasks based on project structure
  const suggestedTasks = (issues || []).slice(0, 6).map((it) => ({
    title: it.title,
    link: it.url || (project.htmlUrl ? `${project.htmlUrl}/issues/${it.number}` : undefined),
    est_minutes: estimateTaskTime(it),
  }));

  // If no labeled issues, make generic beginner tasks
  if (!suggestedTasks.length) {
    suggestedTasks.push(
      { title: "Fix a small documentation typo or improve README section", est_minutes: 20 },
      { title: "Run tests locally and fix a failing test", est_minutes: 60 },
      { title: "Add a small unit test for a utility function", est_minutes: 90 },
    );
  }

  // Difficulty suggestion heuristics (fallback)
  let difficulty_suggestion = "medium";
  const stars = Number(project.stars || 0);
  if (project.difficulty) difficulty_suggestion = project.difficulty;
  else if (stars > 20000) difficulty_suggestion = "hard";
  else if (stars > 5000) difficulty_suggestion = "medium";
  else difficulty_suggestion = "easy";

  // Build markdown content (simple and clean)
  const mdLines = [];

  mdLines.push(`## Contribution Guide`);
  mdLines.push(`**Short summary:** ${short(summary, 300)}`);
  mdLines.push("");
  mdLines.push(`### Quick start`);
  mdLines.push(readmePreview ? readmePreview : "Read the repository README for setup steps.");
  mdLines.push("");
  mdLines.push("### Recommended first steps");
  mdLines.push("- Fork the repo and clone it locally.");
  mdLines.push("- Follow the README's 'Getting Started' or 'Development' section to install dependencies and run locally.");
  if (contributing) {
    mdLines.push("- Read the project's CONTRIBUTING.md for repo-specific contribution rules.");
  } else {
    mdLines.push("- Look for `CONTRIBUTING.md` on the repository for contribution rules (if present).");
  }
  mdLines.push("");
  mdLines.push("### Suggested beginner tasks");
  suggestedTasks.forEach((t, i) => {
    const linkText = t.link ? ` — [issue](${t.link})` : "";
    mdLines.push(`${i + 1}. **${t.title}**${linkText} (Est: ${t.est_minutes}m)`);
  });
  mdLines.push("");
  mdLines.push("### Skills required");
  mdLines.push(`- ${Array.from(new Set([...(project.techTags || []), "git", "reading docs"])).slice(0, 6).join(", ")}`);
  mdLines.push("");
  mdLines.push("### Tips");
  mdLines.push("- Start with documentation or tests — maintainers often accept small fixes.");
  mdLines.push("- If unsure, open an issue or ask in the repo's discussions to ask maintainers where to start.");
  mdLines.push("");
  mdLines.push("*(This guide was generated automatically by the site as a fallback when AI generation isn't available.)*");
  mdLines.push("");
  // Append a small JSON block with quick metadata (so frontend can parse)
  const meta = {
    quick: {
      difficulty_suggestion,
      estimated_setup_minutes: guessSetupMinutes(readme, contributing),
      suggested_tasks: suggestedTasks,
      tags: project.techTags || [],
      fallback_generated: true,
    },
  };

  mdLines.push("```json");
  mdLines.push(JSON.stringify(meta, null, 2));
  mdLines.push("```");

  return { markdown: mdLines.join("\n"), meta };
}

/* -------------------------
   small helper: estimateTaskTime (very naive)
----------------------------*/
function estimateTaskTime(issue) {
  // prefer if issue has labels or body hinting complexity
  if (!issue) return 45;
  const t = String(issue.title || "").toLowerCase();
  if (t.includes("typo") || t.includes("docs") || t.includes("readme")) return 20;
  if (t.includes("test") || t.includes("coverage")) return 60;
  if (t.includes("refactor") || t.includes("cleanup")) return 90;
  return 45;
}

/* -------------------------
   guessSetupMinutes
----------------------------*/
function guessSetupMinutes(readme, contributing) {
  if (!readme) return 30;
  const lower = String(readme).toLowerCase();
  if (lower.includes("docker") || lower.includes("docker-compose")) return 15;
  if (lower.includes("virtualenv") || lower.includes("venv") || lower.includes("pipenv")) return 20;
  if (lower.includes("npm install") || lower.includes("yarn") || lower.includes("pnpm")) return 10;
  return 30;
}

/* -------------------------
   simple HTML stripper for fallback (optional)
   If you already have a utils_text.js with stripHtml, you can use it.
----------------------------*/
export function simpleStripHtml(input) {
  if (!input) return "";
  return String(input).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
