import React from 'react';
import { Play, Sparkles, Radio, Zap, Headphones, Compass } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const BrowseView: React.FC = () => {
  const { albums, tracks, playTrack, navigate } = useMusic();

  const genres = [
    { name: 'Electronic', color: 'from-amber-500 to-yellow-600', count: '12 tracks' },
    { name: 'Ambient & Drone', color: 'from-yellow-600 to-neutral-900', count: '8 tracks' },
    { name: 'Downtempo', color: 'from-amber-600 to-amber-950', count: '6 tracks' },
    { name: 'Neo-Classical', color: 'from-stone-700 to-neutral-950', count: '4 tracks' },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 select-none transition-colors duration-200">
      <div>
        <div className="text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-1">
          Explore
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Browse Music
        </h1>
      </div>

      {/* Curated Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {genres.map((g) => (
          <div
            key={g.name}
            onClick={() => navigate({ type: 'songs' })}
            className={`h-32 rounded-2xl p-5 bg-gradient-to-br ${g.color} flex flex-col justify-between cursor-pointer shadow-lg hover:scale-[1.02] transition-transform border border-black/10 dark:border-white/10`}
          >
            <div className="flex justify-between items-start">
              <span className="text-base font-extrabold text-white drop-shadow">
                {g.name}
              </span>
              <Headphones className="w-5 h-5 text-white/80" />
            </div>
            <span className="text-[11px] text-white/80 font-medium">
              {g.count}
            </span>
          </div>
        ))}
      </div>

      {/* All Releases */}
      <section>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
          All Studio Releases
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {albums.map((alb) => (
            <div
              key={alb.id}
              onClick={() => navigate({ type: 'album-detail', albumId: alb.id })}
              className="group cursor-pointer select-none"
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg shadow-black/10 dark:shadow-black/50 border border-black/10 dark:border-white/10 relative mb-2.5">
                <img
                  src={alb.coverUrl}
                  alt={alb.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-400/30">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                {alb.title}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                {alb.artist} · {alb.releaseYear}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
