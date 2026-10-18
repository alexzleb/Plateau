import React, { useState } from 'react';
import {
  Play,
  Shuffle,
  Trash2,
  Plus,
  ListMusic,
  Clock,
  FileText,
  X,
  Check,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime } from '../utils/formatters';

interface PlaylistDetailViewProps {
  playlistId: string;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({ playlistId }) => {
  const {
    playlists,
    tracks,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    removeTrackFromPlaylist,
    addTrackToPlaylist,
    deletePlaylist,
    navigate,
    setIsLyricsOpen,
  } = useMusic();

  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);

  const playlist = playlists.find((p) => p.id === playlistId) || playlists[0];
  if (!playlist) {
    return <div className="p-8 text-neutral-400">Playlist not found.</div>;
  }

  const playlistTracks = playlist.trackIds
    .map((id) => tracks.find((t) => t.id === id))
    .filter(Boolean) as typeof tracks;

  const totalDuration = playlistTracks.reduce((acc, t) => acc + t.duration, 0);

  // Available tracks not in playlist
  const availableTracks = tracks.filter((t) => !playlist.trackIds.includes(t.id));

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0], playlistTracks.slice(1));
    }
  };

  const handleShuffleAll = () => {
    if (playlistTracks.length > 0) {
      const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled.slice(1));
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 select-none transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
        {/* Cover Art / Gradient */}
        <div
          className={`w-48 h-48 lg:w-56 lg:h-56 rounded-2xl bg-gradient-to-br ${playlist.coverGradient || 'from-amber-500 to-yellow-600'} flex items-center justify-center shadow-2xl border border-black/10 dark:border-white/10 shrink-0 overflow-hidden relative`}
        >
          {playlist.coverUrl ? (
            <img
              src={playlist.coverUrl}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <ListMusic className="w-16 h-16 text-white/80" />
          )}
        </div>

        {/* Info & Actions */}
        <div className="flex-1 text-center sm:text-left flex flex-col justify-between py-1">
          <div>
            <div className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-1.5">
              Playlist
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-2">
              {playlist.title}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl mb-3">
              {playlist.description}
            </p>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              <span>{playlistTracks.length} Songs</span>
              <span className="mx-1.5 text-neutral-400 dark:text-neutral-600">·</span>
              <span>{Math.round(totalDuration / 60)} Minutes</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-6">
            <button
              onClick={handlePlayAll}
              disabled={playlistTracks.length === 0}
              className={`px-6 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2 shadow-lg transition-all ${
                playlistTracks.length > 0
                  ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20 active:scale-95'
                  : 'bg-black/10 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Play</span>
            </button>

            <button
              onClick={handleShuffleAll}
              disabled={playlistTracks.length === 0}
              className="px-5 py-2.5 rounded-full bg-black/[0.05] hover:bg-black/[0.1] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-neutral-800 dark:text-white font-medium text-xs flex items-center gap-2 border border-black/10 dark:border-white/10 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>

            <button
              onClick={() => setIsAddSongModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-600 dark:text-amber-400 font-medium text-xs border border-amber-400/30 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Songs</span>
            </button>

            {playlist.isUserCreated && (
              <button
                onClick={() => {
                  if (confirm(`Delete playlist "${playlist.title}"?`)) {
                    deletePlaylist(playlist.id);
                    navigate({ type: 'listen-now' });
                  }
                }}
                className="p-2.5 text-neutral-400 hover:text-red-500 transition-colors"
                title="Delete playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Tracklist */}
      <div className="pt-4 border-t border-black/[0.08] dark:border-white/[0.08]">
        {playlistTracks.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-xs">
            This playlist has no songs yet.{' '}
            <button
              onClick={() => setIsAddSongModalOpen(true)}
              className="text-amber-500 dark:text-amber-400 hover:underline font-semibold ml-1"
            >
              Add songs from your catalog.
            </button>
          </div>
        ) : (
          <div className="border border-black/[0.08] dark:border-white/[0.08] rounded-2xl bg-white dark:bg-white/[0.02] shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.06] text-neutral-500 uppercase tracking-wider text-[10px] font-semibold bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-2/5 min-w-[240px]">Title</th>
                  <th className="py-3 px-4 w-1/4">Album</th>
                  <th className="py-3 px-4 text-right w-24">Duration</th>
                  <th className="py-3 px-4 text-center w-16">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {playlistTracks.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;

                  return (
                    <tr
                      key={track.id}
                      onClick={() => playTrack(track, playlistTracks.filter((t) => t.id !== track.id))}
                      className={`group transition-colors cursor-pointer ${
                        isCurrent ? 'bg-amber-400/10' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono text-neutral-400 dark:text-neutral-500">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-8 h-8 rounded-md object-cover border border-black/10 dark:border-white/10 shrink-0"
                          />
                          <div className="min-w-0 pr-2">
                            <span
                              className={`font-semibold truncate block ${
                                isCurrent ? 'text-amber-500 dark:text-amber-400' : 'text-neutral-900 dark:text-white'
                              }`}
                              title={track.title}
                            >
                              {track.title}
                            </span>
                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate block">
                              {track.artist}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                        {track.albumTitle}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-neutral-500 dark:text-neutral-400">
                        {formatTime(track.duration)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTrackFromPlaylist(playlist.id, track.id);
                          }}
                          className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Songs Modal */}
      {isAddSongModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181b] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Add Songs to "{playlist.title}"
              </h3>
              <button
                onClick={() => setIsAddSongModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1.5 no-scrollbar">
              {availableTracks.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 dark:text-neutral-400 text-xs">
                  All catalog songs are already in this playlist!
                </div>
              ) : (
                availableTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-8 h-8 rounded-md object-cover border border-black/10 dark:border-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                          {track.title}
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                          {track.artist} · {track.albumTitle}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => addTrackToPlaylist(playlist.id, track.id)}
                      className="px-2.5 py-1 rounded bg-amber-400/20 hover:bg-amber-400 text-amber-700 dark:text-amber-300 hover:text-black font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsAddSongModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-black/10 dark:bg-white/10 text-neutral-900 dark:text-white hover:bg-black/20 dark:hover:bg-white/20 text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
