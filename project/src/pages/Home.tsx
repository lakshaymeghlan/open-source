// src/pages/Home.tsx
import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import ProjectCard, { Project as UIProject } from "../components/ProjectCard";
import AdminSyncButton from "../components/AdminSyncButton";
import SkeletonProjectCard from "../components/SkeletonProjectCard";
import { Sparkles } from "lucide-react";
import { fetchProjects, syncProjects } from "../lib/api";
import { BackendProject, mapBackendProject } from "../lib/types";
import { getSyncLanguagesFor } from "../lib/helpers";

interface HomeProps {
  onProjectClick: (project: UIProject) => void;
  onBookmark: (projectId: string) => void;
}

export default function Home({ onProjectClick, onBookmark }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("stars");

  const [projects, setProjects] = useState<UIProject[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(24);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => { setPage(1); }, [selectedTechs, selectedDifficulty, searchQuery, sortBy]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Attempt a quick sync (non-blocking)
        const langs = selectedTechs.length ? getSyncLanguagesFor(selectedTechs) : ["javascript"];
        try { await syncProjects(langs); } catch (e) { /* ignore */ }

        const res = await fetchProjects({
          tech: selectedTechs.length ? selectedTechs : undefined,
          difficulty: selectedDifficulty ?? undefined,
          q: searchQuery || undefined,
          page,
          limit: perPage,
          sort: sortBy === "stars" ? "stars" : sortBy === "new" ? "new" : undefined,
        });

        const backend = (res.projects || []) as BackendProject[];
        const mapped = backend.map(mapBackendProject);

        if (!mounted) return;
        setProjects(mapped);
        setTotal(res.total ?? 0);
      } catch (err) {
        console.error("Failed to load projects:", err);
        if (mounted) { setProjects([]); setTotal(0); }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [selectedTechs, selectedDifficulty, searchQuery, sortBy, page, perPage]);

  const handleTechToggle = (tech: string) => {
    setSelectedTechs((prev) => (prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]));
  };

  const handleGitHubClick = (e: React.MouseEvent, owner: string, name: string) => {
    e.stopPropagation();
    window.open(`https://github.com/${owner}/${name}`, "_blank");
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startIdx = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endIdx = Math.min(total, page * perPage);
  const gotoPage = (p: number) => { if (p < 1 || p > totalPages) return; setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // callback from admin sync to refresh after sync finishes
  const handleAfterSync = () => {
    // force reload current page
    setPage(1);
    // trigger useEffect reload via changing page (set to 1)
    setTimeout(() => setPage(1), 50);
  };

  return (
    <div className="min-h-screen bg-[#0b0f14]">
      <div className="relative bg-gradient-to-b from-teal-500/10 via-[#0b0f14] to-[#0b0f14] border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-teal-400" />
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-100">Open Source Discovery</h1>
            </div>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Discover open-source projects to contribute to — filtered by tech and difficulty.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search projects, repos, topics..." />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-8 bg-[#0f1720] rounded-2xl border border-gray-800/50 p-5 space-y-3">
              <AdminSyncButton onComplete={handleAfterSync} />
              <FilterBar selectedTechs={selectedTechs} onTechToggle={handleTechToggle} selectedDifficulty={selectedDifficulty} onDifficultyChange={setSelectedDifficulty} sortBy={sortBy} onSortChange={setSortBy} />
              <div className="mt-4">
                <label className="text-sm text-gray-400 mb-1 block">Results per page</label>
                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="w-full bg-[#0b0f14] border border-gray-800/50 rounded p-2 text-gray-200">
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-400">{loading ? "Loading..." : `${startIdx}-${endIdx} of ${total} project${total !== 1 ? "s" : ""}`}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => gotoPage(page - 1)} disabled={page <= 1} className="px-3 py-1 rounded bg-[#0b1720] border border-gray-800/50 text-gray-300 disabled:opacity-40">Prev</button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                    let start = Math.max(1, Math.min(totalPages - 6, page - 3));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <button key={p} onClick={() => gotoPage(p)} className={`px-3 py-1 rounded ${p === page ? "bg-teal-500 text-black" : "bg-[#0b1720] text-gray-300"} border border-gray-800/50`}>
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => gotoPage(page + 1)} disabled={page >= totalPages} className="px-3 py-1 rounded bg-[#0b1720] border border-gray-800/50 text-gray-300 disabled:opacity-40">Next</button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Array.from({ length: perPage > 24 ? 8 : perPage / 3 }).map((_, i) => <SkeletonProjectCard key={i} />)}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} onCardClick={onProjectClick} onBookmark={onBookmark} onGitHubClick={(e) => handleGitHubClick(e, project.owner, project.name)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#0f1720] rounded-2xl border border-gray-800/50">
                <div className="mb-4 text-4xl">🔍</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No projects found</h3>
                <p className="text-gray-500">Try selecting other technologies or adjusting your filters.</p>
              </div>
            )}

            <div className="mt-6 sm:hidden text-center">
              <div className="flex justify-center gap-2">
                <button onClick={() => gotoPage(page - 1)} disabled={page <= 1} className="px-3 py-1 rounded bg-[#0b1720] border border-gray-800/50 text-gray-300 disabled:opacity-40">Prev</button>
                <span className="px-3 py-1 rounded bg-[#0b1720] border border-gray-800/50 text-gray-300">{page}/{totalPages}</span>
                <button onClick={() => gotoPage(page + 1)} disabled={page >= totalPages} className="px-3 py-1 rounded bg-[#0b1720] border border-gray-800/50 text-gray-300 disabled:opacity-40">Next</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
