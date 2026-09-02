import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Film, Search, X, PlayCircle, Flame, Star, Sparkles, ArrowRight } from 'lucide-react';
import { Movie, AdminSettings } from '../types';
import { POPULAR_SEARCH_TAGS, getLiveSearchSuggestions } from '../utils/searchEngine';
import { getAllCatalogMovies } from '../services/movieService';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  onSelectMovie?: (movie: Movie) => void;
  activeTab: 'trending' | 'top_rated' | 'upcoming' | 'watch_movies';
  onSelectTab: (tab: 'trending' | 'top_rated' | 'upcoming' | 'watch_movies') => void;
  onOpenAdmin: () => void;
  onOpenNetlifyGuide?: () => void;
  onOpenTmdbSettings?: () => void;
  adminSettings?: AdminSettings;
  watchMoviesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSelectMovie,
  activeTab,
  onSelectTab,
  watchMoviesCount = 0
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // Pre-load catalog for instant live search suggestions
  const catalogMovies = useMemo(() => getAllCatalogMovies(), []);

  // Compute live suggestions
  const liveSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return getLiveSearchSuggestions(catalogMovies, searchQuery, 5);
  }, [catalogMovies, searchQuery]);

  // Handle click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: 'watch_movies' | 'trending' | 'top_rated' | 'upcoming'; label: string; icon: any; badge?: string; highlight?: boolean }[] = [
    { id: 'watch_movies', label: 'Watch Movies', icon: PlayCircle, badge: watchMoviesCount > 0 ? `${watchMoviesCount}` : undefined, highlight: true },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'top_rated', label: 'Top Rated', icon: Star },
    { id: 'upcoming', label: 'Upcoming', icon: Film },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchFocused(false);
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  const handleSelectSuggestion = (movie: Movie) => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    if (onSelectMovie) {
      onSelectMovie(movie);
    } else {
      onSearchChange(movie.title);
      onSearchSubmit?.(movie.title);
    }
  };

  const handleTagClick = (tag: string) => {
    onSearchChange(tag);
    setIsSearchFocused(false);
    onSearchSubmit?.(tag);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-xl border-b border-zinc-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-2 sm:gap-6">
          
          {/* Brand Logo */}
          <button
            id="brand-logo-btn"
            onClick={() => {
              onSelectTab('trending');
              onSearchChange('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 shrink-0 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-transform duration-200">
              <Film className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-white font-['Outfit'] group-hover:text-orange-400 transition-colors">
                  K CINEMA
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 -mt-0.5 hidden sm:block">Movie Information & Watch Hub</p>
            </div>
          </button>

          {/* Desktop & Tablet Search Bar with Suggestions */}
          <div ref={searchContainerRef} className="hidden sm:flex flex-1 max-w-md md:max-w-lg relative items-center">
            <form
              id="movie-search-form"
              onSubmit={handleFormSubmit}
              className="w-full relative flex items-center"
            >
              <div className="relative w-full flex items-center">
                <input
                  id="movie-search-input"
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  placeholder="Search movies by title, cast, or genre..."
                  className="w-full pl-4 pr-24 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-inner"
                />
                
                {/* Clear button if text exists */}
                {searchQuery && (
                  <button
                    type="button"
                    id="clear-search-btn"
                    onClick={() => {
                      onSearchChange('');
                      setIsSearchFocused(false);
                    }}
                    className="absolute right-16 p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Clickable Search Action Button */}
                <button
                  type="submit"
                  id="search-submit-btn"
                  className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                  title="Search movies (supports typos)"
                >
                  <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden md:inline">Search</span>
                </button>
              </div>
            </form>

            {/* Desktop Instant Suggestions & Popular Searches Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c0c10] border border-zinc-700/90 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150">
                {searchQuery.trim() ? (
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400">
                      <span className="flex items-center gap-1.5 text-orange-400">
                        <Sparkles className="w-3 h-3" />
                        Live Suggestions & Similar
                      </span>
                      <span>Press Search to view all</span>
                    </div>

                    {liveSuggestions.length > 0 ? (
                      <div className="space-y-1">
                        {liveSuggestions.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleSelectSuggestion(m)}
                            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/80 transition-colors text-left group cursor-pointer"
                          >
                            <img
                              src={m.posterPath || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&q=80'}
                              alt={m.title}
                              className="w-8 h-11 object-cover rounded-md bg-zinc-800 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-zinc-100 group-hover:text-orange-400 truncate">
                                {m.title}
                              </div>
                              <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                                <span>{m.releaseDate ? m.releaseDate.substring(0, 4) : 'Cinema'}</span>
                                <span>•</span>
                                <span>{m.genres[0] || 'Movie'}</span>
                                <span>•</span>
                                <span className="text-amber-400 flex items-center gap-0.5">
                                  ★ {m.voteAverage.toFixed(1)}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-orange-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-3 text-center">
                        <p className="text-xs text-zinc-400">
                          Press <strong className="text-orange-400">Search</strong> — our smart engine will match similar titles even with typos!
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400">
                      <Flame className="w-3 h-3 text-orange-400" />
                      Popular & Fast Searches
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {POPULAR_SEARCH_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800/90 hover:bg-orange-500 hover:text-black text-zinc-300 transition-colors cursor-pointer font-medium"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Toggle Button (Shows on small screens) */}
          <div className="sm:hidden flex items-center gap-1.5">
            <button
              id="mobile-search-toggle-btn"
              onClick={() => {
                setIsMobileSearchOpen((prev) => !prev);
                setIsSearchFocused(true);
              }}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isMobileSearchOpen || searchQuery
                  ? 'bg-orange-500 text-black border-orange-400 font-bold'
                  : 'bg-zinc-900 text-zinc-200 border-zinc-700'
              }`}
              title="Toggle search"
            >
              <Search className="w-4 h-4" />
              <span className="text-[11px] font-bold">{searchQuery ? 'Searching' : 'Search'}</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !searchQuery;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    onSearchChange('');
                    onSelectTab(item.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? item.highlight
                        ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.35)] font-bold'
                        : 'bg-zinc-800 text-white font-bold'
                      : item.highlight
                        ? 'text-orange-400 hover:bg-orange-950/40 hover:text-orange-300'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-black text-orange-400' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>HD Cinema</span>
            </div>
          </div>

        </div>

        {/* Mobile Search Dropdown Bar */}
        {isMobileSearchOpen && (
          <div ref={mobileSearchContainerRef} className="sm:hidden pb-3 pt-1 space-y-2">
            <form
              id="mobile-search-form"
              onSubmit={handleFormSubmit}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  id="mobile-movie-search-input"
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search movies (supports typos)..."
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                id="mobile-search-submit-btn"
                className="px-4 py-2 rounded-xl bg-orange-500 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Search</span>
              </button>
            </form>

            {/* Mobile Instant Suggestions or Quick Tags */}
            {searchQuery.trim() ? (
              liveSuggestions.length > 0 && (
                <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-2 space-y-1">
                  <div className="text-[10px] font-bold text-orange-400 px-2 py-1 uppercase tracking-wider">
                    Quick Suggestions:
                  </div>
                  {liveSuggestions.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(m)}
                      className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-800 text-left text-xs text-zinc-200"
                    >
                      <img
                        src={m.posterPath || ''}
                        alt=""
                        className="w-6 h-8 object-cover rounded bg-zinc-800 shrink-0"
                      />
                      <span className="font-semibold truncate">{m.title}</span>
                      <span className="text-[10px] text-zinc-400 ml-auto">★ {m.voteAverage.toFixed(1)}</span>
                    </button>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-wrap gap-1 pt-1">
                {POPULAR_SEARCH_TAGS.slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="px-2 py-1 text-[11px] rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile Quick Category Bar */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar border-t border-zinc-900">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !searchQuery;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSearchChange('');
                  onSelectTab(item.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-orange-500 text-black font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
                {item.badge && <span className="text-[10px]">({item.badge})</span>}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
