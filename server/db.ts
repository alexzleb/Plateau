import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { INITIAL_ARTISTS, INITIAL_ARTIST, INITIAL_ALBUMS, INITIAL_TRACKS, INITIAL_PLAYLISTS } from '../src/data/initialData.ts';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads', 'audio');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const DB_FILE_PATH = path.join(DATA_DIR, 'music.db');

export class MusicDatabase {
  private db: DatabaseSync;

  constructor() {
    this.db = new DatabaseSync(DB_FILE_PATH);
    this.initTables();
    this.seedIfEmpty();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS artist_profile (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        bio TEXT,
        avatar_url TEXT,
        banner_url TEXT,
        hometown TEXT,
        genres TEXT,
        quote TEXT,
        verified INTEGER DEFAULT 1,
        monthly_listeners INTEGER DEFAULT 0,
        social_spotify TEXT,
        social_soundcloud TEXT,
        social_instagram TEXT,
        social_website TEXT
      );

      CREATE TABLE IF NOT EXISTS albums (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        artist_id TEXT,
        cover_url TEXT,
        release_year INTEGER,
        release_date TEXT,
        genre TEXT,
        description TEXT,
        type TEXT DEFAULT 'album',
        record_label TEXT,
        is_hi_res_audio INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS tracks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        artist_id TEXT,
        album_id TEXT,
        album_title TEXT,
        cover_url TEXT,
        duration REAL DEFAULT 180,
        track_number INTEGER DEFAULT 1,
        audio_url TEXT,
        audio_file_name TEXT,
        audio_version TEXT,
        special_notes TEXT,
        notes_date TEXT,
        lyrics TEXT,
        genre TEXT,
        release_year INTEGER,
        is_explicit INTEGER DEFAULT 0,
        is_favorite INTEGER DEFAULT 0,
        is_downloaded INTEGER DEFAULT 0,
        plays INTEGER DEFAULT 0,
        composer TEXT,
        producer TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        cover_gradient TEXT,
        cover_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_user_created INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS playlist_tracks (
        playlist_id TEXT,
        track_id TEXT,
        position INTEGER DEFAULT 0,
        PRIMARY KEY (playlist_id, track_id)
      );
    `);
  }

  private seedIfEmpty() {
    // Seed all artists if fewer than 2
    const artistCount = (this.db.prepare('SELECT COUNT(*) as count FROM artist_profile').get() as { count: number }).count;
    if (artistCount < 2) {
      const insertArtist = this.db.prepare(`
        INSERT OR REPLACE INTO artist_profile (
          id, name, bio, avatar_url, banner_url, hometown, genres, quote, verified, monthly_listeners,
          social_spotify, social_soundcloud, social_instagram, social_website
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const art of INITIAL_ARTISTS) {
        insertArtist.run(
          art.id,
          art.name,
          art.bio,
          art.avatarUrl,
          art.bannerUrl,
          art.hometown,
          JSON.stringify(art.genres),
          art.quote,
          art.verified ? 1 : 0,
          art.monthlyListeners,
          art.socialLinks?.spotify || null,
          art.socialLinks?.soundcloud || null,
          art.socialLinks?.instagram || null,
          art.socialLinks?.website || null
        );
      }
    }

    // Seed albums if empty
    const albumCount = (this.db.prepare('SELECT COUNT(*) as count FROM albums').get() as { count: number }).count;
    if (albumCount === 0) {
      const insertAlbum = this.db.prepare(`
        INSERT INTO albums (
          id, title, artist, artist_id, cover_url, release_year, release_date, genre, description, type, record_label, is_hi_res_audio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const alb of INITIAL_ALBUMS) {
        insertAlbum.run(
          alb.id,
          alb.title,
          alb.artist,
          alb.artistId,
          alb.coverUrl,
          alb.releaseYear,
          alb.releaseDate || `${alb.releaseYear}`,
          alb.genre,
          alb.description,
          alb.type,
          alb.recordLabel,
          alb.isHiResAudio ? 1 : 0
        );
      }
    }

    // Seed tracks if fewer than 3
    const trackCount = (this.db.prepare('SELECT COUNT(*) as count FROM tracks').get() as { count: number }).count;
    if (trackCount < 3) {
      const insertTrack = this.db.prepare(`
        INSERT OR IGNORE INTO tracks (
          id, title, artist, artist_id, album_id, album_title, cover_url, duration, track_number, audio_url,
          audio_file_name, audio_version, special_notes, notes_date, lyrics, genre, release_year,
          is_explicit, is_favorite, is_downloaded, plays, composer, producer
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of INITIAL_TRACKS) {
        insertTrack.run(
          t.id,
          t.title,
          t.artist,
          t.artistId,
          t.albumId,
          t.albumTitle,
          t.coverUrl,
          t.duration,
          t.trackNumber,
          t.audioUrl,
          t.audioFileName || null,
          t.audioVersion || null,
          t.specialNotes || null,
          t.notesDate || null,
          t.lyrics || null,
          t.genre,
          t.releaseYear,
          t.isExplicit ? 1 : 0,
          t.isFavorite ? 1 : 0,
          t.isDownloaded ? 1 : 0,
          t.plays,
          t.composer || null,
          t.producer || null
        );
      }
    }

    // Seed playlists if empty
    const playlistCount = (this.db.prepare('SELECT COUNT(*) as count FROM playlists').get() as { count: number }).count;
    if (playlistCount === 0) {
      const insertPlaylist = this.db.prepare(`
        INSERT INTO playlists (id, title, description, cover_gradient, cover_url, created_at, is_user_created)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const insertPlaylistTrack = this.db.prepare(`
        INSERT INTO playlist_tracks (playlist_id, track_id, position)
        VALUES (?, ?, ?)
      `);
      for (const pl of INITIAL_PLAYLISTS) {
        insertPlaylist.run(
          pl.id,
          pl.title,
          pl.description,
          pl.coverGradient,
          pl.coverUrl || null,
          pl.createdAt,
          pl.isUserCreated ? 1 : 0
        );
        pl.trackIds.forEach((tId, idx) => {
          insertPlaylistTrack.run(pl.id, tId, idx);
        });
      }
    }
  }

  // --- Artist Profile Queries ---
  private formatArtistRow(row: Record<string, unknown>) {
    return {
      id: row.id as string,
      name: row.name as string,
      bio: (row.bio as string) || '',
      avatarUrl: (row.avatar_url as string) || '',
      bannerUrl: (row.banner_url as string) || '',
      hometown: (row.hometown as string) || '',
      genres: row.genres ? JSON.parse(row.genres as string) : [],
      quote: (row.quote as string) || '',
      verified: Boolean(row.verified),
      monthlyListeners: Number(row.monthly_listeners) || 0,
      socialLinks: {
        spotify: (row.social_spotify as string) || undefined,
        soundcloud: (row.social_soundcloud as string) || undefined,
        instagram: (row.social_instagram as string) || undefined,
        website: (row.social_website as string) || undefined,
      },
    };
  }

  public getAllArtists() {
    const rows = this.db.prepare('SELECT * FROM artist_profile ORDER BY name ASC').all() as Record<string, unknown>[];
    if (rows.length === 0) return INITIAL_ARTISTS;
    return rows.map((r) => this.formatArtistRow(r));
  }

  public getArtistById(id: string) {
    const row = this.db.prepare('SELECT * FROM artist_profile WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    return this.formatArtistRow(row);
  }

  public createArtist(profile: Partial<typeof INITIAL_ARTIST>) {
    const id = profile.id || `artist-${Date.now()}`;
    const stmt = this.db.prepare(`
      INSERT INTO artist_profile (
        id, name, bio, avatar_url, banner_url, hometown, genres, quote,
        verified, monthly_listeners, social_spotify, social_soundcloud, social_instagram, social_website
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      profile.name || 'New Artist',
      profile.bio || '',
      profile.avatarUrl || '/src/assets/images/artist_avatar_1792181611089.jpg',
      profile.bannerUrl || '/src/assets/images/artist_hero_banner_1792181611233.jpg',
      profile.hometown || '',
      JSON.stringify(profile.genres || ['Electronic']),
      profile.quote || '',
      profile.verified !== false ? 1 : 0,
      profile.monthlyListeners || 10000,
      profile.socialLinks?.spotify || null,
      profile.socialLinks?.soundcloud || null,
      profile.socialLinks?.instagram || null,
      profile.socialLinks?.website || null
    );
    return this.getArtistById(id);
  }

  public updateArtist(id: string, updates: Partial<typeof INITIAL_ARTIST>) {
    const existing = this.getArtistById(id);
    if (!existing) return null;

    const merged = {
      ...existing,
      ...updates,
      socialLinks: {
        ...existing.socialLinks,
        ...(updates.socialLinks || {}),
      },
    };

    const stmt = this.db.prepare(`
      UPDATE artist_profile SET
        name = ?, bio = ?, avatar_url = ?, banner_url = ?, hometown = ?, genres = ?, quote = ?,
        verified = ?, monthly_listeners = ?, social_spotify = ?, social_soundcloud = ?, social_instagram = ?, social_website = ?
      WHERE id = ?
    `);
    stmt.run(
      merged.name,
      merged.bio,
      merged.avatarUrl,
      merged.bannerUrl,
      merged.hometown,
      JSON.stringify(merged.genres),
      merged.quote,
      merged.verified ? 1 : 0,
      merged.monthlyListeners,
      merged.socialLinks?.spotify || null,
      merged.socialLinks?.soundcloud || null,
      merged.socialLinks?.instagram || null,
      merged.socialLinks?.website || null,
      id
    );
    return this.getArtistById(id);
  }

  public deleteArtist(id: string) {
    this.db.prepare('DELETE FROM artist_profile WHERE id = ?').run(id);
    return { success: true, id };
  }

  public getArtistProfile() {
    const first = this.getAllArtists()[0];
    return first || INITIAL_ARTIST;
  }

  public updateArtistProfile(profile: typeof INITIAL_ARTIST) {
    return this.updateArtist(profile.id, profile);
  }

  // --- Tracks Queries ---
  public getAllTracks() {
    const rows = this.db.prepare('SELECT * FROM tracks ORDER BY album_id, track_number ASC').all() as Record<string, unknown>[];
    return rows.map((r) => ({
      id: r.id as string,
      title: r.title as string,
      artist: r.artist as string,
      artistId: (r.artist_id as string) || 'artist-1',
      albumId: (r.album_id as string) || '',
      albumTitle: (r.album_title as string) || '',
      coverUrl: (r.cover_url as string) || '',
      duration: Number(r.duration) || 180,
      trackNumber: Number(r.track_number) || 1,
      audioUrl: (r.audio_url as string) || '',
      audioFileName: (r.audio_file_name as string) || undefined,
      audioVersion: (r.audio_version as string) || undefined,
      specialNotes: (r.special_notes as string) || undefined,
      notesDate: (r.notes_date as string) || undefined,
      lyrics: (r.lyrics as string) || undefined,
      genre: (r.genre as string) || 'Electronic',
      releaseYear: Number(r.release_year) || 2026,
      isExplicit: Boolean(r.is_explicit),
      isFavorite: Boolean(r.is_favorite),
      isDownloaded: Boolean(r.is_downloaded),
      plays: Number(r.plays) || 0,
      composer: (r.composer as string) || undefined,
      producer: (r.producer as string) || undefined,
    }));
  }

  public getTrackById(id: string) {
    const r = this.db.prepare('SELECT * FROM tracks WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!r) return null;
    return {
      id: r.id as string,
      title: r.title as string,
      artist: r.artist as string,
      artistId: (r.artist_id as string) || 'artist-1',
      albumId: (r.album_id as string) || '',
      albumTitle: (r.album_title as string) || '',
      coverUrl: (r.cover_url as string) || '',
      duration: Number(r.duration) || 180,
      trackNumber: Number(r.track_number) || 1,
      audioUrl: (r.audio_url as string) || '',
      audioFileName: (r.audio_file_name as string) || undefined,
      audioVersion: (r.audio_version as string) || undefined,
      specialNotes: (r.special_notes as string) || undefined,
      notesDate: (r.notes_date as string) || undefined,
      lyrics: (r.lyrics as string) || undefined,
      genre: (r.genre as string) || 'Electronic',
      releaseYear: Number(r.release_year) || 2026,
      isExplicit: Boolean(r.is_explicit),
      isFavorite: Boolean(r.is_favorite),
      isDownloaded: Boolean(r.is_downloaded),
      plays: Number(r.plays) || 0,
      composer: (r.composer as string) || undefined,
      producer: (r.producer as string) || undefined,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createTrack(track: any) {
    const stmt = this.db.prepare(`
      INSERT INTO tracks (
        id, title, artist, artist_id, album_id, album_title, cover_url, duration, track_number, audio_url,
        audio_file_name, audio_version, special_notes, notes_date, lyrics, genre, release_year,
        is_explicit, is_favorite, is_downloaded, plays, composer, producer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      track.id,
      track.title,
      track.artist,
      track.artistId || 'artist-1',
      track.albumId || '',
      track.albumTitle || '',
      track.coverUrl || '',
      track.duration || 180,
      track.trackNumber || 1,
      track.audioUrl || '',
      track.audioFileName || null,
      track.audioVersion || 'Master v1.0',
      track.specialNotes || null,
      track.notesDate || null,
      track.lyrics || null,
      track.genre || 'Electronic',
      track.releaseYear || 2026,
      track.isExplicit ? 1 : 0,
      track.isFavorite ? 1 : 0,
      track.isDownloaded ? 1 : 0,
      track.plays || 0,
      track.composer || null,
      track.producer || null
    );
    return this.getTrackById(track.id as string);
  }

  public updateTrack(id: string, updates: Record<string, unknown>) {
    const existing = this.getTrackById(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates };

    const stmt = this.db.prepare(`
      UPDATE tracks SET
        title = ?, artist = ?, artist_id = ?, album_id = ?, album_title = ?, cover_url = ?, duration = ?,
        track_number = ?, audio_url = ?, audio_file_name = ?, audio_version = ?, special_notes = ?,
        notes_date = ?, lyrics = ?, genre = ?, release_year = ?, is_explicit = ?, is_favorite = ?,
        is_downloaded = ?, plays = ?, composer = ?, producer = ?
      WHERE id = ?
    `);
    stmt.run(
      merged.title,
      merged.artist,
      merged.artistId,
      merged.albumId,
      merged.albumTitle,
      merged.coverUrl,
      merged.duration,
      merged.trackNumber,
      merged.audioUrl,
      merged.audioFileName || null,
      merged.audioVersion || null,
      merged.specialNotes || null,
      merged.notesDate || null,
      merged.lyrics || null,
      merged.genre,
      merged.releaseYear,
      merged.isExplicit ? 1 : 0,
      merged.isFavorite ? 1 : 0,
      merged.isDownloaded ? 1 : 0,
      merged.plays,
      merged.composer || null,
      merged.producer || null,
      id
    );
    return this.getTrackById(id);
  }

  public deleteTrack(id: string) {
    this.db.prepare('DELETE FROM playlist_tracks WHERE track_id = ?').run(id);
    this.db.prepare('DELETE FROM tracks WHERE id = ?').run(id);
    return true;
  }

  public recordTrackPlay(id: string) {
    this.db.prepare('UPDATE tracks SET plays = plays + 1 WHERE id = ?').run(id);
    return this.getTrackById(id);
  }

  // --- Albums Queries ---
  public getAllAlbums() {
    const rows = this.db.prepare('SELECT * FROM albums ORDER BY release_year DESC').all() as Record<string, unknown>[];
    const tracks = this.getAllTracks();

    return rows.map((r) => {
      const albumTracks = tracks.filter((t) => t.albumId === r.id);
      return {
        id: r.id as string,
        title: r.title as string,
        artist: r.artist as string,
        artistId: (r.artist_id as string) || 'artist-1',
        coverUrl: (r.cover_url as string) || '',
        releaseYear: Number(r.release_year) || 2026,
        releaseDate: (r.release_date as string) || `${r.release_year}`,
        genre: (r.genre as string) || 'Electronic',
        description: (r.description as string) || '',
        type: (r.type as 'album' | 'single' | 'ep') || 'album',
        recordLabel: (r.record_label as string) || '',
        isHiResAudio: Boolean(r.is_hi_res_audio),
        trackIds: albumTracks.map((t) => t.id),
      };
    });
  }

  public getAlbumById(id: string) {
    const albums = this.getAllAlbums();
    return albums.find((a) => a.id === id) || null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createAlbum(album: any) {
    const stmt = this.db.prepare(`
      INSERT INTO albums (
        id, title, artist, artist_id, cover_url, release_year, release_date, genre, description, type, record_label, is_hi_res_audio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      album.id,
      album.title,
      album.artist,
      album.artistId || 'artist-1',
      album.coverUrl || '',
      album.releaseYear || 2026,
      album.releaseDate || `${album.releaseYear || 2026}`,
      album.genre || 'Electronic',
      album.description || '',
      album.type || 'album',
      album.recordLabel || 'Amber Wave Music',
      album.isHiResAudio !== false ? 1 : 0
    );
    return this.getAlbumById(album.id as string);
  }

  public updateAlbum(id: string, updates: Record<string, unknown>) {
    const existing = this.getAlbumById(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates };

    const stmt = this.db.prepare(`
      UPDATE albums SET
        title = ?, artist = ?, artist_id = ?, cover_url = ?, release_year = ?, release_date = ?,
        genre = ?, description = ?, type = ?, record_label = ?, is_hi_res_audio = ?
      WHERE id = ?
    `);
    stmt.run(
      merged.title,
      merged.artist,
      merged.artistId,
      merged.coverUrl,
      merged.releaseYear,
      merged.releaseDate,
      merged.genre,
      merged.description,
      merged.type,
      merged.recordLabel,
      merged.isHiResAudio ? 1 : 0,
      id
    );
    return this.getAlbumById(id);
  }

  public deleteAlbum(id: string) {
    this.db.prepare('DELETE FROM albums WHERE id = ?').run(id);
    // Unassign tracks
    this.db.prepare("UPDATE tracks SET album_id = '', album_title = 'Single' WHERE album_id = ?").run(id);
    return true;
  }

  // --- Playlists Queries ---
  public getAllPlaylists() {
    const playlists = this.db.prepare('SELECT * FROM playlists ORDER BY created_at DESC').all() as Record<string, unknown>[];
    const ptRows = this.db.prepare('SELECT * FROM playlist_tracks ORDER BY position ASC').all() as Record<string, unknown>[];

    return playlists.map((p) => {
      const trackIds = ptRows
        .filter((pt) => pt.playlist_id === p.id)
        .map((pt) => pt.track_id as string);
      return {
        id: p.id as string,
        title: p.title as string,
        description: (p.description as string) || '',
        coverGradient: (p.cover_gradient as string) || 'from-amber-500 to-yellow-600',
        coverUrl: (p.cover_url as string) || undefined,
        trackIds,
        createdAt: (p.created_at as string) || new Date().toISOString().split('T')[0],
        isUserCreated: Boolean(p.is_user_created),
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createPlaylist(pl: any) {
    const stmt = this.db.prepare(`
      INSERT INTO playlists (id, title, description, cover_gradient, cover_url, created_at, is_user_created)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      pl.id,
      pl.title,
      pl.description || '',
      pl.coverGradient || 'from-amber-500 to-yellow-600',
      pl.coverUrl || null,
      pl.createdAt || new Date().toISOString().split('T')[0],
      pl.isUserCreated !== false ? 1 : 0
    );
    return pl;
  }

  public addTrackToPlaylist(playlistId: string, trackId: string) {
    const countRow = this.db.prepare('SELECT COUNT(*) as count FROM playlist_tracks WHERE playlist_id = ?').get(playlistId) as { count: number };
    const pos = countRow.count;
    try {
      this.db.prepare('INSERT OR IGNORE INTO playlist_tracks (playlist_id, track_id, position) VALUES (?, ?, ?)').run(playlistId, trackId, pos);
    } catch {
      // ignore duplicates
    }
  }

  public removeTrackFromPlaylist(playlistId: string, trackId: string) {
    this.db.prepare('DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?').run(playlistId, trackId);
  }

  public deletePlaylist(id: string) {
    this.db.prepare('DELETE FROM playlist_tracks WHERE playlist_id = ?').run(id);
    this.db.prepare('DELETE FROM playlists WHERE id = ?').run(id);
  }

  // --- Raw Query Execution for Developer / SQL Studio Inspector ---
  public executeSql(sql: string) {
    const startTime = Date.now();
    const trimmed = sql.trim();
    const isSelect = trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('PRAGMA');

    if (isSelect) {
      const rows = this.db.prepare(trimmed).all();
      const timeMs = Date.now() - startTime;
      const columns = rows.length > 0 ? Object.keys(rows[0] as object) : [];
      return { success: true, isSelect: true, columns, rows, count: rows.length, timeMs };
    } else {
      const info = this.db.exec(trimmed);
      const timeMs = Date.now() - startTime;
      return { success: true, isSelect: false, info, timeMs };
    }
  }

  // --- Database Stats ---
  public getStats() {
    let sizeBytes = 0;
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        sizeBytes = fs.statSync(DB_FILE_PATH).size;
      }
    } catch {
      sizeBytes = 0;
    }

    const tracksCount = (this.db.prepare('SELECT COUNT(*) as count FROM tracks').get() as { count: number }).count;
    const albumsCount = (this.db.prepare('SELECT COUNT(*) as count FROM albums').get() as { count: number }).count;
    const playlistsCount = (this.db.prepare('SELECT COUNT(*) as count FROM playlists').get() as { count: number }).count;

    return {
      filePath: DB_FILE_PATH,
      engine: 'SQLite 3 (Node.js DatabaseSync)',
      sizeBytes,
      sizeKb: (sizeBytes / 1024).toFixed(1),
      rowCounts: {
        tracks: tracksCount,
        albums: albumsCount,
        playlists: playlistsCount,
      },
    };
  }
}

export const musicDb = new MusicDatabase();
