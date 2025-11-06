import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ProjectCard, { Project } from '../components/ProjectCard';
import { mockProjects } from '../data/mockData';
import { Sparkles } from 'lucide-react';

interface HomeProps {
  onProjectClick: (project: Project) => void;
  onBookmark: (projectId: string) => void;
}

export default function Home({ onProjectClick, onBookmark }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('trending');

  const handleTechToggle = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      searchQuery === '' ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTech =
      selectedTechs.length === 0 ||
      selectedTechs.some((tech) => project.techs.includes(tech));

    const matchesDifficulty =
      selectedDifficulty === null || project.difficulty === selectedDifficulty;

    return matchesSearch && matchesTech && matchesDifficulty;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'stars') return b.stars - a.stars;
    if (sortBy === 'new') return b.id.localeCompare(a.id);
    return 0;
  });

  const handleGitHubClick = (e: React.MouseEvent, owner: string, name: string) => {
    e.stopPropagation();
    window.open(`https://github.com/${owner}/${name}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0b0f14]">
      <div className="relative bg-gradient-to-b from-teal-500/10 via-[#0b0f14] to-[#0b0f14] border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-teal-400" />
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-100">
                Open Source Discovery
              </h1>
            </div>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Discover open-source projects to contribute to — filtered by tech and difficulty.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search projects, repos, topics..."
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-8 bg-[#0f1720] rounded-2xl border border-gray-800/50 p-5">
              <FilterBar
                selectedTechs={selectedTechs}
                onTechToggle={handleTechToggle}
                selectedDifficulty={selectedDifficulty}
                onDifficultyChange={setSelectedDifficulty}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-4 text-sm text-gray-400">
              {sortedProjects.length} project{sortedProjects.length !== 1 ? 's' : ''} found
            </div>

            {sortedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {sortedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onCardClick={onProjectClick}
                    onBookmark={onBookmark}
                    onGitHubClick={(e) => handleGitHubClick(e, project.owner, project.name)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#0f1720] rounded-2xl border border-gray-800/50">
                <div className="mb-4 text-4xl">🔍</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No projects found
                </h3>
                <p className="text-gray-500">
                  Try selecting other technologies or adjusting your filters.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
