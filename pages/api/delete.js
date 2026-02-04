import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export default function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId, filename } = req.query;

  if (!roomId || !filename) {
    return res.status(400).json({ error: 'Room ID and filename are required' });
  }

  // Sanitize filename to prevent directory traversal
  const safeFilename = path.basename(filename);
  const filePath = path.join(UPLOADS_DIR, roomId, safeFilename);

  // Ensure the file is within the uploads directory
  if (!filePath.startsWith(UPLOADS_DIR)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Sound not found' });
  }

  try {
    fs.unlinkSync(filePath);

    // Notify room about deleted sound via socket.io (if available)
    if (req.io) {
      req.io.to(roomId).emit('sounds-updated');
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete sound' });
  }
}
