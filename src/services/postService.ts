import { MoviePost } from '../types';

const STORAGE_POSTS_KEY = 'kcinema_posts_v1';

export const INITIAL_POSTS: MoviePost[] = [
  {
    id: 'post-dune-2',
    title: 'Dune: Part Two (2024)',
    posterUrl: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    videoType: 'youtube',
    category: 'Sci-Fi & Epic',
    rating: 8.8,
    releaseDate: '2024-03-01',
    author: 'K Cinema Staff',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    featured: true,
    htmlContent: `
      <h2>The Epic Continuation of Paul Atreides' Journey</h2>
      <p>Denis Villeneuve returns with a visual and sonic triumph that redefines the modern cinematic epic. <strong>Dune: Part Two</strong> explores the mythic mythos of Paul Atreides as he unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.</p>
      
      <div class="my-4 p-4 rounded-xl bg-orange-950/30 border border-orange-500/40">
        <h4 class="font-bold text-orange-400">⚡ Technical & Cinematic Highlights</h4>
        <ul class="list-disc list-inside mt-2 text-sm text-zinc-300 space-y-1">
          <li><strong>Hans Zimmer Score:</strong> Thunderous percussion and haunting vocal chants recorded in custom acoustic environments.</li>
          <li><strong>IMAX 1.43:1 Aspect Ratio:</strong> Shot entirely with Arri Alexa LF IMAX-certified digital cameras.</li>
          <li><strong>Sound Design:</strong> Mastered in Dolby Atmos with earth-shattering sandworm frequencies.</li>
        </ul>
      </div>

      <h3>Critic Consensus & Score</h3>
      <p>A masterclass in world-building, pacing, and visual grandeur. Timothée Chalamet, Zendaya, and Austin Butler deliver career-defining performances across Arrakis' breathtaking desert vistas.</p>
      
      <p><strong>Recommendation:</strong> Must-watch on the largest screen available with reference-grade sound.</p>
    `
  },
  {
    id: 'post-oppenheimer',
    title: 'Oppenheimer (2023)',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    videoType: 'youtube',
    category: 'Biography & Drama',
    rating: 8.9,
    releaseDate: '2023-07-21',
    author: 'K Cinema Staff',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    featured: true,
    htmlContent: `
      <h2>Christopher Nolan's Magnum Opus of Historical Tension</h2>
      <p>The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project. Christopher Nolan creates an intense psychological thriller powered by Cillian Murphy's haunting performance.</p>

      <blockquote class="border-l-4 border-orange-500 pl-4 my-4 italic text-zinc-300">
        "Now I am become Death, the destroyer of worlds." — J. Robert Oppenheimer
      </blockquote>

      <h3>Key Highlights</h3>
      <p>Featuring an exceptional ensemble cast including Robert Downey Jr., Emily Blunt, and Matt Damon. The Trinity Test sequence is crafted with practical effects and Ludwig Göransson's pulse-pounding score.</p>
    `
  },
  {
    id: 'post-spider-verse',
    title: 'Spider-Man: Across the Spider-Verse',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    videoType: 'youtube',
    category: 'Animation & Action',
    rating: 8.7,
    releaseDate: '2023-06-02',
    author: 'K Cinema Staff',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    featured: false,
    htmlContent: `
      <h2>A Visual Masterpiece of Multiverse Animation</h2>
      <p>Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.</p>

      <h3>Art Styles Explored</h3>
      <p>The film combines watercolor expressions of Earth-65, neo-futuristic Mumbattan, brutalist Nueva York, and comic book dot shading to deliver unprecedented visual storytelling.</p>
    `
  },
  {
    id: 'post-interstellar',
    title: 'Interstellar (10th Anniversary 4K)',
    posterUrl: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    videoType: 'youtube',
    category: 'Sci-Fi & Adventure',
    rating: 8.7,
    releaseDate: '2014-11-07',
    author: 'K Cinema Staff',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    featured: true,
    htmlContent: `
      <h2>A Timeless Journey Beyond the Stars</h2>
      <p>When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.</p>
      <p>Exploring the dimensions of time, gravity, and love across relativity, <em>Interstellar</em> remains one of cinema's most emotionally resonant science-fiction journeys.</p>
    `
  }
];

// Fetch all posts (from server with localStorage fallback)
export async function fetchPosts(): Promise<MoviePost[]> {
  try {
    const res = await fetch('/api/posts');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not reach /api/posts, using local fallback', err);
  }

  // Local fallback
  try {
    const local = localStorage.getItem(STORAGE_POSTS_KEY);
    if (local) {
      return JSON.parse(local);
    }
  } catch {}

  localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(INITIAL_POSTS));
  return INITIAL_POSTS;
}

// Create a new post
export async function createPost(post: Omit<MoviePost, 'id' | 'createdAt'>): Promise<MoviePost> {
  const newPost: MoviePost = {
    ...post,
    id: 'post-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    });
    if (res.ok) {
      const saved = await res.json();
      // Update local storage too
      const current = await fetchPosts();
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify([saved, ...current.filter(p => p.id !== saved.id)]));
      return saved;
    }
  } catch (err) {
    console.warn('Server create post failed, saving locally', err);
  }

  // Fallback to local storage
  const current = await fetchPosts();
  const updated = [newPost, ...current];
  localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(updated));
  return newPost;
}

// Update existing post
export async function updatePost(id: string, postData: Partial<MoviePost>): Promise<MoviePost | null> {
  const payload = {
    ...postData,
    updatedAt: new Date().toISOString()
  };

  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const updated = await res.json();
      const current = await fetchPosts();
      const list = current.map(p => p.id === id ? updated : p);
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(list));
      return updated;
    }
  } catch (err) {
    console.warn('Server update post failed, saving locally', err);
  }

  // Fallback
  const current = await fetchPosts();
  let result: MoviePost | null = null;
  const list = current.map(p => {
    if (p.id === id) {
      result = { ...p, ...payload };
      return result;
    }
    return p;
  });
  if (result) {
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(list));
  }
  return result;
}

// Delete post
export async function deletePost(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const current = await fetchPosts();
      const filtered = current.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(filtered));
      return true;
    }
  } catch (err) {
    console.warn('Server delete post failed, removing locally', err);
  }

  const current = await fetchPosts();
  const filtered = current.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(filtered));
  return true;
}

// Parse video link (YouTube, Vimeo, MP4, or Iframe Embed)
export function parseVideoSource(urlOrEmbed: string): { type: 'youtube' | 'vimeo' | 'direct' | 'embed'; src: string; rawIframe?: string } {
  if (!urlOrEmbed) return { type: 'direct', src: '' };
  
  const trimmed = urlOrEmbed.trim();

  // If raw iframe tag
  if (trimmed.startsWith('<iframe') || trimmed.includes('<iframe')) {
    return { type: 'embed', src: '', rawIframe: trimmed };
  }

  // YouTube match
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`
    };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
    };
  }

  // Direct MP4 / WebM / Video stream
  return {
    type: 'direct',
    src: trimmed
  };
}
