import React, { useState, useMemo } from 'react';
import { PlayCircle, Star, Calendar, User, Film, PlusCircle, Sparkles, Filter, ExternalLink, Play, Search, X } from 'lucide-react';
import { MoviePost } from '../types';

interface WatchMoviesSectionProps {
  posts: MoviePost[];
  onSelectPost: (post: MoviePost) => void;
  onOpenAdmin: () => void;
}

export const WatchMoviesSection: React.FC<WatchMoviesSectionProps> = ({
  posts,
  onSelectPost,
  onOpenAdmin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>(['All']);
    posts.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = !searchFilter || 
        p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchFilter.toLowerCase())) ||
        p.htmlContent.toLowerCase().includes(searchFilter.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [posts, selectedCategory, searchFilter]);

  return (
    <section id="watch-movies-section" className="py-10 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
              <PlayCircle className="w-3.5 h-3.5" />
              Watch Movies & Reviews
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
              Curated Cinema Hub
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Watch featured movies, official trailers, and read exclusive editorial reviews and cinematic commentary.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-zinc-900/50 p-2.5 rounded-2xl border border-zinc-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-black shadow-md font-bold'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Filter Posts Search Input */}
            <div className="relative flex items-center min-w-[180px] sm:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter watch posts..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2 text-zinc-400 hover:text-white p-0.5"
                  title="Clear filter"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="text-xs text-zinc-400 font-medium px-2 whitespace-nowrap hidden md:block">
              Showing <strong className="text-white">{filteredPosts.length}</strong> of {posts.length} Posts
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800/80">
            <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-200">No Movie Posts Found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {searchFilter
                ? `No watch posts match "${searchFilter}". Try a different keyword.`
                : 'No movie posts match your selected filter. Please check back later.'}
            </p>
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-orange-400 text-xs font-semibold cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                id={`watch-post-${post.id}`}
                onClick={() => onSelectPost(post)}
                className="group relative bg-[#0e0e11] rounded-2xl border border-zinc-800/80 overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] cursor-pointer flex flex-col"
              >
                {/* Poster & Play Overlay */}
                <div className="relative aspect-[16/10] sm:aspect-[3/4] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={post.posterUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    {post.category && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-black/80 backdrop-blur-md text-orange-400 border border-orange-500/30">
                        {post.category}
                      </span>
                    )}
                    {post.rating !== undefined && (
                      <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-amber-500/90 text-black flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-black" />
                        {post.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Play Button Icon in Center */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-orange-500 text-black flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.6)] transform scale-90 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                  </div>

                  {post.featured && (
                    <div className="absolute bottom-2 left-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-500 text-black">
                        Featured Post
                      </span>
                    </div>
                  )}
                </div>

                {/* Post Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base font-['Outfit'] group-hover:text-orange-400 transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1.5">
                      {post.releaseDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          {post.releaseDate.split('-')[0]}
                        </span>
                      )}
                      {post.author && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-zinc-500" />
                          {post.author}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-orange-400 font-bold group-hover:underline flex items-center gap-1">
                      Watch & Read <PlayCircle className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-zinc-500 text-[11px]">
                      Interactive Review
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
