import React, { useState, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Dices,
  Play,
  Info,
  Star,
  Clock,
  Calendar,
  Flame,
  CheckCircle2,
  Filter,
  Compass,
  Zap,
  Film,
  RotateCw,
  Award
} from 'lucide-react';
import { Movie } from '../types';

interface MovieSuggestionsSectionProps {
  allMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
}

interface VibeOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
  genres: string[];
}

const VIBE_OPTIONS: VibeOption[] = [
  {
    id: 'all',
    label: 'All Recommendations',
    emoji: '✨',
    description: 'Top-ranked, critically acclaimed cinema across all genres',
    genres: []
  },
  {
    id: 'mind_bending',
    label: 'Mind-Bending & Deep',
    emoji: '🧠',
    description: 'Psychological twists, concept-driven Sci-Fi & gripping mysteries',
    genres: ['Sci-Fi', 'Mystery', 'Thriller']
  },
  {
    id: 'adrenaline',
    label: 'Adrenaline & Action',
    emoji: '⚡',
    description: 'Fast-paced stunts, tactical firefights & high-stakes survival',
    genres: ['Action', 'Adventure', 'Crime']
  },
  {
    id: 'critics_darling',
    label: 'Critically Acclaimed',
    emoji: '🏆',
    description: 'Masterclass directing, award-winning performances & deep drama',
    genres: ['Drama', 'History', 'Crime']
  },
  {
    id: 'cosmic',
    label: 'Cosmic & Sci-Fi',
    emoji: '🌌',
    description: 'Interstellar voyages, future worlds & profound space odysseys',
    genres: ['Sci-Fi', 'Adventure']
  },
  {
    id: 'dark_noir',
    label: 'Dark Crime & Mystery',
    emoji: '🔍',
    description: 'Gritty investigations, moral dilemmas & neo-noir tension',
    genres: ['Crime', 'Mystery', 'Thriller']
  },
  {
    id: 'comfort',
    label: 'Comfort & Animation',
    emoji: '🍿',
    description: 'Visually stunning animation, wit & heartwarming journeys',
    genres: ['Animation', 'Comedy', 'Family']
  }
];

