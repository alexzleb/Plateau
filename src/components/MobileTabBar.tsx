import React from 'react';
import { Compass, LayoutGrid, Library, Search, User } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { ActiveView } from '../types/music';

export const MobileTabBar: React.FC = () => {
  const { activeView, navigate } = useMusic();

  const tabs: { label: string; icon: React.ReactNode; view: ActiveView }[] = [
    { label: 'Listen Now', icon: <Compass className="w-5 h-5" />, view: { type: 'listen-now' } },
    { label: 'Browse', icon: <LayoutGrid className="w-5 h-5" />, view: { type: 'browse' } },
    { label: 'Artists', icon: <User className="w-5 h-5" />, view: { type: 'artists' } },
    { label: 'Library', icon: <Library className="w-5 h-5" />, view: { type: 'recently-added' } },
    { label: 'Search', icon: <Search className="w-5 h-5" />, view: { type: 'search', query: '' } },
  ];

  const isActive = (tabView: ActiveView) => {
    if (tabView.type === 'artists') {
      return ['artists', 'artist-detail'].includes(activeView.type);
    }
    if (tabView.type === 'recently-added') {
      return ['recently-added', 'albums', 'songs', 'downloaded', 'album-detail', 'playlist-detail'].includes(activeView.type);
    }
    return activeView.type === tabView.type;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#ffffff]/95 dark:bg-[#121214]/95 backdrop-blur-2xl border-t border-black/[0.08] dark:border-white/[0.08] z-30 grid grid-cols-5 items-center select-none transition-colors duration-200">
      {tabs.map((tab) => {
        const active = isActive(tab.view);
        return (
          <button
            key={tab.label}
            onClick={() => navigate(tab.view)}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
              active
                ? 'text-amber-500 dark:text-amber-400 font-bold'
                : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <div>
              {tab.icon}
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-1">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
