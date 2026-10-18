import React from 'react';
import {
  ArrowDownCircle,
  Play,
  Shuffle,
  Check,
  WifiOff,
  Wifi,
  Trash2,
  HardDrive,
  FileText,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime } from '../utils/formatters';

export const DownloadedView: React.FC = () => {
  const {
    tracks,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleDownload,
    offlineOnlyMode,
    setOfflineOnlyMode,
    setIsLyricsOpen,
  } = useMusic();

  const downloadedTracks = tracks.filter((t) => t.isDownloaded);

  const handlePlayAll = () => {
    if (downloadedTracks.length > 0) {
      playTrack(downloadedTracks[0], downloadedTracks.slice(1));
    }
  };

  const handleShuffleAll = () => {
    if (downloadedTracks.length > 0) {
      const shuffled = [...downloadedTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled.slice(1));
    }
  };

  const estimatedStorageMb = (downloadedTracks.length * 4.2).toFixed(1);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 select-none transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-1">
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Offline Storage</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Downloaded Music
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Saved to local IndexedDB storage for seamless offline listening anywhere.
          </p>
        </div>

        {/* Offline Mode Test Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOfflineOnlyMode(!offlineOnlyMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              offlineOnlyMode
                ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/20'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-300 hover:text-black dark:hover:text-white border-neutral-300 dark:border-white/10'
            }`}
          >
            {offlineOnlyMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span>{offlineOnlyMode ? 'Offline Test Mode: ACTIVE' : 'Simulate Offline Mode'}</span>
          </button>
        </div>
      </div>

      {/* Storage Status Box */}
      <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              {downloadedTracks.length} Songs Downloaded ({estimatedStorageMb} MB)
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {offlineOnlyMode ? 'Network disconnected. Playing only cached offline tracks.' : 'Ready for airplane mode or zero internet playback.'}
            </div>
          </div>
        </div>

        {downloadedTracks.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayAll}
              className="px-4 py-1.5 rounded-lg bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 shadow"
            >
              <Play className="w-3 h-3 fill-black" />
              <span>Play All</span>
            </button>
            <button
              onClick={handleShuffleAll}
              className="px-3 py-1.5 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 text-neutral-800 dark:text-white text-xs font-medium flex items-center gap-1.5"
            >
              <Shuffle className="w-3 h-3" />
              <span>Shuffle</span>
            </button>
          </div>
        )}
      </div>

      {/* Downloaded Tracklist */}
      {downloadedTracks.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-black/10 dark:border-white/10 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01]">
          <ArrowDownCircle className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">No songs downloaded yet</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-4">
            Click the download icon on any song or album to save it for offline listening.
          </p>
          <button
            onClick={() => {
              // Download top 3 tracks
              tracks.slice(0, 3).forEach((t) => toggleDownload(t.id));
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 text-black font-semibold text-xs hover:bg-amber-300 transition-colors"
          >
            Download First 3 Tracks
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
                <th className="py-3 px-4 text-center w-24">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {downloadedTracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;

                return (
                  <tr
                    key={track.id}
                    onClick={() => playTrack(track, downloadedTracks.filter((t) => t.id !== track.id))}
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
                          className="w-9 h-9 rounded-lg object-cover border border-black/10 dark:border-white/10"
                        />
                        <div className="min-w-0 pr-2">
                          <div
                            className={`font-semibold truncate ${
                              isCurrent ? 'text-amber-500 dark:text-amber-400' : 'text-neutral-900 dark:text-white'
                            }`}
                            title={track.title}
                          >
                            {track.title}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                            {track.artist}
                          </div>
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
                          toggleDownload(track.id);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-500 rounded transition-colors"
                        title="Remove from offline downloads"
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
  );
};
