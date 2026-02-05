import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

function getGifUrlsPath(roomId) {
  return path.join(UPLOADS_DIR, roomId, 'gif-urls.json');
}

function getGifUrls(roomId) {
  const urlsFile = getGifUrlsPath(roomId);
  if (fs.existsSync(urlsFile)) {
    try {
      return JSON.parse(fs.readFileSync(urlsFile, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

function saveGifUrls(roomId, urls) {
  const roomDir = path.join(UPLOADS_DIR, roomId);
  if (!fs.existsSync(roomDir)) {
    fs.mkdirSync(roomDir, { recursive: true });
  }
  fs.writeFileSync(getGifUrlsPath(roomId), JSON.stringify(urls, null, 2));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId } = req.query;

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID is required' });
  }

  try {
    const { url, name, position, animation, duration } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const gifName = name?.trim() || 'Custom GIF';
    const gifId = `url-${roomId}-${Date.now()}`;

    const gif = {
      id: gifId,
      name: gifName,
      url: url,
      type: 'url',
      position: position || 'center',
      animation: animation || 'fade',
      duration: parseInt(duration) || 3000,
    };

    // Add to URL list
    const urls = getGifUrls(roomId);
    urls.push(gif);
    saveGifUrls(roomId, urls);

    // Notify room
    if (req.io) {
      req.io.to(roomId).emit('gifs-updated', { gif });
    }

    res.status(200).json({ success: true, gif });
  } catch (error) {
    console.error('URL add error:', error);
    res.status(500).json({ error: 'Failed to add URL' });
  }
}
