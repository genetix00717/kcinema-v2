import React from 'react';
import { Star, Play, Info, Calendar } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  onQuickAdminEdit?: (movie: Movie) => void;
  isAdminLoggedIn?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSelectMovie,
  onPlayTrailer,
}) => {
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';

  return (
    <div 
      id={`movie-card-${movie.id}`}
      className="group relative bg-[#0e0e11] rounded-2xl overflow-hidden border border-zinc-800/90 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-black/80 flex flex-col"
    >
      {/* Poster Media Box */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#050505]">
        {movie.posterPath ? (
          <img
            src={movie.posterPath}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-zinc-900 text-zinc-500">
            <span className="text-3xl mb-2">🎬</span>
            <span className="text-xs font-medium">{movie.title}</span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1 pointer-events-none">
          {/* TMDB Rating */}
          <div className="px-2 py-0.5 rounded-lg bg-[#050505]/90 backdrop-blur-md border border-zinc-700/60 text-[11px] font-bold text-amber-400 flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{movie.voteAverage.toFixed(1)}</span>
          </div>

          {/* Genre Badge */}
          {movie.genres?.[0] && (
            <div className="px-2 py-0.5 rounded-lg bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 text-[10px] font-semibold text-zinc-300">
              {movie.genres[0]}
            </div>
          )}
        </div>

        {/* Custom Staff Badge if present */}
        {movie.customBadge && (
          <div className="absolute top-9 left-2.5 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-orange-500 text-black shadow-md shadow-orange-500/30">
              {movie.customBadge}
            </span>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 gap-2">
          
          {movie.trailerKey && (
            <button
              id={`trailer-btn-${movie.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onPlayTrailer(movie);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs transition-colors shadow-md shadow-orange-500/25 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              Watch Trailer
            </button>
          )}

          <button
            id={`details-btn-${movie.id}`}
            onClick={() => onSelectMovie(movie)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-800/95 hover:bg-zinc-700 text-white font-medium text-xs transition-colors border border-zinc-700 cursor-pointer shadow-sm"
          >
            <Info className="w-3.5 h-3.5 text-zinc-300" />
            Cast & Synopsis
          </button>

        </div>
      </div>

      {/* Card Body Info */}
      <div 
        onClick={() => onSelectMovie(movie)} 
        className="p-3.5 flex-1 flex flex-col justify-between cursor-pointer"
      >
        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-500" />
              {year || 'Movie'}
            </span>
            <span className="truncate max-w-[120px] text-zinc-400">
              {movie.genres?.slice(0, 2).join(', ')}
            </span>
          </div>

          <h3 className="text-sm font-bold text-zinc-100 group-hover:text-orange-400 transition-colors line-clamp-1 font-['Outfit']">
            {movie.title}
          </h3>

          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
            {movie.overview}
          </p>
        </div>
      </div>
    </div>
  );
};
