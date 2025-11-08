// src/App.tsx
import { useState, useEffect } from "react";
import Header from "./components/Header";
import MobileNav from "./components/MobileNav";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ProjectDetail from "./pages/ProjectDetail";
import AuthModal from "./components/AuthModal";
import Toast from "./components/Toast";
import { Project } from "./components/ProjectCard";
import { AuthProvider, useAuth } from "./lib/auth";
import { addBookmark as apiAddBookmark } from "./lib/api";

/**
 * InnerApp is the actual app UI wrapped by AuthProvider in default export below.
 * Keeping auth logic inside the inner component makes it simpler to use useAuth() if needed.
 */
function InnerApp() {
  const [activeView, setActiveView] = useState<"explore" | "profile">("explore");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [darkMode, setDarkMode] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const { user } = useAuth(); // will be null when not logged in

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsProjectDetailOpen(true);
  };

  /**
   * handleBookmark:
   * - If user not logged in: open auth modal
   * - If logged in: call backend addBookmark endpoint (API will ignore duplicates)
   *
   * Note: Profile page has a remove bookmark flow (calls remove endpoint).
   * Here we implement the "add bookmark" flow from Explore / ProjectCard.
   */
  const handleBookmark = async (projectId: string) => {
    if (!user) {
      setAuthMode("signin");
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await apiAddBookmark(projectId);
      showToast("Added to bookmarks", "success");
      // Optionally, you may emit an event or update a shared store to refresh lists
      // For simplicity, we let Home/Profile re-fetch their own data when needed.
    } catch (err: any) {
      console.error("Bookmark error:", err);
      showToast(err?.message || "Failed to bookmark project", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type, isVisible: true });
    // auto-hide after 3s
    setTimeout(() => setToast((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === "signin" ? "signup" : "signin"));
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
        {activeView === "explore" ? (
          <Home onProjectClick={handleProjectClick} onBookmark={handleBookmark} />
        ) : (
          <Profile onProjectClick={handleProjectClick} onBookmark={handleBookmark} />
        )}
      </div>

      <div className="lg:hidden">
        <MobileNav
          activeView={activeView === "explore" ? "explore" : "profile"}
          onViewChange={(view) => setActiveView(view as "explore" | "profile")}
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

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
    </div>
  );
}

/**
 * Wrap InnerApp with AuthProvider here so useAuth() works inside the component tree.
 * If you already wrap at a higher level (like main.tsx), you can export InnerApp directly.
 */
export default function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}
