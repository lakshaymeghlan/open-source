import { Compass, Search, User, RefreshCw } from 'lucide-react';

interface MobileNavProps {
  activeView: 'explore' | 'search' | 'profile';
  onViewChange: (view: 'explore' | 'search' | 'profile') => void;
}

export default function MobileNav({ activeView, onViewChange }: MobileNavProps) {
  const navItems = [
    { id: 'explore' as const, icon: Compass, label: 'Explore' },
    { id: 'search' as const, icon: Search, label: 'Search' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0f1720] border-t border-gray-800/50 lg:hidden z-40">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[72px] ${
                isActive
                  ? 'text-teal-400 bg-teal-500/10'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-[#1a2332]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
        <button
          className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[72px] text-gray-400 hover:text-gray-300 hover:bg-[#1a2332]"
          onClick={() => console.log('Sync clicked')}
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-xs font-medium">Sync</span>
        </button>
      </div>
    </nav>
  );
}
