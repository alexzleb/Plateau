#!/usr/bin/env python3
"""
Local Batch Populating Script for Amber Music (Python)

Usage:
    python3 scripts/populate.py
"""

import sqlite3
import os
import time

db_path = os.path.join(os.getcwd(), 'data', 'music.db')
print(f"Connecting to local database: {db_path}")

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
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
    )
""")

# Sample songs to populate
new_tracks = [
    (
        f"track-py-{int(time.time())}-1",
        "Celestial Reverie",
        "Alez Leb",
        "artist-1",
        "album-3",
        "Aurora Sounds",
        "/src/assets/images/album_midnight_echoes_1792181597466.jpg",
        224,
        3,
        "synth:modern-collective",
        "Python Master v1",
        "Created with Python script. Minimalist Rhodes piano with analog chorus.",
        "Ambient Neo-Classical",
        2026,
        0,
    ),
    (
        f"track-py-{int(time.time())}-2",
        "Amber Skyline",
        "Alez Leb",
        "artist-1",
        "album-1",
        "Amber Hour",
        "/src/assets/images/album_golden_hour_1792181609674.jpg",
        198,
        6,
        "synth:amber-chords",
        "Python Master v1",
        "Created with Python script. Sunset field recording blended with warm sub bass.",
        "Electronic / Ambient",
        2026,
        0,
    ),
]

cur.executemany("""
    INSERT INTO tracks (
        id, title, artist, artist_id, album_id, album_title, cover_url,
        duration, track_number, audio_url, audio_version, special_notes,
        genre, release_year, plays
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", new_tracks)

conn.commit()

cur.execute("SELECT COUNT(*) FROM tracks")
total = cur.fetchone()[0]
print(f"Successfully populated songs! Total tracks in SQLite database: {total}")
conn.close()
