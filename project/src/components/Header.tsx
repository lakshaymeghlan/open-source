// src/components/Header.tsx
import React from 'react';
import { SunMoon } from 'lucide-react';

interface HeaderProps {
  user: any | null;
  loadingProfile?: boolean;
  onAuthClick: () => void;
  onLogout: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  activeView: string;
  onViewChange: (v: string) => void;
}

export default function Header({ user, loadingProfile, onAuthClick, onLogout, darkMode, onDarkModeToggle, activeView, onViewChange }: HeaderProps) {
  return (
    <header className="w-full bg-[#071018] border-b border-gray-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-teal-300 font-bold">OS Discovery</div>
          <nav className="hidden md:flex gap-3 text-gray-400">
            <button onClick={() => onViewChange('explore')} className={`px-3 py-2 rounded ${activeView === 'explore' ? 'text-teal-300' : 'hover:text-gray-200'}`}>Explore</button>
            <button onClick={() => onViewChange('profile')} className={`px-3 py-2 rounded ${activeView === 'profile' ? 'text-teal-300' : 'hover:text-gray-200'}`}>Profile</button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onDarkModeToggle} className="p-2 rounded hover:bg-gray-800/30">
            <SunMoon className="w-5 h-5 text-gray-300" />
          </button>

          {loadingProfile ? (
            <div className="w-24 h-8 bg-gray-800/30 rounded-xl animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <button onClick={() => onViewChange('profile')} className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-600/10 hover:bg-teal-600/20">
                <img src={user.avatar || '/default-avatar.png'} alt={user.name || user.email} className="w-6 h-6 rounded-full border border-gray-700" />
                <span className="text-sm text-gray-200 hidden sm:block">{user.name ?? user.username ?? 'Profile'}</span>
              </button>
              <button onClick={onLogout} className="px-3 py-1 rounded bg-gray-800/60 hover:bg-red-600/20 text-gray-300">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={onAuthClick} className="px-3 py-1 rounded bg-teal-600 text-black font-medium hover:opacity-90">Sign In</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
