import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Disc3,
  Music2,
  User,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  Save,
  Database,
  Terminal,
  Code2,
  HardDrive,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Track, Album, ArtistProfile } from '../types/music';
import { storageService } from '../services/storage';
import { api, SqlQueryResult } from '../services/api';
import { formatTime } from '../utils/formatters';

interface StudioPortalViewProps {
  initialTab?: 'tracks' | 'albums' | 'artist' | 'database' | 'backup';
}

export const StudioPortalView: React.FC<StudioPortalViewProps> = ({
  initialTab = 'tracks',
}) => {
  const {
    tracks,
    albums,
    artist,
    addNewTrack,
    updateTrackMetadata,
    updateTrackNotes,
    replaceAudioFile,
    deleteTrack,
    saveAlbum,
    deleteAlbum,
    updateArtistProfile,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    reloadCatalog,
    dbStats,
    refreshDbStats,
  } = useMusic();

  const [activeTab, setActiveTab] = useState<'tracks' | 'albums' | 'artist' | 'database' | 'backup'>(initialTab);

  // SQL console state
  const [sqlQuery, setSqlQuery] = useState('SELECT id, title, artist, album_title, audio_version, plays FROM tracks ORDER BY plays DESC LIMIT 10;');
  const [sqlResult, setSqlResult] = useState<SqlQueryResult | null>(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<string | null>(null);

  // Modals & form state
  const [replacingTrack, setReplacingTrack] = useState<Track | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceVersionTag, setReplaceVersionTag] = useState('');
  const [isReplacingLoading, setIsReplacingLoading] = useState(false);

  const [editingNotesTrack, setEditingNotesTrack] = useState<Track | null>(null);
  const [notesContent, setNotesContent] = useState('');

  const [editingMetadataTrack, setEditingMetadataTrack] = useState<Track | null>(null);
  const [isAddingNewTrack, setIsAddingNewTrack] = useState(false);

  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [isAddingAlbum, setIsAddingAlbum] = useState(false);

  // Artist form state
  const [artistForm, setArtistForm] = useState<ArtistProfile>(artist);
  const [artistSavedToast, setArtistSavedToast] = useState(false);

  // New Track form state
  const [newTrackForm, setNewTrackForm] = useState<{
    title: string;
    albumId: string;
    audioVersion: string;
    specialNotes: string;
    lyrics: string;
    genre: string;
    isExplicit: boolean;
    audioFile: File | null;
  }>({
    title: '',
    albumId: albums[0]?.id || '',
    audioVersion: 'Master v1.0',
    specialNotes: '',
    lyrics: '',
    genre: 'Electronic',
    isExplicit: false,
    audioFile: null,
  });

  // New Album form state
  const [albumForm, setAlbumForm] = useState<{
    title: string;
    releaseYear: number;
    genre: string;
    description: string;
    type: 'album' | 'single' | 'ep';
    recordLabel: string;
    coverUrl: string;
  }>({
    title: '',
    releaseYear: 2026,
    genre: 'Electronic',
    description: '',
    type: 'album',
    recordLabel: 'Amber Wave Music',
    coverUrl: '/src/assets/images/album_golden_hour_1792181609674.jpg',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Replace Audio File
  const handleSelectReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReplaceFile(file);
      setReplaceVersionTag(`Master v${(Math.random() * 2 + 1).toFixed(1)} (${file.name.slice(0, 16)})`);
    }
  };

  const handleConfirmAudioReplace = async () => {
    if (!replacingTrack || !replaceFile) return;
    setIsReplacingLoading(true);
    try {
      await replaceAudioFile(replacingTrack.id, replaceFile, replaceVersionTag.trim() || 'New Mix Master');
      setReplacingTrack(null);
      setReplaceFile(null);
      setReplaceVersionTag('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplacingLoading(false);
    }
  };

  // Handle Save Notes
  const handleSaveNotes = () => {
    if (!editingNotesTrack) return;
    updateTrackNotes(editingNotesTrack.id, notesContent);
    setEditingNotesTrack(null);
  };

  // Handle Create Track
  const handleCreateTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackForm.title.trim()) return;

    const assignedAlbum = albums.find((a) => a.id === newTrackForm.albumId) || albums[0];
    const newId = `track-${Date.now()}`;

    let audioUrl = 'synth:amber-chords';
    let audioFileName = undefined;
    let duration = 210;

    if (newTrackForm.audioFile) {
      audioFileName = newTrackForm.audioFile.name;
      audioUrl = URL.createObjectURL(newTrackForm.audioFile);
    }

    const createdTrack: Track = {
      id: newId,
      title: newTrackForm.title.trim(),
      artist: artist.name,
      artistId: artist.id,
      albumId: assignedAlbum?.id || '',
      albumTitle: assignedAlbum?.title || 'Singles',
      coverUrl: assignedAlbum?.coverUrl || '/src/assets/images/album_golden_hour_1792181609674.jpg',
      duration,
      trackNumber: (tracks.filter((t) => t.albumId === assignedAlbum?.id).length || 0) + 1,
      audioUrl,
      audioFileName,
      audioVersion: newTrackForm.audioVersion.trim() || 'Master v1.0',
      specialNotes: newTrackForm.specialNotes.trim() || undefined,
      notesDate: newTrackForm.specialNotes.trim() ? 'Just now' : undefined,
      lyrics: newTrackForm.lyrics.trim() || undefined,
      genre: newTrackForm.genre || assignedAlbum?.genre || 'Electronic',
      releaseYear: assignedAlbum?.releaseYear || 2026,
      isExplicit: newTrackForm.isExplicit,
      isFavorite: false,
      isDownloaded: false,
      plays: 1,
    };

    addNewTrack(createdTrack);
    if (newTrackForm.audioFile) {
      await storageService.replaceTrackAudio(newId, newTrackForm.audioFile, createdTrack.audioVersion);
      reloadCatalog();
    }

    setIsAddingNewTrack(false);
    setNewTrackForm({
      title: '',
      albumId: albums[0]?.id || '',
      audioVersion: 'Master v1.0',
      specialNotes: '',
      lyrics: '',
      genre: 'Electronic',
      isExplicit: false,
      audioFile: null,
    });
  };

  // Handle Save Album
  const handleSaveAlbumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumForm.title.trim()) return;

    if (editingAlbum) {
      const updated: Album = {
        ...editingAlbum,
        title: albumForm.title.trim(),
        releaseYear: albumForm.releaseYear,
        genre: albumForm.genre,
        description: albumForm.description,
        type: albumForm.type,
        recordLabel: albumForm.recordLabel,
        coverUrl: albumForm.coverUrl,
      };
      saveAlbum(updated);
      setEditingAlbum(null);
    } else {
      const newAlbum: Album = {
        id: `album-${Date.now()}`,
        title: albumForm.title.trim(),
        artist: artist.name,
        artistId: artist.id,
        coverUrl: albumForm.coverUrl || '/src/assets/images/album_golden_hour_1792181609674.jpg',
        releaseYear: albumForm.releaseYear,
        genre: albumForm.genre,
        description: albumForm.description,
        type: albumForm.type,
        recordLabel: albumForm.recordLabel,
        isHiResAudio: true,
        trackIds: [],
      };
      saveAlbum(newAlbum);
      setIsAddingAlbum(false);
    }
  };

  // Handle Artist Profile Save
  const handleSaveArtistProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateArtistProfile(artistForm);
    setArtistSavedToast(true);
    setTimeout(() => setArtistSavedToast(false), 2500);
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonStr = storageService.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amber_music_catalog_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const ok = storageService.importData(text);
          if (ok) {
            reloadCatalog();
            alert('Catalog restored successfully!');
          } else {
            alert('Invalid backup file.');
          }
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const handleExecuteSql = async () => {
    if (!sqlQuery.trim()) return;
    setSqlLoading(true);
    try {
      const res = await api.executeSql(sqlQuery.trim());
      setSqlResult(res);
      refreshDbStats();
      reloadCatalog();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'SQL Error';
      setSqlResult({ success: false, error: message, timeMs: 0 });
    } finally {
      setSqlLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeSnippet(label);
    setTimeout(() => setCopiedCodeSnippet(null), 2000);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Producer & Artist Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Artist Studio CMS
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your audio tracks, replace master stems, attach liner notes, and customize your streaming profile.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.06] rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'tracks'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Tracks & Stems</span>
          </button>

          <button
            onClick={() => setActiveTab('albums')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'albums'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>Albums & Releases</span>
          </button>

          <button
            onClick={() => setActiveTab('artist')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'artist'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Artist Profile</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('database');
              refreshDbStats();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Local Database (SQLite)</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup & Tools</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TRACKS & STEMS */}
      {activeTab === 'tracks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Tracks Catalog ({tracks.length})
              </h2>
              <p className="text-xs text-neutral-400">
                Replace audio mixes, attach liner notes, and update track details.
              </p>
            </div>

            <button
              onClick={() => setIsAddingNewTrack(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Track</span>
            </button>
          </div>

          {/* Tracks Table */}
          <div className="border border-white/[0.08] rounded-2xl bg-white/[0.02] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-neutral-400 uppercase tracking-wider text-[10px] font-semibold bg-white/[0.02]">
                    <th className="py-3 px-4">Track</th>
                    <th className="py-3 px-4">Album</th>
                    <th className="py-3 px-4">Audio Version</th>
                    <th className="py-3 px-4">Special Notes</th>
                    <th className="py-3 px-4 text-right">Duration</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {tracks.map((track) => {
                    const isCurrent = currentTrack?.id === track.id;
                    const isTrackPlaying = isCurrent && isPlaying;

                    return (
                      <tr key={track.id} className="hover:bg-white/[0.03] transition-colors">
                        {/* Title & Cover & Play */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                if (isCurrent) togglePlay();
                                else playTrack(track);
                              }}
                              className="w-8 h-8 rounded-lg overflow-hidden relative group shrink-0"
                            >
                              <img
                                src={track.coverUrl}
                                alt={track.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {isTrackPlaying ? (
                                  <Pause className="w-3 h-3 text-amber-400 fill-amber-400" />
                                ) : (
                                  <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                                )}
                              </div>
                            </button>

                            <div className="min-w-0 max-w-[180px]">
                              <div className="font-semibold text-white truncate">
                                {track.title}
                              </div>
                              <div className="text-[11px] text-neutral-400 truncate">
                                {track.artist}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Album */}
                        <td className="py-3 px-4 text-neutral-300">
                          {track.albumTitle}
                        </td>

                        {/* Audio Version & Replacement Status */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div className="font-mono text-amber-400 text-[11px]">
                              {track.audioVersion || 'Master v1.0'}
                            </div>
                            {track.audioFileName ? (
                              <div className="text-[10px] text-neutral-400 truncate max-w-[140px]">
                                {track.audioFileName}
                              </div>
                            ) : (
                              <div className="text-[10px] text-neutral-500">
                                Built-in Audio Stem
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Special Notes Preview */}
                        <td className="py-3 px-4 max-w-xs">
                          {track.specialNotes ? (
                            <div className="flex items-start gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span className="text-neutral-300 truncate text-[11px]">
                                {track.specialNotes}
                              </span>
                            </div>
                          ) : (
                            <span className="text-neutral-600 text-[11px] italic">
                              No notes attached
                            </span>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="py-3 px-4 text-right font-mono text-neutral-400">
                          {formatTime(track.duration)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Replace Audio File Button */}
                            <button
                              onClick={() => {
                                setReplacingTrack(track);
                                setReplaceFile(null);
                                setReplaceVersionTag(track.audioVersion || 'Master v2.0');
                              }}
                              className="px-2.5 py-1 rounded bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-medium text-[11px] flex items-center gap-1 transition-colors border border-amber-400/20"
                              title="Replace audio file for this song"
                            >
                              <UploadCloud className="w-3 h-3" />
                              <span>Replace Audio</span>
                            </button>

                            {/* Edit Notes Button */}
                            <button
                              onClick={() => {
                                setEditingNotesTrack(track);
                                setNotesContent(track.specialNotes || '');
                              }}
                              className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                              title="Edit liner notes"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Metadata */}
                            <button
                              onClick={() => setEditingMetadataTrack(track)}
                              className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                              title="Edit song details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Track */}
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${track.title}" from your library?`)) {
                                  deleteTrack(track.id);
                                }
                              }}
                              className="p-1.5 rounded hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                              title="Delete track"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALBUMS & RELEASES */}
      {activeTab === 'albums' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Albums & Releases ({albums.length})
              </h2>
              <p className="text-xs text-neutral-400">
                Organize tracks into LPs, EPs, and singles with custom artwork.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingAlbum(null);
                setAlbumForm({
                  title: '',
                  releaseYear: 2026,
                  genre: 'Electronic',
                  description: '',
                  type: 'album',
                  recordLabel: 'Amber Wave Music',
                  coverUrl: '/src/assets/images/album_golden_hour_1792181609674.jpg',
                });
                setIsAddingAlbum(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Release</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((alb) => {
              const albumTracks = tracks.filter((t) => t.albumId === alb.id);

              return (
                <div
                  key={alb.id}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={alb.coverUrl}
                      alt={alb.title}
                      className="w-20 h-20 rounded-xl object-cover border border-white/10 shadow-md shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          {alb.type}
                        </span>
                        <span className="text-neutral-500">·</span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {alb.releaseYear}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white truncate mt-0.5">
                        {alb.title}
                      </h3>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {alb.genre} · {albumTracks.length} tracks
                      </p>
                      <p className="text-[11px] text-neutral-500 line-clamp-2 mt-2 leading-relaxed">
                        {alb.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {alb.recordLabel}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingAlbum(alb);
                          setAlbumForm({
                            title: alb.title,
                            releaseYear: alb.releaseYear,
                            genre: alb.genre,
                            description: alb.description,
                            type: alb.type,
                            recordLabel: alb.recordLabel,
                            coverUrl: alb.coverUrl,
                          });
                          setIsAddingAlbum(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-neutral-200 transition-colors"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete release "${alb.title}"?`)) {
                            deleteAlbum(alb.id);
                          }
                        }}
                        className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                        title="Delete album"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ARTIST PROFILE */}
      {activeTab === 'artist' && (
        <form onSubmit={handleSaveArtistProfile} className="space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Streaming Artist Profile
            </h2>
            <p className="text-xs text-neutral-400">
              Update how your artist persona is presented to listeners across the streaming service.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
            {/* Name & Hometown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={artistForm.name}
                  onChange={(e) => setArtistForm({ ...artistForm, name: e.target.value })}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Hometown / Studio Location
                </label>
                <input
                  type="text"
                  value={artistForm.hometown}
                  onChange={(e) => setArtistForm({ ...artistForm, hometown: e.target.value })}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                />
              </div>
            </div>

            {/* Artist Quote */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Artist Statement / Featured Quote
              </label>
              <input
                type="text"
                value={artistForm.quote}
                onChange={(e) => setArtistForm({ ...artistForm, quote: e.target.value })}
                placeholder="e.g. Music is an intimate conversation..."
                className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400/60 focus:outline-none"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Full Artist Biography
              </label>
              <textarea
                value={artistForm.bio}
                onChange={(e) => setArtistForm({ ...artistForm, bio: e.target.value })}
                rows={4}
                className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-amber-400/60 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Genres */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Primary Genres (comma separated)
              </label>
              <input
                type="text"
                value={artistForm.genres.join(', ')}
                onChange={(e) =>
                  setArtistForm({
                    ...artistForm,
                    genres: e.target.value.split(',').map((g) => g.trim()).filter(Boolean),
                  })
                }
                className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400/60 focus:outline-none"
              />
            </div>

            {/* Social Links */}
            <div className="pt-3 border-t border-white/[0.06] space-y-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                External & Social Media Profiles
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Spotify URL</label>
                  <input
                    type="url"
                    value={artistForm.socialLinks.spotify || ''}
                    onChange={(e) =>
                      setArtistForm({
                        ...artistForm,
                        socialLinks: { ...artistForm.socialLinks, spotify: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">SoundCloud URL</label>
                  <input
                    type="url"
                    value={artistForm.socialLinks.soundcloud || ''}
                    onChange={(e) =>
                      setArtistForm({
                        ...artistForm,
                        socialLinks: { ...artistForm.socialLinks, soundcloud: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              {artistSavedToast ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile saved successfully!</span>
                </div>
              ) : (
                <div className="text-[11px] text-neutral-500">
                  Visible to all listeners immediately.
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Artist Profile</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB: LOCAL DATABASE & SQLITE PORTAL */}
      {activeTab === 'database' && (
        <div className="space-y-8 max-w-5xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
              <Database className="w-3.5 h-3.5" />
              <span>Direct SQLite Access</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Local Database Management (SQLite)
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Your entire music catalog, liner notes, and albums are stored in a local SQLite database on your machine. You can query, inspect, and batch-populate it directly.
            </p>
          </div>

          {/* Database File & Connection Card */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">music.db</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      LIVE & READY
                    </span>
                  </div>
                  <div className="text-xs font-mono text-neutral-400 mt-0.5">
                    Path: <span className="text-neutral-200">data/music.db</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/api/db/download"
                  download="music.db"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
                  title="Download the raw SQLite database file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download music.db</span>
                </a>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Engine</div>
                <div className="text-xs font-bold text-white mt-1">Node.js SQLite 3</div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">DatabaseSync</div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">File Size</div>
                <div className="text-xs font-bold text-amber-400 mt-1 font-mono">{dbStats?.sizeKb || '24.0'} KB</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">On local filesystem</div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Catalog Tracks</div>
                <div className="text-xs font-bold text-white mt-1 font-mono">{dbStats?.rowCounts.tracks ?? tracks.length}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">In "tracks" table</div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Audio Storage</div>
                <div className="text-xs font-bold text-white mt-1 font-mono">./uploads/audio/</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Direct disk audio stems</div>
              </div>
            </div>
          </div>

          {/* Interactive SQL Query Console */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Interactive SQL Studio Terminal
                </h3>
              </div>
              <span className="text-[10px] text-neutral-400">
                Execute queries directly against <code className="text-amber-400 font-mono">data/music.db</code>
              </span>
            </div>

            {/* Template Query Quick Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-neutral-500">Presets:</span>
              <button
                type="button"
                onClick={() => setSqlQuery('SELECT id, title, artist, audio_version, duration, plays FROM tracks ORDER BY plays DESC;')}
                className="px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-[11px] font-mono text-neutral-300"
              >
                Top Tracks
              </button>
              <button
                type="button"
                onClick={() => setSqlQuery('SELECT id, title, special_notes, notes_date FROM tracks WHERE special_notes IS NOT NULL;')}
                className="px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-[11px] font-mono text-neutral-300"
              >
                Tracks with Liner Notes
              </button>
              <button
                type="button"
                onClick={() => setSqlQuery('SELECT id, title, artist, release_year, genre, type FROM albums;')}
                className="px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-[11px] font-mono text-neutral-300"
              >
                All Albums
              </button>
              <button
                type="button"
                onClick={() => setSqlQuery("PRAGMA table_info('tracks');")}
                className="px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-[11px] font-mono text-neutral-300"
              >
                Inspect Schema (tracks)
              </button>
            </div>

            {/* SQL Input Textarea */}
            <div className="relative">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={4}
                className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3.5 font-mono text-xs text-amber-300 placeholder-neutral-600 focus:outline-none focus:border-amber-400/60 leading-relaxed resize-y selection:bg-amber-400 selection:text-black"
                placeholder="Enter SQL statement, e.g. SELECT * FROM tracks;"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[11px] text-neutral-500 font-mono">
                {sqlResult?.timeMs !== undefined && (
                  <span>Execution time: {sqlResult.timeMs}ms</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleExecuteSql}
                disabled={sqlLoading}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{sqlLoading ? 'Executing...' : 'Run Query'}</span>
              </button>
            </div>

            {/* Query Results Viewer */}
            {sqlResult && (
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
                {sqlResult.error ? (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono">
                    {sqlResult.error}
                  </div>
                ) : sqlResult.isSelect ? (
                  <div>
                    <div className="text-[11px] text-neutral-400 mb-2 flex items-center justify-between font-mono">
                      <span>Query Returned: {sqlResult.count} row(s)</span>
                      <span>Latency: {sqlResult.timeMs}ms</span>
                    </div>

                    <div className="border border-white/10 rounded-xl overflow-x-auto max-h-72 bg-black/60">
                      <table className="w-full text-left font-mono text-[11px] divide-y divide-white/[0.06]">
                        <thead className="bg-neutral-900 sticky top-0">
                          <tr>
                            {sqlResult.columns?.map((col) => (
                              <th key={col} className="py-2 px-3 text-amber-400 font-semibold whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {sqlResult.rows?.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.04] transition-colors">
                              {sqlResult.columns?.map((col) => (
                                <td key={col} className="py-1.5 px-3 text-neutral-300 whitespace-nowrap truncate max-w-xs">
                                  {row[col] !== null && row[col] !== undefined
                                    ? String(row[col])
                                    : <span className="text-neutral-600 italic">null</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                    Query executed successfully. Database state refreshed.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Local Populating & Scripting Guide */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  How to Access & Populate from your Local Machine
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Since the database is a standard SQLite file at <code className="text-neutral-200 font-mono">data/music.db</code>, you can use any terminal tool, DB browser, or script to insert your music.
              </p>
            </div>

            {/* Method 1: SQLite CLI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200">
                  1. Using SQLite Command Line (Terminal)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      'sqlite3 data/music.db "SELECT id, title, artist, audio_version FROM tracks;"',
                      'cli'
                    )
                  }
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCodeSnippet === 'cli' ? 'Copied!' : 'Copy Command'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-neutral-950 border border-white/10 font-mono text-xs text-neutral-300 overflow-x-auto leading-relaxed">
{`# Open database in interactive sqlite shell:
sqlite3 data/music.db

# Or insert a new track directly via CLI:
sqlite3 data/music.db "INSERT INTO tracks (id, title, artist, album_id, album_title, duration, special_notes, genre, release_year) VALUES ('track-local-1', 'My Custom Beat', 'Alez Leb', 'album-1', 'Amber Hour', 215, 'Recorded in my home studio', 'Electronic', 2026);"`}
              </pre>
            </div>

            {/* Method 2: Node.js Script */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200">
                  2. Using a Node.js Script to Batch-Populate
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/music.db');

const stmt = db.prepare(\`
  INSERT INTO tracks (id, title, artist, album_id, album_title, duration, audio_url, special_notes, genre, release_year)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
\`);

stmt.run('track-demo', 'New Horizon', 'Alez Leb', 'album-1', 'Amber Hour', 190, 'synth:amber-chords', 'Vintage Roland Juno chords', 'Ambient', 2026);
console.log('Populated successfully!');`,
                      'node'
                    )
                  }
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCodeSnippet === 'node' ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-neutral-950 border border-white/10 font-mono text-xs text-neutral-300 overflow-x-auto leading-relaxed">
{`import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/music.db');

const stmt = db.prepare(\`
  INSERT INTO tracks (id, title, artist, album_id, album_title, duration, audio_url, special_notes, genre, release_year)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
\`);

stmt.run('track-demo', 'New Horizon', 'Alez Leb', 'album-1', 'Amber Hour', 190, 'synth:amber-chords', 'Vintage Roland Juno chords', 'Ambient', 2026);
console.log('Populated successfully!');`}
              </pre>
            </div>

            {/* Method 3: Python Script */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200">
                  3. Using Python (<code className="text-amber-300">populate.py</code>)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `import sqlite3

conn = sqlite3.connect('data/music.db')
cur = conn.cursor()

songs = [
    ('song-1', 'Golden Drift', 'Alez Leb', 'album-1', 'Amber Hour', 210, 'Master v1', 'Tape chorus with warm bass', 2026),
    ('song-2', 'Echo Chambers', 'Alez Leb', 'album-1', 'Amber Hour', 195, 'Master v1', 'Reversed piano loop', 2026)
]

cur.executemany('''
    INSERT OR REPLACE INTO tracks (id, title, artist, album_id, album_title, duration, audio_version, special_notes, release_year)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
''', songs)

conn.commit()
print("Populated songs into data/music.db")`,
                      'python'
                    )
                  }
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCodeSnippet === 'python' ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-neutral-950 border border-white/10 font-mono text-xs text-neutral-300 overflow-x-auto leading-relaxed">
{`import sqlite3

conn = sqlite3.connect('data/music.db')
cur = conn.cursor()

songs = [
    ('song-1', 'Golden Drift', 'Alez Leb', 'album-1', 'Amber Hour', 210, 'Master v1', 'Tape chorus with warm bass', 2026),
    ('song-2', 'Echo Chambers', 'Alez Leb', 'album-1', 'Amber Hour', 195, 'Master v1', 'Reversed piano loop', 2026)
]

cur.executemany('''
    INSERT OR REPLACE INTO tracks (id, title, artist, album_id, album_title, duration, audio_version, special_notes, release_year)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
''', songs)

conn.commit()
print("Populated songs into data/music.db")`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & CATALOG TOOLS */}
      {activeTab === 'backup' && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Catalog Data & Library Backups
            </h2>
            <p className="text-xs text-neutral-400">
              Download your entire music library configuration, liner notes, and albums as a JSON file, or restore a previous catalog.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-6">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Export Music Catalog
              </h3>
              <p className="text-xs text-neutral-400 mb-3">
                Exports all metadata, song notes, and album collections to a single JSON archive.
              </p>
              <button
                onClick={handleExportJson}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-medium text-xs flex items-center gap-2 border border-white/10 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download Catalog Backup (.json)</span>
              </button>
            </div>

            <div className="pt-6 border-t border-white/[0.06]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Import / Restore Backup
              </h3>
              <p className="text-xs text-neutral-400 mb-3">
                Upload a previously exported backup file to restore your music library.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-medium text-xs border border-white/10 cursor-pointer transition-colors">
                <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Select Backup JSON File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-6 border-t border-white/[0.06]">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                Reset Demo Catalog
              </h3>
              <p className="text-xs text-neutral-400 mb-3">
                Restore the catalog to initial factory preset albums (Amber Hour, Luminal Frequency, Aurora Sounds).
              </p>
              <button
                onClick={() => {
                  if (confirm('Reset catalog to initial state? Any custom tracks will be replaced with initial catalog.')) {
                    storageService.resetToDefault();
                    reloadCatalog();
                    alert('Catalog reset to initial state.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-xs flex items-center gap-2 border border-red-500/20 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Demo State</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Replace Audio File */}
      {replacingTrack && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Audio Stem Replacement
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Replace Audio for "{replacingTrack.title}"
                </h3>
              </div>
              <button
                onClick={() => setReplacingTrack(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drag & Drop File Picker */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-white/[0.02]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a"
                onChange={handleSelectReplaceFile}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              {replaceFile ? (
                <div>
                  <div className="text-xs font-semibold text-white truncate">
                    {replaceFile.name}
                  </div>
                  <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                    {(replaceFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-neutral-200">
                    Click or drag & drop new audio file here
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Supports MP3, WAV, FLAC, AAC, OGG
                  </p>
                </div>
              )}
            </div>

            {/* Version Tag */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Mix / Master Version Tag
              </label>
              <input
                type="text"
                value={replaceVersionTag}
                onChange={(e) => setReplaceVersionTag(e.target.value)}
                placeholder="e.g. Master v2.5 (Vocal Air EQ Boost)"
                className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400/60 focus:outline-none"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReplacingTrack(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!replaceFile || isReplacingLoading}
                onClick={handleConfirmAudioReplace}
                className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  replaceFile && !isReplacingLoading
                    ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/20'
                    : 'bg-white/10 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {isReplacingLoading ? (
                  <span>Saving to Library...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Replace Audio File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Special Notes */}
      {editingNotesTrack && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Song Liner Notes
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Liner Notes for "{editingNotesTrack.title}"
                </h3>
              </div>
              <button
                onClick={() => setEditingNotesTrack(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-neutral-400 mb-2">
                Document recording techniques, hardware instruments used, lyric inspirations, or easter eggs.
              </p>
              <textarea
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                rows={7}
                placeholder="Write behind-the-scenes liner notes here..."
                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3.5 text-xs text-white leading-relaxed focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-neutral-500">
                Listeners can view this in the player's Liner Notes tab.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingNotesTrack(null)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition-colors"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Upload / Add New Track */}
      {isAddingNewTrack && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateTrackSubmit}
            className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  New Track
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Add Song to Streaming Catalog
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNewTrack(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Track Title</label>
                <input
                  type="text"
                  required
                  value={newTrackForm.title}
                  onChange={(e) => setNewTrackForm({ ...newTrackForm, title: e.target.value })}
                  placeholder="e.g. Midnight Reverie"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Album</label>
                  <select
                    value={newTrackForm.albumId}
                    onChange={(e) => setNewTrackForm({ ...newTrackForm, albumId: e.target.value })}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  >
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Version Tag</label>
                  <input
                    type="text"
                    value={newTrackForm.audioVersion}
                    onChange={(e) => setNewTrackForm({ ...newTrackForm, audioVersion: e.target.value })}
                    placeholder="Master v1.0"
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Audio file upload */}
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Audio File (Optional - or uses generative synth)
                </label>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.flac"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewTrackForm({ ...newTrackForm, audioFile: e.target.files[0] });
                    }
                  }}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-neutral-300 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-black cursor-pointer"
                />
              </div>

              {/* Special Notes */}
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Special Notes / Producer Commentary
                </label>
                <textarea
                  value={newTrackForm.specialNotes}
                  onChange={(e) => setNewTrackForm({ ...newTrackForm, specialNotes: e.target.value })}
                  rows={3}
                  placeholder="Add notes about instruments, inspiration, studio date..."
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Lyrics */}
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Lyrics</label>
                <textarea
                  value={newTrackForm.lyrics}
                  onChange={(e) => setNewTrackForm({ ...newTrackForm, lyrics: e.target.value })}
                  rows={3}
                  placeholder="Song lyrics..."
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setIsAddingNewTrack(false)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition-colors"
              >
                Add Track
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Create / Edit Album */}
      {isAddingAlbum && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveAlbumSubmit}
            className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  {editingAlbum ? 'Edit Release' : 'New Release'}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {editingAlbum ? `Edit "${editingAlbum.title}"` : 'Create Album or EP'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingAlbum(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Release Title</label>
                <input
                  type="text"
                  required
                  value={albumForm.title}
                  onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                  placeholder="e.g. Amber Hour"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Type</label>
                  <select
                    value={albumForm.type}
                    onChange={(e) =>
                      setAlbumForm({
                        ...albumForm,
                        type: e.target.value as 'album' | 'single' | 'ep',
                      })
                    }
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none capitalize"
                  >
                    <option value="album">Album</option>
                    <option value="ep">EP</option>
                    <option value="single">Single</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={albumForm.releaseYear}
                    onChange={(e) =>
                      setAlbumForm({ ...albumForm, releaseYear: parseInt(e.target.value) || 2026 })
                    }
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Genre</label>
                  <input
                    type="text"
                    value={albumForm.genre}
                    onChange={(e) => setAlbumForm({ ...albumForm, genre: e.target.value })}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Record Label</label>
                <input
                  type="text"
                  value={albumForm.recordLabel}
                  onChange={(e) => setAlbumForm({ ...albumForm, recordLabel: e.target.value })}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Cover Artwork</label>
                <div className="flex items-center gap-3">
                  <img
                    src={albumForm.coverUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                  />
                  <select
                    value={albumForm.coverUrl}
                    onChange={(e) => setAlbumForm({ ...albumForm, coverUrl: e.target.value })}
                    className="flex-1 bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="/src/assets/images/album_golden_hour_1792181609674.jpg">
                      Preset 1: Amber Hour Sunset Architecture
                    </option>
                    <option value="/src/assets/images/album_neon_solitude_1792181610826.jpg">
                      Preset 2: Luminal Frequency Neon Wave
                    </option>
                    <option value="/src/assets/images/album_midnight_echoes_1792181597466.jpg">
                      Preset 3: Aurora Sounds Golden Circle
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Description</label>
                <textarea
                  value={albumForm.description}
                  onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setIsAddingAlbum(false)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition-colors"
              >
                {editingAlbum ? 'Save Changes' : 'Create Release'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Edit Track Metadata */}
      {editingMetadataTrack && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Metadata Editor
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Edit Track Details
                </h3>
              </div>
              <button
                onClick={() => setEditingMetadataTrack(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editingMetadataTrack.title}
                  onChange={(e) =>
                    setEditingMetadataTrack({ ...editingMetadataTrack, title: e.target.value })
                  }
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Genre</label>
                  <input
                    type="text"
                    value={editingMetadataTrack.genre}
                    onChange={(e) =>
                      setEditingMetadataTrack({ ...editingMetadataTrack, genre: e.target.value })
                    }
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Track #</label>
                  <input
                    type="number"
                    value={editingMetadataTrack.trackNumber}
                    onChange={(e) =>
                      setEditingMetadataTrack({
                        ...editingMetadataTrack,
                        trackNumber: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Producer Credit</label>
                <input
                  type="text"
                  value={editingMetadataTrack.producer || ''}
                  onChange={(e) =>
                    setEditingMetadataTrack({ ...editingMetadataTrack, producer: e.target.value })
                  }
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="explicit-toggle"
                  checked={editingMetadataTrack.isExplicit}
                  onChange={(e) =>
                    setEditingMetadataTrack({
                      ...editingMetadataTrack,
                      isExplicit: e.target.checked,
                    })
                  }
                  className="rounded border-white/20 bg-neutral-900 text-amber-400 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="explicit-toggle" className="text-neutral-300 cursor-pointer">
                  Explicit Content Tag
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
              <button
                onClick={() => setEditingMetadataTrack(null)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateTrackMetadata(editingMetadataTrack);
                  setEditingMetadataTrack(null);
                }}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
