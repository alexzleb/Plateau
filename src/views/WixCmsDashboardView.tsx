import React, { useState, useRef } from 'react';
import {
  Layers,
  Music2,
  Disc3,
  User,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Play,
  Pause,
  UploadCloud,
  BarChart3,
  ExternalLink,
  Search,
  Database,
  ArrowUpDown,
  SlidersHorizontal,
  Sparkles,
  FileText,
  Clock,
  Radio,
  RefreshCw,
  Download,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Track, Album, ArtistProfile } from '../types/music';
import { api } from '../services/api';
import { formatTime, formatPlayCount } from '../utils/formatters';
import { PyramidLogo } from '../components/PyramidLogo';

type CmsCollection = 'tracks' | 'albums' | 'artists' | 'analytics' | 'settings';

export const WixCmsDashboardView: React.FC = () => {
  const {
    tracks,
    albums,
    artists,
    artist,
    playlists,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    updateTrackMetadata,
    addNewTrack,
    deleteTrack,
    saveAlbum,
    deleteAlbum,
    saveArtist,
    deleteArtist,
    dbStats,
    refreshDbStats,
    reloadCatalog,
    setAppMode,
  } = useMusic();

  const [activeCollection, setActiveCollection] = useState<CmsCollection>('tracks');
  const [searchFilter, setSearchFilter] = useState('');

  // Editing Modals State
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [editingArtist, setEditingArtist] = useState<ArtistProfile | null>(null);

  // New Item Modals State
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [isAddingAlbum, setIsAddingAlbum] = useState(false);
  const [isAddingArtist, setIsAddingArtist] = useState(false);

  // Audio Upload Feedback
  const [uploadingTrackId, setUploadingTrackId] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedUploadTrackId, setSelectedUploadTrackId] = useState<string | null>(null);

  // Trigger file selection for replacement
  const handleOpenUploadForTrack = (trackId: string) => {
    setSelectedUploadTrackId(trackId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUploadTrackId) return;

    setUploadingTrackId(selectedUploadTrackId);
    try {
      const res = await api.uploadAudioFile(selectedUploadTrackId, file, `Upload ${file.name}`);
      if (res && res.track) {
        updateTrackMetadata(res.track);
        setUploadSuccessMsg(`Successfully uploaded ${file.name} to "${res.track.title}"!`);
        setTimeout(() => setUploadSuccessMsg(null), 4000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      alert(`Audio upload failed: ${msg}`);
    } finally {
      setUploadingTrackId(null);
      setSelectedUploadTrackId(null);
      if (e.target) e.target.value = '';
    }
  };

  // Filtered collections
  const filteredTracks = tracks.filter((t) =>
    t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.albumTitle.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredAlbums = albums.filter((a) =>
    a.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    a.artist.toLowerCase().includes(searchFilter.toLowerCase()) ||
    a.genre.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    a.genres.some((g) => g.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  // Total Analytics
  const totalPlays = tracks.reduce((acc, t) => acc + (t.plays || 0), 0);
  const topTracksByPlays = [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0));

  return (
    <div className="min-h-screen bg-[#0e1117] text-neutral-200 flex flex-col font-sans select-none">
      {/* Hidden file input for audio replacements */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        className="hidden"
      />

      {/* Plateau CMS Top Bar */}
      <header className="h-16 px-6 bg-[#161a23] border-b border-[#262c3a] flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-900 to-black p-1.5 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-500/30">
            <PyramidLogo className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                Plateau · PRZM Content Manager
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Database Synced
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              PRZM Studio · Music Catalog & Production Backend
            </p>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {/* Refresh data */}
          <button
            onClick={() => {
              refreshDbStats();
              reloadCatalog();
            }}
            className="p-2 rounded-lg bg-[#202634] hover:bg-[#2b3345] text-neutral-300 hover:text-white border border-[#2b3345] transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* New Item Button */}
          <button
            onClick={() => {
              if (activeCollection === 'tracks') setIsAddingTrack(true);
              else if (activeCollection === 'albums') setIsAddingAlbum(true);
              else if (activeCollection === 'artists') setIsAddingArtist(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {activeCollection === 'tracks'
                ? 'New Track'
                : activeCollection === 'albums'
                ? 'New Album'
                : activeCollection === 'artists'
                ? 'New Artist'
                : 'New Item'}
            </span>
          </button>

          {/* Switch back to Public Music Player */}
          <button
            onClick={() => {
              setAppMode('streaming');
              if (window.location.hash.includes('admin') || window.location.hash.includes('cms')) {
                window.location.hash = '';
              }
              if (window.location.pathname === '/admin') {
                window.history.pushState(null, '', '/');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs shadow-md transition-transform hover:scale-102"
            title="Open Public Streaming Frontend"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Public Player</span>
          </button>

          {/* Log Out */}
          <button
            onClick={() => {
              api.setAdminToken(null);
              setAppMode('streaming');
              if (window.location.hash.includes('admin') || window.location.hash.includes('cms')) {
                window.location.hash = '';
              }
              if (window.location.pathname === '/admin') {
                window.history.pushState(null, '', '/');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202634] hover:bg-red-500/20 text-neutral-300 hover:text-red-400 border border-[#2b3345] hover:border-red-500/30 text-xs font-medium transition-colors"
            title="Log Out of Creator Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main CMS Layout (Sidebar + Content Area) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Wix CMS Collections Left Sidebar */}
        <aside className="w-60 bg-[#12161f] border-r border-[#262c3a] p-4 flex flex-col justify-between shrink-0 select-none">
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-2">
                Collections
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveCollection('tracks')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeCollection === 'tracks'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-neutral-400 hover:text-white hover:bg-[#1a202c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Music2 className="w-4 h-4 shrink-0" />
                    <span>Tracks ({tracks.length})</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveCollection('albums')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeCollection === 'albums'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-neutral-400 hover:text-white hover:bg-[#1a202c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Disc3 className="w-4 h-4 shrink-0" />
                    <span>Albums ({albums.length})</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveCollection('artists')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeCollection === 'artists'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-neutral-400 hover:text-white hover:bg-[#1a202c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 shrink-0" />
                    <span>Artists ({artists.length})</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-2">
                Insights & Storage
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveCollection('analytics')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeCollection === 'analytics'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-neutral-400 hover:text-white hover:bg-[#1a202c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4 shrink-0" />
                    <span>Plays & Analytics</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveCollection('settings')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeCollection === 'settings'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-neutral-400 hover:text-white hover:bg-[#1a202c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 shrink-0" />
                    <span>Database & Backup</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Database Footer info */}
          <div className="p-3 bg-[#181d29] rounded-xl border border-[#262c3a] text-[11px] space-y-1">
            <div className="text-neutral-400 font-medium flex items-center justify-between">
              <span>Database Engine</span>
              <span className="text-emerald-400 font-mono">SQLite (Live)</span>
            </div>
            <div className="text-neutral-500 text-[10px]">
              {tracks.length} tracks · {albums.length} albums · {artists.length} artists
            </div>
          </div>
        </aside>

        {/* Content Table / Dashboard View Area */}
        <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar p-6 bg-[#0e1117]">
          {/* Upload Success Alert */}
          {uploadSuccessMsg && (
            <div className="mb-4 px-4 py-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{uploadSuccessMsg}</span>
              </div>
              <button
                onClick={() => setUploadSuccessMsg(null)}
                className="text-emerald-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Collection Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#262c3a]">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                {activeCollection === 'tracks' && 'Tracks & Audio Stems CMS'}
                {activeCollection === 'albums' && 'Albums & Releases CMS'}
                {activeCollection === 'artists' && 'Artists Profiles CMS'}
                {activeCollection === 'analytics' && 'Streaming Performance & Play Metrics'}
                {activeCollection === 'settings' && 'Media & Database Management'}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                {activeCollection === 'tracks' &&
                  'Manage audio files, replace masters, edit liner notes, and monitor play counts.'}
                {activeCollection === 'albums' &&
                  'Configure release metadata, tracklists, cover art, and genre classification.'}
                {activeCollection === 'artists' &&
                  'Edit artist profiles, bios, avatars, monthly listeners, and verified status.'}
                {activeCollection === 'analytics' &&
                  'Audience streams, play tracking counts, and performance by artist and track.'}
                {activeCollection === 'settings' &&
                  'SQLite local database file backup, storage inspector, and reset tools.'}
              </p>
            </div>

            {/* Collection Search */}
            {(activeCollection === 'tracks' ||
              activeCollection === 'albums' ||
              activeCollection === 'artists') && (
              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={`Search ${activeCollection}...`}
                  className="w-full bg-[#161a23] border border-[#2b3345] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* COLLECTION 1: TRACKS */}
          {/* ========================================================================= */}
          {activeCollection === 'tracks' && (
            <div className="bg-[#161a23] border border-[#262c3a] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#12161f] text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-[#262c3a]">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Title & Artwork</th>
                      <th className="py-3 px-4">Artist</th>
                      <th className="py-3 px-4">Album</th>
                      <th className="py-3 px-4 text-center">Audio File & Replace</th>
                      <th className="py-3 px-4 text-center">Liner Notes</th>
                      <th className="py-3 px-4 text-right">Plays (Metric)</th>
                      <th className="py-3 px-4 text-right">Duration</th>
                      <th className="py-3 px-4 text-center w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232938]">
                    {filteredTracks.map((t, idx) => (
                      <tr
                        key={t.id}
                        className="hover:bg-[#1d2330] transition-colors group cursor-pointer"
                        onClick={() => setEditingTrack(t)}
                      >
                        <td className="py-3 px-4 text-center font-mono text-neutral-500">
                          {t.trackNumber || idx + 1}
                        </td>

                        <td className="py-3 px-4 min-w-[220px]">
                          <div className="flex items-center gap-3">
                            <img
                              src={t.coverUrl}
                              alt={t.title}
                              className="w-10 h-10 rounded-lg object-cover border border-[#2b3345] shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-semibold text-white block truncate">
                                {t.title}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                {t.audioVersion || 'Master v1.0'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-neutral-300 font-medium">
                          {t.artist}
                        </td>

                        <td className="py-3 px-4 text-neutral-400">
                          {t.albumTitle}
                        </td>

                        {/* Replace Audio File Drag/Click Button */}
                        <td
                          className="py-3 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleOpenUploadForTrack(t.id)}
                            disabled={uploadingTrackId === t.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#202634] hover:bg-blue-600 text-neutral-300 hover:text-white border border-[#2b3345] hover:border-blue-500 text-[11px] transition-colors"
                            title="Replace master audio file (MP3, WAV, FLAC, M4A)"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>
                              {uploadingTrackId === t.id
                                ? 'Uploading...'
                                : t.audioFileName || 'Replace File'}
                            </span>
                          </button>
                        </td>

                        {/* Special Liner Notes */}
                        <td
                          className="py-3 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.specialNotes ? (
                            <span
                              onClick={() => setEditingTrack(t)}
                              className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded cursor-pointer hover:bg-amber-400/20"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Notes Added</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => setEditingTrack(t)}
                              className="text-[11px] text-neutral-500 hover:text-neutral-300 underline"
                            >
                              + Add Note
                            </button>
                          )}
                        </td>

                        {/* Plays metric (Editable on backend!) */}
                        <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                          {formatPlayCount(t.plays || 0)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-neutral-400">
                          {formatTime(t.duration)}
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditingTrack(t)}
                              className="p-1 text-neutral-400 hover:text-blue-400 rounded"
                              title="Edit item in CMS"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete track "${t.title}" from CMS?`)) {
                                  deleteTrack(t.id);
                                }
                              }}
                              className="p-1 text-neutral-400 hover:text-red-400 rounded"
                              title="Delete from database"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* COLLECTION 2: ALBUMS */}
          {/* ========================================================================= */}
          {activeCollection === 'albums' && (
            <div className="bg-[#161a23] border border-[#262c3a] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#12161f] text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-[#262c3a]">
                    <tr>
                      <th className="py-3 px-4">Album & Artwork</th>
                      <th className="py-3 px-4">Artist Reference</th>
                      <th className="py-3 px-4">Year & Release Date</th>
                      <th className="py-3 px-4">Genre</th>
                      <th className="py-3 px-4">Format Type</th>
                      <th className="py-3 px-4">Tracks</th>
                      <th className="py-3 px-4">Audio Quality</th>
                      <th className="py-3 px-4 text-center w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232938]">
                    {filteredAlbums.map((alb) => (
                      <tr
                        key={alb.id}
                        className="hover:bg-[#1d2330] transition-colors group cursor-pointer"
                        onClick={() => setEditingAlbum(alb)}
                      >
                        <td className="py-3 px-4 min-w-[200px]">
                          <div className="flex items-center gap-3">
                            <img
                              src={alb.coverUrl}
                              alt={alb.title}
                              className="w-11 h-11 rounded-lg object-cover border border-[#2b3345] shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-semibold text-white block truncate">
                                {alb.title}
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                {alb.recordLabel || 'Independent'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-neutral-300 font-medium">
                          {alb.artist}
                        </td>

                        <td className="py-3 px-4 text-neutral-400">
                          {alb.releaseDate || `${alb.releaseYear}`}
                        </td>

                        <td className="py-3 px-4 text-neutral-300">
                          <span className="px-2 py-0.5 rounded bg-[#202634] text-[11px] border border-[#2b3345]">
                            {alb.genre}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-neutral-300 uppercase font-mono text-[11px]">
                          {alb.type}
                        </td>

                        <td className="py-3 px-4 text-neutral-400 font-mono">
                          {alb.trackIds.length} tracks
                        </td>

                        <td className="py-3 px-4">
                          {alb.isHiResAudio ? (
                            <span className="text-amber-400 text-[10px] font-bold border border-amber-400/30 px-1.5 py-0.5 rounded">
                              Hi-Res Lossless
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-[10px]">Standard</span>
                          )}
                        </td>

                        <td
                          className="py-3 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditingAlbum(alb)}
                              className="p-1 text-neutral-400 hover:text-blue-400 rounded"
                              title="Edit Album"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete album "${alb.title}"?`)) {
                                  deleteAlbum(alb.id);
                                }
                              }}
                              className="p-1 text-neutral-400 hover:text-red-400 rounded"
                              title="Delete Album"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* COLLECTION 3: ARTISTS */}
          {/* ========================================================================= */}
          {activeCollection === 'artists' && (
            <div className="bg-[#161a23] border border-[#262c3a] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#12161f] text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-[#262c3a]">
                    <tr>
                      <th className="py-3 px-4">Artist Profile</th>
                      <th className="py-3 px-4">Bio & Quote</th>
                      <th className="py-3 px-4">Genres</th>
                      <th className="py-3 px-4">Origin / Hometown</th>
                      <th className="py-3 px-4 text-right">Monthly Listeners</th>
                      <th className="py-3 px-4 text-center">Verified</th>
                      <th className="py-3 px-4 text-center w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232938]">
                    {filteredArtists.map((art) => (
                      <tr
                        key={art.id}
                        className="hover:bg-[#1d2330] transition-colors group cursor-pointer"
                        onClick={() => setEditingArtist(art)}
                      >
                        <td className="py-3 px-4 min-w-[200px]">
                          <div className="flex items-center gap-3">
                            <img
                              src={art.avatarUrl}
                              alt={art.name}
                              className="w-11 h-11 rounded-full object-cover border border-[#2b3345] shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-semibold text-white block truncate">
                                {art.name}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                ID: {art.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs truncate text-neutral-400">
                          {art.bio}
                        </td>

                        <td className="py-3 px-4 text-neutral-300">
                          <div className="flex flex-wrap gap-1">
                            {art.genres.map((g) => (
                              <span
                                key={g}
                                className="px-1.5 py-0.2 rounded bg-[#202634] text-[10px] text-neutral-300 border border-[#2b3345]"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-neutral-300">
                          {art.hometown || '—'}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                          {art.monthlyListeners.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {art.verified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                              <Check className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-[10px]">Unverified</span>
                          )}
                        </td>

                        <td
                          className="py-3 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditingArtist(art)}
                              className="p-1 text-neutral-400 hover:text-blue-400 rounded"
                              title="Edit Artist Profile"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (artists.length <= 1) {
                                  alert('Cannot delete the only artist in the database.');
                                  return;
                                }
                                if (confirm(`Delete artist "${art.name}" from CMS?`)) {
                                  deleteArtist(art.id);
                                }
                              }}
                              className="p-1 text-neutral-400 hover:text-red-400 rounded"
                              title="Delete Artist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* COLLECTION 4: ANALYTICS & PLAYS */}
          {/* ========================================================================= */}
          {activeCollection === 'analytics' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-[#161a23] border border-[#262c3a] rounded-xl space-y-1">
                  <span className="text-neutral-400 text-xs font-medium">Total Catalog Plays</span>
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                    {totalPlays.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-neutral-500">Across all streaming listeners</span>
                </div>

                <div className="p-5 bg-[#161a23] border border-[#262c3a] rounded-xl space-y-1">
                  <span className="text-neutral-400 text-xs font-medium">Active Artists</span>
                  <div className="text-3xl font-extrabold text-blue-400 font-mono tracking-tight">
                    {artists.length}
                  </div>
                  <span className="text-[11px] text-neutral-500">Artists in public roster</span>
                </div>

                <div className="p-5 bg-[#161a23] border border-[#262c3a] rounded-xl space-y-1">
                  <span className="text-neutral-400 text-xs font-medium">Albums & Releases</span>
                  <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                    {albums.length}
                  </div>
                  <span className="text-[11px] text-neutral-500">Full albums, EPs, & singles</span>
                </div>

                <div className="p-5 bg-[#161a23] border border-[#262c3a] rounded-xl space-y-1">
                  <span className="text-neutral-400 text-xs font-medium">Audience Reach</span>
                  <div className="text-3xl font-extrabold text-purple-400 font-mono tracking-tight">
                    {artists
                      .reduce((acc, a) => acc + (a.monthlyListeners || 0), 0)
                      .toLocaleString()}
                  </div>
                  <span className="text-[11px] text-neutral-500">Aggregated monthly listeners</span>
                </div>
              </div>

              {/* Top Tracks by Plays Table */}
              <div className="bg-[#161a23] border border-[#262c3a] rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center justify-between">
                  <span>Stream Rankings by Play Count (Backend Metric)</span>
                  <span className="text-xs text-neutral-400 font-normal">
                    Real-time listener streams
                  </span>
                </h3>

                <div className="divide-y divide-[#232938]">
                  {topTracksByPlays.map((track, idx) => (
                    <div
                      key={track.id}
                      className="py-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-center font-mono text-neutral-500 font-bold">
                          {idx + 1}
                        </span>
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-9 h-9 rounded-md object-cover border border-[#2b3345]"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-white block truncate">
                            {track.title}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {track.artist} · {track.albumTitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-bold font-mono text-emerald-400">
                            {(track.plays || 0).toLocaleString()} plays
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            {formatTime(track.duration)}
                          </div>
                        </div>

                        {/* Quick edit play count button */}
                        <button
                          onClick={() => {
                            const newPlays = prompt(`Set play count for "${track.title}":`, String(track.plays || 0));
                            if (newPlays !== null && !isNaN(parseInt(newPlays, 10))) {
                              updateTrackMetadata({ ...track, plays: parseInt(newPlays, 10) });
                            }
                          }}
                          className="p-1.5 rounded-lg bg-[#202634] hover:bg-[#2b3345] text-neutral-400 hover:text-white"
                          title="Manually adjust plays in CMS"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* COLLECTION 5: SETTINGS & DATABASE */}
          {/* ========================================================================= */}
          {activeCollection === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#161a23] border border-[#262c3a] rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>SQLite Database File Status</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#232938]">
                    <span className="text-neutral-400">Storage Location:</span>
                    <span className="font-mono text-neutral-200">/data/music.db</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#232938]">
                    <span className="text-neutral-400">Database Size:</span>
                    <span className="font-mono text-neutral-200">{dbStats?.sizeKb || '84 KB'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#232938]">
                    <span className="text-neutral-400">Uploaded Audio Files:</span>
                    <span className="font-mono text-neutral-200">/uploads/audio</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-400">Status:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Healthy & Connected
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <a
                    href="/api/db/download"
                    download="music.db"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Raw .db File</span>
                  </a>
                </div>
              </div>

              <div className="bg-[#161a23] border border-[#262c3a] rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>JSON Catalog Backup & Restore</span>
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Export your entire multi-artist database (tracks, liner notes, audio mappings, and album releases) into a portable JSON backup.
                </p>

                <div className="pt-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const data = {
                        tracks,
                        albums,
                        artists,
                        playlists,
                        exportedAt: new Date().toISOString(),
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], {
                        type: 'application/json',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `music_cms_backup_${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#202634] hover:bg-[#2b3345] text-neutral-200 text-xs font-medium border border-[#2b3345] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON Catalog</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL / DRAWER: EDIT TRACK */}
      {/* ========================================================================= */}
      {editingTrack && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161a23] border border-[#2b3345] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#262c3a]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Edit Track CMS Entry</h3>
              </div>
              <button
                onClick={() => setEditingTrack(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Song Title</label>
                <input
                  type="text"
                  value={editingTrack.title}
                  onChange={(e) => setEditingTrack({ ...editingTrack, title: e.target.value })}
                  className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Artist</label>
                  <select
                    value={editingTrack.artistId}
                    onChange={(e) => {
                      const sel = artists.find((a) => a.id === e.target.value);
                      setEditingTrack({
                        ...editingTrack,
                        artistId: e.target.value,
                        artist: sel ? sel.name : editingTrack.artist,
                      });
                    }}
                    className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {artists.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Album</label>
                  <select
                    value={editingTrack.albumId}
                    onChange={(e) => {
                      const alb = albums.find((a) => a.id === e.target.value);
                      setEditingTrack({
                        ...editingTrack,
                        albumId: e.target.value,
                        albumTitle: alb ? alb.title : editingTrack.albumTitle,
                        coverUrl: alb ? alb.coverUrl : editingTrack.coverUrl,
                      });
                    }}
                    className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {albums.map((alb) => (
                      <option key={alb.id} value={alb.id}>
                        {alb.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Duration (seconds)</label>
                  <input
                    type="number"
                    value={editingTrack.duration}
                    onChange={(e) =>
                      setEditingTrack({ ...editingTrack, duration: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Track Number</label>
                  <input
                    type="number"
                    value={editingTrack.trackNumber}
                    onChange={(e) =>
                      setEditingTrack({ ...editingTrack, trackNumber: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Plays Count (Metric)</label>
                  <input
                    type="number"
                    value={editingTrack.plays || 0}
                    onChange={(e) =>
                      setEditingTrack({ ...editingTrack, plays: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Audio Master Version Label</label>
                <input
                  type="text"
                  value={editingTrack.audioVersion || ''}
                  onChange={(e) =>
                    setEditingTrack({ ...editingTrack, audioVersion: e.target.value })
                  }
                  placeholder="e.g. Master v2.4"
                  className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Creator Liner Notes Editor */}
              <div>
                <label className="block text-neutral-400 mb-1 flex items-center justify-between">
                  <span>Special Creator Liner Notes (Intimate notes & recording history)</span>
                  <span className="text-[10px] text-amber-400">Available on Player Bar icon</span>
                </label>
                <textarea
                  rows={3}
                  value={editingTrack.specialNotes || ''}
                  onChange={(e) =>
                    setEditingTrack({ ...editingTrack, specialNotes: e.target.value })
                  }
                  placeholder="Describe instruments, synthesizers, recording location, or stories behind this track..."
                  className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>

              {/* Lyrics */}
              <div>
                <label className="block text-neutral-400 mb-1">Lyrics</label>
                <textarea
                  rows={3}
                  value={editingTrack.lyrics || ''}
                  onChange={(e) => setEditingTrack({ ...editingTrack, lyrics: e.target.value })}
                  placeholder="Song lyrics..."
                  className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262c3a]">
              <button
                onClick={() => setEditingTrack(null)}
                className="px-4 py-2 rounded-lg bg-[#202634] text-neutral-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateTrackMetadata(editingTrack);
                  setEditingTrack(null);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Track Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW TRACK */}
      {/* ========================================================================= */}
      {isAddingTrack && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161a23] border border-[#2b3345] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#262c3a]">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Create New CMS Track</h3>
              </div>
              <button
                onClick={() => setIsAddingTrack(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const title = (form.elements.namedItem('trackTitle') as HTMLInputElement).value;
                const artistId = (form.elements.namedItem('trackArtistId') as HTMLSelectElement).value;
                const albumId = (form.elements.namedItem('trackAlbumId') as HTMLSelectElement).value;
                const duration = parseFloat((form.elements.namedItem('trackDuration') as HTMLInputElement).value) || 180;
                const specialNotes = (form.elements.namedItem('trackNotes') as HTMLTextAreaElement).value;

                const selectedArtist = artists.find((a) => a.id === artistId);
                const selectedAlbum = albums.find((alb) => alb.id === albumId);

                const newT: Track = {
                  id: `track-${Date.now()}`,
                  title: title.trim(),
                  artist: selectedArtist ? selectedArtist.name : 'Unknown Artist',
                  artistId: artistId,
                  albumId: albumId,
                  albumTitle: selectedAlbum ? selectedAlbum.title : 'Singles',
                  coverUrl: selectedAlbum ? selectedAlbum.coverUrl : '/src/assets/images/album_golden_hour_1792181609674.jpg',
                  duration,
                  trackNumber: 1,
                  audioUrl: 'synth:amber-chords',
                  audioVersion: 'Master v1.0',
                  specialNotes: specialNotes || undefined,
                  genre: selectedAlbum ? selectedAlbum.genre : 'Electronic',
                  releaseYear: 2026,
                  isExplicit: false,
                  isFavorite: false,
                  isDownloaded: false,
                  plays: 0,
                };

                addNewTrack(newT);
                setIsAddingTrack(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-neutral-400 mb-1">Song Title *</label>
                <input
                  name="trackTitle"
                  required
                  placeholder="e.g. Celestial Drift"
                  className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Artist *</label>
                  <select
                    name="trackArtistId"
                    className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {artists.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Album *</label>
                  <select
                    name="trackAlbumId"
                    className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {albums.map((alb) => (
                      <option key={alb.id} value={alb.id}>
                        {alb.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Duration (seconds)</label>
                <input
                  name="trackDuration"
                  type="number"
                  defaultValue={180}
                  className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Special Liner Notes</label>
                <textarea
                  name="trackNotes"
                  rows={3}
                  placeholder="Optional creator commentary or gear notes..."
                  className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262c3a]">
                <button
                  type="button"
                  onClick={() => setIsAddingTrack(false)}
                  className="px-4 py-2 rounded-lg bg-[#202634] text-neutral-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Track</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT / ADD ARTIST */}
      {/* ========================================================================= */}
      {editingArtist && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161a23] border border-[#2b3345] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#262c3a]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Edit Artist Profile Entry</h3>
              </div>
              <button
                onClick={() => setEditingArtist(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Artist Name *</label>
                <input
                  type="text"
                  value={editingArtist.name}
                  onChange={(e) => setEditingArtist({ ...editingArtist, name: e.target.value })}
                  className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editingArtist.bio}
                  onChange={(e) => setEditingArtist({ ...editingArtist, bio: e.target.value })}
                  className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Hometown / Origin</label>
                  <input
                    type="text"
                    value={editingArtist.hometown || ''}
                    onChange={(e) =>
                      setEditingArtist({ ...editingArtist, hometown: e.target.value })
                    }
                    className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Monthly Listeners</label>
                  <input
                    type="number"
                    value={editingArtist.monthlyListeners || 0}
                    onChange={(e) =>
                      setEditingArtist({
                        ...editingArtist,
                        monthlyListeners: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Artist Quote</label>
                <input
                  type="text"
                  value={editingArtist.quote || ''}
                  onChange={(e) => setEditingArtist({ ...editingArtist, quote: e.target.value })}
                  className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 italic"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Genres (comma separated)</label>
                <input
                  type="text"
                  value={editingArtist.genres.join(', ')}
                  onChange={(e) =>
                    setEditingArtist({
                      ...editingArtist,
                      genres: e.target.value.split(',').map((g) => g.trim()).filter(Boolean),
                    })
                  }
                  className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="artistVerified"
                  checked={editingArtist.verified}
                  onChange={(e) =>
                    setEditingArtist({ ...editingArtist, verified: e.target.checked })
                  }
                  className="rounded border-[#2b3345] bg-[#0e1117] text-blue-600 focus:ring-0"
                />
                <label htmlFor="artistVerified" className="text-neutral-300">
                  Verified Artist Badge
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262c3a]">
              <button
                onClick={() => setEditingArtist(null)}
                className="px-4 py-2 rounded-lg bg-[#202634] text-neutral-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveArtist(editingArtist);
                  setEditingArtist(null);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Artist Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW ARTIST */}
      {/* ========================================================================= */}
      {isAddingArtist && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161a23] border border-[#2b3345] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#262c3a]">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Create New Artist Profile</h3>
              </div>
              <button
                onClick={() => setIsAddingArtist(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem('artName') as HTMLInputElement).value;
                const bio = (form.elements.namedItem('artBio') as HTMLTextAreaElement).value;
                const hometown = (form.elements.namedItem('artHometown') as HTMLInputElement).value;
                const genresRaw = (form.elements.namedItem('artGenres') as HTMLInputElement).value;

                const newArt: ArtistProfile = {
                  id: `artist-${Date.now()}`,
                  name: name.trim(),
                  bio: bio.trim(),
                  avatarUrl: '/src/assets/images/artist_avatar_1792181611089.jpg',
                  bannerUrl: '/src/assets/images/artist_hero_banner_1792181611233.jpg',
                  hometown: hometown.trim() || 'Los Angeles, CA',
                  genres: genresRaw.split(',').map((g) => g.trim()).filter(Boolean) || ['Electronic'],
                  quote: 'Crafting sound in the quiet hours.',
                  verified: true,
                  monthlyListeners: 25000,
                  socialLinks: { spotify: 'https://spotify.com' },
                };

                saveArtist(newArt);
                setIsAddingArtist(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-neutral-400 mb-1">Artist Name *</label>
                <input
                  name="artName"
                  required
                  placeholder="e.g. Elena Rostova"
                  className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Bio</label>
                <textarea
                  name="artBio"
                  rows={3}
                  placeholder="Artist description and musical philosophy..."
                  className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Hometown</label>
                  <input
                    name="artHometown"
                    placeholder="e.g. Berlin, Germany"
                    className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Genres (comma separated)</label>
                  <input
                    name="artGenres"
                    placeholder="e.g. Ambient, Neo-Classical"
                    className="w-full bg-[#0e1117] border border-[#2b3345] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262c3a]">
                <button
                  type="button"
                  onClick={() => setIsAddingArtist(false)}
                  className="px-4 py-2 rounded-lg bg-[#202634] text-neutral-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Artist</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
