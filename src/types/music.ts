export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  albumId: string;
  albumTitle: string;
  coverUrl: string;
  duration: number; // in seconds
  trackNumber: number;
  audioUrl: string; // url, blob url, or synth preset
  audioFileName?: string;
  audioVersion?: string; // e.g. "Master v2.1"
  specialNotes?: string; // Musician's liner notes / commentary
  notesDate?: string;
  lyrics?: string;
  genre: string;
  releaseYear: number;
  isExplicit: boolean;
  isFavorite: boolean;
  isDownloaded: boolean;
  plays: number;
  composer?: string;
  producer?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverUrl: string;
  releaseYear: number;
  releaseDate?: string;
  genre: string;
  description: string;
  type: 'album' | 'single' | 'ep';
  recordLabel: string;
  isHiResAudio: boolean;
  trackIds: string[];
}

export interface ArtistProfile {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  hometown: string;
  genres: string[];
  quote: string;
  verified: boolean;
  monthlyListeners: number;
  socialLinks: {
    spotify?: string;
    instagram?: string;
    soundcloud?: string;
    website?: string;
  };
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverGradient: string;
  coverUrl?: string;
  trackIds: string[];
  createdAt: string;
  isUserCreated: boolean;
}

export type ActiveView =
  | { type: 'listen-now' }
  | { type: 'browse' }
  | { type: 'radio' }
  | { type: 'recently-added' }
  | { type: 'artists' }
  | { type: 'artist-detail'; artistId: string }
  | { type: 'albums' }
  | { type: 'album-detail'; albumId: string }
  | { type: 'songs' }
  | { type: 'downloaded' }
  | { type: 'playlist-detail'; playlistId: string }
  | { type: 'search'; query: string }
  | { type: 'studio'; activeTab?: 'tracks' | 'albums' | 'artist' | 'database' | 'backup' };

export type RepeatMode = 'off' | 'all' | 'one';
export type ThemeMode = 'dark' | 'light';
export type AppMode = 'streaming' | 'cms';

export interface ListeningHistoryItem {
  id: string;
  trackId: string;
  playedAt: string;
  title: string;
  artist: string;
  albumTitle: string;
  coverUrl: string;
  duration: number;
}

export interface UserAccount {
  name: string;
  handle: string;
  avatarUrl: string;
  memberSince: string;
  audioQuality: 'lossless' | 'high' | 'standard';
  equalizerPreset: 'warm-tape' | 'flat' | 'bass-boost' | 'acoustic' | 'vocal';
  crossfadeSeconds: number;
  soundCheck: boolean;
  autoSaveHistory: boolean;
}
