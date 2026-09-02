import React, { useState, useEffect, useCallback } from 'react';
import { 
  Film, 
  Search, 
  RefreshCw, 
  Globe, 
  ShieldCheck, 
  Flame, 
  Award,
  Calendar,
  Sparkles,
  Play
} from 'lucide-react';
import { Movie, MoviePost, AdminSettings } from './types';
import { 
  fetchMovies, 
  getAdminSettings, 
  saveAdminSettings, 
} from './services/movieService';
import { fetchPosts } from './services/postService';
import { POPULAR_SEARCH_TAGS } from './utils/searchEngine';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { WatchMoviesSection } from './components/WatchMoviesSection';
import { WatchMovieModal } from './components/WatchMovieModal';
import { MovieCard } from './components/MovieCard';
import { GenreFilterBar } from './components/GenreFilterBar';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { TrailerModal } from './components/TrailerModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { NetlifyGuideModal } from './components/NetlifyGuideModal';

export default function App() {
  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<'trending' | 'top_rated' | 'upcoming' | 'watch_movies'>('trending');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data States
  const [movies, setMovies] = useState<Movie[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [posts, setPosts] = useState<MoviePost[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [didYouMean, setDidYouMean] = useState<string | undefined>(undefined);
  const [isFuzzyMatch, setIsFuzzyMatch] = useState<boolean>(false);

  // Admin Settings State
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(getAdminSettings);

  // Modal States
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<Movie | null>(null);
  const [selectedMovieForTrailer, setSelectedMovieForTrailer] = useState<Movie | null>(null);
  const [selectedPostForWatch, setSelectedPostForWatch] = useState<MoviePost | null>(null);
  const [editingPostForAdmin, setEditingPostForAdmin] = useState<MoviePost | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isNetlifyGuideOpen, setIsNetlifyGuideOpen] = useState(false);

  // Secret link route listener: /#admin, #admin, /admin, or ?admin
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        hash === '#admin' ||
        hash === '#/admin' ||
        path === '/admin' ||
        path === '/admin/' ||
        search.includes('admin')
      ) {
        setIsAdminModalOpen(true);
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);

    // Keyboard shortcut backup for admin: Alt + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminModalOpen(false);
    setEditingPostForAdmin(null);
    if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // Load Posts from Server Storage
  const loadPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const fetched = await fetchPosts();
      setPosts(fetched);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Load TMDB Movies based on active tab / genre / search
  const loadMovies = useCallback(async () => {
    setIsLoadingMovies(true);
    try {
      let category: 'trending' | 'top_rated' | 'upcoming' | 'genre' | 'search' = 'trending';
      let params: { genreId?: number; query?: string } = {};

      if (searchQuery.trim()) {
        category = 'search';
        params.query = searchQuery.trim();
      } else if (selectedGenreId !== null) {
        category = 'genre';
        params.genreId = selectedGenreId;
      } else if (activeTab === 'top_rated') {
        category = 'top_rated';
      } else if (activeTab === 'upcoming') {
        category = 'upcoming';
      }

      const result = await fetchMovies(category, params);

      // Spotlight movies for the hero banner
      setFeaturedMovies(result.movies.slice(0, 5));
      setMovies(result.movies);
      setDidYouMean(result.didYouMean);
      setIsFuzzyMatch(!!result.isFuzzyMatch);
    } catch (err) {
      console.error('Failed to load TMDB movies', err);
    } finally {
      setIsLoadingMovies(false);
    }
  }, [activeTab, selectedGenreId, searchQuery, adminSettings]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  // Update admin settings
  const handleUpdateAdminSettings = (newSettings: AdminSettings) => {
    setAdminSettings(newSettings);
    saveAdminSettings(newSettings);
    loadMovies();
  };

  const getSectionTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (selectedGenreId !== null) return 'Genre Exploration';
    if (activeTab === 'top_rated') return 'Top Rated Masterpieces';
    if (activeTab === 'upcoming') return 'Upcoming Releases';
    return 'Trending Blockbusters';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col selection:bg-orange-500 selection:text-black font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. Navigation Bar with Search & Admin */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedGenreId(null);
          if (tab === 'watch_movies') {
            // Scroll to watch movies
            const el = document.getElementById('watch-movies-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          if (query.trim()) {
            setSelectedGenreId(null);
          }
        }}
        onSearchSubmit={(query) => {
          setSearchQuery(query);
          if (query.trim()) {
            setSelectedGenreId(null);
            const el = document.getElementById('explore-movies-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onSelectMovie={(movie) => setSelectedMovieForDetails(movie)}
        onOpenAdmin={() => {
          setEditingPostForAdmin(null);
          setIsAdminModalOpen(true);
        }}
        onOpenNetlifyGuide={() => setIsNetlifyGuideOpen(true)}
        adminSettings={adminSettings}
        watchMoviesCount={posts.length}
      />

      {/* 2. Hero Spotlight (shown when not searching) */}
      {!searchQuery && selectedGenreId === null && (
        <HeroBanner
          featuredMovies={featuredMovies}
          onSelectMovie={(m) => setSelectedMovieForDetails(m)}
          onPlayTrailer={(m) => setSelectedMovieForTrailer(m)}
          onJumpToWatchMovies={() => {
            setActiveTab('watch_movies');
            const el = document.getElementById('watch-movies-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* 3. "Watch Movies" Section (Displaying posts from Admin Panel) */}
      <WatchMoviesSection
        posts={posts}
        onSelectPost={(post) => setSelectedPostForWatch(post)}
        onOpenAdmin={() => {
          setEditingPostForAdmin(null);
          setIsAdminModalOpen(true);
        }}
      />

      {/* 4. Public TMDB Movie Grid Section */}
      <main id="explore-movies-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Genre Pill Filter Bar & Quick Topic Chips */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <GenreFilterBar
              selectedGenreId={selectedGenreId}
              onSelectGenre={(gid) => {
                setSelectedGenreId(gid);
                if (gid !== null) setSearchQuery('');
              }}
            />
          </div>

          {/* Quick Search Shortcut Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="text-zinc-500 font-semibold text-[11px] whitespace-nowrap flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-orange-400" />
              Quick Searches:
            </span>
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  setSelectedGenreId(null);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === tag.toLowerCase()
                    ? 'bg-orange-500 text-black font-bold shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Typo Correction / "Did You Mean" Smart Banner */}
        {searchQuery && didYouMean && (
          <div className="bg-gradient-to-r from-orange-950/30 via-zinc-900/90 to-zinc-900/90 border border-orange-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-100 flex items-center gap-2 flex-wrap">
                  <span>Smart Search: Showing matches & similar titles for</span>
                  <span className="text-orange-400 font-extrabold">"{searchQuery}"</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Did you mean{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(didYouMean);
                      setSelectedGenreId(null);
                    }}
                    className="text-amber-400 font-bold underline hover:text-white cursor-pointer"
                  >
                    "{didYouMean}"
                  </button>
                  ? Click to refine search results.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery(didYouMean);
                setSelectedGenreId(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-bold shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              Search "{didYouMean}"
            </button>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight font-['Outfit']">
              {activeTab === 'trending' && !searchQuery && <Flame className="w-5 h-5 text-orange-500" />}
              {activeTab === 'top_rated' && !searchQuery && <Award className="w-5 h-5 text-amber-400" />}
              {activeTab === 'upcoming' && !searchQuery && <Calendar className="w-5 h-5 text-orange-400" />}
              {searchQuery && <Search className="w-5 h-5 text-orange-400" />}
              {getSectionTitle()}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              {searchQuery
                ? isFuzzyMatch
                  ? 'Showing best fuzzy matches and related movie recommendations.'
                  : 'Displaying matching titles, cast, and genres.'
                : 'Dynamic live catalog fetched from TMDB public APIs with cast details, trailers, and plot summaries.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              Showing {movies.length} titles
            </span>
          </div>
        </div>

        {/* Movies Grid */}
        {isLoadingMovies ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
            <p className="text-xs text-zinc-400 font-medium">Searching and ranking movie matches...</p>
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelectMovie={(m) => setSelectedMovieForDetails(m)}
                onPlayTrailer={(m) => setSelectedMovieForTrailer(m)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-4 bg-[#0e0e11] rounded-3xl border border-zinc-800 p-8 max-w-2xl mx-auto">
            <Film className="w-12 h-12 text-zinc-600 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-zinc-200 font-['Outfit']">
                No Direct Matches for "{searchQuery}"
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {didYouMean ? (
                  <>
                    Did you mean <strong className="text-orange-400 font-semibold">{didYouMean}</strong>? Click below to search for it immediately.
                  </>
                ) : (
                  'Try one of our popular searches or browse trending blockbusters below.'
                )}
              </p>
            </div>

            {didYouMean && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery(didYouMean);
                  setSelectedGenreId(null);
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.35)]"
              >
                <Search className="w-3.5 h-3.5" />
                Search "{didYouMean}" Instead
              </button>
            )}

            <div className="pt-2">
              <div className="text-[11px] font-semibold text-zinc-400 mb-2">Try popular titles:</div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {POPULAR_SEARCH_TAGS.slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      setSelectedGenreId(null);
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800/80 hover:bg-orange-500 hover:text-black text-zinc-300 transition-colors cursor-pointer font-medium"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenreId(null);
                  setActiveTab('trending');
                }}
                className="text-xs text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset & View All Trending
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer & Netlify Info */}
      <footer className="mt-16 border-t border-zinc-800/80 bg-[#050505] py-10 text-zinc-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold border border-orange-500/30">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-zinc-100 font-['Outfit'] text-sm">K Cinema</span>
                <p className="text-[11px] text-zinc-500">Public Movie Information & Editorial Platform</p>
              </div>
            </div>

            {/* Footer Navigation / Brand */}
            <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
              <span>© {new Date().getFullYear()} K Cinema</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
            <p>
              Data fetched dynamically from public TMDB API. No media files hosted on your server.
            </p>
            <p>
              Production ready for Netlify and custom domains.
            </p>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      
      {/* 1. Watch Movie Modal (Video player + HTML Compose View) */}
      <WatchMovieModal
        post={selectedPostForWatch}
        onClose={() => setSelectedPostForWatch(null)}
        onEditPost={(post) => {
          setSelectedPostForWatch(null);
          setEditingPostForAdmin(post);
          setIsAdminModalOpen(true);
        }}
      />

      {/* 2. Movie Details Modal (TMDB Cast & Plot) */}
      <MovieDetailsModal
        movie={selectedMovieForDetails}
        onClose={() => setSelectedMovieForDetails(null)}
        onPlayTrailer={(m) => setSelectedMovieForTrailer(m)}
      />

      {/* 3. Trailer Modal */}
      <TrailerModal
        movie={selectedMovieForTrailer}
        onClose={() => setSelectedMovieForTrailer(null)}
      />

      {/* 4. Admin Panel Modal (Login & Post Manager & Settings) - Accessed exclusively by secret link /#admin */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={handleCloseAdmin}
        posts={posts}
        onRefreshPosts={loadPosts}
        adminSettings={adminSettings}
        onUpdateAdminSettings={handleUpdateAdminSettings}
        initialEditPost={editingPostForAdmin}
        onOpenNetlifyGuide={() => setIsNetlifyGuideOpen(true)}
      />

      {/* 5. Netlify Guide Modal (Accessible from inside Admin Settings) */}
      <NetlifyGuideModal
        isOpen={isNetlifyGuideOpen}
        onClose={() => setIsNetlifyGuideOpen(false)}
      />

    </div>
  );
}
