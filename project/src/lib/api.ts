// src/lib/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE || "https://open-source-hjs0.onrender.com";

/* ---------- HELPERS ---------- */
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleRes(res: Response) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = text;
  }
  if (!res.ok) {
    const errMsg = (data && (data.message || data.error)) || res.statusText;
    throw new Error(errMsg);
  }
  return data;
}

/* ---------- AUTH ---------- */
export async function apiRegister({
  name,
  email,
  password,
}: {
  name?: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handleRes(res);
}

export async function apiLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleRes(res);
}

/* ---------- PROJECT SYNC ---------- */
/**
 * Triggers a GitHub project sync on backend.
 * Sends { languages: ["javascript","python"] } if multiple.
 */
export async function syncProjects(languages?: string[]) {
  const url = `${API_BASE}/api/github/sync`;
  const payload: any = {};
  if (languages && languages.length) payload.languages = languages;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

/* ---------- PROJECT FETCH ---------- */
export async function fetchProjects({
  tech,
  difficulty,
  q,
  page = 1,
  limit = 12,
  sort,
}: {
  tech?: string[];
  difficulty?: string | null;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  const params = new URLSearchParams();
  if (tech && tech.length) params.append("tech", tech.join(","));
  if (difficulty) params.append("difficulty", difficulty);
  if (q) params.append("q", q);
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));
  if (sort) params.append("sort", sort);

  const url = `${API_BASE}/api/projects?${params.toString()}`;
  const res = await fetch(url);
  return handleRes(res);
}

/* ---------- PROJECT DETAIL ---------- */
export async function fetchProjectById(id: string) {
  const res = await fetch(`${API_BASE}/api/projects/${id}`);
  return handleRes(res);
}

/* ---------- AI CONTRIBUTION GUIDE ---------- */
/**
 * Fetch AI-generated contribution guide (cached or new)
 * Backend route: GET /api/ai/contribution?projectId=...
 */
export async function fetchContributionGuide(projectId: string) {
  const res = await fetch(`${API_BASE}/api/ai/contribution?projectId=${projectId}`, {
    headers: { ...getAuthHeaders() },
  });
  return handleRes(res);
}

/**
 * Force regenerate contribution guide (fresh from AI)
 * Backend route: POST /api/ai/contribution/regenerate
 */
export async function regenerateContributionGuide(projectId: string) {
  const res = await fetch(`${API_BASE}/api/ai/contribution/regenerate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ projectId }),
  });
  return handleRes(res);
}

/* ---------- USER PROFILE ---------- */
export async function fetchProfile() {
  const res = await fetch(`${API_BASE}/api/users/me`, {
    headers: { ...getAuthHeaders() },
  });
  return handleRes(res);
}

/* ---------- BOOKMARKS ---------- */
export async function addBookmark(projectId: string) {
  const res = await fetch(`${API_BASE}/api/users/bookmarks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ projectId }),
  });
  return handleRes(res);
}

export async function removeBookmark(projectId: string) {
  const res = await fetch(`${API_BASE}/api/users/bookmarks/${projectId}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return handleRes(res);
}
