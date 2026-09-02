import React, { useState, useEffect } from 'react';
import { Play, Info, Star, ChevronLeft, ChevronRight, User, Calendar, Clock, Film } from 'lucide-react';
import { Movie } from '../types';

interface HeroBannerProps {
  featuredMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  onJumpToWatchMovies?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredMovies,
  onSelectMovie,
  onPlayTrailer,
  onJumpToWatchMovies,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (!featuredMovies || featuredMovies.length === 0) return null;

  const currentMovie = featuredMovies[currentIndex] || featuredMovies[0];
  const year = currentMovie.releaseDate ? new Date(currentMovie.releaseDate).getFullYear() : '2024';

  return (
    <div className="relative w-full overflow-hidden bg-[#050505] border-b border-zinc-800/80">
      {/* Background Backdrop with Multi-layer Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        {currentMovie.backdropPath ? (
          <img
            src={currentMovie.backdropPath}
            alt={currentMovie.title}
            className="w-full h-full object-cover object-top opacity-30 scale-105 transition-all duration-1000 ease-out filter contrast-110"
          />
        ) : (
          <div className="w-full h-full bg-zinc-950" />
        )}
        {/* Cinematic Multi-layered Vignette & Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/85 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Hero Movie Info */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 tracking-wide uppercase shadow-[0_0_10px_rgba(249,115,22,0.2)] font-['Outfit']">
                {currentMovie.customBadge || 'Spotlight Blockbuster'}
              </span>

              {/* Rating */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-900/90 text-amber-400 border border-zinc-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{currentMovie.voteAverage.toFixed(1)} / 10</span>
              </div>
            </div>

            {/* Movie Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-['Outfit'] drop-shadow-sm">
              {currentMovie.title}
            </h1>

            {/* Tagline or Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-300 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {year}
              </span>
              {currentMovie.runtime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  {Math.floor(currentMovie.runtime / 60)}h {currentMovie.runtime % 60}m
                </span>
              )}
              {currentMovie.director && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  Dir. {currentMovie.director}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                {currentMovie.genres.slice(0, 3).map((g) => (
                  <span key={g} className="px-2.5 py-0.5 rounded-lg bg-zinc-800/80 text-zinc-300 text-[11px] border border-zinc-700/60">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Plot Synopsis */}
            <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 sm:line-clamp-4 max-w-2xl leading-relaxed">
              {currentMovie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-watch-trailer-btn"
                onClick={() => onPlayTrailer(currentMovie)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] cursor-pointer hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-black" />
                Watch Trailer
              </button>

              <button
                id="hero-view-details-btn"
                onClick={() => onSelectMovie(currentMovie)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold text-sm transition-all cursor-pointer hover:border-zinc-500 shadow-sm"
              >
                <Info className="w-4 h-4 text-zinc-400" />
                View Cast & Synopsis
              </button>

              {onJumpToWatchMovies && (
                <button
                  onClick={onJumpToWatchMovies}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-950/40 hover:bg-orange-900/50 text-orange-400 border border-orange-500/40 font-bold text-xs transition-all cursor-pointer"
                >
                  <Film className="w-3.5 h-3.5" />
                  Browse Watch Movies
                </button>
              )}
            </div>

          </div>

          {/* Side Poster Card for Desktop */}
          <div className="hidden lg:flex lg:col-span-4 justify-center">
            <div 
              onClick={() => onSelectMovie(currentMovie)}
              className="group relative w-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/90 border border-zinc-700/80 cursor-pointer transform hover:-translate-y-2 transition-all duration-300"
            >
              {currentMovie.posterPath ? (
                <img
                  src={currentMovie.posterPath}
                  alt={currentMovie.title}
                  className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-zinc-800 flex items-center justify-center text-zinc-500">
                  No Poster
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <span className="text-xs text-orange-400 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                  <Info className="w-3 h-3" /> Click for Cast & Synopsis
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Carousel Pagination & Arrows */}
        {featuredMovies.length > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-zinc-800/40 mt-6">
            <div className="flex items-center gap-2">
              {featuredMovies.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-8 bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1))}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Previous Featured Movie"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredMovies.length)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Next Featured Movie"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
