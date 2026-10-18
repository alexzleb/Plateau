import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  Sun,
  Moon,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

interface TopBarProps {
  onOpenMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const {
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    artist,
    artists,
    navigate,
    activeView,
    offlineOnlyMode,
    setOfflineOnlyMode,
    theme,
    toggleTheme,
    appMode,
    setAppMode,
  } = useMusic();

  const getTitle = (): string => {
    switch (activeView.type) {
      case 'listen-now':
        return 'Listen Now';
      case 'browse':
        return 'Browse';
      case 'radio':
        return 'Radio';
      case 'recently-added':
        return 'Recently Added';
      case 'artists':
        return 'Artists';
      case 'artist-detail': {
        const found = artists.find((a) => a.id === activeView.artistId) || artist;
        return found ? found.name : 'Artist';
      }
      case 'albums':
        return 'Albums';
      case 'album-detail':
        return 'Album';
      case 'songs':
        return 'Songs';
      case 'downloaded':
        return 'Downloaded (Offline)';
      case 'playlist-detail':
        return 'Playlist';
      case 'search':
        return `Search: ${activeView.query}`;
      default:
        return 'Plateau';
    }
  };

  return (
    <header className="h-14 px-4 lg:px-8 border-b border-black/[0.07] dark:border-white/[0.07] bg-white/75 dark:bg-black/60 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20 select-none transition-colors duration-200">
      {/* Left: Navigation history arrows */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-md"
            aria-label="Menu"
          >
            <div className="w-4 h-0.5 bg-current mb-1" />
            <div className="w-4 h-0.5 bg-current mb-1" />
            <div className="w-4 h-0.5 bg-current" />
          </button>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={`p-1.5 rounded-full transition-colors ${
              canGoBack
                ? 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95'
                : 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed opacity-40'
            }`}
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className={`p-1.5 rounded-full transition-colors ${
              canGoForward
                ? 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95'
                : 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed opacity-40'
            }`}
            title="Go Forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight ml-2 hidden sm:block truncate max-w-xs">
          {getTitle()}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Offline test mode button */}
        <button
          onClick={() => setOfflineOnlyMode(!offlineOnlyMode)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            offlineOnlyMode
              ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 border-amber-400/40'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-neutral-200 border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
          }`}
          title={offlineOnlyMode ? 'Offline Mode Active' : 'Simulate Offline Mode'}
        >
          {offlineOnlyMode ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="hidden sm:inline">Offline</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Online</span>
            </>
          )}
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-full border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-amber-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Artist profile avatar button */}
        <button
          onClick={() => navigate({ type: 'artists' })}
          className="relative group p-0.5 rounded-full hover:ring-2 hover:ring-amber-400 transition-all ml-0.5"
          title={`Artists roster (${artists.length} artists)`}
        >
          <img
            src={artist.avatarUrl}
            alt={artist.name}
            className="w-7 h-7 rounded-full object-cover border border-black/10 dark:border-white/10"
            referrerPolicy="no-referrer"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white dark:border-black" />
        </button>
      </div>
    </header>
  );
};
