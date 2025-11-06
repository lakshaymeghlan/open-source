import { useState, useEffect } from 'react';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ProjectDetail from './pages/ProjectDetail';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import { Project } from './components/ProjectCard';
import { mockProjects } from './data/mockData';

function App() {
  const [activeView, setActiveView] = useState<'explore' | 'profile'>('explore');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [darkMode, setDarkMode] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });
  const [projects, setProjects] = useState(mockProjects);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsProjectDetailOpen(true);
  };

  const handleBookmark = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, isBookmarked: !p.isBookmarked } : p
      )
    );

    const project = projects.find((p) => p.id === projectId);
    if (project) {
      showToast(
        project.isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
        'success'
      );
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
  };

  return (
    <div className="min-h-screen bg-[#0b0f14]">
      <Header
        onAuthClick={() => setIsAuthModalOpen(true)}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <div className="pb-16 lg:pb-0">
        {activeView === 'explore' ? (
          <Home onProjectClick={handleProjectClick} onBookmark={handleBookmark} />
        ) : (
          <Profile onProjectClick={handleProjectClick} onBookmark={handleBookmark} />
        )}
      </div>

      <div className="lg:hidden">
        <MobileNav
          activeView={activeView === 'explore' ? 'explore' : 'profile'}
          onViewChange={(view) => setActiveView(view as 'explore' | 'profile')}
        />
      </div>

      <ProjectDetail
        project={selectedProject}
        isOpen={isProjectDetailOpen}
        onClose={() => setIsProjectDetailOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onToggleMode={toggleAuthMode}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

export default App;
