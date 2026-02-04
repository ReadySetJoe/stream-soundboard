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

  // Ensure uploads directory exists for this room
  const roomDir = path.join(UPLOADS_DIR, roomId);
  if (!fs.existsSync(roomDir)) {
    fs.mkdirSync(roomDir, { recursive: true });
  }

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    // Parse multipart form data manually (simple implementation)
    const boundary = req.headers['content-type'].split('boundary=')[1];
    const parts = parseMultipart(buffer, boundary);

    const filePart = parts.find(p => p.filename);
    const namePart = parts.find(p => p.name === 'name');

    if (!filePart) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const ext = path.extname(filePart.filename).toLowerCase();
    if (!['.mp3', '.wav', '.ogg'].includes(ext)) {
      return res.status(400).json({ error: 'Invalid file type. Only MP3, WAV, and OGG are allowed.' });
    }

    // Use custom name or original filename
    const soundName = namePart?.value?.trim() || path.basename(filePart.filename, ext);
    const safeFilename = soundName.replace(/[^a-zA-Z0-9-_]/g, '_') + ext;
    const filePath = path.join(roomDir, safeFilename);

    fs.writeFileSync(filePath, filePart.data);

    const sound = {
      id: `upload-${roomId}-${soundName}`,
      name: soundName,
      url: `/uploads/${roomId}/${safeFilename}`,
      isUpload: true,
    };

    // Notify room about new sound via socket.io (if available)
    if (req.io) {
      req.io.to(roomId).emit('sounds-updated', { sound });
    }

    res.status(200).json({ success: true, sound });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}

function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const str = buffer.toString('binary');

  const sections = str.split(`--${boundary}`);

  for (const section of sections) {
    if (section.trim() === '' || section.trim() === '--') continue;

    const headerEnd = section.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;

    const header = section.substring(0, headerEnd);
    const body = section.substring(headerEnd + 4);

    // Remove trailing \r\n
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