export const MovieSuggestionsSection: React.FC<MovieSuggestionsSectionProps> = ({
  allMovies,
  onSelectMovie,
  onPlayTrailer,
}) => {
  const [selectedVibeId, setSelectedVibeId] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [runtimeFilter, setRuntimeFilter] = useState<'any' | 'quick' | 'epic'>('any');
  const [eraFilter, setEraFilter] = useState<'any' | '2020s' | '2010s' | 'classics'>('any');
  const [isRolling, setIsRolling] = useState(false);
  const [surpriseMovie, setSurpriseMovie] = useState<Movie | null>(null);

  // Filter movies based on selected criteria
  const suggestedMovies = useMemo(() => {
    if (!allMovies || allMovies.length === 0) return [];

    const activeVibe = VIBE_OPTIONS.find((v) => v.id === selectedVibeId);

    return allMovies
      .filter((movie) => {
        // Vibe genre filter
        if (activeVibe && activeVibe.genres.length > 0) {
          const hasMatchingGenre = movie.genres?.some((g) =>
            activeVibe.genres.some((vg) => g.toLowerCase().includes(vg.toLowerCase()))
          );
          if (!hasMatchingGenre) return false;
        }

        // Min rating
        if (minRating > 0 && movie.voteAverage < minRating) return false;

        // Runtime filter
        if (runtimeFilter === 'quick' && movie.runtime && movie.runtime > 115) return false;
        if (runtimeFilter === 'epic' && movie.runtime && movie.runtime < 140) return false;

        // Era filter
        const year = movie.releaseDate ? parseInt(movie.releaseDate.substring(0, 4), 10) : null;
        if (year) {
          if (eraFilter === '2020s' && year < 2020) return false;
          if (eraFilter === '2010s' && (year < 2010 || year > 2019)) return false;
          if (eraFilter === 'classics' && year >= 2010) return false;
        }

        return true;
      })
      .sort((a, b) => b.voteAverage - a.voteAverage);
  }, [allMovies, selectedVibeId, minRating, runtimeFilter, eraFilter]);

  // Roll the dice / Random Lucky Pick
  const handleRollSurprise = useCallback(() => {
    if (suggestedMovies.length === 0) return;
    setIsRolling(true);

    let counter = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * suggestedMovies.length);
      setSurpriseMovie(suggestedMovies[randomIndex]);
      counter++;
      if (counter >= 8) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 80);
  }, [suggestedMovies]);

  // Calculate Match Percentage Badge
  const getMatchScore = (movie: Movie, index: number): number => {
    // Generates a convincing 90% - 99% match based on voteAverage and ranking
    const base = Math.min(99, Math.round(movie.voteAverage * 10 + (10 - index * 0.5)));
    return Math.max(88, base);
  };

  const activeVibe = VIBE_OPTIONS.find((v) => v.id === selectedVibeId);

  return (
    <section id="movie-suggestions-section" className="py-10 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Cinema Matcher
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-['Outfit'] tracking-tight">
              Movie Suggestions for Tonight
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Can't decide what to watch? Filter by mood, era, or runtime — or let our Smart Engine roll the dice for your next cinematic experience.
            </p>
          </div>

          {/* Surprise Me / Dice Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-dice-surprise-me"
              onClick={handleRollSurprise}
              disabled={isRolling || suggestedMovies.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin text-black' : ''}`} />
              <span>{isRolling ? 'Selecting Winner...' : '🎲 Surprise Me / Lucky Pick'}</span>
            </button>
          </div>
        </div>

        {/* Lucky Pick Showcase Card (When Rolled) */}
        {surpriseMovie && (
          <div className="mb-8 rounded-3xl bg-gradient-to-br from-[#121218] via-[#0c0c10] to-[#14101a] border-2 border-orange-500/50 p-6 sm:p-8 relative overflow-hidden shadow-2xl animate-in fade-in duration-300">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 lg:gap-8">
              {/* Poster Thumbnail */}
              <div className="w-32 sm:w-40 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 shrink-0 border border-zinc-700">
                <img
                  src={surpriseMovie.posterPath || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'}
                  alt={surpriseMovie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Movie Details */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-black">
                    🎯 99% Match Winner
                  </span>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f5c518] text-black">
                    <Star className="w-3 h-3 fill-black text-black" />
                    <span>{surpriseMovie.voteAverage.toFixed(1)} IMDb</span>
                  </div>
                  {surpriseMovie.runtime && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {surpriseMovie.runtime} mins
                    </span>
                  )}
                  {surpriseMovie.releaseDate && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {surpriseMovie.releaseDate.substring(0, 4)}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
                  {surpriseMovie.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                  {surpriseMovie.genres?.join(' • ')} {surpriseMovie.director && `| Directed by ${surpriseMovie.director}`}
                </p>

                <p className="text-sm text-zinc-300 line-clamp-2 max-w-3xl leading-relaxed">
                  {surpriseMovie.overview}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {surpriseMovie.trailerKey && (
                    <button
                      type="button"
                      onClick={() => onPlayTrailer(surpriseMovie)}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      Watch Official Trailer
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectMovie(surpriseMovie)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-zinc-300" />
                    Full Movie Details & Cast
                  </button>

                  <button
                    type="button"
                    onClick={handleRollSurprise}
                    className="px-3 py-2 rounded-xl text-zinc-400 hover:text-white text-xs flex items-center gap-1 hover:bg-zinc-800/80 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Roll Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mood & Vibe Filter Buttons */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-orange-400" />
            <span>Select Your Movie Vibe:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {VIBE_OPTIONS.map((vibe) => {
              const isSelected = selectedVibeId === vibe.id;
              return (
                <button
                  key={vibe.id}
                  id={`vibe-btn-${vibe.id}`}
                  onClick={() => setSelectedVibeId(vibe.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-black font-bold shadow-[0_0_15px_rgba(249,115,22,0.35)] scale-[1.02]'
                      : 'bg-[#0e0e11] hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-sm">{vibe.emoji}</span>
                  <span>{vibe.label}</span>
                </button>
              );
            })}
          </div>

          {activeVibe && (
            <p className="text-xs text-orange-400/90 font-medium italic">
              Showing: {activeVibe.description}
            </p>
          )}
        </div>

        {/* Secondary Filters Bar: Rating, Runtime, Era */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0c0c10] border border-zinc-800/80 mb-6 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Min Rating Filter */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-semibold">Min Score:</span>
              <div className="flex items-center gap-1">
                {[0, 7.5, 8.0, 8.5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setMinRating(val)}
                    className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      minRating === val
                        ? 'bg-amber-400 text-black'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {val === 0 ? 'Any' : `★ ${val}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Runtime Filter */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-semibold">Runtime:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'any', label: 'Any' },
                  { id: 'quick', label: '< 115 min' },
                  { id: 'epic', label: '140+ min' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRuntimeFilter(item.id as any)}
                    className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      runtimeFilter === item.id
                        ? 'bg-orange-500 text-black'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Era Filter */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-semibold">Decade:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'any', label: 'Any' },
                  { id: '2020s', label: '2020s' },
                  { id: '2010s', label: '2010s' },
                  { id: 'classics', label: 'Classics' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setEraFilter(item.id as any)}
                    className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      eraFilter === item.id
                        ? 'bg-orange-500 text-black'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <span className="text-zinc-500 font-medium">
            {suggestedMovies.length} curated matches
          </span>
        </div>

        {/* Suggested Movies Grid */}
        {suggestedMovies.length === 0 ? (
          <div className="py-16 text-center bg-[#0c0c10] rounded-3xl border border-zinc-800 p-8">
            <Film className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No suggestions match these exact filters</h3>
            <p className="text-xs text-zinc-400 mt-1">Try relaxing the rating or runtime filter above.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedVibeId('all');
                setMinRating(0);
                setRuntimeFilter('any');
                setEraFilter('any');
              }}
              className="mt-3 px-3 py-1.5 rounded-xl bg-orange-500 text-black font-bold text-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {suggestedMovies.slice(0, 15).map((movie, idx) => {
              const matchScore = getMatchScore(movie, idx);
              const year = movie.releaseDate ? movie.releaseDate.substring(0, 4) : '';

              return (
                <div
                  key={movie.id}
                  id={`suggested-card-${movie.id}`}
                  className="group relative bg-[#0e0e11] rounded-2xl overflow-hidden border border-zinc-800/90 hover:border-orange-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-black/90 flex flex-col"
                >
                  {/* Poster Thumbnail with Overlays */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#050505]">
                    <img
                      src={movie.posterPath || ''}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Smart Match Pill */}
                    <div className="absolute top-2.5 left-2.5 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md border border-orange-500/50 text-[10px] font-black text-orange-400 flex items-center gap-1 shadow-md">
                        <Zap className="w-3 h-3 fill-orange-400" />
                        {matchScore}% MATCH
                      </span>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-2.5 right-2.5 pointer-events-none">
                      <div className="px-2 py-0.5 rounded-lg bg-[#050505]/90 backdrop-blur-md border border-zinc-700/60 text-[11px] font-bold text-[#f5c518] flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#f5c518]" />
                        <span>{movie.voteAverage.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Hover Action Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 gap-1.5">
                      {movie.trailerKey && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayTrailer(movie);
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-black" />
                          Trailer
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectMovie(movie)}
                        className="w-full py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-zinc-700 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5 text-zinc-300" />
                        Details
                      </button>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div
                    onClick={() => onSelectMovie(movie)}
                    className="p-3.5 flex-1 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          {year}
                        </span>
                        <span className="truncate max-w-[110px] text-zinc-400">
                          {movie.genres?.[0] || 'Cinema'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1 font-['Outfit']">
                        {movie.title}
                      </h4>

                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        {movie.overview}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                      <span>{movie.runtime ? `${movie.runtime}m` : 'Feature film'}</span>
                      <span className="text-orange-400/90 font-semibold">Recommended</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
