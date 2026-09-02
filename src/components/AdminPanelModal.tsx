import React, { useState, useEffect } from 'react';
import { 
  X, Lock, ShieldCheck, Key, Plus, Trash2, Edit2, Eye, 
  Save, RefreshCw, Film, Play, Image, Code, Sparkles, 
  CheckCircle2, AlertCircle, LogOut, Search, ExternalLink,
  Bold, Italic, Heading2, Heading3, Quote, List, Link as LinkIcon,
  Copy, Check, Globe
} from 'lucide-react';
import { MoviePost, AdminSettings, Movie } from '../types';
import { createPost, updatePost, deletePost, parseVideoSource } from '../services/postService';
import { saveAdminSettings } from '../services/movieService';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: MoviePost[];
  onRefreshPosts: () => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
  initialEditPost?: MoviePost | null;
  onOpenNetlifyGuide?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  posts,
  onRefreshPosts,
  adminSettings,
  onUpdateAdminSettings,
  initialEditPost,
  onOpenNetlifyGuide
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('kcinema_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'posts' | 'create' | 'settings'>('posts');

  // Form State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formPosterUrl, setFormPosterUrl] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formHtmlContent, setFormHtmlContent] = useState('');
  const [formCategory, setFormCategory] = useState('Sci-Fi & Action');
  const [formRating, setFormRating] = useState<number>(8.5);
  const [formReleaseDate, setFormReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAuthor, setFormAuthor] = useState('K Cinema Admin');
  const [formFeatured, setFormFeatured] = useState(false);

  // HTML Compose Toolbar Preview Mode
  const [previewHtml, setPreviewHtml] = useState(false);

  // TMDB Autocomplete search in Admin
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
  const [tmdbSearchResults, setTmdbSearchResults] = useState<any[]>([]);
  const [tmdbSearching, setTmdbSearching] = useState(false);

  // Settings tab
  const [apiKeyInput, setApiKeyInput] = useState(adminSettings.tmdbApiKey || '');
  const [newPassword, setNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize editing post if provided
  useEffect(() => {
    if (initialEditPost) {
      loadPostIntoForm(initialEditPost);
      setActiveTab('create');
    }
  }, [initialEditPost]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('kcinema_admin_auth', 'true');
        setPasswordInput('');
      } else {
        // Direct password check fallback for offline
        if (passwordInput === 'admin' || passwordInput === adminSettings.adminPassword) {
          setIsAuthenticated(true);
          localStorage.setItem('kcinema_admin_auth', 'true');
        } else {
          setAuthError(data.error || 'Incorrect password. Default is "admin"');
        }
      }
    } catch {
      if (passwordInput === 'admin' || passwordInput === adminSettings.adminPassword) {
        setIsAuthenticated(true);
        localStorage.setItem('kcinema_admin_auth', 'true');
      } else {
        setAuthError('Incorrect password. Default is "admin"');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('kcinema_admin_auth');
  };

  // Load post into form for editing
  const loadPostIntoForm = (post: MoviePost) => {
    setEditingPostId(post.id);
    setFormTitle(post.title);
    setFormPosterUrl(post.posterUrl);
    setFormVideoUrl(post.videoUrl);
    setFormHtmlContent(post.htmlContent);
    setFormCategory(post.category || 'General');
    setFormRating(post.rating || 8.0);
    setFormReleaseDate(post.releaseDate || new Date().toISOString().split('T')[0]);
    setFormAuthor(post.author || 'K Cinema Admin');
    setFormFeatured(Boolean(post.featured));
    setActiveTab('create');
  };

  // Reset form
  const resetForm = () => {
    setEditingPostId(null);
    setFormTitle('');
    setFormPosterUrl('');
    setFormVideoUrl('');
    setFormHtmlContent('');
    setFormCategory('Action & Sci-Fi');
    setFormRating(8.5);
    setFormReleaseDate(new Date().toISOString().split('T')[0]);
    setFormAuthor('K Cinema Admin');
    setFormFeatured(false);
    setPreviewHtml(false);
  };

  // Save Post (Create or Update)
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a movie title' });
      return;
    }

    try {
      if (editingPostId) {
        await updatePost(editingPostId, {
          title: formTitle,
          posterUrl: formPosterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
          videoUrl: formVideoUrl,
          htmlContent: formHtmlContent || '<p>Movie synopsis & review...</p>',
          category: formCategory,
          rating: Number(formRating),
          releaseDate: formReleaseDate,
          author: formAuthor,
          featured: formFeatured
        });
        setStatusMessage({ type: 'success', text: 'Movie post updated successfully!' });
      } else {
        await createPost({
          title: formTitle,
          posterUrl: formPosterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
          videoUrl: formVideoUrl,
          htmlContent: formHtmlContent || '<p>Movie synopsis & review...</p>',
          category: formCategory,
          rating: Number(formRating),
          releaseDate: formReleaseDate,
          author: formAuthor,
          featured: formFeatured
        });
        setStatusMessage({ type: 'success', text: 'New movie post published to server!' });
      }

      onRefreshPosts();
      resetForm();
      setActiveTab('posts');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save post' });
    }
  };

  // Delete Post
  const handleDeletePost = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deletePost(id);
      onRefreshPosts();
      setStatusMessage({ type: 'success', text: `Deleted "${title}"` });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // TMDB Quick Search Helper
  const handleTmdbSearch = async () => {
    if (!tmdbSearchQuery.trim()) return;
    setTmdbSearching(true);
    try {
      const apiKey = adminSettings.tmdbApiKey || '4e44d9029b1270a757cddc766a1bcb63'; // fallback demo key if none
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(tmdbSearchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setTmdbSearchResults(data.results?.slice(0, 5) || []);
      }
    } catch {
      setTmdbSearchResults([]);
    } finally {
      setTmdbSearching(false);
    }
  };

  const applyTmdbMovieToForm = async (m: any) => {
    setFormTitle(m.title + (m.release_date ? ` (${m.release_date.split('-')[0]})` : ''));
    if (m.poster_path) {
      setFormPosterUrl(`https://image.tmdb.org/t/p/w780${m.poster_path}`);
    }
    setFormReleaseDate(m.release_date || new Date().toISOString().split('T')[0]);
    setFormRating(Number((m.vote_average || 8.0).toFixed(1)));
    
    // Auto-generate starting HTML template
    setFormHtmlContent(`
      <h2>About ${m.title}</h2>
      <p>${m.overview || 'Synopsis coming soon.'}</p>
      
      <div class="my-4 p-4 rounded-xl bg-orange-950/30 border border-orange-500/30">
        <h4 class="font-bold text-orange-400">Movie Information</h4>
        <ul class="list-disc list-inside mt-2 text-sm text-zinc-300 space-y-1">
          <li><strong>Release Date:</strong> ${m.release_date || 'N/A'}</li>
          <li><strong>Vote Average:</strong> ${m.vote_average || 'N/A'} / 10 (${m.vote_count || 0} votes)</li>
        </ul>
      </div>

      <h3>Review & Verdict</h3>
      <p>Add your custom in-depth critique and commentary here...</p>
    `);

    // Try fetching YouTube trailer key for this TMDB movie
    try {
      const apiKey = adminSettings.tmdbApiKey || '4e44d9029b1270a757cddc766a1bcb63';
      const vRes = await fetch(`https://api.themoviedb.org/3/movie/${m.id}/videos?api_key=${apiKey}`);
      if (vRes.ok) {
        const vData = await vRes.json();
        const trailer = vData.results?.find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
        if (trailer) {
          setFormVideoUrl(`https://www.youtube.com/watch?v=${trailer.key}`);
        }
      }
    } catch {}

    setTmdbSearchResults([]);
    setTmdbSearchQuery('');
  };

  // Helper for inserting HTML tags in compose view
  const insertHtmlTag = (tagOpen: string, tagClose: string = '') => {
    const textarea = document.getElementById('compose-html-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = tagOpen + (selectedText || 'text') + tagClose;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setFormHtmlContent(newText);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...adminSettings,
      tmdbApiKey: apiKeyInput.trim(),
    };
    if (newPassword) {
      updated.adminPassword = newPassword;
      try {
        await fetch('/api/admin/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword: 'admin', newPassword })
        });
      } catch {}
    }
    saveAdminSettings(updated);
    onUpdateAdminSettings(updated);
    setStatusMessage({ type: 'success', text: 'Admin settings saved successfully!' });
    setNewPassword('');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div 
        id="admin-panel-container"
        className="relative z-10 w-full max-w-5xl bg-[#0e0e11] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-zinc-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-orange-950/30 via-[#0e0e11] to-[#0e0e11]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold shadow-[0_0_15px_rgba(249,115,22,0.25)]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white font-['Outfit']">
                  K Cinema Admin Panel
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-orange-500 text-black">
                  Server Storage
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Manage movie posts, video embeds, rich HTML articles, and TMDB configurations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Logout from Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800' : 'bg-rose-950/80 text-rose-300 border-b border-rose-800'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Login Screen if NOT authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full my-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto shadow-[0_0_25px_rgba(249,115,22,0.2)]">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-['Outfit']">Admin Authentication</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your admin password to access post publishing and settings.
              </p>
              <div className="mt-2 inline-block px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
                Default Password: <code className="text-orange-400 font-bold">admin</code>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password..."
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-center tracking-widest"
                />
              </div>

              {authError && (
                <p className="text-xs text-rose-400 font-medium">{authError}</p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.35)] cursor-pointer"
              >
                {authLoading ? 'Verifying...' : 'Unlock Admin Dashboard'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="grid grid-cols-3 border-b border-zinc-800 bg-[#050505]/60">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer font-['Outfit'] flex items-center justify-center gap-2 ${
                  activeTab === 'posts'
                    ? 'border-orange-500 bg-orange-950/20 text-orange-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Manage Posts ({posts.length})</span>
              </button>

              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('create');
                }}
                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer font-['Outfit'] flex items-center justify-center gap-2 ${
                  activeTab === 'create'
                    ? 'border-orange-500 bg-orange-950/20 text-orange-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{editingPostId ? 'Edit Movie Post' : 'Create New Post'}</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer font-['Outfit'] flex items-center justify-center gap-2 ${
                  activeTab === 'settings'
                    ? 'border-orange-500 bg-orange-950/20 text-orange-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>Settings & API</span>
              </button>
            </div>

            {/* Secret Link Notice Banner */}
            <div className="bg-orange-950/25 border-b border-orange-500/20 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                <span>
                  <strong>Secret Admin URL:</strong> All public admin/hosting buttons are hidden. Access via{' '}
                  <code className="px-1.5 py-0.5 rounded bg-black/60 border border-orange-500/30 text-orange-400 font-mono text-[11px]">
                    /#admin
                  </code>
                </span>
              </div>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/#admin`;
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-orange-400" />
                    <span>Copy Secret Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Main Content Area */}
            <div className="overflow-y-auto p-4 sm:p-6 flex-1">
              
              {/* TAB 1: MANAGE POSTS */}
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white font-['Outfit']">Published Movie Posts</h3>
                      <p className="text-xs text-zinc-400">All posts saved in persistent server storage.</p>
                    </div>
                    <button
                      onClick={() => {
                        resetForm();
                        setActiveTab('create');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" /> Add Movie Post
                    </button>
                  </div>

                  {posts.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-zinc-800">
                      <Film className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                      <p className="text-sm text-zinc-400 font-medium">No posts published yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="p-3 sm:p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between gap-4 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={post.posterUrl}
                              alt={post.title}
                              className="w-12 h-16 object-cover rounded-lg bg-zinc-900 shrink-0 border border-zinc-800"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white truncate font-['Outfit']">
                                  {post.title}
                                </h4>
                                {post.featured && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                                <span>{post.category || 'General'}</span>
                                <span>•</span>
                                <span className="text-amber-400 font-semibold">★ {post.rating?.toFixed(1) || '8.0'}</span>
                                <span>•</span>
                                <span>{post.releaseDate?.split('-')[0] || '2024'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => loadPostIntoForm(post)}
                              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                              title="Edit Post"
                            >
                              <Edit2 className="w-4 h-4 text-orange-400" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id, post.title)}
                              className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors cursor-pointer"
                              title="Delete Post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CREATE / EDIT POST */}
              {activeTab === 'create' && (
                <form onSubmit={handleSavePost} className="space-y-6">
                  
                  {/* TMDB Quick Autofill Helper */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-wider font-['Outfit'] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Quick TMDB Auto-Fill Helper
                      </span>
                      <span className="text-[11px] text-zinc-500">Search TMDB to auto-populate title, poster & trailer</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tmdbSearchQuery}
                        onChange={(e) => setTmdbSearchQuery(e.target.value)}
                        placeholder="Search movie title (e.g., Gladiator 2, Inception)..."
                        className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleTmdbSearch();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleTmdbSearch}
                        disabled={tmdbSearching}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors cursor-pointer"
                      >
                        {tmdbSearching ? 'Searching...' : 'Search'}
                      </button>
                    </div>

                    {tmdbSearchResults.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-900">
                        {tmdbSearchResults.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => applyTmdbMovieToForm(m)}
                            className="p-2 rounded-xl bg-zinc-900 hover:bg-orange-950/30 border border-zinc-800 hover:border-orange-500/50 flex items-center gap-2.5 cursor-pointer transition-all"
                          >
                            <img
                              src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : 'https://via.placeholder.com/92x138'}
                              alt={m.title}
                              className="w-8 h-12 object-cover rounded bg-black shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-white truncate">{m.title}</h5>
                              <p className="text-[10px] text-zinc-400">{m.release_date?.split('-')[0] || 'N/A'} • ★ {m.vote_average?.toFixed(1) || '0'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Main Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Field 1: Movie Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-200">
                        Movie Title <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Dune: Part Two (2024)"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Field 2: Poster Image URL */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-200">
                        Poster Image URL <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="url"
                        value={formPosterUrl}
                        onChange={(e) => setFormPosterUrl(e.target.value)}
                        placeholder="https://image.tmdb.org/t/p/w780/..."
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Field 3: Video URL or Embedding */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                        <span>Video URL or Embedding (YouTube, Vimeo, MP4, or &lt;iframe&gt;)</span>
                        <span className="text-[11px] text-zinc-500 font-normal">Supports full iframe embed codes</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formVideoUrl}
                        onChange={(e) => setFormVideoUrl(e.target.value)}
                        placeholder="e.g. https://www.youtube.com/watch?v=Way9Dexny3w OR <iframe src='...'></iframe>"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Metadata columns */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-200">Category / Genre</label>
                      <input
                        type="text"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        placeholder="e.g. Action, Sci-Fi, Featured Review"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-200">Rating (0 - 10)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={formRating}
                          onChange={(e) => setFormRating(parseFloat(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-200">Release Date</label>
                        <input
                          type="date"
                          value={formReleaseDate}
                          onChange={(e) => setFormReleaseDate(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-200">Author / Reviewer</label>
                      <input
                        type="text"
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        placeholder="K Cinema Admin"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="form-featured-checkbox"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 bg-zinc-900 border-zinc-700"
                      />
                      <label htmlFor="form-featured-checkbox" className="text-xs font-bold text-zinc-200 cursor-pointer">
                        Pin as Featured Post in "Watch Movies"
                      </label>
                    </div>

                  </div>

                  {/* Field 4: HTML Compose View */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-orange-400" />
                        <span>HTML Compose View (Rich Review & Article Content)</span>
                      </label>

                      {/* Toggle Preview Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewHtml(!previewHtml)}
                        className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-orange-400" />
                        <span>{previewHtml ? 'Edit HTML' : 'Live HTML Preview'}</span>
                      </button>
                    </div>

                    {/* Compose Quick Toolbar */}
                    {!previewHtml && (
                      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-t-xl bg-zinc-900 border border-b-0 border-zinc-700 text-xs">
                        <button
                          type="button"
                          onClick={() => insertHtmlTag('<h2>', '</h2>')}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                          title="Heading 2"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlTag('<h3>', '</h3>')}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                          title="Heading 3"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlTag('<strong>', '</strong>')}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                          title="Bold"
                        >
                          <Bold className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlTag('<em>', '</em>')}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                          title="Italic"
                        >
                          <Italic className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlTag('<blockquote class="border-l-4 border-orange-500 pl-4 my-4 italic text-zinc-300">', '</blockquote>')}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                          title="Blockquote"
                        >
                          <Quote className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlTag('<ul class="list-disc list-inside mt-2 space-y-1"><li>', '</li></ul>')}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                          title="Bullet List"
                        >
                          <List className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlTag('<div class="my-4 p-4 rounded-xl bg-orange-950/30 border border-orange-500/40">', '</div>')}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-orange-400 font-bold"
                          title="Callout Box"
                        >
                          Box
                        </button>
                      </div>
                    )}

                    {previewHtml ? (
                      <div className="p-5 rounded-xl bg-[#050505] border border-zinc-700 min-h-[220px]">
                        <div 
                          className="prose prose-invert max-w-none prose-orange"
                          dangerouslySetInnerHTML={{ __html: formHtmlContent || '<p className="text-zinc-500">No HTML content yet.</p>' }}
                        />
                      </div>
                    ) : (
                      <textarea
                        id="compose-html-textarea"
                        rows={8}
                        value={formHtmlContent}
                        onChange={(e) => setFormHtmlContent(e.target.value)}
                        placeholder="Write your HTML article, synopsis, review, download notes, or custom markup here..."
                        className="w-full px-3.5 py-3 rounded-b-xl bg-zinc-950 border border-zinc-700 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-orange-500 leading-relaxed"
                      />
                    )}
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
                    >
                      Reset Form
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('posts')}
                        className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] cursor-pointer flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingPostId ? 'Update Movie Post' : 'Publish to Server'}</span>
                      </button>
                    </div>
                  </div>

                </form>
              )}

              {/* TAB 3: SETTINGS & TMDB API */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
                  
                  {/* TMDB API Key Section */}
                  <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 font-['Outfit']">
                      <Key className="w-4 h-4 text-orange-400" />
                      TMDB Public Movie API Key
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Enter your free TMDB API key to dynamically fetch thousands of movies, live posters, trailers, and cast credits.
                    </p>
                    <input
                      type="text"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Paste TMDB v3 API Key..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                    />
                    <div className="text-[11px] text-zinc-500">
                      Need a free key? Get one in 2 minutes at{' '}
                      <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline">
                        themoviedb.org
                      </a>
                    </div>
                  </div>

                  {/* Change Password Section */}
                  <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 font-['Outfit']">
                      <Lock className="w-4 h-4 text-orange-400" />
                      Change Admin Password
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Update the password used to unlock this Admin Panel.
                    </p>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new admin password (optional)..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Netlify & Custom Domain Reference */}
                  {onOpenNetlifyGuide && (
                    <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 font-['Outfit']">
                          <Globe className="w-4 h-4 text-orange-400" />
                          Netlify & Custom Domain Guide
                        </h4>
                        <button
                          type="button"
                          onClick={onOpenNetlifyGuide}
                          className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-orange-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Open Guide</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-400">
                        View DNS setup instructions for connecting your own custom domain (e.g. www.yourcinema.com) on Netlify.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Configuration
                  </button>
                </form>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};
