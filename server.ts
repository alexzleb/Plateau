import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { musicDb, DB_FILE_PATH } from './server/db.ts';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname;

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Parse JSON bodies up to 50MB (for bulk imports, artwork, etc.)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set up file upload with multer to save directly to local disk
const uploadsDir = path.join(ROOT_DIR, 'uploads', 'audio');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
    cb(null, `${uniqueSuffix}_${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max per audio file
});

// Serve uploaded audio and artwork statically
app.use('/uploads', express.static(path.join(ROOT_DIR, 'uploads')));

// --------------------------------------------------------------------------
// Admin Authentication & Security
// --------------------------------------------------------------------------
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'admin2026';

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const adminHeader = req.headers['x-admin-token'];
  const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.substring(7) : adminHeader;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
  }

  try {
    const decoded = Buffer.from(String(token), 'base64').toString('utf-8');
    if (decoded.startsWith(`amber_admin:${ADMIN_PASSCODE}:`)) {
      return next();
    }
  } catch {
    // continue
  }

  if (token === ADMIN_PASSCODE) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });
}

// Admin login verification endpoint
app.post('/api/admin/login', (req, res) => {
  try {
    const { passcode } = req.body;
    if (passcode && (passcode === ADMIN_PASSCODE || passcode.trim() === ADMIN_PASSCODE)) {
      const token = Buffer.from(`amber_admin:${ADMIN_PASSCODE}:${Date.now()}`).toString('base64');
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: 'Invalid admin passcode' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    res.status(500).json({ error: message });
  }
});

// Admin verify session endpoint
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const adminHeader = req.headers['x-admin-token'];
  const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.substring(7) : adminHeader;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const decoded = Buffer.from(String(token), 'base64').toString('utf-8');
    if (decoded.startsWith(`amber_admin:${ADMIN_PASSCODE}:`)) {
      return res.json({ authenticated: true });
    }
  } catch {
    // continue
  }

  if (token === ADMIN_PASSCODE) {
    return res.json({ authenticated: true });
  }

  return res.status(401).json({ authenticated: false });
});

// --------------------------------------------------------------------------
// API Endpoints: Local SQLite Database
// --------------------------------------------------------------------------

// Health & Database stats
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/db/stats', (_req, res) => {
  try {
    const stats = musicDb.getStats();
    res.json(stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Download raw .db file directly (protected)
app.get('/api/db/download', requireAdmin, (_req, res) => {
  if (fs.existsSync(DB_FILE_PATH)) {
    res.download(DB_FILE_PATH, 'music.db');
  } else {
    res.status(404).json({ error: 'Database file not found' });
  }
});

// Raw SQL query executor for Developer Studio / Database Inspector (protected)
app.post('/api/db/query', requireAdmin, (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ error: 'SQL query string is required' });
    }
    const result = musicDb.executeSql(sql);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'SQL Error';
    res.status(400).json({ error: message });
  }
});

// --- Tracks ---
app.get('/api/tracks', (_req, res) => {
  try {
    const tracks = musicDb.getAllTracks();
    res.json(tracks);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/tracks', requireAdmin, (req, res) => {
  try {
    const track = musicDb.createTrack(req.body);
    res.status(201).json(track);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

app.put('/api/tracks/:id', requireAdmin, (req, res) => {
  try {
    const updated = musicDb.updateTrack(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Track not found' });
    }
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

app.delete('/api/tracks/:id', requireAdmin, (req, res) => {
  try {
    musicDb.deleteTrack(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/tracks/:id/play', (req, res) => {
  try {
    const updated = musicDb.recordTrackPlay(req.params.id);
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Upload and replace audio file for a track
app.post('/api/tracks/:id/upload', requireAdmin, upload.single('audio'), (req, res) => {
  try {
    const trackId = req.params.id;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const versionLabel = req.body.versionLabel || `Local Upload (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    const audioUrl = `/uploads/audio/${file.filename}`;

    const updated = musicDb.updateTrack(trackId, {
      audio_url: audioUrl,
      audio_file_name: file.originalname,
      audio_version: versionLabel,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({
      success: true,
      track: updated,
      audioUrl,
      fileName: file.originalname,
      sizeBytes: file.size,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    res.status(500).json({ error: message });
  }
});

// --- Albums ---
app.get('/api/albums', (_req, res) => {
  try {
    const albums = musicDb.getAllAlbums();
    res.json(albums);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/albums', requireAdmin, (req, res) => {
  try {
    const album = musicDb.createAlbum(req.body);
    res.status(201).json(album);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

app.put('/api/albums/:id', requireAdmin, (req, res) => {
  try {
    const updated = musicDb.updateAlbum(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Album not found' });
    }
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

app.delete('/api/albums/:id', requireAdmin, (req, res) => {
  try {
    musicDb.deleteAlbum(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// --- Artists (Multiple Artists Support) ---
app.get('/api/artists', (_req, res) => {
  try {
    const artists = musicDb.getAllArtists();
    res.json(artists);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/artists', requireAdmin, (req, res) => {
  try {
    const created = musicDb.createArtist(req.body);
    res.status(201).json(created);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

app.get('/api/artists/:id', (req, res) => {
  try {
    const artist = musicDb.getArtistById(req.params.id);
    if (!artist) return res.status(404).json({ error: 'Artist not found' });
    res.json(artist);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.put('/api/artists/:id', requireAdmin, (req, res) => {
  try {
    const updated = musicDb.updateArtist(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Artist not found' });
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

app.delete('/api/artists/:id', requireAdmin, (req, res) => {
  try {
    musicDb.deleteArtist(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Single artist legacy compatibility
app.get('/api/artist', (_req, res) => {
  try {
    const profile = musicDb.getArtistProfile();
    res.json(profile);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.put('/api/artist', requireAdmin, (req, res) => {
  try {
    const updated = musicDb.updateArtistProfile(req.body);
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// --- Playlists ---
app.get('/api/playlists', (_req, res) => {
  try {
    const playlists = musicDb.getAllPlaylists();
    res.json(playlists);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/playlists', (req, res) => {
  try {
    const playlist = musicDb.createPlaylist(req.body);
    res.status(201).json(playlist);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

app.delete('/api/playlists/:id', (req, res) => {
  try {
    musicDb.deletePlaylist(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/playlists/:id/tracks', (req, res) => {
  try {
    const { trackId } = req.body;
    musicDb.addTrackToPlaylist(req.params.id, trackId);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

app.delete('/api/playlists/:id/tracks/:trackId', (req, res) => {
  try {
    musicDb.removeTrackFromPlaylist(req.params.id, req.params.trackId);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// --------------------------------------------------------------------------
// Vite integration for development or static serving for production
// --------------------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for SPA routing in development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/uploads')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(ROOT_DIR, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Plateau · PRZM Server running at http://localhost:${PORT}`);
    console.log(`Local SQLite Database connected at: ${DB_FILE_PATH}`);
  });
}

startServer();
