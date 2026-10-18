import React, { useState } from 'react';
import {
  Play,
  Shuffle,
  Heart,
  ArrowDownCircle,
  Check,
  CheckCircle2,
  FileText,
  ExternalLink,
  Disc3,
  Sparkles,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime } from '../utils/formatters';

interface ArtistProfileViewProps {
  artistId: string;
}

export const ArtistProfileView: React.FC<ArtistProfileViewProps> = ({ artistId }) => {
  const {
    artist,
    artists,
    tracks,
    albums,
    currentTrack,
    isPlaying,
    playTrack,
    toggleFavorite,
    toggleDownload,
    navigate,
    setIsLyricsOpen,
  } = useMusic();

  const [discoFilter, setDiscoFilter] = useState<'all' | 'album' | 'single' | 'ep'>('all');

  const currentArtist =
    artists.find((a) => a.id === artistId) ||
    artists.find((a) => a.name.toLowerCase() === (artistId || '').toLowerCase()) ||
    artists[0] ||
    artist;

  const artistTracks = tracks.filter(
    (t) => t.artistId === currentArtist.id || t.artist.toLowerCase() === currentArtist.name.toLowerCase()
  );
  const topTracks = [...artistTracks].sort((a, b) => b.plays - a.plays).slice(0, 5);

  const artistAlbums = albums.filter(
    (a) => a.artistId === currentArtist.id || a.artist.toLowerCase() === currentArtist.name.toLowerCase()
  );
  const filteredAlbums = discoFilter === 'all'
    ? artistAlbums
    : artistAlbums.filter((a) => a.type === discoFilter);

  const handlePlayArtist = () => {
    if (topTracks.length > 0) {
      playTrack(topTracks[0], topTracks.slice(1));
    } else if (artistTracks.length > 0) {
      playTrack(artistTracks[0], artistTracks.slice(1));
    }
  };

  const handleShuffleArtist = () => {
    if (artistTracks.length > 0) {
      const shuffled = [...artistTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled.slice(1));
    }
  };

  return (
    <div className="select-none pb-16">
      {/* Widescreen Cinematic Hero Banner */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden bg-neutral-900">
        <img
          src={currentArtist.bannerUrl}
          alt={currentArtist.name}
          className="w-full h-full object-cover object-center filter brightness-90"
          referrerPolicy="no-referrer"
        />
        {/* Scrim gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Hero Content */}
        <div className="absolute bottom-6 left-6 right-6 lg:left-10 lg:right-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-end gap-5">
            <div className="relative group shrink-0">
              <img
                src={currentArtist.avatarUrl}
                alt={currentArtist.name}
                className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-2 border-white/20 shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-black" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1">
                <span>Verified Artist</span>
                <CheckCircle2 className="w-3.5 h-3.5 fill-amber-400 text-black" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {currentArtist.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium mt-1">
                <span>{currentArtist.monthlyListeners.toLocaleString()} monthly listeners</span>
                {currentArtist.hometown && (
                  <>
                    <span className="text-neutral-500">·</span>
                    <span>{currentArtist.hometown}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayArtist}
              className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/25 active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Play</span>
            </button>

            <button
              onClick={handleShuffleArtist}
              className="px-5 py-2.5 rounded-full bg-white/[0.15] hover:bg-white/[0.25] text-white font-medium text-xs flex items-center gap-2 backdrop-blur-md border border-white/10 active:scale-95 transition-all"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 max-w-7xl mx-auto space-y-12 mt-8">
        {/* Section: Top Songs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
              Top Songs
            </h2>
            <button
              onClick={() => navigate({ type: 'songs' })}
              className="text-xs text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-medium hover:underline"
            >
              See All
            </button>
          </div>

          <div className="space-y-1">
            {topTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isTrackPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, topTracks.filter((t) => t.id !== track.id))}
                  className={`group flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-400/10'
                      : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
                    <span className="w-5 text-center text-xs font-mono font-medium text-neutral-400 dark:text-neutral-500">
                      {idx + 1}
                    </span>

                    <div className="relative shrink-0">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover border border-black/10 dark:border-white/10"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                        {isTrackPlaying ? (
                          <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isCurrent ? 'text-amber-500 dark:text-amber-400' : 'text-neutral-900 dark:text-white'
                          }`}
                          title={track.title}
                        >
                          {track.title}
                        </span>
                        {track.specialNotes && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playTrack(track);
                              setIsLyricsOpen(true);
                            }}
                            className="shrink-0 p-0.5 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-transform hover:scale-110"
                            title="Song has special creator notes"
                          >
                            <FileText className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {track.albumTitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-neutral-500 dark:text-neutral-400 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className={`p-1 ${track.isFavorite ? 'text-amber-500 dark:text-amber-400' : 'text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}
                      title={track.isFavorite ? 'Favorited' : 'Favorite'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDownload(track.id);
                      }}
                      className={`p-1 ${track.isDownloaded ? 'text-amber-500 dark:text-amber-400' : 'text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}
                      title={track.isDownloaded ? 'Downloaded' : 'Download for offline'}
                    >
                      {track.isDownloaded ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <ArrowDownCircle className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <span className="w-10 text-right">{formatTime(track.duration)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Discography */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
              Discography
            </h2>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-xl text-xs font-medium w-fit">
              {(['all', 'album', 'single', 'ep'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDiscoFilter(filter)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    discoFilter === filter
                      ? 'bg-amber-400 text-black font-semibold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {filter === 'all' ? 'All Releases' : filter === 'ep' ? 'EPs' : `${filter}s`}
                </button>
              ))}
            </div>
          </div>

          {filteredAlbums.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 rounded-2xl border border-dashed border-black/10 dark:border-white/10">
              No releases found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredAlbums.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => navigate({ type: 'album-detail', albumId: alb.id })}
                  className="group cursor-pointer select-none"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg shadow-black/20 dark:shadow-black/50 border border-black/10 dark:border-white/10 relative mb-3">
                    <img
                      src={alb.coverUrl}
                      alt={alb.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-400/30">
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                    {alb.title}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {alb.releaseYear} · {alb.type.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section: About the Artist */}
        <section className="pt-8 border-t border-black/[0.08] dark:border-white/[0.08]">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
            About {currentArtist.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-6 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] space-y-4">
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
                {currentArtist.bio}
              </p>

              {currentArtist.quote && (
                <div className="border-l-2 border-amber-400 pl-4 py-1 italic text-xs text-neutral-600 dark:text-neutral-400">
                  "{currentArtist.quote}"
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {currentArtist.genres.map((g) => (
                  <span
                    key={g}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] space-y-3">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Artist Stats
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                    {currentArtist.monthlyListeners.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-neutral-500">Monthly Listeners</div>
                </div>
                {currentArtist.hometown && (
                  <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <div className="text-xs font-medium text-neutral-900 dark:text-white">
                      {currentArtist.hometown}
                    </div>
                    <div className="text-[11px] text-neutral-500">Origin</div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="p-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  Links
                </div>
                <div className="space-y-2 text-xs">
                  {currentArtist.socialLinks?.spotify && (
                    <a
                      href={currentArtist.socialLinks.spotify}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400"
                    >
                      <span>Spotify</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {currentArtist.socialLinks?.soundcloud && (
                    <a
                      href={currentArtist.socialLinks.soundcloud}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400"
                    >
                      <span>SoundCloud</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {currentArtist.socialLinks?.instagram && (
                    <a
                      href={currentArtist.socialLinks.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400"
                    >
                      <span>Instagram</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {currentArtist.socialLinks?.website && (
                    <a
                      href={currentArtist.socialLinks.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400"
                    >
                      <span>Official Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
