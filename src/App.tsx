import React, { useState } from 'react';
import { MusicProvider, useMusic } from './context/MusicContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { PlayerBar } from './components/PlayerBar';
import { MobileTabBar } from './components/MobileTabBar';
import { MobilePlayer } from './components/MobilePlayer';
import { LyricsAndNotesDrawer } from './components/LyricsAndNotesDrawer';
import { QueueDrawer } from './components/QueueDrawer';

// Views
import { ListenNowView } from './views/ListenNowView';
import { BrowseView } from './views/BrowseView';
import { AlbumDetailView } from './views/AlbumDetailView';
import { ArtistProfileView } from './views/ArtistProfileView';
import { ArtistsListView } from './views/ArtistsListView';
import { LibrarySongsView } from './views/LibrarySongsView';
import { DownloadedView } from './views/DownloadedView';
import { PlaylistDetailView } from './views/PlaylistDetailView';
import { SearchView } from './views/SearchView';
import { WixCmsDashboardView } from './views/WixCmsDashboardView';
import { AdminLoginView } from './views/AdminLoginView';
import { api } from './services/api';
import { Play } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, albums, navigate, artist, appMode, setAppMode } = useMusic();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => api.hasAdminToken());

  // Verify admin session if navigating to CMS mode
  React.useEffect(() => {
    if (appMode === 'cms' && api.hasAdminToken()) {
      api.adminVerify().then((valid) => {
        setIsAdminAuthenticated(valid);
        if (!valid) {
          api.setAdminToken(null);
        }
      });
    }
  }, [appMode]);

  // If on secret admin route, gate behind login
  if (appMode === 'cms') {
    if (isAdminAuthenticated) {
      return <WixCmsDashboardView />;
    }
    return (
      <AdminLoginView
        onSuccess={() => setIsAdminAuthenticated(true)}
        onExit={() => setAppMode('streaming')}
      />
    );
  }

  const renderActiveView = () => {
    switch (activeView.type) {
      case 'listen-now':
        return <ListenNowView />;
      case 'browse':
      case 'radio':
        return <BrowseView />;
      case 'album-detail':
        return <AlbumDetailView albumId={activeView.albumId} />;
      case 'artist-detail':
        return <ArtistProfileView artistId={activeView.artistId} />;
      case 'artists':
        return <ArtistsListView />;
      case 'songs':
        return <LibrarySongsView />;
      case 'downloaded':
        return <DownloadedView />;
      case 'playlist-detail':
        return <PlaylistDetailView playlistId={activeView.playlistId} />;
      case 'search':
        return <SearchView query={activeView.query} />;
      case 'studio':
        return <ListenNowView />;
      case 'recently-added':
      case 'albums':
      default:
        return (
          <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 select-none transition-colors duration-200">
            <div>
              <div className="text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-1">
                Library
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                Albums ({albums.length})
              </h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {albums.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => navigate({ type: 'album-detail', albumId: alb.id })}
                  className="group cursor-pointer select-none"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg shadow-black/10 dark:shadow-black/50 border border-black/10 dark:border-white/10 relative mb-3">
                    <img
                      src={alb.coverUrl}
                      alt={alb.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-400/30">
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                    {alb.title}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {alb.artist} · {alb.releaseYear}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#ffffff] dark:bg-black text-neutral-900 dark:text-[#f5f5f7] transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex shrink-0" />

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <Sidebar
            className="relative z-10 w-72"
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopBar onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

        {/* Scrollable Main Content Frame */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-36 md:pb-24">
          {renderActiveView()}
        </main>

        {/* Desktop macOS Player Bar */}
        <div className="hidden md:block">
          <PlayerBar />
        </div>

        {/* Apple Music Frosted Side Drawers */}
        <LyricsAndNotesDrawer />
        <QueueDrawer />

        {/* Mobile Mini Player & Tab Bar */}
        <MobilePlayer />
        <MobileTabBar />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <MusicProvider>
      <MainContent />
    </MusicProvider>
  );
}
