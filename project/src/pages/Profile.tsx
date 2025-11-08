// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import Card from "../components/Card";
import Chip from "../components/Chip";
import ProjectCard, { Project as UIProject } from "../components/ProjectCard";
import { Award, Bookmark, GitPullRequest } from "lucide-react";
import { fetchProfile, removeBookmark as apiRemoveBookmark } from "../lib/api";
import { BackendProject, mapBackendProject } from "../lib/types";

interface ProfileProps {
  onProjectClick: (project: UIProject) => void;
  onBookmark: (projectId: string) => void;
}

export default function Profile({ onProjectClick, onBookmark }: ProfileProps) {
  const [profile, setProfile] = useState<any | null>(null);
  const [bookmarkedProjects, setBookmarkedProjects] = useState<UIProject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchProfile();
        if (!mounted) return;
        setProfile(data);
        const b = (data.bookmarks || []) as BackendProject[];
        setBookmarkedProjects(b.map(mapBackendProject));
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleRemoveBookmark = async (projectId: string) => {
    try {
      await apiRemoveBookmark(projectId);
      setBookmarkedProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    }
  };

  const contributionProjects = []; // optionally fetch contributions if implemented

  return (
    <div className="min-h-screen bg-[#0b0f14]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Card className="p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img src={profile?.avatar || "/default-avatar.png"} alt={profile?.name} className="w-24 h-24 rounded-full border-2 border-gray-700" />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-100 mb-1">{profile?.name || "Your name"}</h1>
              <p className="text-gray-400 mb-3">@{profile?.email?.split("@")?.[0] || "you"}</p>
              <p className="text-gray-300 leading-relaxed mb-4">{profile?.bio || "Update your bio in settings"}</p>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Technologies</label>
                <div className="flex flex-wrap gap-2">
                  {(profile?.preferredTechs || ["nodejs"]).map((tech: string) => (
                    <Chip key={tech} label={tech} selected variant="tech" size="sm" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-bold text-gray-100">Achievements</h2>
          </div>
          {/* Achievements UI - keep as before or fetch real ones */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border text-center bg-teal-500/10 border-teal-500/50">
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
