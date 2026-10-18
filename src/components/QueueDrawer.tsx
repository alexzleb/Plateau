import React from 'react';
import { X, Trash2, Play, Volume2, Sparkles, ListMusic } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime } from '../utils/formatters';

export const QueueDrawer: React.FC = () => {
  const {
    currentTrack,
    queue,
    isQueueOpen,
    setIsQueueOpen,
    removeFromQueue,
    clearQueue,
    playTrack,
    isPlaying,
    tracks,
  } = useMusic();

  if (!isQueueOpen) return null;

  // Suggested songs from library not currently in queue or playing
  const suggested = tracks
    .filter((t) => t.id !== currentTrack?.id && !queue.some((q) => q.id === t.id))
    .slice(0, 3);

  return (
    <aside className="fixed top-14 bottom-20 right-0 w-80 md:w-96 bg-white/95 dark:bg-[#161618]/95 backdrop-blur-2xl border-l border-black/10 dark:border-white/[0.08] shadow-2xl z-30 flex flex-col select-none animate-in slide-in-from-right duration-200 text-neutral-900 dark:text-white transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-black/[0.07] dark:border-white/[0.07] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            Playing Next
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">
            ({queue.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="text-[11px] text-neutral-500 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={() => setIsQueueOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
        {/* Now Playing */}
        {currentTrack && (
          <div>
            <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Now Playing
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30">
              <div className="relative shrink-0">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-11 h-11 rounded-lg object-cover border border-black/10 dark:border-white/10"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 truncate">
                  {currentTrack.title}
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-300 truncate">
                  {currentTrack.artist}
                </div>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                {formatTime(currentTrack.duration)}
              </span>
            </div>
          </div>
        )}

        {/* Up Next List */}
        <div>
          <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
            Queue
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-6 text-neutral-500 text-xs">
              Queue is empty. Select songs to add.
            </div>
          ) : (
            <div className="space-y-1">
              {queue.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  className="group flex items-center gap-3 p-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <button
                    onClick={() => {
                      const nextQueue = queue.filter((_, i) => i !== idx);
                      playTrack(track, nextQueue);
                    }}
                    className="relative shrink-0"
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-9 h-9 rounded-md object-cover border border-black/10 dark:border-white/10"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-md flex items-center justify-center transition-opacity">
                      <Play className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                      {track.title}
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                      {track.artist}
                    </div>
                  </div>

                  <span className="text-[10px] text-neutral-500 font-mono group-hover:hidden">
                    {formatTime(track.duration)}
                  </span>

                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="hidden group-hover:flex p-1 text-neutral-400 hover:text-red-500 transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Autoplay Suggestions */}
        {suggested.length > 0 && (
          <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              <span>Autoplay Recommendations</span>
            </div>
            <div className="space-y-1">
              {suggested.map((track) => (
                <div
                  key={`sugg-${track.id}`}
                  onClick={() => playTrack(track)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer group"
                >
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-8 h-8 rounded-md object-cover border border-black/10 dark:border-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate group-hover:text-amber-500 dark:group-hover:text-amber-400">
                      {track.title}
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                      {track.artist} · {track.albumTitle}
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {formatTime(track.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
