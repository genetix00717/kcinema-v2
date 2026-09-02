import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Play, 
  User, 
  Clock, 
  Calendar, 
  DollarSign, 
  Film, 
  Check, 
  Share2,
  Tag
} from 'lucide-react';
import { Movie, CastMember } from '../types';

interface MovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
  onPlayTrailer: (movie: Movie) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onPlayTrailer,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cast'>('overview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (movie) {
      setActiveTab('overview');
    }
  }, [movie]);

  if (!movie) return null;

  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '2024';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div 
        id="movie-details-modal"
        className="relative z-10 w-full max-w-4xl bg-[#0e0e11] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-zinc-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Hero Backdrop */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-[#050505] shrink-0">
          {movie.backdropPath ? (
            <img
              src={movie.backdropPath}
              alt={movie.title}
              className="w-full h-full object-cover object-top opacity-35 filter contrast-105"
            />
          ) : (
            <div className="w-full h-full bg-[#050505] flex items-center justify-center text-zinc-600">
              <Film className="w-16 h-16" />
            </div>
          )}

          {/* Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-[#0e0e11]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e11]/90 via-transparent to-transparent" />

          {/* Top Control Bar */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
              title="Copy share link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Poster & Main Header info */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 flex items-end gap-4 z-10">
            {/* Poster thumbnail */}
            <div className="hidden sm:block w-24 sm:w-32 rounded-2xl overflow-hidden shadow-2xl border-2 border-zinc-700 shrink-0 bg-[#050505] aspect-[2/3]">
              {movie.posterPath ? (
                <img src={movie.posterPath} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">No Poster</div>
              )}
            </div>

            {/* Title & Stats */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {movie.customBadge && (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-orange-500 text-black shadow-md">
                    {movie.customBadge}
                  </span>
                )}
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#050505]/90 border border-zinc-700 text-xs font-bold text-amber-400 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{movie.voteAverage.toFixed(1)} / 10</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit'] truncate">
                {movie.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 font-medium">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-zinc-400" />{year}</span>
                {movie.runtime && (
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-400" />{movie.runtime} mins</span>
                )}
                {movie.director && (
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-zinc-400" />Dir. {movie.director}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {movie.genres?.map((g) => (
                  <span key={g} className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-700/60">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 border-b border-zinc-800 flex items-center justify-between gap-2 bg-[#08080a] shrink-0">
          <div className="flex items-center gap-2 py-2">
            <button
              id="tab-overview"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer font-['Outfit'] ${
                activeTab === 'overview'
                  ? 'bg-orange-500 text-black font-extrabold shadow-[0_0_12px_rgba(249,115,22,0.35)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Overview & Details
            </button>

            <button
              id="tab-cast"
              onClick={() => setActiveTab('cast')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer font-['Outfit'] ${
                activeTab === 'cast'
                  ? 'bg-orange-500 text-black font-extrabold shadow-[0_0_12px_rgba(249,115,22,0.35)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Cast & Crew ({movie.cast?.length || 0})
            </button>
          </div>

          {movie.trailerKey && (
            <button
              id="modal-play-trailer-btn"
              onClick={() => onPlayTrailer(movie)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-extrabold transition-all shrink-0 cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.35)]"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              Watch Trailer
            </button>
          )}
        </div>

        {/* Tab Body Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* 1. Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Plot Summary */}
              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 font-['Outfit']">
                  <Film className="w-4 h-4 text-orange-400" />
                  Plot Summary
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed bg-[#050505] p-4 rounded-2xl border border-zinc-800/80">
                  {movie.overview || 'No synopsis provided for this movie.'}
                </p>
              </div>

              {/* Extra Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#050505] border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block mb-1">Director</span>
                  <span className="text-xs font-bold text-zinc-200">{movie.director || 'N/A'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#050505] border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block mb-1">Release Date</span>
                  <span className="text-xs font-bold text-zinc-200">{movie.releaseDate || 'N/A'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#050505] border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block mb-1">Budget</span>
                  <span className="text-xs font-bold text-zinc-200">
                    {movie.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : 'N/A'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#050505] border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block mb-1">Box Office Revenue</span>
                  <span className="text-xs font-bold text-zinc-200">
                    {movie.revenue ? `$${(movie.revenue / 1000000).toFixed(1)}M` : 'N/A'}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* 2. Cast Tab */}
          {activeTab === 'cast' && (
            <div>
              <h3 className="text-base font-bold text-white mb-4 font-['Outfit']">Cast Members & Characters</h3>
              {movie.cast && movie.cast.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {movie.cast.map((actor: CastMember) => (
                    <div
                      key={actor.id || actor.name}
                      className="p-3 rounded-2xl bg-[#050505] border border-zinc-800 flex items-center gap-3 hover:border-zinc-700 transition-colors"
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                        {actor.profilePath ? (
                          <img src={actor.profilePath} alt={actor.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold text-xs">
                            {actor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-zinc-100 truncate font-['Outfit']">{actor.name}</h4>
                        <p className="text-[11px] text-zinc-400 truncate">{actor.character || 'Cast'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 text-sm bg-zinc-950 rounded-2xl border border-zinc-800">
                  Cast details will be retrieved from the live TMDB public registry.
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
