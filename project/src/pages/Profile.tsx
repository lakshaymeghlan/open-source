import { useState } from 'react';
import Card from '../components/Card';
import Chip from '../components/Chip';
import ProjectCard, { Project } from '../components/ProjectCard';
import { mockProjects, mockUserProfile } from '../data/mockData';
import { Award, Bookmark, GitPullRequest } from 'lucide-react';

interface ProfileProps {
  onProjectClick: (project: Project) => void;
  onBookmark: (projectId: string) => void;
}

export default function Profile({ onProjectClick, onBookmark }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'bookmarked' | 'contributions'>('bookmarked');

  const bookmarkedProjects = mockProjects.filter((p) => p.isBookmarked);
  const contributionProjects = mockProjects.slice(0, 3);

  const displayedProjects = activeTab === 'bookmarked' ? bookmarkedProjects : contributionProjects;

  const handleGitHubClick = (e: React.MouseEvent, owner: string, name: string) => {
    e.stopPropagation();
    window.open(`https://github.com/${owner}/${name}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0b0f14]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Card className="p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={mockUserProfile.avatar}
              alt={mockUserProfile.name}
              className="w-24 h-24 rounded-full border-2 border-gray-700"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-100 mb-1">
                {mockUserProfile.name}
              </h1>
              <p className="text-gray-400 mb-3">@{mockUserProfile.username}</p>
              <p className="text-gray-300 leading-relaxed mb-4">{mockUserProfile.bio}</p>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Preferred Technologies
                </label>
                <div className="flex flex-wrap gap-2">
                  {mockUserProfile.preferredTechs.map((tech) => (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {mockUserProfile.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-teal-500/10 border-teal-500/50'
                    : 'bg-[#0b0f14] border-gray-800/50 opacity-50'
                }`}
              >
                <div className="text-2xl mb-2">{achievement.unlocked ? '🏆' : '🔒'}</div>
                <div className="text-sm font-medium text-gray-300">{achievement.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <div className="flex gap-2 mb-6 border-b border-gray-800/50">
            <button
              onClick={() => setActiveTab('bookmarked')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                activeTab === 'bookmarked'
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Bookmarked
              <span className="px-2 py-0.5 bg-[#1a2332] rounded-full text-xs">
                {bookmarkedProjects.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('contributions')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                activeTab === 'contributions'
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <GitPullRequest className="w-4 h-4" />
              Contributions
              <span className="px-2 py-0.5 bg-[#1a2332] rounded-full text-xs">
                {contributionProjects.length}
              </span>
            </button>
          </div>

          {displayedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayedProjects.map((project) => (
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
              <div className="mb-4 text-4xl">
                {activeTab === 'bookmarked' ? '📚' : '🚀'}
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {activeTab === 'bookmarked' ? 'No bookmarked projects yet' : 'No contributions yet'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'bookmarked'
                  ? 'Start exploring and bookmark projects you want to contribute to.'
                  : 'Make your first contribution to unlock this achievement!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
