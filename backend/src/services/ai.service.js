// src/services/ai.service.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) console.warn("OPENAI_API_KEY not set. AI features will not work.");

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Build prompt and call OpenAI chat completion
 * Returns a plain-text (markdown) summary and optional structured JSON metadata.
 */
export async function generateContributionGuide({ project, readme, contributing, issues }) {
  if (!OPENAI_KEY) throw new Error("OPENAI_API_KEY not configured");

  // truncate inputs to safe size
  const r = readme ? readme.slice(0, 15000) : "";
  const c = contributing ? contributing.slice(0, 8000) : "";
  const issuesText = (issues || []).slice(0, 6).map((it, idx) => `${idx + 1}. ${it.title} (${it.url})`).join("\n");

  // Prompt: keep concise and structured output (markdown + JSON block)
  const system = `You are an expert developer and teacher. Produce a short, actionable "Contribution Guide" for the given GitHub repository.
Make the guide beginner-friendly: give a 3-line summary, setup steps, 3-6 suggested first PR ideas (exact file/area if possible), estimated time per task, required skills, and links to relevant files or issues. 
Return the answer as MARKDOWN text suitable to show in UI. Also append a JSON block at the end with a "quick" object that includes keys: difficulty_suggestion, estimated_setup_minutes, suggested_tasks (array of {title, est_minutes, link?}), and tags (array of strings).`;

  const userPrompt = `
Repository: ${project.fullName || project.name}
Description: ${project.description || "No description provided."}
Stars: ${project.stars || 0} | Forks: ${project.forks || 0} | Open issues: ${project.openIssues || 0}

README (truncated):
${r}

CONTRIBUTING.md (truncated):
${c}

Top open issues (labeled good-first-issue if any):
${issuesText || "No obvious labelled issues found."}

Provide:
- Short markdown guide (beginner friendly)
- 3-6 suggested small PR tasks with estimated time
- Quick bullet skills required
- Links for setup or issues if available

Finally append a JSON block inside triple backticks with language "json" (so we can parse it), like:
\`\`\`json
{ "quick": {...} }
\`\`\`
`;

  const payload = {
    model: "gpt-4o-mini", // pick a chat model you prefer / available
    messages: [
      { role: "system", content: system },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 800,
    temperature: 0.2,
  };

  const res = await axios.post(OPENAI_URL, payload, {
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
    timeout: 60000,
  });

  const choices = res.data?.choices || [];
  const content = choices[0]?.message?.content || "";
  // try to extract the JSON block at the end
  let jsonMeta = null;
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try { jsonMeta = JSON.parse(jsonMatch[1]); } catch (e) { jsonMeta = null; }
  }

  return { markdown: content, meta: jsonMeta };
}
