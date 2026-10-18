import React from 'react';
import { Play, FileText, Music2, Disc3 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime } from '../utils/formatters';

interface SearchViewProps {
  query: string;
}

export const SearchView: React.FC<SearchViewProps> = ({ query }) => {
  const { tracks, albums, artist, playTrack, navigate, setIsLyricsOpen } = useMusic();

  const q = query.toLowerCase().trim();

  const matchingTracks = tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.albumTitle.toLowerCase().includes(q) ||
      (t.specialNotes && t.specialNotes.toLowerCase().includes(q))
  );

  const matchingAlbums = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.artist.toLowerCase().includes(q) ||
      a.genre.toLowerCase().includes(q)
  );

  const topResult = matchingTracks[0] || null;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 select-none transition-colors duration-200">
      <div>
        <div className="text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-1">
          Search Results
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          "{query}"
        </h1>
      </div>

      {matchingTracks.length === 0 && matchingAlbums.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 text-sm">
          No songs or albums matched your search.
        </div>
      ) : (
        <div className="space-y-10">
          {/* Top Result + Songs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {topResult && (
              <div className="md:col-span-5">
                <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">
                  Top Result
                </h2>
                <div
                  onClick={() => playTrack(topResult)}
                  className="p-5 rounded-2xl bg-neutral-100/80 hover:bg-neutral-200/80 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] cursor-pointer group transition-all"
                >
                  <img
                    src={topResult.coverUrl}
                    alt={topResult.title}
                    className="w-24 h-24 rounded-xl object-cover shadow-lg border border-black/10 dark:border-white/10 mb-4"
                  />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                    {topResult.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Song · {topResult.artist} · {topResult.albumTitle}
                  </p>
                </div>
              </div>
            )}

            {/* Matching Songs */}
            <div className={topResult ? 'md:col-span-7' : 'md:col-span-12'}>
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">
                Songs ({matchingTracks.length})
              </h2>
              <div className="space-y-1">
                {matchingTracks.slice(0, 6).map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover border border-black/10 dark:border-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 truncate">
                          {track.title}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                          {track.artist} · {track.albumTitle}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Matching Albums */}
          {matchingAlbums.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">
                Albums ({matchingAlbums.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {matchingAlbums.map((alb) => (
                  <div
                    key={alb.id}
                    onClick={() => navigate({ type: 'album-detail', albumId: alb.id })}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 mb-2.5">
                      <img
                        src={alb.coverUrl}
                        alt={alb.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-amber-500 dark:group-hover:text-amber-400">
                      {alb.title}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {alb.artist} · {alb.releaseYear}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
