import fs from 'fs';
import path from 'path';

const GIFS_DIR = path.join(process.cwd(), 'public', 'gifs');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Pre-defined GIF definitions
// Use full URLs for external GIFs, or local filenames for files in public/gifs/
const predefinedGifDefs = [
  // === Reactions ===
  { id: 'deal-with-it', name: 'Deal With It', url: 'https://media.giphy.com/media/ZhmPbrADKRMuA/giphy.gif', category: 'Reactions' },
  { id: 'mind-blown', name: 'Mind Blown', url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif', category: 'Reactions' },
  { id: 'thumbs-up', name: 'Thumbs Up', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', category: 'Reactions' },
  { id: 'thumbs-down', name: 'Thumbs Down', url: 'https://media.giphy.com/media/iJxHzcuNcCJXi/giphy.gif', category: 'Reactions' },
  { id: 'facepalm', name: 'Facepalm', url: 'https://media.giphy.com/media/6yRVg0HWzgS88/giphy.gif', category: 'Reactions' },
  { id: 'eye-roll', name: 'Eye Roll', url: 'https://media.giphy.com/media/Rhhr8D5mKSX7O/giphy.gif', category: 'Reactions' },
  { id: 'cringe', name: 'Cringe', url: 'https://media.giphy.com/media/4WFirPVJhAhavWrcd3/giphy.gif', category: 'Reactions' },
  { id: 'shocked', name: 'Shocked', url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', category: 'Reactions' },

  // === Celebrations ===
  { id: 'confetti', name: 'Confetti', url: 'https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif', category: 'Celebrations' },
  { id: 'party-parrot', name: 'Party Parrot', url: 'https://media.giphy.com/media/l3q2zVr6cu95nF6O4/giphy.gif', category: 'Celebrations' },
  { id: 'victory', name: 'Victory', url: 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif', category: 'Celebrations' },
  { id: 'gg', name: 'GG', url: 'https://media.giphy.com/media/Jev4iU72S9RYc/giphy.gif', category: 'Celebrations' },
  { id: 'hype', name: 'HYPE', url: 'https://media.giphy.com/media/b1o4elYH8Tqjm/giphy.gif', category: 'Celebrations' },

  // === Fails & Disasters ===
  { id: 'explosion', name: 'Explosion', url: 'https://media.giphy.com/media/oe33xf3B50fsc/giphy.gif', category: 'Fails' },
  { id: 'this-is-fine', name: 'This Is Fine', url: 'https://media.giphy.com/media/QMHoU66sBXqqLqYvGO/giphy.gif', category: 'Fails' },
  { id: 'f', name: 'F', url: 'https://media.giphy.com/media/hStvd5LiWCFzYNyxR4/giphy.gif', category: 'Fails' },
  { id: 'disaster', name: 'Disaster', url: 'https://media.giphy.com/media/HUkOv6BNWc1HO/giphy.gif', category: 'Fails' },
  { id: 'rage-quit', name: 'Rage Quit', url: 'https://media.giphy.com/media/11tTNkNy1SdXGg/giphy.gif', category: 'Fails' },
  { id: 'grimace', name: 'Grimace', url: 'https://media.giphy.com/media/3ohzdE2hl1Yuv7hIw8/giphy.gif', category: 'Fails' },
  
  // === Memes & Classics ===
  { id: 'rick-roll', name: 'Rick Roll', url: 'https://media.giphy.com/media/Vuw9m5wXviFIQ/giphy.gif', category: 'Memes' },
  { id: 'nyan-cat', name: 'Nyan Cat', url: 'https://media.giphy.com/media/sIIhZliB2McAo/giphy.gif', category: 'Memes' },
  { id: 'stonks', name: 'Stonks', url: 'https://media.giphy.com/media/YnkMcHgNIMW4Yfmjxr/giphy.gif', category: 'Memes' },
  { id: 'among-us', name: 'Among Us', url: 'https://media.giphy.com/media/RtdRhc7TxBxB0YAsK6/giphy.gif', category: 'Memes' },
  { id: 'surprised-pikachu', name: 'Surprised Pikachu', url: 'https://media.giphy.com/media/6nWhy3ulBL7GSCvKw6/giphy.gif', category: 'Memes' },
  { id: 'thinking', name: 'Thinking', url: 'https://media.giphy.com/media/a5viI92PAF89q/giphy.gif', category: 'Memes' },
  { id: 'money-printer', name: 'Money Printer', url: 'https://media.giphy.com/media/Y2ZUWLrTy63j9T6qrK/giphy.gif', category: 'Memes' },

  // === Stream Alerts ===
  { id: 'welcome', name: 'Welcome', url: 'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif', category: 'Alerts' },
  { id: 'new-sub-gnome', name: 'New Sub Gnome', url: 'https://media.giphy.com/media/l4pTfx2qLszoacZRS/giphy.gif', category: 'Alerts' },
  { id: 'donation', name: 'Donation', url: 'https://media.giphy.com/media/67ThRZlYBvibtdF9JH/giphy.gif', category: 'Alerts' },
  { id: 'bits', name: 'Bits', url: 'https://media.giphy.com/media/3oKIPa2TdahY8LAAxy/giphy.gif', category: 'Alerts' },
  { id: 'new-chatter', name: 'New Chatter', url: 'https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif', category: 'Alerts' },

  // === Emotions ===
  { id: 'laugh', name: 'Laugh', url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif', category: 'Emotions' },
  { id: 'cry', name: 'Cry', url: 'https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif', category: 'Emotions' },
  { id: 'angry', name: 'Angry', url: 'https://media.giphy.com/media/11tTNkNy1SdXGg/giphy.gif', category: 'Emotions' },
  { id: 'scared', name: 'Scared', url: 'https://media.giphy.com/media/bEVKYB487Lqxy/giphy.gif', category: 'Emotions' },
  { id: 'love', name: 'Love', url: 'https://media.giphy.com/media/26FLdmIp6wJr91JAI/giphy.gif', category: 'Emotions' },
  { id: 'sad', name: 'Sad', url: 'https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif', category: 'Emotions' },
  { id: 'nervous', name: 'Nervous', url: 'https://media.giphy.com/media/32mC2kXYWCsg0/giphy.gif', category: 'Emotions' },

  // === Actions ===
  { id: 'wave', name: 'Wave', url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', category: 'Actions' },
  { id: 'salute', name: 'Salute', url: 'https://media.giphy.com/media/rHR8qP1mC5V3G/giphy.gif', category: 'Actions' },
  { id: 'strength-and-honor', name: 'Strength & Honor', url: 'https://media.giphy.com/media/pHb82xtBPfqEg/giphy.gif', category: 'Actions' },
  { id: 'mic-drop', name: 'Mic Drop', url: 'https://media.giphy.com/media/3o7qDSOvfaCO9b3MlO/giphy.gif', category: 'Actions' },
  { id: 'peace-out', name: 'Peace Out', url: 'https://media.giphy.com/media/42D3CxaINsAFemFuId/giphy.gif', category: 'Actions' },
  { id: 'finger-guns', name: 'Finger Guns', url: 'https://media.giphy.com/media/ui1hpJSyBDWlG/giphy.gif', category: 'Actions' },
];

function getGifUrls(roomId) {
  const urlsFile = path.join(UPLOADS_DIR, roomId, 'gif-urls.json');
  if (fs.existsSync(urlsFile)) {
    try {
      return JSON.parse(fs.readFileSync(urlsFile, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId } = req.query;

  // Include pre-defined GIFs - URLs are used directly, local files checked for existence
  const existingGifs = predefinedGifDefs
    .filter((g) => {
      // If it's a URL, include it directly
      if (g.url.startsWith('http')) return true;
      // If it's a local file, check if it exists
      return fs.existsSync(path.join(GIFS_DIR, g.url));
    })
    .map((g) => ({
      id: g.id,
      name: g.name,
      url: g.url.startsWith('http') ? g.url : `/gifs/${g.url}`,
      category: g.category,
      type: 'preset',
    }));

  // Group by category
  const presetCategories = {};
  existingGifs.forEach((gif) => {
    if (!presetCategories[gif.category]) {
      presetCategories[gif.category] = [];
    }
    presetCategories[gif.category].push(gif);
  });

  // Add room-specific uploaded GIFs if they exist
  const customGifs = [];
  if (roomId) {
    const roomGifsDir = path.join(UPLOADS_DIR, roomId, 'gifs');

    if (fs.existsSync(roomGifsDir)) {
      const files = fs.readdirSync(roomGifsDir);

      files.forEach((file) => {
        if (/\.(gif|webp|png|apng)$/i.test(file)) {
          const name = path.basename(file, path.extname(file));
          // Try to load metadata
          const metaFile = path.join(roomGifsDir, `${name}.json`);
          let meta = { position: 'center', animation: 'fade', duration: 3000 };
          if (fs.existsSync(metaFile)) {
            try {
              meta = { ...meta, ...JSON.parse(fs.readFileSync(metaFile, 'utf-8')) };
            } catch {}
          }

          customGifs.push({
            id: `upload-${roomId}-gif-${name}`,
            name: name,
            url: `/uploads/${roomId}/gifs/${file}`,
            filename: file,
            type: 'custom',
            ...meta,
          });
        }
      });
    }

    // Add URL-based GIFs
    const urlGifs = getGifUrls(roomId);
    customGifs.push(...urlGifs);
  }

  res.status(200).json({ presetCategories, customGifs });
}
