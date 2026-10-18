import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Track, Album, ArtistProfile, Playlist, ActiveView, RepeatMode, ThemeMode, AppMode, UserAccount, ListeningHistoryItem } from '../types/music';
import { storageService, getAudioBlob } from '../services/storage';
import { audioEngine } from '../services/audioEngine';
import { api, DatabaseStats } from '../services/api';

interface MusicContextType {
  tracks: Track[];
  albums: Album[];
  artist: ArtistProfile;
  artists: ArtistProfile[];
  playlists: Playlist[];
  activeView: ActiveView;
  navigate: (view: ActiveView) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Theme & App Mode
  theme: ThemeMode;
  toggleTheme: () => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;

  // Local SQLite Database status
  dbStats: DatabaseStats | null;
  refreshDbStats: () => Promise<void>;

  // Playback
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  queue: Track[];
  isLyricsOpen: boolean;
  setIsLyricsOpen: (open: boolean) => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (open: boolean) => void;
  isMobilePlayerExpanded: boolean;
  setIsMobilePlayerExpanded: (expanded: boolean) => void;
  offlineOnlyMode: boolean;
  setOfflineOnlyMode: (offline: boolean) => void;

  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;

  // Library actions
  toggleFavorite: (trackId: string) => void;
  toggleDownload: (trackId: string) => void;
  updateTrackNotes: (trackId: string, notes: string) => void;
  updateTrackMetadata: (updated: Track) => void;
  addNewTrack: (track: Track) => void;
  deleteTrack: (trackId: string) => void;
  replaceAudioFile: (trackId: string, file: File, versionLabel?: string) => Promise<Track>;

  // Albums & Artist & Playlists
  saveAlbum: (album: Album) => void;
  deleteAlbum: (albumId: string) => void;
  updateArtistProfile: (profile: ArtistProfile) => void;
  saveArtist: (profile: ArtistProfile) => void;
  deleteArtist: (artistId: string) => void;
  createPlaylist: (title: string, description: string, initialTracks?: string[]) => Playlist;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  reloadCatalog: () => void;

