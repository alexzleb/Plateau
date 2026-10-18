import React, { useState } from 'react';
import {
  Play,
  Shuffle,
  Heart,
  ArrowDownCircle,
  Check,
  FileText,
  MoreHorizontal,
  Clock,
  Sparkles,
  Share2,
  Plus,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime, formatPlayCount } from '../utils/formatters';
import { Track } from '../types/music';

interface AlbumDetailViewProps {
  albumId: string;
}

export const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({ albumId }) => {
  const {
    albums,
    tracks,
    artist,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleFavorite,
    toggleDownload,
    navigate,
    setIsLyricsOpen,
    playlists,
    addTrackToPlaylist,
  } = useMusic();

  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);

  const album = albums.find((a) => a.id === albumId) || albums[0];
  if (!album) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Album not found.
      </div>
    );
  }

  const albumTracks = tracks.filter((t) => t.albumId === album.id);
  const totalDuration = albumTracks.reduce((acc, t) => acc + t.duration, 0);

  const handlePlayAlbum = () => {
    if (albumTracks.length > 0) {
      if (currentTrack?.albumId === album.id) {
        togglePlay();
      } else {
        playTrack(albumTracks[0], albumTracks.slice(1));
      }
    }
  };

  const handleShuffleAlbum = () => {
    if (albumTracks.length > 0) {
      const shuffled = [...albumTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled.slice(1));
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 select-none transition-colors duration-200">
      {/* Album Header: Split 2-column Apple Music layout */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Album Artwork */}
        <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/80 border border-black/10 dark:border-white/10 shrink-0 group relative">
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Album Info */}
        <div className="flex-1 text-center md:text-left flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-1.5">
              <span>{album.type}</span>
              {album.isHiResAudio && (
                <>
                  <span className="text-neutral-400 dark:text-neutral-600">·</span>
                  <span className="flex items-center gap-1 text-[10px] text-neutral-600 dark:text-neutral-400 border border-black/10 dark:border-white/10 px-1.5 py-0.2 rounded font-mono">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />
                    Hi-Res Lossless
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-2">
              {album.title}
            </h1>

            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-neutral-600 dark:text-neutral-300 font-medium mb-3">
              <button
                onClick={() => navigate({ type: 'artist-detail', artistId: album.artistId })}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 hover:underline"
              >
                {album.artist}
              </button>
              <span className="text-neutral-400 dark:text-neutral-600">·</span>
              <span>{album.releaseYear}</span>
              <span className="text-neutral-400 dark:text-neutral-600">·</span>
              <span>{album.genre}</span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xl line-clamp-3 leading-relaxed mb-6">
              {album.description}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={handlePlayAlbum}
              className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/25 active:scale-95 transition-all"
            >
              {currentTrack?.albumId === album.id && isPlaying ? (
                <span>Pause</span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              onClick={handleShuffleAlbum}
              className="px-5 py-2.5 rounded-full bg-black/[0.06] hover:bg-black/[0.1] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-neutral-900 dark:text-white font-medium text-xs flex items-center gap-2 border border-black/10 dark:border-white/10 active:scale-95 transition-all"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist Table */}
      <div className="pt-4 border-t border-black/[0.08] dark:border-white/[0.08]">
        {/* Table Column Header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-9 sm:col-span-9 md:col-span-10">Title</div>
          <div className="col-span-2 sm:col-span-2 md:col-span-1 text-right flex justify-end items-center">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
          {albumTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const isTrackPlaying = isCurrent && isPlaying;

            return (
              <div
                key={track.id}
                onDoubleClick={() => playTrack(track, albumTracks.filter((t) => t.id !== track.id))}
                className={`group grid grid-cols-12 gap-3 px-4 py-3 items-center rounded-xl transition-colors cursor-pointer relative ${
                  isCurrent
                    ? 'bg-amber-400/10'
                    : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                {/* Track number / Play button */}
                <div className="col-span-1 text-center flex items-center justify-center">
                  <span
                    className={`text-xs font-mono font-medium group-hover:hidden ${
                      isCurrent ? 'text-amber-500 dark:text-amber-400' : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    {track.trackNumber || idx + 1}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrent) {
                        togglePlay();
                      } else {
                        playTrack(track, albumTracks.filter((t) => t.id !== track.id));
                      }
                    }}
                    className="hidden group-hover:flex items-center justify-center w-6 h-6 rounded-full text-neutral-900 dark:text-white"
                  >
                    {isTrackPlaying ? (
                      <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Track Title (Dominant width so title is never cut off) */}
                <div className="col-span-9 sm:col-span-9 md:col-span-10 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold truncate ${
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
                    {/* Project preview liner notes icon */}
                    {track.specialNotes && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track);
                          setIsLyricsOpen(true);
                        }}
                        className="shrink-0 p-0.5 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-transform hover:scale-110"
                        title="Read artist liner notes"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {track.artist}
                  </div>
                </div>

                {/* Duration & Context Actions */}
                <div className="col-span-2 sm:col-span-2 md:col-span-1 text-right flex items-center justify-end gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
                  {/* Favorite */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                    className={`p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      track.isFavorite ? '!opacity-100 text-amber-400 fill-amber-400' : 'hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  {/* Offline Download */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDownload(track.id);
                    }}
                    className={`p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      track.isDownloaded ? '!opacity-100 text-amber-400' : 'hover:text-white'
                    }`}
                    title={track.isDownloaded ? 'Downloaded' : 'Download for offline'}
                  >
                    {track.isDownloaded ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <ArrowDownCircle className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <span className="w-10 text-right">{formatTime(track.duration)}</span>

                  {/* Context menu toggle */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuTrackId(activeMenuTrackId === track.id ? null : track.id);
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:text-white rounded"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>

                    {activeMenuTrackId === track.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-6 w-48 bg-white dark:bg-[#1e1e22] border border-black/10 dark:border-white/10 rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 p-1.5 z-40 text-left font-sans text-xs"
                      >
                        <div className="px-2 py-1 text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                          Add to Playlist
                        </div>
                        {playlists.map((pl) => (
                          <button
                            key={pl.id}
                            onClick={() => {
                              addTrackToPlaylist(pl.id, track.id);
                              setActiveMenuTrackId(null);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200 truncate flex items-center gap-1.5"
                          >
                            <Plus className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                            <span>{pl.title}</span>
                          </button>
                        ))}
                        <div className="my-1 border-t border-black/10 dark:border-white/10" />
                        <button
                          onClick={() => {
                            playTrack(track);
                            setIsLyricsOpen(true);
                            setActiveMenuTrackId(null);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5"
                        >
                          <FileText className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                          <span>View Liner Notes</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer credits */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] text-xs text-neutral-500 space-y-1">
          <div>{albumTracks.length} Songs, {Math.round(totalDuration / 60)} Minutes</div>
          <div>{album.releaseDate || `${album.releaseYear}`}</div>
          <div>© {album.releaseYear} {album.recordLabel}. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
};
