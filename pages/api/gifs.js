import fs from 'fs';
import path from 'path';

const GIFS_DIR = path.join(process.cwd(), 'public', 'gifs');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Pre-defined GIF definitions (only included if file exists)
const predefinedGifDefs = [
  // Reactions
  { id: 'deal-with-it', name: 'Deal With It', file: 'deal-with-it.gif', category: 'Reactions', position: 'center', animation: 'slide', duration: 3000 },
  { id: 'mind-blown', name: 'Mind Blown', file: 'mind-blown.gif', category: 'Reactions', position: 'center', animation: 'zoom', duration: 3000 },
  { id: 'thumbs-up', name: 'Thumbs Up', file: 'thumbs-up.gif', category: 'Reactions', position: 'center', animation: 'bounce', duration: 3000 },
  { id: 'facepalm', name: 'Facepalm', file: 'facepalm.gif', category: 'Reactions', position: 'center', animation: 'fade', duration: 3000 },

  // Effects
  { id: 'explosion', name: 'Explosion', file: 'explosion.gif', category: 'Effects', position: 'center', animation: 'zoom', duration: 2000 },
  { id: 'fire', name: 'Fire', file: 'fire.gif', category: 'Effects', position: 'bottom-center', animation: 'fade', duration: 3000 },
  { id: 'confetti', name: 'Confetti', file: 'confetti.gif', category: 'Effects', position: 'top-center', animation: 'fade', duration: 4000 },
  { id: 'sparkles', name: 'Sparkles', file: 'sparkles.gif', category: 'Effects', position: 'center', animation: 'fade', duration: 3000 },
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

  // Include pre-defined GIFs only if the files exist, grouped by category
  const existingGifs = predefinedGifDefs
    .filter((g) => fs.existsSync(path.join(GIFS_DIR, g.file)))
    .map((g) => ({
      id: g.id,
      name: g.name,
      url: `/gifs/${g.file}`,
      category: g.category,
      type: 'preset',
      position: g.position,
      animation: g.animation,
      duration: g.duration,
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