  // Personal Listener Account & Listening History
  userAccount: UserAccount;
  updateUserAccount: (updates: Partial<UserAccount>) => void;
  listeningHistory: ListeningHistoryItem[];
  clearListeningHistory: () => void;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<ArtistProfile[]>(() => storageService.getArtists());
  const [artist, setArtist] = useState<ArtistProfile>(storageService.getArtist());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);

  // Listener Account & History State
  const [userAccount, setUserAccount] = useState<UserAccount>(() => storageService.getUserAccount());
  const [listeningHistory, setListeningHistory] = useState<ListeningHistoryItem[]>(() => storageService.getListeningHistory());
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const updateUserAccount = (updates: Partial<UserAccount>) => {
    setUserAccount((prev) => {
      const next = { ...prev, ...updates };
      storageService.saveUserAccount(next);
      return next;
    });
  };

  const clearListeningHistory = () => {
    setListeningHistory([]);
    storageService.saveListeningHistory([]);
  };

  // Theme & App Mode
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apple_music_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
    if (document.body) {
      document.body.classList.remove('dark', 'light');
      document.body.classList.add(theme);
    }
    localStorage.setItem('apple_music_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [appMode, setAppModeState] = useState<AppMode>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash === '#admin' || hash === '#cms') {
        return 'cms';
      }
    }
    return 'streaming';
  });

  useEffect(() => {
    const syncModeFromUrl = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash === '#admin' || hash === '#cms') {
        setAppModeState('cms');
      } else {
        setAppModeState('streaming');
      }
    };
    window.addEventListener('hashchange', syncModeFromUrl);
    window.addEventListener('popstate', syncModeFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncModeFromUrl);
      window.removeEventListener('popstate', syncModeFromUrl);
    };
  }, []);

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    if (mode === 'cms') {
      window.location.hash = '#admin';
    } else {
      if (window.location.hash === '#admin' || window.location.hash === '#cms') {
        window.location.hash = '';
      }
      if (window.location.pathname.startsWith('/admin')) {
        window.history.pushState(null, '', '/');
      }
    }
  };

  // Navigation History
  const [historyStack, setHistoryStack] = useState<ActiveView[]>([{ type: 'listen-now' }]);
  const [historyPointer, setHistoryPointer] = useState<number>(0);
  const activeView = historyStack[historyPointer] || { type: 'listen-now' };

  const [searchQuery, setSearchQuery] = useState('');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isMobilePlayerExpanded, setIsMobilePlayerExpanded] = useState<boolean>(false);
  const [offlineOnlyMode, setOfflineOnlyMode] = useState<boolean>(false);

  // References to preserve state in audio callbacks
  const currentTrackRef = useRef<Track | null>(null);
  const queueRef = useRef<Track[]>([]);
  const repeatModeRef = useRef<RepeatMode>('off');

  currentTrackRef.current = currentTrack;
  queueRef.current = queue;
  repeatModeRef.current = repeatMode;

  const refreshDbStats = async () => {
    try {
      const stats = await api.getStats();
      setDbStats(stats);
    } catch (e) {
      console.warn('Could not fetch DB stats:', e);
    }
  };

  // Initialize catalog from SQLite API
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [apiTracks, apiAlbums, apiArtists, apiPlaylists] = await Promise.all([
          api.getTracks(),
          api.getAlbums(),
          api.getArtists(),
          api.getPlaylists(),
        ]);

        if (apiTracks && apiTracks.length > 0) {
          setTracks(apiTracks);
          setAlbums(apiAlbums);
          if (apiArtists && apiArtists.length > 0) {
            setArtists(apiArtists);
            setArtist(apiArtists[0]);
            storageService.saveArtists(apiArtists);
          }
          setPlaylists(apiPlaylists);
          storageService.saveTracks(apiTracks);
          storageService.saveAlbums(apiAlbums);
          storageService.savePlaylists(apiPlaylists);

          if (!currentTrackRef.current) {
            setCurrentTrack(apiTracks[0]);
            setDuration(apiTracks[0].duration);
            setQueue(apiTracks.slice(1));
          }
          refreshDbStats();
          return;
        }
      } catch (e) {
        console.warn('Falling back to local storage cache:', e);
      }

      // Fallback to local storage if API is initializing
      const loadedTracks = storageService.getTracks();
      const loadedAlbums = storageService.getAlbums();
      const loadedArtists = storageService.getArtists();
      const loadedPlaylists = storageService.getPlaylists();

      setTracks(loadedTracks);
      setAlbums(loadedAlbums);
      setArtists(loadedArtists);
      setArtist(loadedArtists[0] || storageService.getArtist());
      setPlaylists(loadedPlaylists);

      if (loadedTracks.length > 0 && !currentTrackRef.current) {
        setCurrentTrack(loadedTracks[0]);
        setDuration(loadedTracks[0].duration);
        setQueue(loadedTracks.slice(1));
      }
      refreshDbStats();
    }

    loadCatalog();
  }, []);

  // Sync audio engine callbacks
  useEffect(() => {
    audioEngine.setCallbacks(
      (time, dur) => {
        setCurrentTime(time);
        if (dur && !isNaN(dur) && isFinite(dur)) {
          setDuration(dur);
        }
      },
      () => {
        // Track ended
        handleTrackEnded();
      },
      (playing) => {
        setIsPlaying(playing);
      }
    );
  }, []);

  const handleTrackEnded = useCallback(() => {
    if (repeatModeRef.current === 'one' && currentTrackRef.current) {
      audioEngine.seek(0);
      audioEngine.resume();
      return;
    }

    if (queueRef.current.length > 0) {
      const next = queueRef.current[0];
      const remainingQueue = queueRef.current.slice(1);
      if (repeatModeRef.current === 'all' && currentTrackRef.current) {
        remainingQueue.push(currentTrackRef.current);
      }
      playTrack(next, remainingQueue);
    } else if (repeatModeRef.current === 'all' && currentTrackRef.current) {
      audioEngine.seek(0);
      audioEngine.resume();
    } else {
      setIsPlaying(false);
    }
  }, []);

  const reloadCatalog = () => {
    setTracks(storageService.getTracks());
    setAlbums(storageService.getAlbums());
    setArtist(storageService.getArtist());
    setPlaylists(storageService.getPlaylists());
  };

  const navigate = (newView: ActiveView) => {
    const newStack = historyStack.slice(0, historyPointer + 1);
    newStack.push(newView);
    setHistoryStack(newStack);
    setHistoryPointer(newStack.length - 1);
  };

  const goBack = () => {
    if (historyPointer > 0) {
      setHistoryPointer((prev) => prev - 1);
    }
  };

  const goForward = () => {
    if (historyPointer < historyStack.length - 1) {
      setHistoryPointer((prev) => prev + 1);
    }
  };

  const canGoBack = historyPointer > 0;
  const canGoForward = historyPointer < historyStack.length - 1;

  // Playback handlers
  const playTrack = async (track: Track, newQueue?: Track[]) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration);

    if (newQueue) {
      setQueue(newQueue);
    } else {
      // Create queue from same album or all tracks following this one
      const sameAlbumTracks = tracks.filter((t) => t.albumId === track.albumId && t.id !== track.id);
      setQueue(sameAlbumTracks);
    }

    // Check if this track has a stored IndexedDB file blob
    let playUrl = track.audioUrl;
    const blob = await getAudioBlob(track.id);
    if (blob) {
      playUrl = URL.createObjectURL(blob);
    }

    audioEngine.playTrack(track.id, playUrl, track.duration);

    // Increment play count locally and persist to SQLite backend
    const updated = tracks.map((t) => (t.id === track.id ? { ...t, plays: t.plays + 1 } : t));
    setTracks(updated);
    storageService.saveTracks(updated);
    api.recordPlay(track.id).catch(() => {});

    // Record to personal listening history
    if (userAccount.autoSaveHistory) {
      const historyItem: ListeningHistoryItem = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        trackId: track.id,
        playedAt: new Date().toISOString(),
        title: track.title,
        artist: track.artist,
        albumTitle: track.albumTitle,
        coverUrl: track.coverUrl,
        duration: track.duration,
      };
      setListeningHistory((prev) => {
        const filtered = prev.filter((h) => h.trackId !== track.id);
        const next = [historyItem, ...filtered].slice(0, 60);
        storageService.saveListeningHistory(next);
        return next;
      });
    }
  };

  const togglePlay = () => {
    if (!currentTrack) {
      if (tracks.length > 0) {
        playTrack(tracks[0]);
      }
      return;
    }
    if (isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.resume();
    }
  };

  const nextTrack = () => {
    if (queue.length > 0) {
      const next = queue[0];
      const nextQueue = queue.slice(1);
      if (repeatMode === 'all' && currentTrack) {
        nextQueue.push(currentTrack);
      }
      playTrack(next, nextQueue);
    } else {
      // Loop back to beginning of current track
      audioEngine.seek(0);
    }
  };

  const previousTrack = () => {
    if (currentTime > 3) {
      audioEngine.seek(0);
      setCurrentTime(0);
    } else {
      // Play previous track from album if possible
      const albumTracks = tracks.filter((t) => t.albumId === currentTrack?.albumId);
      const currentIndex = albumTracks.findIndex((t) => t.id === currentTrack?.id);
      if (currentIndex > 0) {
        playTrack(albumTracks[currentIndex - 1]);
      } else {
        audioEngine.seek(0);
      }
    }
  };

  const seekTo = (seconds: number) => {
    audioEngine.seek(seconds);
    setCurrentTime(seconds);
  };

  const setVolume = (level: number) => {
    setVolumeState(level);
    setIsMuted(level === 0);
    audioEngine.setVolume(level);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume || 0.85);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };

  const toggleShuffle = () => {
    setIsShuffled((prev) => {
      const next = !prev;
      if (next && queue.length > 1) {
        // Shuffle queue
        const shuffled = [...queue].sort(() => Math.random() - 0.5);
        setQueue(shuffled);
      }
      return next;
    });
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  // Library actions
  const toggleFavorite = async (trackId: string) => {
    const target = tracks.find((t) => t.id === trackId);
    if (!target) return;
    const newFav = !target.isFavorite;

    const updated = storageService.toggleFavorite(trackId);
    setTracks(updated);
    if (currentTrack?.id === trackId) {
      setCurrentTrack((prev) => (prev ? { ...prev, isFavorite: newFav } : null));
    }

    try {
      await api.updateTrack(trackId, { isFavorite: newFav });
    } catch (e) {
      console.warn('Could not sync favorite to SQLite:', e);
    }
  };

  const toggleDownload = (trackId: string) => {
    const updated = storageService.toggleDownload(trackId);
    setTracks(updated);
    if (currentTrack?.id === trackId) {
      setCurrentTrack((prev) => (prev ? { ...prev, isDownloaded: !prev.isDownloaded } : null));
    }
  };

  const updateTrackNotes = async (trackId: string, notes: string) => {
    const target = tracks.find((t) => t.id === trackId);
    if (target) {
      const notesDate = `Updated ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      const updatedTrack: Track = {
        ...target,
        specialNotes: notes,
        notesDate,
      };
      const updated = storageService.updateTrack(updatedTrack);
      setTracks(updated);
      if (currentTrack?.id === trackId) {
        setCurrentTrack(updatedTrack);
      }

      try {
        await api.updateTrack(trackId, { specialNotes: notes, notesDate });
      } catch (e) {
        console.warn('Could not sync notes to SQLite:', e);
      }
    }
  };

  const updateTrackMetadata = async (updatedTrack: Track) => {
    const updated = storageService.updateTrack(updatedTrack);
    setTracks(updated);
    if (currentTrack?.id === updatedTrack.id) {
      setCurrentTrack(updatedTrack);
    }

    try {
      await api.updateTrack(updatedTrack.id, updatedTrack);
    } catch (e) {
      console.warn('Could not sync metadata to SQLite:', e);
    }
  };

  const addNewTrack = async (newTrack: Track) => {
    const result = storageService.addTrack(newTrack);
    setTracks(result.tracks);
    setAlbums(result.albums);

    try {
      await api.createTrack(newTrack);
      refreshDbStats();
    } catch (e) {
      console.warn('Could not sync new track to SQLite:', e);
    }
  };

  const deleteTrack = async (trackId: string) => {
    const result = storageService.deleteTrack(trackId);
    setTracks(result.tracks);
    setAlbums(result.albums);
    setPlaylists(storageService.getPlaylists());
    if (currentTrack?.id === trackId) {
      if (result.tracks.length > 0) {
        playTrack(result.tracks[0]);
      } else {
        audioEngine.stop();
        setCurrentTrack(null);
      }
    }

    try {
      await api.deleteTrack(trackId);
      refreshDbStats();
    } catch (e) {
      console.warn('Could not delete from SQLite:', e);
    }
  };

  const replaceAudioFile = async (trackId: string, file: File, versionLabel?: string) => {
    // 1. Try uploading to local server disk & SQLite database first
    try {
      const uploadRes = await api.uploadAudioFile(trackId, file, versionLabel);
      if (uploadRes.success && uploadRes.track) {
        const updated = uploadRes.track;
        const newTracks = tracks.map((t) => (t.id === trackId ? updated : t));
        setTracks(newTracks);
        storageService.saveTracks(newTracks);
        if (currentTrack?.id === trackId) {
          setCurrentTrack(updated);
          audioEngine.playTrack(updated.id, updated.audioUrl, updated.duration);
        }
        refreshDbStats();
        return updated;
      }
    } catch (err) {
      console.warn('Server audio upload fallback to IndexedDB:', err);
    }

    // 2. Fallback to browser IndexedDB if offline
    const updated = await storageService.replaceTrackAudio(trackId, file, versionLabel);
    setTracks(storageService.getTracks());
    if (currentTrack?.id === trackId) {
      setCurrentTrack(updated);
      audioEngine.playTrack(updated.id, updated.audioUrl, updated.duration);
    }
    return updated;
  };

  // Album actions
  const saveAlbum = async (album: Album) => {
    const updated = storageService.saveAlbum(album);
    setAlbums(updated);

    try {
      const existing = albums.find((a) => a.id === album.id);
      if (existing) {
        await api.updateAlbum(album.id, album);
      } else {
        await api.createAlbum(album);
      }
      refreshDbStats();
    } catch (e) {
      console.warn('Could not sync album to SQLite:', e);
    }
  };

  const deleteAlbum = async (albumId: string) => {
    const result = storageService.deleteAlbum(albumId);
    setAlbums(result.albums);
    setTracks(result.tracks);

    try {
      await api.deleteAlbum(albumId);
      refreshDbStats();
    } catch (e) {
      console.warn('Could not delete album from SQLite:', e);
    }
  };

  const updateArtistProfile = async (profile: ArtistProfile) => {
    await saveArtist(profile);
  };

  const saveArtist = async (profile: ArtistProfile) => {
    storageService.saveArtist(profile);
    setArtists((prev) => {
      const exists = prev.some((a) => a.id === profile.id);
      return exists ? prev.map((a) => (a.id === profile.id ? profile : a)) : [...prev, profile];
    });
    if (artist.id === profile.id) {
      setArtist(profile);
    }

    try {
      const exists = artists.some((a) => a.id === profile.id);
      if (exists) {
        await api.updateArtistById(profile.id, profile);
      } else {
        await api.createArtist(profile);
      }
      refreshDbStats();
    } catch (e) {
      console.warn('Could not sync artist to backend:', e);
    }
  };

  const deleteArtist = async (artistId: string) => {
    const updated = artists.filter((a) => a.id !== artistId);
    setArtists(updated);
    storageService.saveArtists(updated);
    if (artist.id === artistId && updated.length > 0) {
      setArtist(updated[0]);
    }

    try {
      await api.deleteArtist(artistId);
      refreshDbStats();
    } catch (e) {
      console.warn('Could not delete artist from backend:', e);
    }
  };

  const createPlaylist = (title: string, description: string, initialTracks?: string[]) => {
    const pl = storageService.createPlaylist(title, description, initialTracks);
    setPlaylists(storageService.getPlaylists());

    try {
      api.createPlaylist(pl).then(() => {
        if (initialTracks) {
          initialTracks.forEach((tId) => api.addTrackToPlaylist(pl.id, tId));
        }
        refreshDbStats();
      });
    } catch (e) {
      console.warn('Could not sync playlist to SQLite:', e);
    }

    return pl;
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    const updated = storageService.addTrackToPlaylist(playlistId, trackId);
    setPlaylists(updated);

    try {
      api.addTrackToPlaylist(playlistId, trackId);
    } catch (e) {
      console.warn('Could not sync add to playlist in SQLite:', e);
    }
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    const updated = storageService.removeTrackFromPlaylist(playlistId, trackId);
    setPlaylists(updated);

    try {
      api.removeTrackFromPlaylist(playlistId, trackId);
    } catch (e) {
      console.warn('Could not sync remove from playlist in SQLite:', e);
    }
  };

  const deletePlaylist = (playlistId: string) => {
    const updated = storageService.deletePlaylist(playlistId);
    setPlaylists(updated);

    try {
      api.deletePlaylist(playlistId);
    } catch (e) {
      console.warn('Could not delete playlist from SQLite:', e);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        tracks,
        albums,
        artist,
        artists,
        playlists,
        activeView,
        navigate,
        goBack,
        goForward,
        canGoBack,
        canGoForward,
        searchQuery,
        setSearchQuery,
        theme,
        toggleTheme,
        appMode,
        setAppMode,
        dbStats,
        refreshDbStats,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isShuffled,
        queue,
        isLyricsOpen,
        setIsLyricsOpen,
        isQueueOpen,
        setIsQueueOpen,
        isMobilePlayerExpanded,
        setIsMobilePlayerExpanded,
        offlineOnlyMode,
        setOfflineOnlyMode,
        playTrack,
        togglePlay,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        toggleMute,
        toggleRepeat,
        toggleShuffle,
        addToQueue,
        removeFromQueue,
        clearQueue,
        toggleFavorite,
        toggleDownload,
        updateTrackNotes,
        updateTrackMetadata,
        addNewTrack,
        deleteTrack,
        replaceAudioFile,
        saveAlbum,
        deleteAlbum,
        updateArtistProfile,
        saveArtist,
        deleteArtist,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        deletePlaylist,
        reloadCatalog,
        userAccount,
        updateUserAccount,
        listeningHistory,
        clearListeningHistory,
        isAccountModalOpen,
        setIsAccountModalOpen,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
