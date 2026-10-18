import React, { useState, useEffect } from 'react';
import { Play, Sparkles, FileText, Heart, Clock, Disc3 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime } from '../utils/formatters';
import { extractColorsFromImage, ExtractedColorPalette } from '../utils/colorExtractor';

export const ListenNowView: React.FC = () => {
  const {
    albums,
    tracks,
    artists,
    artist,
    playTrack,
    currentTrack,
    isPlaying,
    navigate,
    setIsLyricsOpen,
    toggleFavorite,
    theme,
  } = useMusic();

  const featuredAlbum = albums[0];
  const recentAlbums = albums.slice(0, 4);
  const featuredArtists = artists.slice(0, 4);

  const [palette, setPalette] = useState<ExtractedColorPalette | null>(null);

  useEffect(() => {
    if (featuredAlbum?.coverUrl) {
      let isMounted = true;
      extractColorsFromImage(featuredAlbum.coverUrl).then((extracted) => {
        if (isMounted) {
          setPalette(extracted);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [featuredAlbum?.coverUrl]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 select-none transition-colors duration-200">
      {/* Editorial Header */}
      <div>
        <div className="text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-1">
          Featured Release
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Listen Now
        </h1>
      </div>

      {/* Hero Featured Card with Dynamic Album Color Extraction */}
      {featuredAlbum && (
        <div className="relative group cursor-pointer select-none">
          {/* Ambient Blurred Color Glow Backdrop */}
          <div
            className="absolute -inset-1 sm:-inset-2 rounded-3xl opacity-40 dark:opacity-60 blur-2xl -z-10 transition-all duration-700 pointer-events-none"
            style={{
              background: palette?.ambient || 'rgba(217, 119, 6, 0.35)',
            }}
          />

          <div
            onClick={() => navigate({ type: 'album-detail', albumId: featuredAlbum.id })}
            className="relative rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 text-white transition-all duration-500"
            style={{
              background: palette
                ? palette.gradientDark
                : 'linear-gradient(135deg, #1e1e24 0%, #121214 60%, #0a0a0c 100%)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 items-center">
              {/* Left Copy */}
              <div className="p-6 sm:p-10 md:col-span-7 flex flex-col justify-between h-full z-10 space-y-4">
                <div>
                  <div
                    className="flex items-center gap-2 text-xs font-semibold mb-2 transition-colors duration-500"
                    style={{ color: palette?.accent || '#fbbf24' }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>FEATURED ARTIST RELEASE</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight group-hover:text-amber-200 transition-colors">
                    {featuredAlbum.title}
                  </h2>
                  <div
                    className="text-sm font-medium mt-1 transition-colors duration-500"
                    style={{ color: palette?.accent || '#fcd34d' }}
                  >
                    by {featuredAlbum.artist}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200/90 mt-2 line-clamp-2 max-w-lg leading-relaxed">
                    {featuredAlbum.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const albumTracks = tracks.filter((t) => t.albumId === featuredAlbum.id);
                      if (albumTracks.length > 0) {
                        playTrack(albumTracks[0], albumTracks.slice(1));
                      }
                    }}
                    className="px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-black/30 hover:scale-102 active:scale-95 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Listen Now</span>
                  </button>

                  <span className="text-xs text-white/70 font-medium">
                    {featuredAlbum.recordLabel} · {featuredAlbum.releaseYear}
                  </span>
                </div>
              </div>

              {/* Right Media */}
              <div className="md:col-span-5 h-64 md:h-80 relative overflow-hidden">
                <img
                  src={featuredAlbum.coverUrl}
                  alt={featuredAlbum.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent via-black/30 to-black/80 transition-colors duration-500"
                  style={{
                    background: palette
                      ? `linear-gradient(to right, ${palette.secondary} 0%, rgba(0,0,0,0.1) 60%, transparent 100%)`
                      : undefined,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section: Featured Artists Roster */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
              Featured Artists
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Discover unique voices, producers, and musicians across the network
            </p>
          </div>
          <button
            onClick={() => navigate({ type: 'artists' })}
            className="text-xs text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-medium hover:underline"
          >
            All Artists ({artists.length})
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {featuredArtists.map((art) => (
            <div
              key={art.id}
              onClick={() => navigate({ type: 'artist-detail', artistId: art.id })}
              className="p-4 rounded-2xl bg-neutral-100/70 hover:bg-neutral-200/80 dark:bg-neutral-900/40 dark:hover:bg-neutral-900/80 border border-black/[0.06] dark:border-white/[0.07] flex flex-col items-center text-center cursor-pointer group transition-all"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 border-2 border-black/10 dark:border-white/10 shadow-md">
                <img
                  src={art.avatarUrl}
                  alt={art.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                </div>
              </div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors truncate w-full">
                {art.name}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate w-full mt-0.5">
                {art.genres.slice(0, 2).join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Recently Released Albums */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
            Albums & Collections
          </h2>
          <button
            onClick={() => navigate({ type: 'albums' })}
            className="text-xs text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-medium hover:underline"
          >
            See All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {recentAlbums.map((alb) => (
            <div
              key={alb.id}
              onClick={() => navigate({ type: 'album-detail', albumId: alb.id })}
              className="group cursor-pointer select-none"
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg shadow-black/10 dark:shadow-black/60 border border-black/10 dark:border-white/10 relative mb-2.5">
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
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5 flex items-center gap-1.5">
                <span>{alb.artist}</span>
                <span className="text-neutral-400 dark:text-neutral-600">·</span>
                <span>{alb.releaseYear}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
