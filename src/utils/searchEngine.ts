import { Movie } from '../types';

// Normalized string: lowercase, strip punctuation, clean whitespace
export function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Compute Levenshtein distance between two strings
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Normalized Levenshtein similarity between 0 and 1
export function stringSimilarity(a: string, b: string): number {
  const s1 = normalizeText(a);
  const s2 = normalizeText(b);
  if (!s1 && !s2) return 1;
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;

  const maxLen = Math.max(s1.length, s2.length);
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, (maxLen - dist) / maxLen);
}

// Popular search suggestions for 1-click ease
export const POPULAR_SEARCH_TAGS = [
  'Dune',
  'Oppenheimer',
  'Interstellar',
  'Deadpool',
  'The Dark Knight',
  'Gladiator',
  'Sci-Fi',
  'Action',
  'Inception',
  'Spirited Away'
];

// Map of common acronyms or alternative names
const NICKNAMES_AND_ACRONYMS: Record<string, string[]> = {
  lotr: ['The Lord of the Rings', 'Lord of the Rings'],
  batman: ['The Dark Knight', 'The Dark Knight Rises', 'Batman'],
  spiderman: ['Spider-Man: Across the Spider-Verse', 'Spider-Man: Into the Spider-Verse'],
  'spider man': ['Spider-Man: Across the Spider-Verse', 'Spider-Man: Into the Spider-Verse'],
  mcu: ['Deadpool & Wolverine', 'Avengers', 'Spider-Man'],
  marvel: ['Deadpool & Wolverine', 'Spider-Man: Across the Spider-Verse'],
  scifi: ['Science Fiction', 'Dune: Part Two', 'Interstellar', 'The Matrix', 'Alien: Romulus'],
  'sci fi': ['Science Fiction', 'Dune: Part Two', 'Interstellar', 'The Matrix'],
  space: ['Interstellar', 'Dune: Part Two', 'Alien: Romulus'],
  anime: ['Spirited Away'],
  ghibli: ['Spirited Away'],
  nolan: ['Oppenheimer', 'Interstellar', 'The Dark Knight', 'Inception'],
  villeneuve: ['Dune: Part Two'],
  tarantino: ['Pulp Fiction', 'Django Unchained'],
  scorsese: ['GoodFellas', 'Killers of the Flower Moon']
};

export interface SearchMatchResult {
  movie: Movie;
  score: number;
  matchType: 'exact' | 'prefix' | 'fuzzy' | 'cast' | 'genre';
  highlightTerm?: string;
}

export interface SmartSearchResult {
  movies: Movie[];
  didYouMean?: string;
  isFuzzyMatch: boolean;
  totalMatches: number;
}

