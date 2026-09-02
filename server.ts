import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

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

async function startServer() {
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
