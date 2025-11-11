// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import Card from "../components/Card";
import Chip from "../components/Chip";
import ProjectCard, { Project as UIProject } from "../components/ProjectCard";
import { Award, Bookmark, GitPullRequest } from "lucide-react";
import { removeBookmark as apiRemoveBookmark } from "../lib/api";
import { BackendProject, mapBackendProject } from "../lib/types";
import { useAuth } from "../lib/auth";

interface ProfileProps {
  user: any | null;
  onProjectClick: (project: UIProject) => void;
  onBookmark: (projectId: string) => void;
}

export default function Profile({ user, onProjectClick, onBookmark }: ProfileProps) {
  const [bookmarkedProjects, setBookmarkedProjects] = useState<UIProject[]>([]);
  const [loading, setLoading] = useState(false);

  const { refreshUser } = useAuth();

  // When user changes (login/logout), map their bookmarks into UIProject objects
  useEffect(() => {
    if (!user) {
      setBookmarkedProjects([]);
      return;
    }
    setLoading(true);
    try {
      const b = (user.bookmarks || []) as BackendProject[];
      setBookmarkedProjects(b.map(mapBackendProject));
    } catch (err) {
      console.error("Failed to map bookmarks:", err);
      setBookmarkedProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleRemoveBookmark = async (projectId: string) => {
    try {
      await apiRemoveBookmark(projectId);
      // refresh global user so UI everywhere updates
      try { await refreshUser(); } catch (e) { console.warn("refreshUser failed after remove", e); }
      // locally remove to keep UI snappy
      setBookmarkedProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    }
  };

  const contributionProjects: UIProject[] = []; // TODO: fetch contributions if implemented

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0f14]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-300">
            <h2 className="text-2xl font-bold mb-2">You are not signed in</h2>
            <p className="text-gray-500">Sign in to see your bookmarks and contribution activity.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f14]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Card className="p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={user.avatar || "/default-avatar.png"}
              alt={user.name || user.email}
              className="w-24 h-24 rounded-full border-2 border-gray-700"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-100 mb-1">{user.name || user.username}</h1>
              <p className="text-gray-400 mb-3">@{(user.username) ?? user.email?.split("@")?.[0]}</p>
              <p className="text-gray-300 leading-relaxed mb-4">{user.bio || "Update your bio in settings"}</p>
              <div className="flex gap-2">
                <a className="px-4 py-2 rounded-full bg-teal-600/10 text-teal-300" href="#">Edit profile</a>
                <a className="px-4 py-2 rounded-full bg-gray-800/40 text-gray-300" href="#">Settings</a>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-bold text-gray-100">Achievements</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border text-center bg-teal-500/10 border-teal-500/30">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-sm font-medium text-gray-300">First Bookmark</div>
            </div>
            <div className="p-4 rounded-xl border text-center bg-[#0b0f14] border-gray-800/50 opacity-50">
              <div className="text-2xl mb-2">🔒</div>
              <div className="text-sm font-medium text-gray-300">10 Contributions</div>
            </div>
          </div>
        </Card>

        <div>
          <div className="flex gap-2 mb-6 border-b border-gray-800/50">
            <button className="flex items-center gap-2 px-4 py-3 font-medium text-teal-400 border-b-2 border-teal-400">
              <Bookmark className="w-4 h-4" /> Bookmarked
              <span className="px-2 py-0.5 bg-[#1a2332] rounded-full text-xs">{bookmarkedProjects.length}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-3 font-medium text-gray-400 hover:text-gray-300">
              <GitPullRequest className="w-4 h-4" /> Contributions
              <span className="px-2 py-0.5 bg-[#1a2332] rounded-full text-xs">{contributionProjects.length}</span>
            </button>
          </div>

          {bookmarkedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {bookmarkedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onCardClick={onProjectClick}
                  onBookmark={() => handleRemoveBookmark(project.id)}
                  onGitHubClick={(e) => { e.stopPropagation(); window.open(project.htmlUrl, "_blank"); }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#0f1720] rounded-2xl border border-gray-800/50">
              <div className="mb-4 text-4xl">📚</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No bookmarked projects yet</h3>
              <p className="text-gray-500">Start exploring and bookmark projects you want to contribute to.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
