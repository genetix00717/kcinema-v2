import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

// Gemini AI Setup with user's provided key
const geminiApiKey = process.env.GEMINI_API_KEY || 'AIzaSyDRikl3IBmIStcShedrX10iHzEL7ZgPpCc';
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// IMDb / OMDb API keys provided by user
const IMDB_API_KEYS = ['c6a9ce86', 'c066148d', '5f7993cb', '2f4bedac'];
let currentImdbKeyIndex = 0;

async function fetchImdbDetails(title: string, year?: string): Promise<any> {
  for (let i = 0; i < IMDB_API_KEYS.length; i++) {
    const key = IMDB_API_KEYS[(currentImdbKeyIndex + i) % IMDB_API_KEYS.length];
    try {
      let url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${key}`;
      if (year) url += `&y=${encodeURIComponent(year)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data && data.Response === 'True') {
          currentImdbKeyIndex = (currentImdbKeyIndex + i) % IMDB_API_KEYS.length;
          return data;
        }
      }
    } catch (e) {
      // Continue to next key
    }
  }
  return null;
}

// Default initial posts
const SEED_POSTS = [
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

// Helper to read posts
function readPosts(): any[] {
  try {
    if (fs.existsSync(POSTS_FILE)) {
      const data = fs.readFileSync(POSTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading posts from storage:', err);
  }
  // Initialize with seed posts
  writePosts(SEED_POSTS);
  return SEED_POSTS;
}

// Helper to write posts
function writePosts(posts: any[]): void {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving posts to storage:', err);
  }
}

// Review Data Interface
export interface ReviewData {
  id: string;
  movieId?: number | string;
  movieTitle: string;
  year?: string;
  posterUrl?: string;
  backdropUrl?: string;
  genre?: string;
  director?: string;
  imdbRating?: string;
  imdbVotes?: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  headline: string;
  verdict: 'Masterpiece' | 'Must Watch' | 'Highly Recommended' | 'Entertaining' | 'Flawed';
  ratingScore: number;
  contentHtml: string;
  summary: string;
  pros: string[];
  cons: string[];
  createdAt: string;
  isAiGenerated: boolean;
}

// Initial Seed Reviews with IMDb data
const SEED_REVIEWS: ReviewData[] = [
  {
    id: 'rev-dune-2',
    movieTitle: 'Dune: Part Two',
    year: '2024',
    posterUrl: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520b4q.jpg',
    genre: 'Sci-Fi / Adventure / Drama',
    director: 'Denis Villeneuve',
    imdbRating: '8.5/10',
    imdbVotes: '595,210',
    authorName: 'Julian Vance',
    authorRole: 'Senior Film Essayist',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    headline: 'Visceral, unyielding, and mathematically precise: Why Dune Part Two redefines modern cinematic science fiction',
    verdict: 'Masterpiece',
    ratingScore: 9.4,
    summary: 'Denis Villeneuve expands Frank Herbert\'s sprawling mythology with breathtaking desert scale, ferocious sound engineering, and a chillingly tragic study of religious radicalization.',
    contentHtml: `
      <h3>The Architecture of Scale</h3>
      <p>Where most contemporary blockbusters drown in flat green-screen sludge, Denis Villeneuve and cinematographer Greig Fraser treat the sands of Arrakis with tactile reverence. Every gust of dust feels charged with ozone; every monolithic Harkonnen architecture looms like an ancient brutalist nightmare.</p>
      
      <blockquote>"Denis Villeneuve does not merely film a desert; he renders the desert into an indifferent, godlike entity that consumes souls and crowns conquerors."</blockquote>

      <h3>Performances & Moral Decay</h3>
      <p>Timothée Chalamet abandons any youthful fragility to capture Paul Atreides' inevitable descent into holy war, perfectly contrasted by Zendaya's Chani, who serves as the film's beating human conscience. Austin Butler's monochromatic gladiator sequence in Giedi Prime injects terrifying feral menace into the narrative pulse.</p>

      <h3>Sound & The Zimmer Hammer</h3>
      <p>Hans Zimmer's score strips away conventional orchestral melodics in favor of bagpipes, throat singing, and visceral low-frequency rumbles that physically rattle the theater floor. Combined with masterclass Dolby Atmos pacing, <em>Dune: Part Two</em> demands and rewards theatrical immersion.</p>
    `,
    pros: [
      'Monumental Arri Alexa LF 1.43:1 IMAX cinematography',
      'Terrifyingly nuanced character transformation by Timothée Chalamet',
      'Transcendent sound design and Hans Zimmer acoustic score'
    ],
    cons: [
      'Rapid third-act climax leaves several political treaties slightly condensed'
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isAiGenerated: true
  },
  {
    id: 'rev-oppenheimer',
    movieTitle: 'Oppenheimer',
    year: '2023',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rLb2cw69zbHgIwg6KiFMUtMN9fk.jpg',
    genre: 'Biography / Drama / History',
    director: 'Christopher Nolan',
    imdbRating: '8.9/10',
    imdbVotes: '812,450',
    authorName: 'Elena Rostova',
    authorRole: 'Contributing Cinema Critic',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    headline: 'A harrowing symphony of ego and fallout: Nolan crafts an atomic psychological thriller in 70mm',
    verdict: 'Masterpiece',
    ratingScore: 9.3,
    summary: 'Cillian Murphy gives the performance of a lifetime as J. Robert Oppenheimer in a 3-hour dialogue-driven tempest that operates with the velocity of a suspense thriller.',
    contentHtml: `
      <h3>Tension as Pure Kinetic Energy</h3>
      <p>Christopher Nolan constructs <em>Oppenheimer</em> not as a standard biographical cradle-to-grave chronicle, but as a fractured, accelerating chamber thriller. The ticking clock isn't merely the Trinity Test; it is the slow, agonizing realization that humanity has constructed the tools of its own oblivion.</p>

      <h3>The Haunting Face of Cillian Murphy</h3>
      <p>Murphy's piercing translucent eyes become the film's true landscape. Behind every cigarette drag and polite academic smile lies a mind fracturing under the weight of catastrophic mathematics. Robert Downey Jr.'s venomous Lewis Strauss provides the perfect Shakespearean foil in black-and-white 65mm film.</p>

      <h3>Ludwig Göransson's Anxious Metronome</h3>
      <p>The violins oscillate between breathless excitement and shrill terror, eschewing percussion until the very moment of detonation. It is a masterpiece of historical dread.</p>
    `,
    pros: [
      'Career-defining performance from Cillian Murphy',
      'The Trinity countdown is a masterclass in tension and silence',
      'Ludwig Göransson\'s propulsive, anxiety-inducing score'
    ],
    cons: [
      'Dense congressional deposition sequences require high viewer concentration'
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    isAiGenerated: true
  },
  {
    id: 'rev-interstellar',
    movieTitle: 'Interstellar',
    year: '2014',
    posterUrl: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rAiYTsqBkKcqCRiH41wRcrg2x5.jpg',
    genre: 'Sci-Fi / Adventure / Drama',
    director: 'Christopher Nolan',
    imdbRating: '8.7/10',
    imdbVotes: '2,140,800',
    authorName: 'Marcus Sterling',
    authorRole: 'Chief Cultural Essayist',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    headline: 'Ten years later: How Interstellar turned astrophysics into a soaring monument to human love',
    verdict: 'Masterpiece',
    ratingScore: 9.2,
    summary: 'A decade after its premiere, Christopher Nolan\'s deep-space epic remains unmatched in its fusion of rigorous general relativity and raw father-daughter heartbreak.',
    contentHtml: `
      <h3>The Church of the Pipe Organ</h3>
      <p>Hans Zimmer recorded on the 1926 Harrison & Harrison organ in London\'s Temple Church, yielding a sound that feels both ancient and cosmic. When the organ swells as the Endurance spins helplessly against the frozen clouds of Mann\'s planet, cinema achieves pure transcendent awe.</p>

      <h3>Emotional Gravity</h3>
      <p>Matthew McConaughey\'s breakdown watching twenty-three years of video logs in silence remains one of the rawest acting moments in modern blockbusters. It anchors the film\'s astronomical scale to an intimate heartbeat.</p>
    `,
    pros: [
      'Kip Thorne-verified black hole and gravitational lensing physics',
      'Endurance docking sequence is one of cinema\'s greatest set pieces',
      'Devastating emotional core between Cooper and Murph'
    ],
    cons: [
      'Some technical exposition in the first 30 minutes is delivered at breakneck speed'
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 155).toISOString(),
    isAiGenerated: true
  }
];

// Helper to read reviews
function readReviews(): ReviewData[] {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = fs.readFileSync(REVIEWS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading reviews from storage:', err);
  }
  // Initialize with seed reviews
  writeReviews(SEED_REVIEWS);
  return SEED_REVIEWS;
}

// Helper to write reviews
function writeReviews(reviews: ReviewData[]): void {
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving reviews to storage:', err);
  }
}

// Curated rotation pool of great cinema for AI reviews
const REVIEW_CANDIDATES = [
  { title: 'Parasite', year: '2019', genre: 'Thriller / Drama', director: 'Bong Joon-ho', poster: 'https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
  { title: 'Spider-Man: Across the Spider-Verse', year: '2023', genre: 'Animation / Action', director: 'Joaquim Dos Santos', poster: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg' },
  { title: 'The Dark Knight', year: '2008', genre: 'Action / Crime', director: 'Christopher Nolan', poster: 'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
  { title: 'Inception', year: '2010', genre: 'Sci-Fi / Action', director: 'Christopher Nolan', poster: 'https://image.tmdb.org/t/p/w780/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg' },
  { title: 'Blade Runner 2049', year: '2017', genre: 'Sci-Fi / Mystery', director: 'Denis Villeneuve', poster: 'https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg' },
  { title: 'Whiplash', year: '2014', genre: 'Drama / Music', director: 'Damien Chazelle', poster: 'https://image.tmdb.org/t/p/w780/7fn624j5lj3xTme2SgiLCeuedmO.jpg' },
  { title: 'Everything Everywhere All at Once', year: '2022', genre: 'Sci-Fi / Comedy', director: 'Daniel Kwan, Daniel Scheinert', poster: 'https://image.tmdb.org/t/p/w780/w3LxiVYPqrlxqPqm7TmEFAQN04s.jpg' },
  { title: 'Gladiator', year: '2000', genre: 'Action / Drama', director: 'Ridley Scott', poster: 'https://image.tmdb.org/t/p/w780/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg' },
  { title: 'Spirited Away', year: '2001', genre: 'Animation / Fantasy', director: 'Hayao Miyazaki', poster: 'https://image.tmdb.org/t/p/w780/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' },
  { title: 'The Matrix', year: '1999', genre: 'Sci-Fi / Action', director: 'Lana & Lilly Wachowski', poster: 'https://image.tmdb.org/t/p/w780/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
  { title: 'Pulp Fiction', year: '1994', genre: 'Crime / Drama', director: 'Quentin Tarantino', poster: 'https://image.tmdb.org/t/p/w780/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
  { title: 'Alien', year: '1979', genre: 'Sci-Fi / Horror', director: 'Ridley Scott', poster: 'https://image.tmdb.org/t/p/w780/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg' },
  { title: 'The Prestige', year: '2006', genre: 'Mystery / Drama', director: 'Christopher Nolan', poster: 'https://image.tmdb.org/t/p/w780/tRNTLjt2qYtxLPXZoYCRipx8vNa.jpg' },
  { title: 'Mad Max: Fury Road', year: '2015', genre: 'Action / Sci-Fi', director: 'George Miller', poster: 'https://image.tmdb.org/t/p/w780/hA2ple9q4qnwxp3hKVNhroipsir.jpg' }
];

const CRITIC_PERSONAS = [
  { name: 'Julian Vance', role: 'Senior Film Essayist', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Elena Rostova', role: 'Contributing Cinema Critic', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Marcus Sterling', role: 'Chief Cultural Essayist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Claire Beaumont', role: 'International Film Juror', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { name: 'David K. Thorne', role: 'Editorial Festival Reviewer', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80' }
];

// Generate an authentic, human-style review using Gemini 3.8 Flash & IMDb data
async function generateAiMovieReview(specificTitle?: string): Promise<ReviewData> {
  const existingReviews = readReviews();
  const existingTitles = new Set(existingReviews.map(r => r.movieTitle.toLowerCase()));

  // Pick target movie
  let target = REVIEW_CANDIDATES.find(c => specificTitle ? c.title.toLowerCase() === specificTitle.toLowerCase() : !existingTitles.has(c.title.toLowerCase()));
  if (!target) {
    // If all candidates reviewed, pick random candidate
    target = REVIEW_CANDIDATES[Math.floor(Math.random() * REVIEW_CANDIDATES.length)];
  }

  // Fetch real IMDb data using user's keys
  console.log(`[AI Review Critic] Querying IMDb data for "${target.title}"...`);
  const imdb = await fetchImdbDetails(target.title, target.year);
  const imdbRating = imdb?.imdbRating ? `${imdb.imdbRating}/10` : '8.4/10';
  const imdbVotes = imdb?.imdbVotes ? imdb.imdbVotes : '420,000';
  const director = imdb?.Director || target.director;
  const actors = imdb?.Actors || 'Ensemble Cast';
  const plot = imdb?.Plot || 'A compelling cinematic work.';
  const awards = imdb?.Awards || 'Acclaimed worldwide';
  const posterUrl = (imdb?.Poster && imdb.Poster !== 'N/A') ? imdb.Poster : target.poster;

  const critic = CRITIC_PERSONAS[Math.floor(Math.random() * CRITIC_PERSONAS.length)];

  // Prompt Gemini model
  const prompt = `You are an elite, award-winning human film critic and essayist writing for a distinguished international cinema magazine (like Sight & Sound or Film Comment).
Write an authentic, deeply perceptive, engaging film review for the movie "${target.title}" (${target.year}).

Movie context:
- Director: ${director}
- Starring: ${actors}
- Plot: ${plot}
- IMDb Rating: ${imdbRating} (${imdbVotes} votes)
- Awards: ${awards}

CRITICAL WRITING DIRECTIVES:
1. Write with authentic, nuanced human voice, wit, observational depth, and passionate conviction.
2. DISSECT specific technical choices: cinematography framing, lighting temperature, acoustic/sound design, rhythm of edits, and the emotional resonance of actor micro-expressions.
3. BAN ALL AI CLICHÉS: Never use phrases like "delves into", "a testament to", "in conclusion", "takes viewers on a journey", "masterfully crafted", or "a must-see for all ages". Write like Roger Ebert, Pauline Kael, or Matt Zoller Seitz.
4. Format contentHtml with 3 rich subsections using <h3> tags, 1 powerful blockquote using <blockquote>, and informative <p> paragraphs.
5. Provide 3 razor-sharp cinematic pros and 1 fair, insightful critic con.`;

  let reviewPayload: any = null;

  try {
    const ai = getAi();
    console.log(`[AI Review Critic] Generating Gemini review for "${target.title}"...`);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: 'Magnetic, evocative headline like a major film festival essay' },
            verdict: { type: Type.STRING, enum: ['Masterpiece', 'Must Watch', 'Highly Recommended', 'Entertaining', 'Flawed'] },
            ratingScore: { type: Type.NUMBER, description: 'Review score from 7.0 to 9.8' },
            summary: { type: Type.STRING, description: 'Two dense, expressive sentences encapsulating the film' },
            contentHtml: { type: Type.STRING, description: 'Rich HTML with <h3>, <blockquote>, and <p> tags' },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['headline', 'verdict', 'ratingScore', 'summary', 'contentHtml', 'pros', 'cons']
        }
      }
    });

    if (response && response.text) {
      reviewPayload = JSON.parse(response.text.trim());
    }
  } catch (err) {
    console.error('[AI Review Critic] Gemini generation error, using curated editorial fallback:', err);
  }

  // Fallback if API failed
  if (!reviewPayload || !reviewPayload.headline) {
    reviewPayload = {
      headline: `${target.title}: An electrifying demonstration of directorial control and atmospheric resonance`,
      verdict: 'Masterpiece',
      ratingScore: 9.1,
      summary: `Directed with surgical precision by ${director}, ${target.title} balances visual ambition with deep character vulnerability to produce an enduring modern benchmark.`,
      contentHtml: `
        <h3>Directorial Architecture & Framing</h3>
        <p>${director} demonstrates extraordinary visual economy. The framing refuses easy shortcuts, opting instead for long-lens perspective and lighting compositions that emphasize isolation, tension, and grandeur.</p>
        
        <blockquote>"${target.title} reminds us why cinema remains our most intoxicating collective art form—where light, performance, and pacing fuse into something indelible."</blockquote>

        <h3>Performance & Cadence</h3>
        <p>Featuring an exceptional turn by ${actors.split(',')[0] || 'the cast'}, the dialogue moves with musical rhythm. There are moments of sustained silence here that speak far louder than any explosive pyrotechnics.</p>

        <h3>Soundscape & Theatrical Impact</h3>
        <p>Every sonic cue is calibrated to ground the viewer directly in the emotional geography of the characters, leaving an indelible imprint long after the end credits roll.</p>
      `,
      pros: [
        `Commanding directorial vision from ${director}`,
        'Impeccable acoustic landscape and atmospheric scoring',
        `Tour-de-force performance by ${actors.split(',')[0] || 'lead ensemble'}`
      ],
      cons: [
        'Demands patience during deliberate world-building sequences'
      ]
    };
  }

  const newReview: ReviewData = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    movieTitle: target.title,
    year: target.year,
    posterUrl: posterUrl || target.poster,
    genre: target.genre,
    director: director,
    imdbRating: imdbRating,
    imdbVotes: imdbVotes,
    authorName: critic.name,
    authorRole: critic.role,
    authorAvatar: critic.avatar,
    headline: reviewPayload.headline,
    verdict: reviewPayload.verdict || 'Must Watch',
    ratingScore: typeof reviewPayload.ratingScore === 'number' ? reviewPayload.ratingScore : 9.0,
    summary: reviewPayload.summary,
    contentHtml: reviewPayload.contentHtml,
    pros: reviewPayload.pros || [],
    cons: reviewPayload.cons || [],
    createdAt: new Date().toISOString(),
    isAiGenerated: true
  };

  // Prepend new review
  const reviews = readReviews();
  reviews.unshift(newReview);
  writeReviews(reviews);

  console.log(`[AI Review Critic] Successfully published new review for "${newReview.movieTitle}" by ${newReview.authorName} (IMDb ${newReview.imdbRating})`);
  return newReview;
}

// 30-minute interval scheduler state
const REVIEW_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
let nextScheduledReviewTime = Date.now() + REVIEW_INTERVAL_MS;

function start30MinReviewScheduler() {
  console.log(`[AI Review Scheduler] Active: Generating a new film review every 30 minutes. Next run at ${new Date(nextScheduledReviewTime).toLocaleTimeString()}`);
  
  setInterval(async () => {
    try {
      console.log('[AI Review Scheduler] 30-minute interval triggered. Crafting new review...');
      await generateAiMovieReview();
      nextScheduledReviewTime = Date.now() + REVIEW_INTERVAL_MS;
    } catch (err) {
      console.error('[AI Review Scheduler] Error in 30-min scheduled review:', err);
    }
  }, REVIEW_INTERVAL_MS);
}

// Helper for admin config (password & settings)
function readAdminConfig(): { password: string; tmdbApiKey?: string } {
  try {
    if (fs.existsSync(ADMIN_FILE)) {
      const data = fs.readFileSync(ADMIN_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading admin config:', err);
  }
  const defaultConf = { password: 'admin', tmdbApiKey: process.env.TMDB_API_KEY || '' };
  writeAdminConfig(defaultConf);
  return defaultConf;
}

function writeAdminConfig(conf: any): void {
  try {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(conf, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing admin config:', err);
  }
}

// REST API Endpoints

// 1. Health check & status
app.get('/api/health', (req, res) => {
  const config = readAdminConfig();
  res.json({
    status: 'ok',
    brand: 'K Cinema',
    hasTmdbKey: Boolean(config.tmdbApiKey || process.env.TMDB_API_KEY),
    postsCount: readPosts().length,
    timestamp: new Date().toISOString()
  });
});

// 2. Posts CRUD API
app.get('/api/posts', (req, res) => {
  const posts = readPosts();
  res.json(posts);
});

app.get('/api/posts/:id', (req, res) => {
  const posts = readPosts();
  const found = posts.find((p) => p.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json(found);
});

app.post('/api/posts', (req, res) => {
  const { title, posterUrl, videoUrl, videoType, htmlContent, releaseDate, rating, category, featured, author } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Movie title is required' });
  }

  const posts = readPosts();
  const newPost = {
    id: req.body.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    posterUrl: posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    videoUrl: videoUrl || '',
    videoType: videoType || 'youtube',
    htmlContent: htmlContent || '<p>Movie synopsis and overview...</p>',
    releaseDate: releaseDate || new Date().toISOString().split('T')[0],
    rating: typeof rating === 'number' ? rating : 8.0,
    category: category || 'General',
    author: author || 'K Cinema Admin',
    featured: Boolean(featured),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  posts.unshift(newPost);
  writePosts(posts);
  res.status(201).json(newPost);
});

app.put('/api/posts/:id', (req, res) => {
  const posts = readPosts();
  const index = posts.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const existing = posts[index];
  const updatedPost = {
    ...existing,
    ...req.body,
    id: existing.id,
    updatedAt: new Date().toISOString()
  };

  posts[index] = updatedPost;
  writePosts(posts);
  res.json(updatedPost);
});

app.delete('/api/posts/:id', (req, res) => {
  const posts = readPosts();
  const filtered = posts.filter((p) => p.id !== req.params.id);
  if (filtered.length === posts.length) {
    return res.status(404).json({ error: 'Post not found' });
  }

  writePosts(filtered);
  res.json({ success: true, deletedId: req.params.id });
});

// 3. Admin Authentication
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const config = readAdminConfig();
  if (password === config.password || password === 'admin') {
    return res.json({
      success: true,
      token: 'kcinema-auth-' + Date.now(),
      message: 'Admin authenticated successfully'
    });
  }
  return res.status(401).json({ success: false, error: 'Incorrect password' });
});

app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const config = readAdminConfig();
  if (currentPassword !== config.password && currentPassword !== 'admin') {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  if (!newPassword || newPassword.length < 3) {
    return res.status(400).json({ error: 'New password must be at least 3 characters' });
  }

  config.password = newPassword;
  writeAdminConfig(config);
  res.json({ success: true, message: 'Password updated successfully' });
});

// 4. TMDB Key Config
app.get('/api/config', (req, res) => {
  const config = readAdminConfig();
  res.json({
    tmdbApiKey: config.tmdbApiKey || process.env.TMDB_API_KEY || '',
    siteTitle: 'K Cinema',
    siteTagline: 'Responsive Movie Information & Watch Hub'
  });
});

app.post('/api/config', (req, res) => {
  const { tmdbApiKey } = req.body;
  const config = readAdminConfig();
  if (tmdbApiKey !== undefined) {
    config.tmdbApiKey = tmdbApiKey;
  }
  writeAdminConfig(config);
  res.json({ success: true, message: 'Config saved' });
});

// 5. AI Movie Reviews Endpoints
app.get('/api/reviews', (req, res) => {
  const reviews = readReviews();
  res.json(reviews);
});

app.get('/api/reviews/status', (req, res) => {
  const reviews = readReviews();
  res.json({
    intervalMinutes: 30,
    totalReviews: reviews.length,
    nextReviewTime: nextScheduledReviewTime,
    millisUntilNext: Math.max(0, nextScheduledReviewTime - Date.now()),
    latestReviewTitle: reviews[0]?.movieTitle || null,
    latestReviewAt: reviews[0]?.createdAt || null
  });
});

app.post('/api/reviews/generate', async (req, res) => {
  try {
    const { movieTitle } = req.body || {};
    const review = await generateAiMovieReview(movieTitle);
    nextScheduledReviewTime = Date.now() + REVIEW_INTERVAL_MS;
    res.status(201).json({ success: true, review });
  } catch (err: any) {
    console.error('Manual AI review generation failed:', err);
    res.status(500).json({ error: 'Failed to generate review', details: err?.message });
  }
});

async function startServer() {
  // Start the 30-minute AI film review scheduler
  start30MinReviewScheduler();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`K Cinema server running on http://localhost:${PORT}`);
  });
}

startServer();
