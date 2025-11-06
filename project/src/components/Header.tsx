import { Sparkles, User, LogIn, Moon, Sun } from 'lucide-react';
import Button from './Button';

interface HeaderProps {
  onAuthClick: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  activeView: 'explore' | 'profile';
  onViewChange: (view: 'explore' | 'profile') => void;
}

export default function Header({ onAuthClick, darkMode, onDarkModeToggle, activeView, onViewChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#0f1720]/95 backdrop-blur-sm border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onViewChange('explore')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Sparkles className="w-6 h-6 text-teal-400" />
            <span className="text-lg font-bold text-gray-100 hidden sm:inline">
              OS Discovery
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onDarkModeToggle}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#1a2332] rounded-xl transition-all"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant={activeView === 'profile' ? 'primary' : 'ghost'}
                size="sm"
                icon={User}
                onClick={() => onViewChange('profile')}
              >
                Profile
              </Button>
              <Button variant="secondary" size="sm" icon={LogIn} onClick={onAuthClick}>
                Sign In
              </Button>
            </div>

            <button
              onClick={onAuthClick}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-200 hover:bg-[#1a2332] rounded-xl transition-all"
            >
              <LogIn className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
