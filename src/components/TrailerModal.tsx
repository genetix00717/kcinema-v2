import React from 'react';
import { X, Film, ExternalLink } from 'lucide-react';
import { Movie } from '../types';

interface TrailerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ movie, onClose }) => {
  if (!movie) return null;

  const trailerKey = movie.trailerKey;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div 
        id="trailer-modal"
        className="relative z-10 w-full max-w-4xl bg-[#0e0e11] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#050505]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 font-['Outfit']">
                {movie.title} - Official Trailer
              </h3>
              <p className="text-[11px] text-zinc-400">{movie.genres.join(', ')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          {trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
              title={`${movie.title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Film className="w-12 h-12 text-zinc-600" />
              <p className="text-sm text-zinc-300 font-medium">
                Direct video stream not attached yet.
              </p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-extrabold transition-colors inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.35)]"
              >
                Search on YouTube <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#050505] text-xs text-zinc-400 flex items-center justify-between border-t border-zinc-800/80">
          <span className="truncate max-w-[70%]">{movie.overview}</span>
          <span className="text-orange-400 font-bold shrink-0">★ {movie.voteAverage.toFixed(1)}/10</span>
        </div>
      </div>
    </div>
  );
};
