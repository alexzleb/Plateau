/**
 * Local Batch Populating Script for Amber Music (Node.js)
 *
 * Usage:
 *   node scripts/populate.js
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const dataDir = path.join(ROOT_DIR, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'music.db');
const db = new DatabaseSync(dbPath);

db.exec(`
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
`);

console.log(`Connecting to local SQLite database: ${dbPath}`);

// Example: Inserting custom tracks into an album
const customTracks = [
  {
    id: `track-custom-${Date.now()}-1`,
    title: 'Neon Drift (Custom Mix)',
    artist: 'Alez Leb',
    albumId: 'album-1',
    albumTitle: 'Amber Hour',
    coverUrl: '/src/assets/images/album_golden_hour_1792181609674.jpg',
    duration: 204,
    trackNumber: 5,
    audioUrl: 'synth:amber-chords',
    audioVersion: 'Studio Demo v1.0',
    specialNotes: 'Added via local script. Recorded with modular synth filter sweeps.',
    genre: 'Electronic',
    releaseYear: 2026,
  },
  {
    id: `track-custom-${Date.now()}-2`,
    title: 'Solitude in Tape',
    artist: 'Alez Leb',
    albumId: 'album-2',
    albumTitle: 'Luminal Frequency',
    coverUrl: '/src/assets/images/album_neon_solitude_1792181610826.jpg',
    duration: 238,
    trackNumber: 4,
    audioUrl: 'synth:void-pulse',
    audioVersion: 'Analog Tape Mix',
    specialNotes: 'Added via local script. Mastered through analog reel-to-reel tape.',
    genre: 'Synthwave',
    releaseYear: 2026,
  },
];

const insertStmt = db.prepare(`
  INSERT INTO tracks (
    id, title, artist, album_id, album_title, cover_url, duration, track_number,
    audio_url, audio_version, special_notes, genre, release_year, plays
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const t of customTracks) {
  insertStmt.run(
    t.id,
    t.title,
    t.artist,
    t.albumId,
    t.albumTitle,
    t.coverUrl,
    t.duration,
    t.trackNumber,
    t.audioUrl,
    t.audioVersion,
    t.specialNotes,
    t.genre,
    t.releaseYear,
    0
  );
  console.log(`✓ Inserted: "${t.title}" (${t.albumTitle})`);
}

const count = db.prepare('SELECT COUNT(*) as total FROM tracks').get();
console.log(`\nDone! Total tracks now in local SQLite database: ${count.total}`);
