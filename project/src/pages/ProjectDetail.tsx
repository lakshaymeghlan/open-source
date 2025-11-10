// src/pages/ProjectDetail.tsx
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import Chip from "../components/Chip";
import Button from "../components/Button";
import AvatarGrid from "../components/AvatarGrid";
import { Project as UIProject } from "../components/ProjectCard";
import { fetchProjectById, fetchContributionGuide } from "../lib/api";
import { BackendProject, mapBackendProject } from "../lib/types";
import { ExternalLink, GitFork, Star, AlertCircle, Calendar } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface ProjectDetailProps {
  project: UIProject | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetail({ project, isOpen, onClose }: ProjectDetailProps) {
  const [detail, setDetail] = useState<UIProject | null>(null);
  const [loading, setLoading] = useState(false);

  // Contribution guide states
  const [guide, setGuide] = useState<{ summary: string; meta?: any; generatedAt?: string } | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isOpen || !project) return;
      setLoading(true);
      setGuide(null);
      setGuideError(null);
      try {
        // Fetch up-to-date project from backend to get htmlUrl, topics, lastSyncedAt, etc.
        const res = await fetchProjectById(project.id);
        const mapped = mapBackendProject(res as BackendProject);
        if (mounted) setDetail(mapped);
      } catch (err) {
        console.error("Failed to load project detail:", err);
        // fallback to passed project if backend fetch fails
        if (mounted) setDetail(project);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isOpen, project]);

  // Fetch the AI contribution guide when modal opens and detail is available
  useEffect(() => {
    let mounted = true;
    const loadGuide = async () => {
      if (!isOpen || !detail) return;
      setGuideLoading(true);
      setGuideError(null);
      try {
        const res = await fetchContributionGuide(detail.id);
        // Expected response: { cached: boolean, guide: { summary, meta, generatedAt } }
        if (!mounted) return;
        const g = res?.guide ?? null;
        setGuide(g);
      } catch (err: any) {
        console.error("Failed to fetch contribution guide:", err);
        if (mounted) setGuideError(err?.message || "Failed to load contribution guide");
      } finally {
        if (mounted) setGuideLoading(false);
      }
    };
    loadGuide();
    return () => {
      mounted = false;
    };
  }, [isOpen, detail]);

  if (!detail) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return String(num ?? 0);
  };

  // repo links
  const repoFull = `${detail.owner}/${detail.name}`;
  const issuesUrl = `https://github.com/${repoFull}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`;
  const contributorsUrl = `https://github.com/${repoFull}/graphs/contributors`;
  const repoUrl = detail.htmlUrl || `https://github.com/${repoFull}`;

  // Render markdown safely
  const renderMarkdown = (md: string) => {
    try {
      const html = marked(md || "");
      // sanitize
      return { __html: DOMPurify.sanitize(html) };
    } catch {
      return { __html: DOMPurify.sanitize(String(md || "")) };
    }
  };

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
              <Button variant="primary" icon={ExternalLink} onClick={() => window.open(repoUrl, "_blank")}>Open on GitHub</Button>
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
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Contribution Guide</h3>

            {guideLoading ? (
              <div className="p-6 bg-[#0b0f14] rounded-xl border border-gray-800/50">
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-gray-700/20 rounded w-1/2" />
                  <div className="h-3 bg-gray-700/20 rounded" />
                  <div className="h-3 bg-gray-700/20 rounded w-4/5" />
                  <div className="h-3 bg-gray-700/20 rounded w-3/4" />
                </div>
              </div>
            ) : guide ? (
              <div className="bg-[#0b0f14] rounded-xl border border-gray-800/50 p-6 prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={renderMarkdown(guide.summary || "")} />
                {guide.generatedAt && (
                  <div className="text-xs text-gray-400 mt-3">Guide generated: {new Date(guide.generatedAt).toLocaleString()}</div>
                )}
                {guide.meta && (
                  <div className="mt-3 text-xs text-gray-400">
                    {/* show a compact quick summary if provided */}
                    {guide.meta.quick && (
                      <div>
                        <strong className="text-gray-200">Quick:</strong>
                        <div className="mt-1">
                          <span className="mr-2">Difficulty suggestion: <strong className="text-gray-200">{guide.meta.quick.difficulty_suggestion ?? detail.difficulty}</strong></span>
                        </div>
                        <div className="mt-2">
                          <span className="text-gray-400">Suggested tasks:</span>
                          <ul className="mt-1 ml-4 list-disc text-gray-300">
                            {(guide.meta.quick.suggested_tasks || []).slice(0, 5).map((t: any, idx: number) => (
                              <li key={idx}>
                                {t.title}{t.link ? (<a className="ml-2 text-teal-300 underline" href={t.link} target="_blank" rel="noreferrer">link</a>) : null}
                                {t.est_minutes ? <span className="ml-2 text-xs text-gray-400">({t.est_minutes}m)</span> : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : guideError ? (
              <div className="p-4 bg-[#0b0f14] rounded border border-gray-800/50 text-red-400">
                Error loading contribution guide: {guideError}
              </div>
            ) : (
              <div className="p-4 bg-[#0b0f14] rounded border border-gray-800/50 text-gray-400">
                No contribution guide available.
              </div>
            )}
          </div>

          <div className="border-t border-gray-800/50 pt-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Top Open Issues</h3>
            <div className="space-y-3">
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
