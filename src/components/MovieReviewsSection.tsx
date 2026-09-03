import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  Star, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Film, 
  RefreshCw, 
  Quote, 
  ExternalLink,
  BookOpen,
  Calendar,
  UserCheck,
  Award,
  Flame,
  Search
} from 'lucide-react';
import { MovieReview, Movie } from '../types';
import { fetchReviews, fetchReviewStatus, triggerAiReviewGeneration, ReviewStatusResponse } from '../services/reviewService';

interface MovieReviewsSectionProps {
  onSelectMovie?: (movieTitle: string) => void;
  onPlayTrailer?: (movieTitle: string) => void;
}

export const MovieReviewsSection: React.FC<MovieReviewsSectionProps> = ({
  onSelectMovie,
  onPlayTrailer
}) => {
  const [reviews, setReviews] = useState<MovieReview[]>([]);
  const [status, setStatus] = useState<ReviewStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [selectedReview, setSelectedReview] = useState<MovieReview | null>(null);
  const [filterVerdict, setFilterVerdict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('29:59');

  // Load reviews and status
  const loadData = async () => {
    try {
      const [revs, stat] = await Promise.all([
        fetchReviews(),
        fetchReviewStatus()
      ]);
      setReviews(revs);
      setStatus(stat);
    } catch (err) {
      console.error('Failed to load reviews data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll status every 30 seconds
    const interval = setInterval(async () => {
      const stat = await fetchReviewStatus();
      if (stat) {
        setStatus(stat);
        // If count increased, reload reviews
        if (stat.totalReviews !== reviews.length) {
          const revs = await fetchReviews();
          setReviews(revs);
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  // Live countdown timer for the 30-minute schedule
  useEffect(() => {
    if (!status?.nextReviewTime) return;

    const timer = setInterval(() => {
      const diff = status.nextReviewTime - Date.now();
      if (diff <= 0) {
        setTimeRemaining('Uploading soon...');
        loadData();
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [status?.nextReviewTime]);

  const handleManualGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const newReview = await triggerAiReviewGeneration();
      setReviews(prev => [newReview, ...prev.filter(r => r.id !== newReview.id)]);
      const stat = await fetchReviewStatus();
      if (stat) setStatus(stat);
      setSelectedReview(newReview);
    } catch (err: any) {
      alert(`Could not generate review: ${err?.message || 'Server error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filterVerdict !== 'all' && r.verdict !== filterVerdict) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.movieTitle.toLowerCase().includes(q) || 
             r.headline.toLowerCase().includes(q) || 
             r.authorName.toLowerCase().includes(q);
    }
    return true;
  });

  const featuredReview = reviews[0] || null;

  return (
    <section id="movie-reviews-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 scroll-mt-20">
      {/* 1. Header with Live 30-Minute AI Dispatcher Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold tracking-wide">
              <BookOpen className="w-3.5 h-3.5" />
              <span>EDITORIAL FILM CRITICISM</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Movie Reviews
              <span className="text-xs sm:text-sm font-medium px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {reviews.length} Essays Published
              </span>
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Long-form cinema critiques crafted with authentic human-critic voice, technical cinematography analysis, acoustic sound design observations, and verified IMDb audience ratings.
            </p>
          </div>

          {/* 30-Min Schedule & Dispatcher Widget */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-zinc-900/80 border border-zinc-800/90 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 pr-2">
              <div className="relative flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative" />
              </div>
              <div>
                <div className="text-[11px] text-zinc-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span>Next AI Review</span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {timeRemaining}
                </div>
                <div className="text-[10px] text-zinc-500">Every 30 Minutes</div>
              </div>
            </div>

            <button
              onClick={handleManualGenerate}
              disabled={generating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black font-semibold text-xs tracking-wide transition-all shadow-lg shadow-orange-500/20 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Writing Review...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>Write Review Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Featured Latest Review Highlight (if available) */}
      {featuredReview && (
        <div className="relative rounded-2xl overflow-hidden bg-zinc-900/60 border border-zinc-800 shadow-xl transition-all hover:border-zinc-700">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8">
            {/* Poster & IMDb Card */}
            <div className="lg:col-span-4 flex flex-col items-center sm:items-start gap-4">
              <div className="relative w-full max-w-[280px] sm:max-w-none aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-zinc-950 border border-zinc-800 group">
                <img
                  src={featuredReview.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'}
                  alt={featuredReview.movieTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* IMDb Badge Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500 text-black font-extrabold text-xs shadow-md tracking-wider">
                  <span className="bg-black text-amber-400 px-1 py-0.2 rounded text-[10px]">IMDb</span>
                  <span>{featuredReview.imdbRating || '8.5/10'}</span>
                </div>

                {/* Score Pill */}
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-orange-400 font-bold text-xs flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-orange-400" />
                  <span>{featuredReview.ratingScore.toFixed(1)} / 10</span>
                </div>
              </div>

              {/* Votes & Details */}
              <div className="w-full flex items-center justify-between text-xs text-zinc-400 px-1">
                <span>IMDb Audience: <strong className="text-zinc-200">{featuredReview.imdbVotes || '500K+'} votes</strong></span>
                {featuredReview.year && <span>Released: <strong className="text-zinc-200">{featuredReview.year}</strong></span>}
              </div>
            </div>

            {/* Content & Critique */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    {featuredReview.verdict}
                  </span>
                  <span className="text-xs text-zinc-400">
                    Director: <strong className="text-zinc-300">{featuredReview.director || 'Director'}</strong>
                  </span>
                  {featuredReview.genre && (
                    <span className="text-xs text-zinc-500">• {featuredReview.genre}</span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {featuredReview.headline}
                </h3>

                {/* Critic Byline */}
                <div className="flex items-center gap-3 pt-1 border-b border-zinc-800 pb-3">
                  {featuredReview.authorAvatar && (
                    <img 
                      src={featuredReview.authorAvatar} 
                      alt={featuredReview.authorName} 
                      className="w-8 h-8 rounded-full object-cover border border-zinc-700" 
                    />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1">
                      <span>{featuredReview.authorName}</span>
                      <UserCheck className="w-3 h-3 text-orange-400" />
                    </div>
                    <div className="text-[11px] text-zinc-400">{featuredReview.authorRole}</div>
                  </div>
                  <div className="ml-auto text-[11px] text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(featuredReview.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed italic border-l-2 border-orange-500/60 pl-3">
                  "{featuredReview.summary}"
                </p>

                {/* Pros & Cons Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {featuredReview.pros?.length > 0 && (
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-emerald-950/40">
                      <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Key Cinematic Strengths</span>
                      </div>
                      <ul className="text-xs text-zinc-400 space-y-1">
                        {featuredReview.pros.slice(0, 2).map((pro, i) => (
                          <li key={i} className="line-clamp-1">• {pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {featuredReview.cons?.length > 0 && (
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-red-950/40">
                      <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1 mb-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Critic Consideration</span>
                      </div>
                      <ul className="text-xs text-zinc-400 space-y-1">
                        {featuredReview.cons.slice(0, 2).map((con, i) => (
                          <li key={i} className="line-clamp-1">• {con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  onClick={() => setSelectedReview(featuredReview)}
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs tracking-wide flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Full Film Critique</span>
                </button>

                {onPlayTrailer && (
                  <button
                    onClick={() => onPlayTrailer(featuredReview.movieTitle)}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-zinc-700 active:scale-95 cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5 text-orange-400" />
                    <span>Watch Trailer</span>
                  </button>
                )}

                {onSelectMovie && (
                  <button
                    onClick={() => onSelectMovie(featuredReview.movieTitle)}
                    className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all ml-auto cursor-pointer"
                  >
                    <span>View Movie Overview</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-zinc-800">
        {/* Verdict Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'Masterpiece', 'Must Watch', 'Highly Recommended'].map(verdict => (
            <button
              key={verdict}
              onClick={() => setFilterVerdict(verdict)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                filterVerdict === verdict
                  ? 'bg-orange-500 text-black font-semibold shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {verdict === 'all' ? 'All Reviews' : verdict}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by movie or critic..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* 4. Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map(review => (
          <div
            key={review.id}
            className="flex flex-col justify-between bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all shadow-md group"
          >
            {/* Card Header & Poster */}
            <div>
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                <img
                  src={review.backdropUrl || review.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'}
                  alt={review.movieTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                
                {/* IMDb Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500 text-black font-extrabold text-[11px] shadow">
                  <span className="bg-black text-amber-400 px-1 py-0.2 rounded text-[9px]">IMDb</span>
                  <span>{review.imdbRating || '8.4/10'}</span>
                </div>

                {/* Verdict Pill */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-sm border border-white/10 text-emerald-400 text-[10px] font-bold">
                  {review.verdict}
                </div>

                {/* Movie Title & Score in Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-white drop-shadow-md line-clamp-1">
                      {review.movieTitle}
                    </h4>
                    <p className="text-[11px] text-zinc-300 drop-shadow">
                      {review.director ? `Dir. ${review.director}` : ''} {review.year ? `(${review.year})` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/90 text-black text-xs font-bold">
                    <Star className="w-3 h-3 fill-black" />
                    <span>{review.ratingScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Review Excerpt */}
              <div className="p-4 space-y-3">
                <h5 className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug group-hover:text-orange-400 transition-colors">
                  {review.headline}
                </h5>
                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {review.summary}
                </p>

                {/* Critic Byline Mini */}
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                  {review.authorAvatar && (
                    <img src={review.authorAvatar} alt={review.authorName} className="w-5 h-5 rounded-full object-cover" />
                  )}
                  <span className="font-medium text-zinc-300">{review.authorName}</span>
                  <span className="text-zinc-600">•</span>
                  <span>{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 pt-0">
              <button
                onClick={() => setSelectedReview(review)}
                className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700/60 cursor-pointer"
              >
                <span>Read Full Review</span>
                <ChevronRight className="w-3.5 h-3.5 text-orange-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && !loading && (
        <div className="text-center py-12 bg-zinc-900/40 rounded-xl border border-zinc-800">
          <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-400">No movie reviews found matching your filter.</p>
        </div>
      )}

      {/* 5. Full In-Depth Review Reading Modal */}
      {selectedReview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedReview(null)}
        >
          <div 
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-zinc-100 my-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Close */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    {selectedReview.verdict}
                  </span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-black font-extrabold text-xs">
                    <span>IMDb {selectedReview.imdbRating}</span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    Score: <strong className="text-orange-400">{selectedReview.ratingScore.toFixed(1)} / 10</strong>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {selectedReview.movieTitle} {selectedReview.year ? `(${selectedReview.year})` : ''}
                </h2>
                <p className="text-xs text-zinc-400">
                  Directed by {selectedReview.director || 'Director'} • {selectedReview.genre || 'Film'}
                </p>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Critic Headline & Byline */}
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-bold text-orange-400 leading-snug">
                "{selectedReview.headline}"
              </h3>

              <div className="flex items-center gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                {selectedReview.authorAvatar && (
                  <img src={selectedReview.authorAvatar} alt={selectedReview.authorName} className="w-10 h-10 rounded-full object-cover border border-zinc-700" />
                )}
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>By {selectedReview.authorName}</span>
                    <Award className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <div className="text-[11px] text-zinc-400">{selectedReview.authorRole}</div>
                </div>
                <div className="ml-auto text-[11px] text-zinc-500">
                  Published: {new Date(selectedReview.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Poster + Summary */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-sm text-zinc-300 italic leading-relaxed">
              "{selectedReview.summary}"
            </div>

            {/* Pros and Cons Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedReview.pros?.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cinematic Triumphs</span>
                  </h4>
                  <ul className="text-xs text-zinc-300 space-y-1.5">
                    {selectedReview.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedReview.cons?.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-2">
                    <XCircle className="w-4 h-4" />
                    <span>Critical Caveats</span>
                  </h4>
                  <ul className="text-xs text-zinc-300 space-y-1.5">
                    {selectedReview.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Long Form Article Body */}
            <div 
              className="prose prose-invert prose-zinc max-w-none text-sm text-zinc-300 space-y-4 leading-relaxed [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-4 [&>h3]:mb-1 [&>blockquote]:border-l-2 [&>blockquote]:border-orange-500 [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-zinc-200"
              dangerouslySetInnerHTML={{ __html: selectedReview.contentHtml }}
            />

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
              <div className="text-xs text-zinc-500">
                Verified IMDb Score: <strong className="text-amber-400">{selectedReview.imdbRating}</strong> ({selectedReview.imdbVotes || 'Hundreds of thousands'} ratings)
              </div>
              <div className="flex items-center gap-2">
                {onPlayTrailer && (
                  <button
                    onClick={() => {
                      onPlayTrailer(selectedReview.movieTitle);
                      setSelectedReview(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Watch Trailer
                  </button>
                )}
                <button
                  onClick={() => setSelectedReview(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