// Calculate match score for a movie given a user query
export function scoreMovieAgainstQuery(movie: Movie, rawQuery: string): SearchMatchResult | null {
  const query = normalizeText(rawQuery);
  if (!query) return null;

  const titleNorm = normalizeText(movie.title);
  const queryWords = query.split(' ').filter(Boolean);
  const titleWords = titleNorm.split(' ').filter(Boolean);

  // 1. Exact or Substring title match
  if (titleNorm === query) {
    return { movie, score: 1.0, matchType: 'exact' };
  }
  if (titleNorm.includes(query)) {
    return { movie, score: 0.95, matchType: 'exact' };
  }

  // 2. Acronym & Nicknames check
  if (NICKNAMES_AND_ACRONYMS[query]) {
    const targets = NICKNAMES_AND_ACRONYMS[query];
    if (targets.some(t => normalizeText(t).includes(titleNorm) || titleNorm.includes(normalizeText(t)))) {
      return { movie, score: 0.92, matchType: 'fuzzy' };
    }
  }

  // 3. Word starts-with (Prefix) check
  const allWordsStart = queryWords.every(qw =>
    titleWords.some(tw => tw.startsWith(qw))
  );
  if (allWordsStart) {
    return { movie, score: 0.88, matchType: 'prefix' };
  }

  // 4. Word-by-word fuzzy comparison for typo tolerance
  // e.g. "oppenhiemer" -> "oppenheimer", "intersteler" -> "interstellar"
  let maxWordSimilarity = 0;
  for (const qw of queryWords) {
    for (const tw of titleWords) {
      // Direct similarity between words
      const sim = stringSimilarity(qw, tw);
      if (sim > maxWordSimilarity) {
        maxWordSimilarity = sim;
      }
    }
  }

  // Entire phrase similarity
  const fullPhraseSim = stringSimilarity(query, titleNorm);
  const bestTitleSim = Math.max(maxWordSimilarity, fullPhraseSim);

  if (bestTitleSim >= 0.65) {
    return {
      movie,
      score: 0.7 + bestTitleSim * 0.2,
      matchType: 'fuzzy',
      highlightTerm: movie.title
    };
  }

  // 5. Check Cast Members
  if (movie.cast && movie.cast.length > 0) {
    for (const member of movie.cast) {
      const castNorm = normalizeText(member.name);
      if (castNorm.includes(query)) {
        return { movie, score: 0.78, matchType: 'cast', highlightTerm: member.name };
      }
      const castSim = stringSimilarity(query, castNorm);
      if (castSim >= 0.75) {
        return { movie, score: 0.65, matchType: 'cast', highlightTerm: member.name };
      }
    }
  }

  // 6. Check Director
  if (movie.director) {
    const dirNorm = normalizeText(movie.director);
    if (dirNorm.includes(query)) {
      return { movie, score: 0.76, matchType: 'cast', highlightTerm: movie.director };
    }
    if (stringSimilarity(query, dirNorm) >= 0.75) {
      return { movie, score: 0.65, matchType: 'cast', highlightTerm: movie.director };
    }
  }

  // 7. Check Genres
  for (const g of movie.genres) {
    const genreNorm = normalizeText(g);
    if (genreNorm.includes(query) || query.includes(genreNorm)) {
      return { movie, score: 0.72, matchType: 'genre', highlightTerm: g };
    }
    if (stringSimilarity(query, genreNorm) >= 0.75) {
      return { movie, score: 0.60, matchType: 'genre', highlightTerm: g };
    }
  }

  // 8. Lower threshold fuzzy for single typos (e.g. len >= 4 with 1 letter wrong)
  if (query.length >= 4 && bestTitleSim >= 0.5) {
    return {
      movie,
      score: bestTitleSim * 0.7,
      matchType: 'fuzzy',
      highlightTerm: movie.title
    };
  }

  return null;
}

// Perform smart search with typo tolerance & "Did you mean" recommendations
export function performSmartMovieSearch(movies: Movie[], rawQuery: string): SmartSearchResult {
  const query = rawQuery.trim();
  if (!query) {
    return { movies, isFuzzyMatch: false, totalMatches: movies.length };
  }

  const scored: SearchMatchResult[] = [];
  for (const movie of movies) {
    const match = scoreMovieAgainstQuery(movie, query);
    if (match) {
      scored.push(match);
    }
  }

  // Sort by highest score first
  scored.sort((a, b) => b.score - a.score);

  // If we have exact or prefix matches
  const exactMatches = scored.filter(s => s.score >= 0.85);
  if (exactMatches.length > 0) {
    return {
      movies: scored.map(s => s.movie),
      isFuzzyMatch: false,
      totalMatches: scored.length
    };
  }

  // If we have fuzzy / typo matches
  if (scored.length > 0) {
    const bestMatch = scored[0];
    const suggestedTitle = bestMatch.movie.title;
    return {
      movies: scored.map(s => s.movie),
      didYouMean: suggestedTitle,
      isFuzzyMatch: true,
      totalMatches: scored.length
    };
  }

  // Zero matches: find the closest movie anyway to offer a "Did you mean"
  let closestMovie: Movie | null = null;
  let highestSim = 0;

  for (const movie of movies) {
    const sim = stringSimilarity(query, movie.title);
    if (sim > highestSim) {
      highestSim = sim;
      closestMovie = movie;
    }
  }

  return {
    movies: [],
    didYouMean: highestSim >= 0.35 && closestMovie ? closestMovie.title : undefined,
    isFuzzyMatch: true,
    totalMatches: 0
  };
}

// Instant live suggestions for search dropdown
export function getLiveSearchSuggestions(movies: Movie[], rawQuery: string, limit: number = 5): Movie[] {
  const query = rawQuery.trim();
  if (!query) return [];

  const searchResult = performSmartMovieSearch(movies, query);
  return searchResult.movies.slice(0, limit);
}
