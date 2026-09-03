import { MovieReview } from '../types';

const STORAGE_REVIEWS_KEY = 'kcinema_reviews_cache_v1';

export interface ReviewStatusResponse {
  intervalMinutes: number;
  totalReviews: number;
  nextReviewTime: number;
  millisUntilNext: number;
  latestReviewTitle: string | null;
  latestReviewAt: string | null;
}

export async function fetchReviews(): Promise<MovieReview[]> {
  try {
    const res = await fetch('/api/reviews');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch reviews from server, checking local cache:', err);
  }

  try {
    const cached = localStorage.getItem(STORAGE_REVIEWS_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  return [];
}

export async function fetchReviewStatus(): Promise<ReviewStatusResponse | null> {
  try {
    const res = await fetch('/api/reviews/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Could not fetch review status:', err);
  }
  return null;
}

export async function triggerAiReviewGeneration(movieTitle?: string): Promise<MovieReview> {
  const res = await fetch('/api/reviews/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movieTitle })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate review');
  }

  const data = await res.json();
  return data.review;
}
