import React, { useState } from 'react';
import { Play, CheckCircle2, Search, User } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const ArtistsListView: React.FC = () => {
  const { artists, tracks, playTrack, navigate } = useMusic();
  const [filterQuery, setFilterQuery] = useState('');

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    a.genres.some((g) => g.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const handlePlayArtist = (artistId: string, artistName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const artistTracks = tracks.filter((t) => t.artistId === artistId || t.artist === artistName);
    if (artistTracks.length > 0) {
      playTrack(artistTracks[0], artistTracks.slice(1));
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 select-none transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-1">
            Library
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Artists ({artists.length})
          </h1>
        </div>

        {/* Filter input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter artists..."
            className="w-full bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-300 dark:border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
          />
        </div>
      </div>

      {/* Grid of Artist Circles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {filteredArtists.map((art) => {
          const artistSongCount = tracks.filter(
            (t) => t.artistId === art.id || t.artist.toLowerCase() === art.name.toLowerCase()
          ).length;

          return (
            <div
              key={art.id}
              onClick={() => navigate({ type: 'artist-detail', artistId: art.id })}
              className="group cursor-pointer flex flex-col items-center text-center select-none"
            >
              {/* Round Avatar with Apple Music style hover play */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-xl shadow-black/10 dark:shadow-black/50 border-2 border-black/10 dark:border-white/10 mb-3.5">
                <img
                  src={art.avatarUrl}
                  alt={art.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => handlePlayArtist(art.id, art.name, e)}
                    className="w-12 h-12 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-400/30 hover:scale-105 transition-transform"
                    title={`Play all songs by ${art.name}`}
                  >
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Artist Name & Badge */}
              <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                <span className="truncate max-w-[180px]">{art.name}</span>
                {art.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 fill-amber-400 text-black shrink-0" />
                )}
              </div>

              {/* Genre / Listeners */}
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate max-w-[180px]">
                {art.genres.slice(0, 2).join(' · ')}
              </div>

              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                {art.monthlyListeners.toLocaleString()} listeners · {artistSongCount} {artistSongCount === 1 ? 'song' : 'songs'}
              </div>
            </div>
          );
        })}
      </div>

      {filteredArtists.length === 0 && (
        <div className="p-12 text-center text-neutral-500">
          <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No artists found matching "{filterQuery}"</p>
        </div>
      )}
    </div>
  );
};
