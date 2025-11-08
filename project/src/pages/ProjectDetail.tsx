// src/pages/ProjectDetail.tsx
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import Chip from "../components/Chip";
import Button from "../components/Button";
import AvatarGrid from "../components/AvatarGrid";
import { Project as UIProject } from "../components/ProjectCard";
import { fetchProjectById } from "../lib/api";
import { BackendProject, mapBackendProject } from "../lib/types";
import { ExternalLink, GitFork, Star, AlertCircle, Calendar } from "lucide-react";

interface ProjectDetailProps {
  project: UIProject | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetail({ project, isOpen, onClose }: ProjectDetailProps) {
  const [detail, setDetail] = useState<UIProject | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isOpen || !project) return;
      setLoading(true);
      try {
        // fetch backend project by id to get latest fields (topics, htmlUrl etc)
        const res = await fetchProjectById(project.id);
        const mapped = mapBackendProject(res);
        if (mounted) setDetail(mapped);
      } catch (err) {
        console.error("Failed to load project detail:", err);
        // fallback to passed project
        if (mounted) setDetail(project);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [isOpen, project]);

  if (!detail) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // github links
  const repoFull = `${detail.owner}/${detail.name}`;
  const issuesUrl = `https://github.com/${repoFull}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`;
  const contributorsUrl = `https://github.com/${repoFull}/graphs/contributors`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start gap-4 mb-4">
              <img src={detail.avatar} alt={detail.owner} className="w-16 h-16 rounded-full border-2 border-gray-700" />
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">{detail.owner}/{detail.name}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge label={detail.difficulty} difficulty={detail.difficulty} variant="difficulty" />
                  {detail.techs.map((tech) => (<Chip key={tech} label={tech} variant="topic" size="sm" />))}
                </div>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed mb-4">{detail.description}</p>

            <div className="flex flex-wrap gap-3">
              <Button variant="primary" icon={ExternalLink} onClick={() => window.open(detail.htmlUrl || `https://github.com/${repoFull}`, "_blank")}>Open on GitHub</Button>
              <Button variant="secondary" onClick={() => window.open(issuesUrl, "_blank")}>Good First Issues</Button>
            </div>
          </div>

          <div className="border-t border-gray-800/50 pt-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">README Preview</h3>
            <div className="bg-[#0b0f14] rounded-xl border border-gray-800/50 p-6 prose prose-invert prose-sm max-w-none">
              <h1>About {detail.name}</h1>
              <p className="text-gray-400 leading-relaxed">{detail.description}</p>
              <h2>Getting Started</h2>
              <p className="text-gray-400">To get started with this project, clone the repository and follow the installation instructions in the documentation. This project welcomes contributions from developers of all skill levels.</p>
              <h2>Contributing</h2>
              <p className="text-gray-400">We love contributions! Click the button above to view good first issues. Make sure to read contributing guidelines before submitting a pull request.</p>
            </div>
          </div>

          <div className="border-t border-gray-800/50 pt-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Top Open Issues</h3>
            <div className="space-y-3">
              {/* We don't fetch issues in backend; link user to GitHub issues page */}
              <a href={issuesUrl} target="_blank" rel="noopener noreferrer" className="block bg-[#0b0f14] rounded-xl border border-gray-800/50 p-4 hover:border-teal-500/30 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-200 font-medium mb-2 hover:text-teal-400 transition-colors">Open issues (view on GitHub)</h4>
                    <div className="flex flex-wrap gap-2"><span className="px-2 py-0.5 bg-[#1a2332] text-gray-400 text-xs rounded-full border border-gray-700/50">good-first-issues</span></div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </div>
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800/50 pt-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Top Contributors</h3>
            <div className="mb-3 text-sm text-gray-400">View contributors on GitHub</div>
            <div>
              <Button variant="secondary" onClick={() => window.open(contributorsUrl, "_blank")}>Open Contributors</Button>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <div className="bg-[#0b0f14] rounded-xl border border-gray-800/50 p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Project Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400"><Star className="w-4 h-4" /><span className="text-sm">Stars</span></div>
                  <span className="text-gray-200 font-semibold">{formatNumber(detail.stars)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400"><GitFork className="w-4 h-4" /><span className="text-sm">Forks</span></div>
                  <span className="text-gray-200 font-semibold">{formatNumber(detail.forks)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400"><AlertCircle className="w-4 h-4" /><span className="text-sm">Open Issues</span></div>
                  <span className="text-gray-200 font-semibold">{detail.openIssues}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0b0f14] rounded-xl border border-gray-800/50 p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {detail.techs.map((tech) => (<Chip key={tech} label={tech} variant="topic" size="sm" />))}
                <Chip label="open-source" variant="topic" size="sm" />
                <Chip label="beginner-friendly" variant="topic" size="sm" />
              </div>
            </div>

            <div className="bg-[#0b0f14] rounded-xl border border-gray-800/50 p-5">
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Calendar className="w-4 h-4" />
                <span>Last synced: {detail.lastSyncedAt ? new Date(detail.lastSyncedAt).toLocaleString() : "Unknown"}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Modal>
  );
}
