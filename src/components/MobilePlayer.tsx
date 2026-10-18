import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronDown,
  Heart,
  Volume2,
  FileText,
  ListMusic,
  ArrowDownCircle,
  Check,
  Sparkles,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime, formatTimeRemaining } from '../utils/formatters';

export const MobilePlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMobilePlayerExpanded,
    setIsMobilePlayerExpanded,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleFavorite,
    toggleDownload,
    updateTrackNotes,
  } = useMusic();

  const [activeTab, setActiveTab] = useState<'cover' | 'notes'>('cover');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Render Mini Player (Bottom Docked above navigation tabs)
  if (!isMobilePlayerExpanded) {
    return (
      <div className="md:hidden fixed bottom-16 left-2 right-2 z-40 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl p-2 px-3 flex items-center justify-between shadow-2xl transition-colors duration-200">
        {/* Track preview */}
        <div
          onClick={() => setIsMobilePlayerExpanded(true)}
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
        >
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-10 h-10 rounded-lg object-cover shadow-sm shrink-0 border border-black/10 dark:border-white/10"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate flex items-center gap-1.5">
              <span>{currentTrack.title}</span>
              {currentTrack.specialNotes && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              )}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              {currentTrack.artist}
            </div>
          </div>
        </div>

        {/* Mini Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center text-neutral-900 dark:text-white"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={nextTrack}
            className="w-10 h-10 flex items-center justify-center text-neutral-600 dark:text-neutral-300"
            aria-label="Next track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Micro progress hairline on top */}
        <div className="absolute -top-[1px] left-3 right-3 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  // Render Full-Screen iOS Apple Music Player Modal
  return (
    <div className="md:hidden fixed inset-0 z-50 bg-[#121214] text-white flex flex-col p-6 overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300">
      {/* Top Handle & Dismiss */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsMobilePlayerExpanded(false)}
          className="p-2 -ml-2 text-neutral-400 hover:text-white"
          aria-label="Collapse player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Tab switcher: Album Cover vs Liner Notes */}
        <div className="flex items-center gap-1 p-1 bg-white/10 rounded-full">
          <button
            onClick={() => setActiveTab('cover')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'cover' ? 'bg-amber-400 text-black' : 'text-neutral-300'
            }`}
          >
            Track
          </button>
          <button
            onClick={() => {
              setActiveTab('notes');
              setNotesDraft(currentTrack.specialNotes || '');
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
              activeTab === 'notes' ? 'bg-amber-400 text-black' : 'text-neutral-300'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Notes</span>
          </button>
        </div>

        <button
          onClick={() => toggleDownload(currentTrack.id)}
          className="p-2 -mr-2 text-neutral-400 hover:text-amber-400"
          title="Download Offline"
        >
          {currentTrack.isDownloaded ? (
            <Check className="w-5 h-5 text-amber-400 stroke-[2.5]" />
          ) : (
            <ArrowDownCircle className="w-5 h-5" />
          )}
        </button>
      </div>

      {activeTab === 'cover' ? (
        <>
          {/* Huge Album Art */}
          <div className="flex-1 flex items-center justify-center my-3">
            <div className="w-full max-w-xs aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 relative">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Title & Artist & Favorite */}
          <div className="flex items-center justify-between mt-4 mb-5">
            <div className="min-w-0 flex-1 pr-4">
              <h2 className="text-xl font-bold text-white truncate leading-tight">
                {currentTrack.title}
              </h2>
              <p className="text-sm text-neutral-400 truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className="p-2"
              aria-label="Favorite"
            >
              <Heart
                className={`w-6 h-6 ${
                  currentTrack.isFavorite
                    ? 'fill-amber-400 stroke-amber-400 text-amber-400'
                    : 'text-neutral-400'
                }`}
              />
            </button>
          </div>

          {/* Scrubber */}
          <div className="space-y-1 mb-6">
            <div className="relative flex items-center h-5">
              <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 180}
                step={0.5}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              />
            </div>
            <div className="flex justify-between text-xs text-neutral-400 font-mono tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTimeRemaining(currentTime, duration)}</span>
            </div>
          </div>

          {/* Big iOS Play Controls */}
          <div className="flex items-center justify-center gap-10 mb-8">
            <button
              onClick={previousTrack}
              className="p-3 text-neutral-300 hover:text-white active:scale-90 transition-transform"
              aria-label="Previous"
            >
              <SkipBack className="w-8 h-8 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-400/30 active:scale-95 transition-transform"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-black stroke-black" />
              ) : (
                <Play className="w-8 h-8 fill-black stroke-black ml-1" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-3 text-neutral-300 hover:text-white active:scale-90 transition-transform"
              aria-label="Next"
            >
              <SkipForward className="w-8 h-8 fill-current" />
            </button>
          </div>

          {/* Bottom Volume Slider */}
          <div className="flex items-center gap-3 px-2">
            <Volume2 className="w-4 h-4 text-neutral-500" />
            <div className="relative flex-1 flex items-center h-4">
              <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${volume * 100}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              />
            </div>
          </div>
        </>
      ) : (
        /* Liner Notes View */
        <div className="flex-1 overflow-y-auto space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              Special Artist Notes
            </h3>
            {!isEditingNotes ? (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-xs text-amber-400 font-semibold"
              >
                Edit Notes
              </button>
            ) : (
              <button
                onClick={() => {
                  updateTrackNotes(currentTrack.id, notesDraft);
                  setIsEditingNotes(false);
                }}
                className="text-xs bg-amber-400 text-black px-2.5 py-1 rounded font-bold"
              >
                Save
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={8}
              placeholder="Behind the scenes liner notes for this song..."
              className="w-full bg-neutral-900 border border-amber-400/50 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none"
            />
          ) : (
            <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10 text-sm leading-relaxed whitespace-pre-wrap">
              {currentTrack.specialNotes || 'No notes added yet for this track.'}
            </div>
          )}

          {/* Audio stem version info */}
          <div className="bg-neutral-900/80 p-4 rounded-xl border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Audio Version</span>
              <span className="font-mono text-amber-400">{currentTrack.audioVersion || 'Master v1'}</span>
            </div>
            {currentTrack.audioFileName && (
              <div className="flex justify-between">
                <span className="text-neutral-400">Audio File</span>
                <span className="font-mono text-neutral-300 truncate max-w-[180px]">{currentTrack.audioFileName}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
