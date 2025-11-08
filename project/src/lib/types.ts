// src/lib/types.ts
export type BackendProject = {
    _id: string;
    githubId?: string | number;
    name: string;
    fullName?: string; // owner/repo
    htmlUrl?: string;
    avatar?: string;
    description?: string;
    techTags?: string[];
    topics?: string[];
    stars?: number;
    forks?: number;
    openIssues?: number;
    difficulty?: "easy" | "medium" | "hard";
    lastSyncedAt?: string;
  };
  
  export type Project = {
    id: string;
    name: string;
    owner: string;
    avatar?: string;
    description?: string;
    techs: string[]; // used by UI
    topics: string[];
    stars: number;
    forks: number;
    openIssues: number;
    difficulty?: "easy" | "medium" | "hard";
    htmlUrl?: string;
    lastSyncedAt?: string;
  };
  
  export function mapBackendProject(b: BackendProject): Project {
    const full = b.fullName || "";
    const [owner, repoName] = full.includes("/") ? full.split("/") : [full || "unknown", b.name];
    return {
      id: b._id,
      name: b.name,
      owner: owner || "unknown",
      avatar: b.avatar || "",
      description: b.description || "",
      techs: (b.techTags || []).map((t) => t.toLowerCase()),
      topics: (b.topics || []).map((t) => t.toLowerCase()),
      stars: b.stars ?? 0,
      forks: b.forks ?? 0,
      openIssues: b.openIssues ?? 0,
      difficulty: b.difficulty,
      htmlUrl: b.htmlUrl || (full ? `https://github.com/${full}` : undefined),
      lastSyncedAt: b.lastSyncedAt,
    };
  }
  