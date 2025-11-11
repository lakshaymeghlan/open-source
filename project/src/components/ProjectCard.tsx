// src/components/ProjectCard.tsx
import { Star, GitFork, AlertCircle, Bookmark as BookmarkIcon } from "lucide-react";
import Card from "./Card";
import Badge from "./Badge";
import Chip from "./Chip";
import Button from "./Button";

export interface Project {
  id: string;
  owner: string;
  name: string;
  description: string;
  avatar: string;
  stars: number;
  forks: number;
  openIssues: number;
  difficulty: "easy" | "medium" | "hard";
  techs: string[];
  htmlUrl?: string;
  isBookmarked?: boolean;
}

interface ProjectCardProps {
  project: Project;
  onCardClick: (project: Project) => void;
  onBookmark: (projectId: string) => void;
  onGitHubClick: (e: React.MouseEvent) => void;
}

export default function ProjectCard({ project, onCardClick, onBookmark, onGitHubClick }: ProjectCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return String(num ?? 0);
  };

  const bookmarked = !!project.isBookmarked;

  return (
    <Card hover onClick={() => onCardClick(project)} className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src={project.avatar} alt={project.owner} className="w-10 h-10 rounded-full border border-gray-700" />
          <div className="min-w-0 flex-1">
            <h3 className="text-gray-100 font-semibold truncate">{project.owner}/{project.name}</h3>
          </div>
        </div>
        <Badge label={project.difficulty} difficulty={project.difficulty} variant="difficulty" size="sm" />
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">{project.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {project.techs.map((tech) => (
          <Chip key={tech} label={tech} variant="topic" size="sm" />
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {formatNumber(project.stars)}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="w-4 h-4" />
            {formatNumber(project.forks)}
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {project.openIssues}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onGitHubClick(e); }}>
            GitHub
          </Button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(project.id);
            }}
            aria-pressed={bookmarked}
            title={bookmarked ? "Bookmarked" : "Bookmark"}
            className={`p-2 rounded-xl border border-gray-800/50 transition ${bookmarked ? "bg-teal-500/10 text-teal-300" : "bg-[#071018] text-gray-300"}`}
          >
            <BookmarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
