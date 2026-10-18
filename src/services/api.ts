import { Track, Album, ArtistProfile, Playlist } from '../types/music';

export interface DatabaseStats {
  filePath: string;
  engine: string;
  sizeBytes: number;
  sizeKb: string;
  rowCounts: {
    tracks: number;
    albums: number;
    playlists: number;
  };
}

export interface SqlQueryResult {
  success: boolean;
  isSelect?: boolean;
  columns?: string[];
  rows?: Record<string, unknown>[];
  count?: number;
  timeMs: number;
  error?: string;
}

class ApiService {
  public getAdminToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('amber_admin_token') || localStorage.getItem('amber_admin_token');
  }

  public setAdminToken(token: string | null) {
    if (typeof window === 'undefined') return;
    if (token) {
      sessionStorage.setItem('amber_admin_token', token);
      localStorage.setItem('amber_admin_token', token);
    } else {
      sessionStorage.removeItem('amber_admin_token');
      localStorage.removeItem('amber_admin_token');
    }
  }

  public hasAdminToken(): boolean {
    return !!this.getAdminToken();
  }

  public async adminLogin(passcode: string): Promise<{ success: boolean; token: string }> {
    const res = await this.request<{ success: boolean; token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ passcode }),
    });
    if (res.token) {
      this.setAdminToken(res.token);
    }
    return res;
  }

  public async adminVerify(): Promise<boolean> {
    const token = this.getAdminToken();
    if (!token) return false;
    try {
      const res = await this.request<{ authenticated: boolean }>('/api/admin/verify');
      return !!res.authenticated;
    } catch {
      return false;
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const adminToken = this.getAdminToken();
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { Authorization: `Bearer ${adminToken}`, 'x-admin-token': adminToken } : {}),
        ...((options?.headers as Record<string, string>) || {}),
      },
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.error || `HTTP error ${res.status}`);
    }
    return res.json();
  }

  // Stats & Health
  public async getStats(): Promise<DatabaseStats> {
    return this.request<DatabaseStats>('/api/db/stats');
  }

  public async executeSql(sql: string): Promise<SqlQueryResult> {
    return this.request<SqlQueryResult>('/api/db/query', {
      method: 'POST',
      body: JSON.stringify({ sql }),
    });
  }

  // Tracks
  public async getTracks(): Promise<Track[]> {
    return this.request<Track[]>('/api/tracks');
  }

  public async createTrack(track: Partial<Track>): Promise<Track> {
    return this.request<Track>('/api/tracks', {
      method: 'POST',
      body: JSON.stringify(track),
    });
  }

  public async updateTrack(id: string, updates: Partial<Track>): Promise<Track> {
    return this.request<Track>(`/api/tracks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async deleteTrack(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/api/tracks/${id}`, {
      method: 'DELETE',
    });
  }

  public async recordPlay(id: string): Promise<Track> {
    return this.request<Track>(`/api/tracks/${id}/play`, {
      method: 'POST',
    });
  }

  public async uploadAudioFile(
    trackId: string,
    file: File,
    versionLabel?: string
  ): Promise<{ success: boolean; track: Track; audioUrl: string }> {
    const formData = new FormData();
    formData.append('audio', file);
    if (versionLabel) {
      formData.append('versionLabel', versionLabel);
    }

    const adminToken = this.getAdminToken();
    const headers: Record<string, string> = {};
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
      headers['x-admin-token'] = adminToken;
    }

    const res = await fetch(`/api/tracks/${trackId}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }

    return res.json();
  }

  // Albums
  public async getAlbums(): Promise<Album[]> {
    return this.request<Album[]>('/api/albums');
  }

  public async createAlbum(album: Partial<Album>): Promise<Album> {
    return this.request<Album>('/api/albums', {
      method: 'POST',
      body: JSON.stringify(album),
    });
  }

  public async updateAlbum(id: string, updates: Partial<Album>): Promise<Album> {
    return this.request<Album>(`/api/albums/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async deleteAlbum(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/api/albums/${id}`, {
      method: 'DELETE',
    });
  }

  // Artists
  public async getArtists(): Promise<ArtistProfile[]> {
    return this.request<ArtistProfile[]>('/api/artists');
  }

  public async getArtistById(id: string): Promise<ArtistProfile> {
    return this.request<ArtistProfile>(`/api/artists/${id}`);
  }

  public async createArtist(profile: Partial<ArtistProfile>): Promise<ArtistProfile> {
    return this.request<ArtistProfile>('/api/artists', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  public async updateArtistById(id: string, updates: Partial<ArtistProfile>): Promise<ArtistProfile> {
    return this.request<ArtistProfile>(`/api/artists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async deleteArtist(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/api/artists/${id}`, {
      method: 'DELETE',
    });
  }

  // Legacy Artist
  public async getArtist(): Promise<ArtistProfile> {
    return this.request<ArtistProfile>('/api/artist');
  }

  public async updateArtist(profile: ArtistProfile): Promise<ArtistProfile> {
    return this.request<ArtistProfile>('/api/artist', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // Playlists
  public async getPlaylists(): Promise<Playlist[]> {
    return this.request<Playlist[]>('/api/playlists');
  }

  public async createPlaylist(playlist: Partial<Playlist>): Promise<Playlist> {
    return this.request<Playlist>('/api/playlists', {
      method: 'POST',
      body: JSON.stringify(playlist),
    });
  }

  public async deletePlaylist(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/api/playlists/${id}`, {
      method: 'DELETE',
    });
  }

  public async addTrackToPlaylist(playlistId: string, trackId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ trackId }),
    });
  }

  public async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
