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
  fs.writeFileSync(getGifUrlsPath(roomId), JSON.stringify(urls, null, 2));
}

export default function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId, id, filename } = req.query;

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID is required' });
  }

  try {
    // Handle URL-based GIF deletion
    if (id && id.startsWith('url-')) {
      const urls = getGifUrls(roomId);
      const newUrls = urls.filter(g => g.id !== id);
      saveGifUrls(roomId, newUrls);

      if (req.io) {
        req.io.to(roomId).emit('gifs-updated');
      }

      return res.status(200).json({ success: true });
    }

    // Handle uploaded file deletion
    if (!filename) {
      return res.status(400).json({ error: 'Filename or ID is required' });
    }

    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, roomId, 'gifs', safeFilename);

    // Verify the file is within the expected directory
    if (!filePath.startsWith(path.join(UPLOADS_DIR, roomId, 'gifs'))) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);

      // Also delete metadata file if exists
      const name = path.basename(safeFilename, path.extname(safeFilename));
      const metaPath = path.join(UPLOADS_DIR, roomId, 'gifs', `${name}.json`);
      if (fs.existsSync(metaPath)) {
        fs.unlinkSync(metaPath);
      }

      if (req.io) {
        req.io.to(roomId).emit('gifs-updated');
      }

      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete GIF' });
  }
}
