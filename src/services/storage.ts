import { Track, Album, ArtistProfile, Playlist, UserAccount, ListeningHistoryItem } from '../types/music';
import { INITIAL_ARTISTS, INITIAL_ARTIST, INITIAL_ALBUMS, INITIAL_TRACKS, INITIAL_PLAYLISTS } from '../data/initialData';

const STORAGE_KEYS = {
  TRACKS: 'plateau_music_tracks_v1',
  ALBUMS: 'plateau_music_albums_v1',
  ARTISTS: 'plateau_music_artists_v1',
  ARTIST: 'plateau_music_artist_v1',
  PLAYLISTS: 'plateau_music_playlists_v1',
  OFFLINE_IDS: 'plateau_music_offline_ids_v1',
  SETTINGS: 'plateau_music_settings_v1',
  USER_ACCOUNT: 'plateau_user_account_v1',
  LISTENING_HISTORY: 'plateau_listening_history_v1',
};

// Simple IndexedDB helper for audio files and blobs
const DB_NAME = 'AmberMusicAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'audio_files';

function openAudioDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeAudioBlob(trackId: string, blob: Blob): Promise<void> {
  const db = await openAudioDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(blob, trackId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAudioBlob(trackId: string): Promise<Blob | null> {
  try {
    const db = await openAudioDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(trackId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

class StorageService {
  public getTracks(): Track[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRACKS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading tracks from localStorage', e);
    }
    // Seed initial
    this.saveTracks(INITIAL_TRACKS);
    return INITIAL_TRACKS;
  }

  public saveTracks(tracks: Track[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(tracks));
    } catch (e) {
      console.warn('Error saving tracks to localStorage', e);
    }
  }

  public getAlbums(): Album[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ALBUMS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading albums from localStorage', e);
    }
    this.saveAlbums(INITIAL_ALBUMS);
    return INITIAL_ALBUMS;
  }

  public saveAlbums(albums: Album[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
    } catch (e) {
      console.warn('Error saving albums to localStorage', e);
    }
  }

  public getArtists(): ArtistProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ARTISTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading artists from localStorage', e);
    }
    this.saveArtists(INITIAL_ARTISTS);
    return INITIAL_ARTISTS;
  }

  public saveArtists(artists: ArtistProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ARTISTS, JSON.stringify(artists));
    } catch (e) {
      console.warn('Error saving artists to localStorage', e);
    }
  }

  public getArtist(): ArtistProfile {
    const list = this.getArtists();
    return list[0] || INITIAL_ARTIST;
  }

  public saveArtist(artist: ArtistProfile): void {
    const list = this.getArtists();
    const updated = list.map((a) => (a.id === artist.id ? artist : a));
    if (!list.some((a) => a.id === artist.id)) {
      updated.push(artist);
    }
    this.saveArtists(updated);
  }

  public getPlaylists(): Playlist[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading playlists from localStorage', e);
    }
    this.savePlaylists(INITIAL_PLAYLISTS);
    return INITIAL_PLAYLISTS;
  }

  public savePlaylists(playlists: Playlist[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.warn('Error saving playlists to localStorage', e);
    }
  }

  // Track operations
  public updateTrack(updated: Track): Track[] {
    const tracks = this.getTracks().map((t) => (t.id === updated.id ? updated : t));
    this.saveTracks(tracks);
    return tracks;
  }

  public addTrack(newTrack: Track): { tracks: Track[]; albums: Album[] } {
    const tracks = [...this.getTracks(), newTrack];
    this.saveTracks(tracks);

    // Also link track to album if present
    const albums = this.getAlbums().map((alb) => {
      if (alb.id === newTrack.albumId && !alb.trackIds.includes(newTrack.id)) {
        return { ...alb, trackIds: [...alb.trackIds, newTrack.id] };
      }
      return alb;
    });
    this.saveAlbums(albums);

    return { tracks, albums };
  }

  public deleteTrack(trackId: string): { tracks: Track[]; albums: Album[] } {
    const tracks = this.getTracks().filter((t) => t.id !== trackId);
    this.saveTracks(tracks);

    const albums = this.getAlbums().map((alb) => ({
      ...alb,
      trackIds: alb.trackIds.filter((id) => id !== trackId),
    }));
    this.saveAlbums(albums);

    // Also remove from playlists
    const playlists = this.getPlaylists().map((pl) => ({
      ...pl,
      trackIds: pl.trackIds.filter((id) => id !== trackId),
    }));
    this.savePlaylists(playlists);

    return { tracks, albums };
  }

  // Replace audio file with uploaded local file
  public async replaceTrackAudio(
    trackId: string,
    file: File,
    versionLabel?: string
  ): Promise<Track> {
    await storeAudioBlob(trackId, file);
    const objectUrl = URL.createObjectURL(file);

    // Compute approximate audio duration
    const audio = new Audio();
    audio.src = objectUrl;
    let duration = 180;
    try {
      duration = await new Promise((resolve) => {
        audio.onloadedmetadata = () => resolve(Math.round(audio.duration) || 180);
        audio.onerror = () => resolve(180);
      });
    } catch {
      duration = 180;
    }

    const tracks = this.getTracks();
    const target = tracks.find((t) => t.id === trackId);
    if (!target) {
      throw new Error('Track not found');
    }

    const updated: Track = {
      ...target,
      audioUrl: objectUrl,
      audioFileName: file.name,
      audioVersion: versionLabel || `Replaced ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      duration: duration || target.duration,
    };

    const newTracks = tracks.map((t) => (t.id === trackId ? updated : t));
    this.saveTracks(newTracks);
    return updated;
  }

  public toggleFavorite(trackId: string): Track[] {
    const tracks = this.getTracks().map((t) =>
      t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t
    );
    this.saveTracks(tracks);
    return tracks;
  }

  public toggleDownload(trackId: string): Track[] {
    const tracks = this.getTracks().map((t) =>
      t.id === trackId ? { ...t, isDownloaded: !t.isDownloaded } : t
    );
    this.saveTracks(tracks);
    return tracks;
  }

  // Album operations
  public saveAlbum(album: Album): Album[] {
    const albums = this.getAlbums();
    const index = albums.findIndex((a) => a.id === album.id);
    let updated: Album[];
    if (index >= 0) {
      updated = albums.map((a) => (a.id === album.id ? album : a));
    } else {
      updated = [...albums, album];
    }
    this.saveAlbums(updated);
    return updated;
  }

  public deleteAlbum(albumId: string): { albums: Album[]; tracks: Track[] } {
    const albums = this.getAlbums().filter((a) => a.id !== albumId);
    this.saveAlbums(albums);

    // Keep tracks or unassign them
    const tracks = this.getTracks().map((t) =>
      t.albumId === albumId ? { ...t, albumId: '', albumTitle: 'Single' } : t
    );
    this.saveTracks(tracks);

    return { albums, tracks };
  }

  // Playlist operations
  public createPlaylist(title: string, description: string, initialTrackIds: string[] = []): Playlist {
    const gradients = [
      'from-amber-500 via-yellow-500 to-amber-700',
      'from-yellow-400 via-amber-600 to-zinc-950',
      'from-amber-600 via-orange-600 to-neutral-900',
      'from-yellow-500 via-stone-700 to-black',
    ];
    const gradient = gradients[Math.floor(Math.random() * gradients.length)];
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      title,
      description: description || 'Custom user playlist',
      coverGradient: gradient,
      trackIds: initialTrackIds,
      createdAt: new Date().toISOString().split('T')[0],
      isUserCreated: true,
    };

    const playlists = [...this.getPlaylists(), newPlaylist];
    this.savePlaylists(playlists);
    return newPlaylist;
  }

  public addTrackToPlaylist(playlistId: string, trackId: string): Playlist[] {
    const playlists = this.getPlaylists().map((p) => {
      if (p.id === playlistId && !p.trackIds.includes(trackId)) {
        return { ...p, trackIds: [...p.trackIds, trackId] };
      }
      return p;
    });
    this.savePlaylists(playlists);
    return playlists;
  }

  public removeTrackFromPlaylist(playlistId: string, trackId: string): Playlist[] {
    const playlists = this.getPlaylists().map((p) => {
      if (p.id === playlistId) {
        return { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) };
      }
      return p;
    });
    this.savePlaylists(playlists);
    return playlists;
  }

  public deletePlaylist(playlistId: string): Playlist[] {
    const playlists = this.getPlaylists().filter((p) => p.id !== playlistId);
    this.savePlaylists(playlists);
    return playlists;
  }

  // Backup & Restore
  public exportData(): string {
    const data = {
      artist: this.getArtist(),
      albums: this.getAlbums(),
      tracks: this.getTracks(),
      playlists: this.getPlaylists(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  public importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.tracks && parsed.albums && parsed.artist) {
        this.saveArtist(parsed.artist);
        this.saveAlbums(parsed.albums);
        this.saveTracks(parsed.tracks);
        if (parsed.playlists) this.savePlaylists(parsed.playlists);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public getUserAccount(): UserAccount {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_ACCOUNT);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      name: 'Plateau Listener',
      handle: '@listener',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces&q=80',
      memberSince: 'October 2026',
      audioQuality: 'lossless',
      equalizerPreset: 'warm-tape',
      crossfadeSeconds: 3,
      soundCheck: true,
      autoSaveHistory: true,
    };
  }

  public saveUserAccount(account: UserAccount): void {
    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(account));
  }

  public getListeningHistory(): ListeningHistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LISTENING_HISTORY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  }

  public saveListeningHistory(history: ListeningHistoryItem[]): void {
    localStorage.setItem(STORAGE_KEYS.LISTENING_HISTORY, JSON.stringify(history.slice(0, 100)));
  }

  public resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.TRACKS);
    localStorage.removeItem(STORAGE_KEYS.ALBUMS);
    localStorage.removeItem(STORAGE_KEYS.ARTIST);
    localStorage.removeItem(STORAGE_KEYS.PLAYLISTS);
    this.saveTracks(INITIAL_TRACKS);
    this.saveAlbums(INITIAL_ALBUMS);
    this.saveArtist(INITIAL_ARTIST);
    this.savePlaylists(INITIAL_PLAYLISTS);
  }
}

export const storageService = new StorageService();
