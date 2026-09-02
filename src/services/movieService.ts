import { Movie, CastMember, AdminSettings } from '../types';
import { FALLBACK_MOVIES } from '../data/fallbackMovies';
import { GENRE_MAP } from '../data/genres';
import { performSmartMovieSearch } from '../utils/searchEngine';

const STORAGE_ADMIN_KEY = 'kcinema_admin_settings_v1';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Default admin settings
export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  tmdbApiKey: '',
  siteTitle: 'K Cinema',
  siteTagline: 'Responsive Movie Information & Streaming Hub',
  adminPassword: 'admin',
  featuredMovieIds: [693134, 872585, 157336],
  hiddenMovieIds: [],
  movieOverrides: {},
  customMovies: []
};

export function getAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_KEY);
    if (!raw) return DEFAULT_ADMIN_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ADMIN_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_ADMIN_SETTINGS;
  }
}

export function saveAdminSettings(settings: AdminSettings): void {
  try {
    localStorage.setItem(STORAGE_ADMIN_KEY, JSON.stringify(settings));
    // Also sync with backend if available
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdbApiKey: settings.tmdbApiKey })
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to save admin settings to localStorage', err);
  }
}

// Convert TMDB raw movie item to internal Movie model
function formatTmdbMovie(raw: any, adminSettings: AdminSettings): Movie {
  const id = raw.id;
  const genres = raw.genres
    ? raw.genres.map((g: any) => g.name || GENRE_MAP[g.id] || 'General')
    : (raw.genre_ids || []).map((gid: number) => GENRE_MAP[gid] || 'General');

  const posterPath = raw.poster_path
    ? (raw.poster_path.startsWith('http') ? raw.poster_path : `${TMDB_IMAGE_BASE}/w500${raw.poster_path}`)
    : (raw.posterPath || null);

  const backdropPath = raw.backdrop_path
    ? (raw.backdrop_path.startsWith('http') ? raw.backdrop_path : `${TMDB_IMAGE_BASE}/original${raw.backdrop_path}`)
    : (raw.backdropPath || null);

  let cast: CastMember[] = [];
  let director = raw.director || '';

  if (raw.credits) {
    if (raw.credits.cast) {
      cast = raw.credits.cast.slice(0, 10).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profilePath: c.profile_path ? `${TMDB_IMAGE_BASE}/w185${c.profile_path}` : null,
        order: c.order
      }));
    }
    if (raw.credits.crew) {
      const dirObj = raw.credits.crew.find((member: any) => member.job === 'Director');
      if (dirObj) director = dirObj.name;
    }
  }

  // Find trailer key
  let trailerKey: string | null = raw.trailerKey || null;
  if (raw.videos?.results) {
    const trailer = raw.videos.results.find(
      (v: any) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
    ) || raw.videos.results[0];
    if (trailer) trailerKey = trailer.key;
  }

  // Apply admin overrides
  const override = adminSettings.movieOverrides?.[String(id)] || {};

  return {
    id,
    title: raw.title || raw.name || 'Untitled Movie',
    originalTitle: raw.original_title || raw.title,
    posterPath,
    backdropPath,
    overview: override.customPlot || raw.overview || 'No plot summary available.',
    releaseDate: raw.release_date || raw.first_air_date || '2024-01-01',
    voteAverage: override.customRating !== undefined ? override.customRating : Number((raw.vote_average || 7.5).toFixed(1)),
    voteCount: raw.vote_count || 1200,
    popularity: raw.popularity || 100,
    genreIds: raw.genre_ids,
    genres: genres.length > 0 ? genres : ['Cinema'],
    cast: cast.length > 0 ? cast : (raw.cast || []),
    director: director || 'Visionary Director',
    runtime: raw.runtime || 120,
    tagline: raw.tagline || '',
    trailerKey,
    budget: raw.budget,
    revenue: raw.revenue,
    status: raw.status || 'Released',
    customBadge: override.customBadge || (adminSettings.featuredMovieIds.includes(id) ? 'Featured' : undefined),
    adminOverride: override
  };
}

export interface FetchMoviesResult {
  movies: Movie[];
  totalPages: number;
  didYouMean?: string;
  isFuzzyMatch?: boolean;
}

export function getAllCatalogMovies(): Movie[] {
  const adminSettings = getAdminSettings();
  let list = [...FALLBACK_MOVIES];
  if (adminSettings.customMovies?.length > 0) {
    list = [...adminSettings.customMovies, ...list];
  }
  return list
    .map(m => {
      const override = adminSettings.movieOverrides?.[String(m.id)];
      if (!override) return m;
      return {
        ...m,
        overview: override.customPlot || m.overview,
        voteAverage: override.customRating !== undefined ? override.customRating : m.voteAverage,
        customBadge: override.customBadge || m.customBadge,
        adminOverride: override
      };
    })
    .filter(m => !adminSettings.hiddenMovieIds.includes(m.id) && !m.adminOverride?.isHidden);
}

