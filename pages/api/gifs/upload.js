import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId } = req.query;

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID is required' });
  }

  // Ensure uploads/gifs directory exists for this room
  const roomGifsDir = path.join(UPLOADS_DIR, roomId, 'gifs');
  if (!fs.existsSync(roomGifsDir)) {
    fs.mkdirSync(roomGifsDir, { recursive: true });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    const boundary = req.headers['content-type'].split('boundary=')[1];
    const parts = parseMultipart(buffer, boundary);

    const filePart = parts.find(p => p.filename);
    const namePart = parts.find(p => p.name === 'name');
    const positionPart = parts.find(p => p.name === 'position');
    const animationPart = parts.find(p => p.name === 'animation');
    const durationPart = parts.find(p => p.name === 'duration');

    if (!filePart) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const ext = path.extname(filePart.filename).toLowerCase();
    if (!['.gif', '.webp', '.png', '.apng'].includes(ext)) {
      return res.status(400).json({ error: 'Invalid file type. Only GIF, WebP, PNG, and APNG are allowed.' });
    }

    // Use custom name or original filename
    const gifName = namePart?.value?.trim() || path.basename(filePart.filename, ext);
    const safeFilename = gifName.replace(/[^a-zA-Z0-9-_]/g, '_') + ext;
    const filePath = path.join(roomGifsDir, safeFilename);

    fs.writeFileSync(filePath, filePart.data);

    // Save metadata
    const meta = {
      position: positionPart?.value || 'center',
      animation: animationPart?.value || 'fade',
      duration: parseInt(durationPart?.value) || 3000,
    };
    const metaPath = path.join(roomGifsDir, `${gifName.replace(/[^a-zA-Z0-9-_]/g, '_')}.json`);
    fs.writeFileSync(metaPath, JSON.stringify(meta));

    const gif = {
      id: `upload-${roomId}-gif-${gifName}`,
      name: gifName,
      url: `/uploads/${roomId}/gifs/${safeFilename}`,
      type: 'custom',
      ...meta,
    };

    // Notify room about new GIF via socket.io
    if (req.io) {
      req.io.to(roomId).emit('gifs-updated', { gif });
    }

    res.status(200).json({ success: true, gif });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}

function parseMultipart(buffer, boundary) {
  const parts = [];
  const str = buffer.toString('binary');
  const sections = str.split(`--${boundary}`);

  for (const section of sections) {
    if (section.trim() === '' || section.trim() === '--') continue;

    const headerEnd = section.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;

    const header = section.substring(0, headerEnd);
    const body = section.substring(headerEnd + 4);
    const cleanBody = body.replace(/\r\n$/, '');

    const nameMatch = header.match(/name="([^"]+)"/);
    const filenameMatch = header.match(/filename="([^"]+)"/);

    if (filenameMatch) {
      parts.push({
        name: nameMatch ? nameMatch[1] : null,
        filename: filenameMatch[1],
        data: Buffer.from(cleanBody, 'binary'),
      });
    } else if (nameMatch) {
      parts.push({
        name: nameMatch[1],
        value: cleanBody,
      });
    }
  }

  return parts;
}
