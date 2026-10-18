import React, { useState } from 'react';
import { X, FileText, Mic2, Edit3, Check, Disc3, Sparkles, UploadCloud } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const LyricsAndNotesDrawer: React.FC = () => {
  const {
    currentTrack,
    isLyricsOpen,
    setIsLyricsOpen,
    updateTrackNotes,
    navigate,
  } = useMusic();

  const [activeTab, setActiveTab] = useState<'notes' | 'lyrics'>('notes');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  if (!isLyricsOpen || !currentTrack) return null;

  const handleStartEdit = () => {
    setEditedNotes(currentTrack.specialNotes || '');
    setIsEditingNotes(true);
  };

  const handleSaveNotes = () => {
    updateTrackNotes(currentTrack.id, editedNotes);
    setIsEditingNotes(false);
  };

  return (
    <aside className="fixed top-14 bottom-20 right-0 w-80 md:w-96 bg-white/95 dark:bg-[#161618]/95 backdrop-blur-2xl border-l border-black/10 dark:border-white/[0.08] shadow-2xl z-30 flex flex-col select-none animate-in slide-in-from-right duration-200 text-neutral-900 dark:text-white transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-black/[0.07] dark:border-white/[0.07] flex items-center justify-between">
        {/* Apple Style Segmented Tab Toggle */}
        <div className="flex items-center gap-1 p-1 bg-black/[0.05] dark:bg-white/[0.06] rounded-lg">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'notes'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Liner Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('lyrics')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'lyrics'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>
        </div>

        <button
          onClick={() => setIsLyricsOpen(false)}
          className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Track Mini Card */}
      <div className="px-5 py-3.5 border-b border-black/[0.05] dark:border-white/[0.05] flex items-center gap-3 bg-black/[0.02] dark:bg-white/[0.02]">
        <img
          src={currentTrack.coverUrl}
          alt={currentTrack.title}
          className="w-10 h-10 rounded-md object-cover shadow-sm border border-black/10 dark:border-white/10"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">{currentTrack.title}</div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{currentTrack.artist} · {currentTrack.albumTitle}</div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
        {activeTab === 'notes' ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider">
                  Creator's Liner Notes
                </span>
                {currentTrack.notesDate && (
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    · {currentTrack.notesDate}
                  </span>
                )}
              </div>

              {!isEditingNotes ? (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1 text-[11px] text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-medium"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              ) : (
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1 text-[11px] text-black bg-amber-400 hover:bg-amber-300 px-2 py-0.5 rounded font-semibold"
                >
                  <Check className="w-3 h-3" />
                  <span>Save</span>
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Add your artist commentary, recording setup, equipment used, or easter eggs for this song..."
                  rows={8}
                  className="w-full bg-neutral-100 dark:bg-neutral-900 border border-amber-400/50 rounded-lg p-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none font-sans leading-relaxed"
                />
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                  <span>Changes save to your local library.</span>
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="hover:underline text-neutral-600 dark:text-neutral-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentTrack.specialNotes ? (
                  <div className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-4 font-sans whitespace-pre-wrap">
                    {currentTrack.specialNotes}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-dashed border-black/10 dark:border-white/10">
                    <FileText className="w-8 h-8 text-neutral-400 dark:text-neutral-600 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">No liner notes added yet for this track.</p>
                    <button
                      onClick={handleStartEdit}
                      className="px-3 py-1.5 text-xs font-semibold bg-amber-400 text-black rounded-lg hover:bg-amber-300 transition-colors"
                    >
                      Write Song Notes
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Lyrics & Credits */
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider mb-3">
                Lyrics
              </div>
              {currentTrack.lyrics ? (
                <div className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap space-y-4">
                  {currentTrack.lyrics}
                </div>
              ) : (
                <div className="text-xs text-neutral-400 dark:text-neutral-500 italic">Instrumental track (no lyrics provided).</div>
              )}
            </div>

            {/* Song Credits */}
            <div className="pt-4 border-t border-black/[0.08] dark:border-white/[0.08] space-y-2.5 text-xs">
              <div className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                Credits
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Artist</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">{currentTrack.artist}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Album</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">{currentTrack.albumTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Genre</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">{currentTrack.genre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Released</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-medium">{currentTrack.releaseYear}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
