export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department?: string;
  profilePath: string | null;
}

export interface Movie {
  id: number | string;
  title: string;
  originalTitle?: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  voteCount?: number;
  popularity?: number;
  genreIds?: number[];
  genres: string[];
  cast?: CastMember[];
  director?: string;
  runtime?: number;
  tagline?: string;
  trailerKey?: string | null;
  budget?: number;
  revenue?: number;
  status?: string;
  customBadge?: string;
  adminOverride?: {
    customPlot?: string;
    customRating?: number;
    customNotes?: string;
    customBadge?: string;
    isFeatured?: boolean;
    isHidden?: boolean;
  };
}

export interface Genre {
  id: number;
  name: string;
  emoji?: string;
}

export interface MoviePost {
  id: string;
  title: string;
  posterUrl: string;
  videoUrl: string; // Direct video url, YouTube URL, Vimeo URL, or raw <iframe> embed code
  videoType?: 'youtube' | 'vimeo' | 'direct' | 'embed';
  htmlContent: string; // HTML compose view (rich review / notes / synopsis / download links / commentary)
  releaseDate?: string;
  rating?: number;
  category?: string; // e.g., 'Action', 'Sci-Fi', 'Featured Review', 'Latest Release'
  author?: string;
  createdAt: string;
  updatedAt?: string;
  featured?: boolean;
}

export interface AdminSettings {
  tmdbApiKey: string;
  siteTitle: string;
  siteTagline: string;
  adminPassword?: string;
  featuredMovieIds: (number | string)[];
  hiddenMovieIds: (number | string)[];
  movieOverrides: Record<string, {
    customPlot?: string;
    customRating?: number;
    customNotes?: string;
    customBadge?: string;
    isFeatured?: boolean;
    isHidden?: boolean;
  }>;
  customMovies: Movie[];
}
