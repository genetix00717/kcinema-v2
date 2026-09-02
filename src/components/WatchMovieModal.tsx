import React, { useEffect, useState } from 'react';
import { X, Play, Star, Calendar, User, Tag, Share2, Check, Film, Edit3 } from 'lucide-react';
import { MoviePost } from '../types';
import { parseVideoSource } from '../services/postService';

interface WatchMovieModalProps {
  post: MoviePost | null;
  onClose: () => void;
  onEditPost?: (post: MoviePost) => void;
}

export const WatchMovieModal: React.FC<WatchMovieModalProps> = ({
  post,
  onClose,
  onEditPost
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!post) return null;

  const parsedVideo = parseVideoSource(post.videoUrl);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div 
        id="watch-movie-modal-content"
        className="relative z-10 w-full max-w-4xl bg-[#0e0e11] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-zinc-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-zinc-800 flex items-center justify-between bg-[#08080a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit'] line-clamp-1">
                {post.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                {post.category && <span className="text-orange-400">{post.category}</span>}
                {post.releaseDate && <span>• {post.releaseDate.split('-')[0]}</span>}
                {post.rating && (
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    • <Star className="w-3 h-3 fill-amber-400" /> {post.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEditPost && (
              <button
                onClick={() => {
                  onClose();
                  onEditPost(post);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Edit this post in Admin Panel"
              >
                <Edit3 className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">Edit Post</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Share Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Video Player Section */}
          <div className="rounded-2xl overflow-hidden bg-black border border-zinc-800 aspect-video w-full shadow-2xl relative">
            {parsedVideo.type === 'youtube' || parsedVideo.type === 'vimeo' ? (
              <iframe
                src={parsedVideo.src}
                title={post.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : parsedVideo.type === 'embed' && parsedVideo.rawIframe ? (
              <div 
                className="w-full h-full flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                dangerouslySetInnerHTML={{ __html: parsedVideo.rawIframe }}
              />
            ) : parsedVideo.src ? (
              <video
                src={parsedVideo.src}
                controls
                autoPlay
                className="w-full h-full object-contain"
                poster={post.posterUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500">
                <Play className="w-12 h-12 text-zinc-700 mb-2" />
                <p className="text-sm font-medium">No video source provided for this post.</p>
              </div>
            )}
          </div>

          {/* Post Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-500 block mb-0.5">Rating</span>
              <span className="font-bold text-amber-400 flex items-center gap-1 text-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {post.rating ? `${post.rating.toFixed(1)} / 10` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Category</span>
              <span className="font-bold text-white text-sm">{post.category || 'Cinema'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Release Date</span>
              <span className="font-bold text-white text-sm">{post.releaseDate || '2024'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Author / Reviewer</span>
              <span className="font-bold text-orange-400 text-sm">{post.author || 'K Cinema Staff'}</span>
            </div>
          </div>

          {/* HTML Compose View / Article Content */}
          <div className="bg-[#050505] p-5 sm:p-7 rounded-2xl border border-zinc-800/90">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-800 text-xs font-bold uppercase tracking-wider text-orange-400 font-['Outfit']">
              <span>Full Review & Movie Synopsis</span>
            </div>
            
            {/* HTML Rendered Safely */}
            <div 
              id="post-html-content"
              className="prose prose-invert max-w-none prose-orange prose-p:text-zinc-300 prose-p:leading-relaxed prose-headings:font-['Outfit'] prose-headings:text-white prose-h2:text-xl prose-h2:font-bold prose-h3:text-lg prose-h3:font-semibold prose-a:text-orange-400 prose-strong:text-white prose-blockquote:border-orange-500 prose-blockquote:text-zinc-300 prose-ul:text-zinc-300"
              dangerouslySetInnerHTML={{ __html: post.htmlContent || '<p>No written review provided.</p>' }}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#08080a] flex items-center justify-between text-xs text-zinc-500">
          <span>Published on K Cinema</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
