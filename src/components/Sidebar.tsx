import React, { useState } from 'react';
import {
  Compass,
  LayoutGrid,
  Radio,
  Clock,
  User,
  Disc3,
  Music2,
  ArrowDownCircle,
  Plus,
  Search,
  ListMusic,
  Trash2,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { ActiveView } from '../types/music';
import { PyramidLogo } from './PyramidLogo';

interface SidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '', onCloseMobile }) => {
  const {
    activeView,
    navigate,
    playlists,
    createPlaylist,
    deletePlaylist,
    searchQuery,
    setSearchQuery,
    tracks,
  } = useMusic();

  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');

  const downloadedCount = tracks.filter((t) => t.isDownloaded).length;

  const handleNavClick = (view: ActiveView) => {
    navigate(view);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      navigate({ type: 'search', query: val });
    }
  };

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistTitle.trim()) {
      const pl = createPlaylist(newPlaylistTitle.trim(), 'Personal playlist');
      setNewPlaylistTitle('');
      setIsCreatingPlaylist(false);
      navigate({ type: 'playlist-detail', playlistId: pl.id });
    }
  };

  const isNavActive = (type: ActiveView['type'], extraId?: string): boolean => {
    if (activeView.type !== type) return false;
    if (type === 'playlist-detail' && 'playlistId' in activeView) {
      return activeView.playlistId === extraId;
    }
    return true;
  };

  return (
    <aside
      className={`w-64 h-full bg-[#fbfbfd] dark:bg-[#121214]/95 backdrop-blur-2xl border-r border-black/[0.07] dark:border-white/[0.07] flex flex-col select-none transition-colors duration-200 ${className}`}
    >
      {/* Brand Header: Plateau · PRZM */}
      <div className="p-5 pb-3">
        <div
          className="flex items-center gap-2.5 mb-5 cursor-pointer group"
          onClick={() => handleNavClick({ type: 'listen-now' })}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-900 to-black dark:from-neutral-800 dark:to-black p-1.5 flex items-center justify-center shadow-lg shadow-amber-500/10 border border-amber-500/30 group-hover:border-amber-400 transition-colors">
            <PyramidLogo className="w-full h-full" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white block leading-none">
              Plateau
            </span>
            <span className="text-[9px] font-semibold tracking-widest uppercase text-amber-600 dark:text-amber-400/90 font-mono mt-0.5 block">
              PRZM STUDIO
            </span>
          </div>
        </div>

        {/* Apple Music Style Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search"
            className="w-full bg-neutral-200/70 dark:bg-neutral-900/80 border border-neutral-300/80 dark:border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400/60 focus:bg-white dark:focus:bg-neutral-800 transition-all"
          />
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 text-xs no-scrollbar">
        {/* Discover section */}
        <div>
          <div className="px-3 pb-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase">
            Discover
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => handleNavClick({ type: 'listen-now' })}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                isNavActive('listen-now')
                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>Listen Now</span>
            </button>

            <button
              onClick={() => handleNavClick({ type: 'browse' })}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                isNavActive('browse')
                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span>Browse</span>
            </button>

            <button
              onClick={() => handleNavClick({ type: 'radio' })}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                isNavActive('radio')
                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
              }`}
            >
              <Radio className="w-4 h-4 shrink-0" />
              <span>Radio</span>
            </button>
          </div>
        </div>

        {/* Library section */}
        <div>
          <div className="px-3 pb-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase">
            Library
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => handleNavClick({ type: 'recently-added' })}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                isNavActive('recently-added')
                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Recently Added</span>
            </button>

            <button
              onClick={() => handleNavClick({ type: 'artists' })}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                isNavActive('artists') || isNavActive('artist-detail')
                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Artists</span>
            </button>

            <button
              onClick={() => handleNavClick({ type: 'albums' })}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                isNavActive('albums') || isNavActive('album-detail')
                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
              }`}
            >
              <Disc3 className="w-4 h-4 shrink-0" />
              <span>Albums</span>
            </button>

            <button
              onClick={() => handleNavClick({ type: 'songs' })}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                isNavActive('songs')
                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
              }`}
            >
              <Music2 className="w-4 h-4 shrink-0" />
              <span>Songs</span>
            </button>

            <button
              onClick={() => handleNavClick({ type: 'downloaded' })}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                isNavActive('downloaded')
                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <ArrowDownCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">Downloaded</span>
              </div>
              {downloadedCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isNavActive('downloaded')
                      ? 'bg-black text-amber-400'
                      : 'bg-black/10 dark:bg-white/10 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {downloadedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Playlists section */}
        <div>
          <div className="flex items-center justify-between px-3 pb-1.5">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase">
              Playlists
            </span>
            <button
              onClick={() => setIsCreatingPlaylist(!isCreatingPlaylist)}
              title="New Playlist"
              className="text-neutral-500 hover:text-amber-500 dark:text-neutral-400 dark:hover:text-amber-400 p-0.5 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isCreatingPlaylist && (
            <form onSubmit={handleCreatePlaylistSubmit} className="px-3 mb-2">
              <input
                type="text"
                autoFocus
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                placeholder="Playlist name..."
                className="w-full bg-neutral-200 dark:bg-neutral-900 border border-amber-400/50 rounded px-2.5 py-1 text-xs text-neutral-900 dark:text-white focus:outline-none"
              />
            </form>
          )}

          <div className="space-y-0.5">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className={`group flex items-center justify-between px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  isNavActive('playlist-detail', pl.id)
                    ? 'bg-amber-400 text-black font-semibold shadow-sm'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
                }`}
                onClick={() => handleNavClick({ type: 'playlist-detail', playlistId: pl.id })}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ListMusic className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate text-xs">{pl.title}</span>
                </div>
                {pl.isUserCreated && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(pl.id);
                    }}
                    title="Delete playlist"
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
