import React, { useState } from 'react';
import {
  Play,
  Pause,
  Heart,
  ArrowDownCircle,
  Check,
  FileText,
  Clock,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime, formatPlayCount } from '../utils/formatters';
import { Track } from '../types/music';

export const LibrarySongsView: React.FC = () => {
  const {
    tracks,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleFavorite,
    toggleDownload,
    setIsLyricsOpen,
    navigate,
  } = useMusic();

  const [sortField, setSortField] = useState<'title' | 'artist' | 'album' | 'duration' | 'plays'>('title');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterText, setFilterText] = useState('');

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = tracks.filter((t) => {
    const q = filterText.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.albumTitle.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortField === 'artist') cmp = a.artist.localeCompare(b.artist);
    else if (sortField === 'album') cmp = a.albumTitle.localeCompare(b.albumTitle);
    else if (sortField === 'duration') cmp = a.duration - b.duration;
    else if (sortField === 'plays') cmp = a.plays - b.plays;
    return sortAsc ? cmp : -cmp;
  });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6 select-none transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-1">
            Library
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Songs ({tracks.length})
          </h1>
        </div>

        {/* Filter input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter songs..."
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Songs Table */}
      <div className="border border-black/[0.08] dark:border-white/[0.08] rounded-2xl bg-white dark:bg-white/[0.02] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.06] text-neutral-500 uppercase tracking-wider text-[10px] font-semibold bg-black/[0.02] dark:bg-white/[0.02]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-neutral-900 dark:hover:text-white w-2/5 min-w-[240px]"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Title</span>
                    {sortField === 'title' && <ArrowUpDown className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-neutral-900 dark:hover:text-white w-1/4"
                  onClick={() => handleSort('artist')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Artist</span>
                    {sortField === 'artist' && <ArrowUpDown className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-neutral-900 dark:hover:text-white w-1/4"
                  onClick={() => handleSort('album')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Album</span>
                    {sortField === 'album' && <ArrowUpDown className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-right cursor-pointer hover:text-neutral-900 dark:hover:text-white w-24"
                  onClick={() => handleSort('duration')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {sorted.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                const isTrackPlaying = isCurrent && isPlaying;

                return (
                  <tr
                    key={track.id}
                    onDoubleClick={() => playTrack(track, sorted.filter((t) => t.id !== track.id))}
                    className={`group transition-colors cursor-pointer ${
                      isCurrent ? 'bg-amber-400/10' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* # / Play Icon */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono text-neutral-400 dark:text-neutral-500 group-hover:hidden ${
                          isCurrent ? 'text-amber-500 dark:text-amber-400 font-bold' : ''
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrent) togglePlay();
                          else playTrack(track, sorted.filter((t) => t.id !== track.id));
                        }}
                        className="hidden group-hover:inline-flex items-center justify-center text-neutral-900 dark:text-white"
                      >
                        {isTrackPlaying ? (
                          <Pause className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                      </button>
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-9 h-9 rounded-md object-cover border border-black/10 dark:border-white/10 shrink-0"
                        />
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-semibold truncate block ${
                                isCurrent ? 'text-amber-500 dark:text-amber-400' : 'text-neutral-900 dark:text-white'
                              }`}
                              title={track.title}
                            >
                              {track.title}
                            </span>
                            {track.isExplicit && (
                              <span className="text-[9px] font-bold px-1 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-white/10 shrink-0">
                                E
                              </span>
                            )}
                            {track.specialNotes && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playTrack(track);
                                  setIsLyricsOpen(true);
                                }}
                                className="shrink-0 p-0.5 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-transform hover:scale-110"
                                title="View creator liner notes"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Artist */}
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate({ type: 'artist-detail', artistId: track.artistId });
                        }}
                        className="hover:underline hover:text-neutral-900 dark:hover:text-white"
                      >
                        {track.artist}
                      </span>
                    </td>

                    {/* Album */}
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate({ type: 'album-detail', albumId: track.albumId });
                        }}
                        className="hover:underline hover:text-neutral-900 dark:hover:text-white truncate block max-w-xs"
                      >
                        {track.albumTitle}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 text-right font-mono text-neutral-500 dark:text-neutral-400">
                      {formatTime(track.duration)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(track.id);
                          }}
                          className={`p-1 ${
                            track.isFavorite
                              ? 'text-amber-500 dark:text-amber-400'
                              : 'text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white'
                          }`}
                          title={track.isFavorite ? 'Favorited' : 'Add to Favorites'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDownload(track.id);
                          }}
                          className={`p-1 ${track.isDownloaded ? 'text-amber-400' : 'text-neutral-500 hover:text-white'}`}
                          title={track.isDownloaded ? 'Downloaded' : 'Download'}
                        >
                          {track.isDownloaded ? (
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDownCircle className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
