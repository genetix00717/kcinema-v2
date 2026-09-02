import React from 'react';
import { MOVIE_GENRES } from '../data/genres';

interface GenreFilterBarProps {
  selectedGenreId: number | null;
  onSelectGenre: (genreId: number | null) => void;
}

export const GenreFilterBar: React.FC<GenreFilterBarProps> = ({
  selectedGenreId,
  onSelectGenre,
}) => {
  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max px-1">
        <button
          id="genre-all-btn"
          onClick={() => onSelectGenre(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedGenreId === null
              ? 'bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)] font-extrabold'
              : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
          }`}
        >
          🌟 All Categories
        </button>

        {MOVIE_GENRES.map((g) => {
          const isSelected = selectedGenreId === g.id;
          return (
            <button
              key={g.id}
              id={`genre-btn-${g.id}`}
              onClick={() => onSelectGenre(isSelected ? null : g.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)] font-extrabold'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              <span>{g.emoji}</span>
              <span>{g.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