export async function fetchMovies(
  category: 'trending' | 'top_rated' | 'upcoming' | 'now_playing' | 'genre' | 'search',
  params: { genreId?: number; query?: string; page?: number } = {}
): Promise<FetchMoviesResult> {
  const adminSettings = getAdminSettings();
  const apiKey = adminSettings.tmdbApiKey;

  // If TMDB API Key is configured, fetch live data
  if (apiKey) {
    try {
      const getEndpointForPage = (pageNum: number) => {
        if (category === 'trending') {
          return `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&page=${pageNum}`;
        } else if (category === 'top_rated') {
          return `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=${pageNum}`;
        } else if (category === 'upcoming') {
          return `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&page=${pageNum}`;
        } else if (category === 'now_playing') {
          return `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&page=${pageNum}`;
        } else if (category === 'genre' && params.genreId) {
          return `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${params.genreId}&sort_by=popularity.desc&page=${pageNum}`;
        } else if (category === 'search' && params.query) {
          return `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(params.query)}&page=${pageNum}`;
        }
        return '';
      };

      const requestedPage = params.page || 1;
      const endpoint1 = getEndpointForPage(requestedPage);

      if (endpoint1) {
        // Fetch 2 pages on page 1 to load 40 titles seamlessly
        const shouldFetchSecondPage = requestedPage === 1 && category !== 'search';
        const endpoint2 = shouldFetchSecondPage ? getEndpointForPage(2) : null;

        const [res1, res2] = await Promise.all([
          fetch(endpoint1),
          endpoint2 ? fetch(endpoint2).catch(() => null) : Promise.resolve(null)
        ]);

        if (res1.ok) {
          const data1 = await res1.json();
          let rawResults = data1.results || [];

          if (res2 && res2.ok) {
            try {
              const data2 = await res2.json();
              if (Array.isArray(data2.results)) {
                rawResults = [...rawResults, ...data2.results];
              }
            } catch {}
          }

          let formattedList = rawResults.map((m: any) => formatTmdbMovie(m, adminSettings));

          // Filter out hidden movies
          formattedList = formattedList.filter(
            (m: Movie) => !adminSettings.hiddenMovieIds.includes(m.id) && !m.adminOverride?.isHidden
          );

          // Merge custom admin movies if on page 1
          if (requestedPage === 1 && adminSettings.customMovies?.length > 0) {
            formattedList = [...adminSettings.customMovies, ...formattedList];
          }

          // If TMDB search returned results, return them
          if (category !== 'search' || formattedList.length > 0) {
            return {
              movies: formattedList.slice(0, 42),
              totalPages: Math.min(data1.total_pages || 1, 20),
              isFuzzyMatch: false
            };
          }
          // If TMDB search yielded 0 results (e.g. user made a typo), continue to smart typo fallback below!
        }
      }
    } catch (err) {
      console.warn('Live TMDB API fetch failed, falling back to local catalog', err);
    }
  }

  // Fallback to rich curated local dataset
  let localList = getAllCatalogMovies();

  // Smart Search handling with Typo tolerance & similar movies
  if (category === 'search' && params.query) {
    const searchResult = performSmartMovieSearch(localList, params.query);
    return {
      movies: searchResult.movies,
      totalPages: 1,
      didYouMean: searchResult.didYouMean,
      isFuzzyMatch: searchResult.isFuzzyMatch
    };
  }

  // Genre Filter
  if (category === 'genre' && params.genreId) {
    const genreName = GENRE_MAP[params.genreId];
    if (genreName) {
      localList = localList.filter(
        m => m.genres.includes(genreName) || (m.genreIds && m.genreIds.includes(params.genreId!))
      );
    }
  } else if (category === 'top_rated') {
    localList.sort((a, b) => b.voteAverage - a.voteAverage);
  } else if (category === 'upcoming') {
    localList.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
  }

  return {
    movies: localList,
    totalPages: 1,
    isFuzzyMatch: false
  };
}

export async function fetchMovieDetails(id: number | string): Promise<Movie | null> {
  const adminSettings = getAdminSettings();
  const apiKey = adminSettings.tmdbApiKey;

  // Check if custom movie in admin
  const customMovie = adminSettings.customMovies?.find(m => String(m.id) === String(id));
  if (customMovie) return customMovie;

  if (apiKey && (typeof id === 'number' || !isNaN(Number(id)))) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits,videos,similar`
      );
      if (res.ok) {
        const data = await res.json();
        return formatTmdbMovie(data, adminSettings);
      }
    } catch (err) {
      console.warn(`Failed to fetch live details for movie ${id}`, err);
    }
  }

  // Fallback find in local list
  const local = FALLBACK_MOVIES.find(m => String(m.id) === String(id));
  if (local) {
    const override = adminSettings.movieOverrides?.[String(local.id)];
    if (override) {
      return {
        ...local,
        overview: override.customPlot || local.overview,
        voteAverage: override.customRating !== undefined ? override.customRating : local.voteAverage,
        customBadge: override.customBadge || local.customBadge,
        adminOverride: override
      };
    }
    return local;
  }

  return null;
}
