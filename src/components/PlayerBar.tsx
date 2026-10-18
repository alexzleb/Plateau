import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  FileText,
  ListMusic,
  ArrowDownCircle,
  Check,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime, formatTimeRemaining } from '../utils/formatters';

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    isLyricsOpen,
    setIsLyricsOpen,
    isQueueOpen,
    setIsQueueOpen,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleFavorite,
    toggleDownload,
    navigate,
  } = useMusic();

  const [showRemaining, setShowRemaining] = useState(true);

  if (!currentTrack) {
    return null;
  }

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seekTo(val);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-4 h-4" />;
    if (volume < 0.5) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-20 bg-white/95 dark:bg-[#161618]/95 backdrop-blur-2xl border-t border-black/[0.08] dark:border-white/[0.08] px-4 lg:px-6 flex items-center justify-between select-none z-30 relative transition-colors duration-200">
      {/* Left: Track Info & Artwork (Expanded width to prevent title truncation) */}
      <div className="flex items-center gap-3.5 w-1/3 min-w-[220px] max-w-sm">
        <div
          className="relative group cursor-pointer shrink-0"
          onClick={() => navigate({ type: 'album-detail', albumId: currentTrack.albumId })}
        >
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.albumTitle}
            className="w-12 h-12 rounded-lg object-cover shadow-md shadow-black/20 dark:shadow-black/40 border border-black/10 dark:border-white/10"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center">
            <span
              onClick={() => navigate({ type: 'album-detail', albumId: currentTrack.albumId })}
              className="text-xs font-semibold text-neutral-900 dark:text-white hover:underline truncate cursor-pointer tracking-tight"
              title={currentTrack.title}
            >
              {currentTrack.title}
            </span>
          </div>

          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1 mt-0.5">
            <span
              onClick={() => navigate({ type: 'artist-detail', artistId: currentTrack.artistId })}
              className="hover:underline hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
            >
              {currentTrack.artist}
            </span>
            <span className="opacity-40">·</span>
            <span
              onClick={() => navigate({ type: 'album-detail', albumId: currentTrack.albumId })}
              className="hover:underline hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer truncate"
            >
              {currentTrack.albumTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Favorite */}
          <button
            onClick={() => toggleFavorite(currentTrack.id)}
            className={`p-1.5 rounded-full transition-colors ${
              currentTrack.isFavorite
                ? 'text-amber-500 dark:text-amber-400 fill-amber-400 hover:text-amber-600'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
            title={currentTrack.isFavorite ? 'Favorited' : 'Favorite'}
          >
            <Heart
              className={`w-4 h-4 ${currentTrack.isFavorite ? 'fill-amber-500 dark:fill-amber-400 stroke-amber-500 dark:stroke-amber-400' : ''}`}
            />
          </button>

          {/* Offline Download indicator & toggle */}
          <button
            onClick={() => toggleDownload(currentTrack.id)}
            className={`p-1.5 rounded-full transition-colors ${
              currentTrack.isDownloaded
                ? 'text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
            title={currentTrack.isDownloaded ? 'Downloaded Offline (Click to remove)' : 'Download Offline'}
          >
            {currentTrack.isDownloaded ? (
              <Check className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <ArrowDownCircle className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Center: Controls & Scrubber */}
      <div className="flex flex-col items-center max-w-xl w-full px-4">
        {/* Buttons row */}
        <div className="flex items-center gap-5 mb-1.5">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full transition-colors ${
              isShuffled
                ? 'text-amber-500 dark:text-amber-400 hover:text-amber-600'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={previousTrack}
            className="p-1 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
            title="Previous"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center transition-all shadow-md shadow-amber-400/20 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black stroke-black" />
            ) : (
              <Play className="w-4 h-4 fill-black stroke-black ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
            title="Next"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-1.5 rounded-full transition-colors ${
              repeatMode !== 'off'
                ? 'text-amber-500 dark:text-amber-400 hover:text-amber-600'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-3.5 h-3.5" />
            ) : (
              <Repeat className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Scrubber bar */}
        <div className="w-full flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
          <span className="w-8 text-right select-none">{formatTime(currentTime)}</span>

          <div className="relative flex-1 flex items-center h-4 group">
            {/* Background track */}
            <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 group-hover:bg-amber-300 rounded-full transition-[width] duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Native input for scrubbing */}
            <input
              type="range"
              min={0}
              max={duration || 180}
              step={0.5}
              value={currentTime}
              onChange={handleSeekChange}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            />
          </div>

          <button
            onClick={() => setShowRemaining(!showRemaining)}
            className="w-9 text-left select-none hover:text-black dark:hover:text-white transition-colors"
            title="Click to toggle remaining / total time"
          >
            {showRemaining
              ? formatTimeRemaining(currentTime, duration)
              : formatTime(duration)}
          </button>
        </div>
      </div>

      {/* Right: Lyrics/Notes, Queue, Volume */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">

        {/* Lyrics & Artist Notes Drawer Button */}
        <button
          onClick={() => {
            setIsLyricsOpen(!isLyricsOpen);
            if (!isLyricsOpen) setIsQueueOpen(false);
          }}
          className={`p-2 rounded-lg transition-colors ${
            isLyricsOpen
              ? 'bg-amber-400/20 text-amber-500 dark:text-amber-400'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.06]'
          }`}
          title="Artist Notes & Lyrics"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Queue Button */}
        <button
          onClick={() => {
            setIsQueueOpen(!isQueueOpen);
            if (!isQueueOpen) setIsLyricsOpen(false);
          }}
          className={`p-2 rounded-lg transition-colors ${
            isQueueOpen
              ? 'bg-amber-400/20 text-amber-500 dark:text-amber-400'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.06]'
          }`}
          title="Playing Next Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume controls */}
        <div className="flex items-center gap-1.5 w-28">
          <button
            onClick={toggleMute}
            className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white p-1 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {getVolumeIcon()}
          </button>

          <div className="relative flex-1 flex items-center h-4 group">
            <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-900 dark:bg-white group-hover:bg-amber-400 rounded-full"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
