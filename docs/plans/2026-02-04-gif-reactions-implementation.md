# GIF Reactions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add visual GIF reactions that display on the OBS output when triggered from the input controller.

**Architecture:** Extends existing socket pattern (input emits → server broadcasts → output renders). GIFs render in a 3x3 position grid with configurable CSS animations.

**Tech Stack:** React, Next.js Pages Router, Socket.io, CSS Keyframes, existing multipart upload pattern.

---

## Task 1: Add Socket Events for GIFs

**Files:**
- Modify: `server.js:47-51`

**Step 1: Add play-gif socket handler**

Add after the existing `play-sound` handler (around line 51):

```javascript
socket.on('play-gif', ({ roomId, gifId, gifUrl, position, animation, duration }) => {
  console.log(`Playing gif ${gifId} in room ${roomId}`);
  socket.to(roomId).emit('gif-triggered', { gifId, gifUrl, position, animation, duration });
});
```

**Step 2: Test manually**

Start the server and verify no errors:
```bash
npm run dev
```

**Step 3: Commit**

```bash
git add server.js
git commit -m "feat: add play-gif socket event handler"
```

---

## Task 2: Add CSS Animations for GIFs

**Files:**
- Modify: `styles/globals.css` (append to end)

**Step 1: Add GIF overlay container styles**

Append to `styles/globals.css`:

```css
/* GIF Overlay Styles */
.gif-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.gif-container {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Position classes */
.gif-container.top-left { top: 0; left: 0; }
.gif-container.top-center { top: 0; left: 50%; transform: translateX(-50%); }
.gif-container.top-right { top: 0; right: 0; }
.gif-container.middle-left { top: 50%; left: 0; transform: translateY(-50%); }
.gif-container.center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
.gif-container.middle-right { top: 50%; right: 0; transform: translateY(-50%); }
.gif-container.bottom-left { bottom: 0; left: 0; }
.gif-container.bottom-center { bottom: 0; left: 50%; transform: translateX(-50%); }
.gif-container.bottom-right { bottom: 0; right: 0; }

.gif-container img {
  max-width: 300px;
  max-height: 300px;
}
```

**Step 2: Add animation keyframes**

Continue appending to `styles/globals.css`:

```css
/* GIF Animations */
@keyframes gif-fade {
  0% { opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes gif-slide-left {
  0% { opacity: 0; transform: translateX(-100px); }
  15% { opacity: 1; transform: translateX(0); }
  85% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(-100px); }
}

@keyframes gif-slide-right {
  0% { opacity: 0; transform: translateX(100px); }
  15% { opacity: 1; transform: translateX(0); }
  85% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(100px); }
}

@keyframes gif-slide-top {
  0% { opacity: 0; transform: translateY(-100px); }
  15% { opacity: 1; transform: translateY(0); }
  85% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-100px); }
}

@keyframes gif-slide-bottom {
  0% { opacity: 0; transform: translateY(100px); }
  15% { opacity: 1; transform: translateY(0); }
  85% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(100px); }
}

@keyframes gif-bounce {
  0% { opacity: 0; transform: scale(0.3); }
  15% { opacity: 1; transform: scale(1.1); }
  25% { transform: scale(0.9); }
  35% { transform: scale(1.03); }
  45% { transform: scale(0.97); }
  55% { transform: scale(1); }
  85% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.3); }
}

@keyframes gif-shake {
  0% { opacity: 0; }
  10% { opacity: 1; }
  20%, 80% { opacity: 1; }
  22% { transform: translateX(-10px); }
  24% { transform: translateX(10px); }
  26% { transform: translateX(-10px); }
  28% { transform: translateX(10px); }
  30% { transform: translateX(0); }
  100% { opacity: 0; }
}

@keyframes gif-spin {
  0% { opacity: 0; transform: rotate(0deg) scale(0.5); }
  15% { opacity: 1; transform: rotate(360deg) scale(1); }
  85% { opacity: 1; transform: rotate(360deg) scale(1); }
  100% { opacity: 0; transform: rotate(720deg) scale(0.5); }
}

@keyframes gif-zoom {
  0% { opacity: 0; transform: scale(0); }
  10% { opacity: 1; transform: scale(1.2); }
  20% { transform: scale(1); }
  85% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0); }
}

@keyframes gif-wiggle {
  0% { opacity: 0; transform: rotate(0deg); }
  10% { opacity: 1; }
  20% { transform: rotate(-5deg); }
  30% { transform: rotate(5deg); }
  40% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
  60% { transform: rotate(-5deg); }
  70% { transform: rotate(5deg); }
  80% { transform: rotate(0deg); opacity: 1; }
  100% { opacity: 0; }
}

@keyframes gif-bounce-around {
  0% { opacity: 0; transform: translate(0, 0); }
  10% { opacity: 1; transform: translate(20px, -30px); }
  20% { transform: translate(-25px, 15px); }
  30% { transform: translate(15px, -20px); }
  40% { transform: translate(-20px, 25px); }
  50% { transform: translate(25px, -15px); }
  60% { transform: translate(-15px, 20px); }
  70% { transform: translate(20px, -25px); }
  80% { transform: translate(0, 0); opacity: 1; }
  100% { opacity: 0; transform: translate(0, 0); }
}

/* Animation classes */
.gif-anim-fade { animation: gif-fade var(--gif-duration, 3s) ease-in-out forwards; }
.gif-anim-slide { animation: gif-slide-left var(--gif-duration, 3s) ease-out forwards; }
.gif-anim-bounce { animation: gif-bounce var(--gif-duration, 3s) ease-out forwards; }
.gif-anim-shake { animation: gif-shake var(--gif-duration, 3s) ease-in-out forwards; }
.gif-anim-spin { animation: gif-spin var(--gif-duration, 3s) ease-in-out forwards; }
.gif-anim-zoom { animation: gif-zoom var(--gif-duration, 3s) ease-out forwards; }
.gif-anim-wiggle { animation: gif-wiggle var(--gif-duration, 3s) ease-in-out forwards; }
.gif-anim-bounce-around { animation: gif-bounce-around var(--gif-duration, 3s) ease-in-out forwards; }
```

**Step 3: Commit**

```bash
git add styles/globals.css
git commit -m "feat: add CSS animations for GIF overlay"
```

---

## Task 3: Update Output Page to Render GIFs

**Files:**
- Modify: `pages/[roomId]/output.js`

**Step 1: Add state for active GIFs**

Add after the existing `audioRefs` line (around line 10):

```javascript
const [activeGifs, setActiveGifs] = useState([]);
```

**Step 2: Add gif-triggered socket listener**

Inside the `useEffect` that sets up socket listeners, add after the `sound-triggered` listener:

```javascript
socket.on('gif-triggered', ({ gifId, gifUrl, position, animation, duration }) => {
  console.log('GIF triggered:', gifId, gifUrl);
  const id = `${gifId}-${Date.now()}`;

  setActiveGifs(prev => [...prev, { id, gifUrl, position, animation, duration }]);

  // Remove after duration
  setTimeout(() => {
    setActiveGifs(prev => prev.filter(g => g.id !== id));
  }, duration || 3000);
});
```

**Step 3: Add cleanup for gif-triggered**

In the cleanup return function, add:

```javascript
socket.off('gif-triggered');
```

**Step 4: Add GIF overlay to JSX**

Replace the return statement with:

```javascript
return (
  <>
    <Head>
      <title>{`Output - ${roomId || ''}`}</title>
      <style>{`
        body {
          background: transparent !important;
        }
      `}</style>
    </Head>
    <div className="output-page">
      {/* GIF overlay */}
      <div className="gif-overlay">
        {activeGifs.map((gif) => (
          <div
            key={gif.id}
            className={`gif-container ${gif.position || 'center'}`}
          >
            <img
              src={gif.gifUrl}
              alt=""
              className={`gif-anim-${gif.animation || 'fade'}`}
              style={{ '--gif-duration': `${(gif.duration || 3000) / 1000}s` }}
            />
          </div>
        ))}
      </div>

      {/* Hidden audio elements for preloading */}
      <div className="output-hidden">
        {sounds.map((sound) => (
          <audio
            key={sound.id}
            ref={(el) => {
              if (el) audioRefs.current[sound.id] = el;
            }}
            src={sound.url}
            preload="auto"
          />
        ))}
      </div>
    </div>
  </>
);
```

**Step 5: Commit**

```bash
git add pages/[roomId]/output.js
git commit -m "feat: add GIF rendering to output page"
```

---

## Task 4: Create GIFs API Endpoint

**Files:**
- Create: `pages/api/gifs.js`

**Step 1: Create the GIFs API**

Create `pages/api/gifs.js`:

```javascript
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
```

**Step 2: Commit**

```bash
git add pages/api/gifs.js
git commit -m "feat: add GIFs API endpoint"
```

---

## Task 5: Create GIF Upload API

**Files:**
- Create: `pages/api/gifs/upload.js`

**Step 1: Create the upload endpoint**

Create directory and file `pages/api/gifs/upload.js`:

```javascript
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
```

**Step 2: Commit**

```bash
git add pages/api/gifs/upload.js
git commit -m "feat: add GIF upload API endpoint"
```

---

## Task 6: Create GIF URL API

**Files:**
- Create: `pages/api/gifs/url.js`

**Step 1: Create the URL endpoint**

Create `pages/api/gifs/url.js`:

```javascript
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
```

**Step 2: Commit**

```bash
git add pages/api/gifs/url.js
git commit -m "feat: add GIF URL API endpoint"
```

---

## Task 7: Create GIF Delete API

**Files:**
- Create: `pages/api/gifs/delete.js`

**Step 1: Create the delete endpoint**

Create `pages/api/gifs/delete.js`:

```javascript
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
```

**Step 2: Commit**

```bash
git add pages/api/gifs/delete.js
git commit -m "feat: add GIF delete API endpoint"
```

---

## Task 8: Add Tab Styles to CSS

**Files:**
- Modify: `styles/globals.css`

**Step 1: Add tab component styles**

Append to `styles/globals.css`:

```css
/* Tab Navigation */
.tab-nav {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #3d3d5c;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #888;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-btn:hover {
  color: #aaa;
}

.tab-btn.active {
  color: #fff;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* GIF Grid */
.gif-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.gif-item {
  position: relative;
}

.gif-btn {
  width: 100%;
  aspect-ratio: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 12px;
  background: #2d2d44;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  overflow: hidden;
}

.gif-btn:hover {
  transform: scale(1.05);
}

.gif-btn:active {
  transform: scale(0.95);
}

.gif-btn.playing {
  animation: pulse 0.3s ease-out;
}

.gif-btn img {
  max-width: 80%;
  max-height: 60%;
  object-fit: contain;
  border-radius: 4px;
}

.gif-btn .gif-name {
  font-size: 0.75rem;
  color: #aaa;
  text-align: center;
  word-break: break-word;
  max-height: 2.4em;
  overflow: hidden;
}

.gif-item .delete-btn {
  top: 4px;
  right: 4px;
}

.gif-item .edit-btn {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
}

.gif-item:hover .edit-btn {
  opacity: 1;
}

.edit-btn:hover {
  background: #667eea;
}

/* Add GIF Section */
.add-gif-section {
  background: #2d2d44;
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 2rem;
}

.add-gif-section h2 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.add-gif-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.add-gif-tabs button {
  padding: 0.5rem 1rem;
  border: 1px solid #444;
  border-radius: 8px;
  background: transparent;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.add-gif-tabs button.active {
  background: #3d3d5c;
  border-color: #667eea;
  color: #fff;
}

.gif-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.gif-form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.gif-form-row > * {
  flex: 1;
  min-width: 120px;
}

.gif-form select,
.gif-form input[type="text"],
.gif-form input[type="url"],
.gif-form input[type="number"] {
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 8px;
  background: #1a1a2e;
  color: #eee;
  font-size: 0.9rem;
}

.gif-form select:focus,
.gif-form input:focus {
  outline: none;
  border-color: #667eea;
}

.gif-form label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #888;
}

.gif-form .form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
```

**Step 2: Commit**

```bash
git add styles/globals.css
git commit -m "feat: add tab and GIF form styles"
```

---

## Task 9: Update Input Page with Tabs and GIF UI

**Files:**
- Modify: `pages/[roomId]/input.js`

**Step 1: Add new state variables**

Add after the existing state declarations (around line 17):

```javascript
const [activeTab, setActiveTab] = useState('sounds');
const [presetGifCategories, setPresetGifCategories] = useState({});
const [customGifs, setCustomGifs] = useState([]);
const [playingGif, setPlayingGif] = useState(null);
const [gifUploadStatus, setGifUploadStatus] = useState(null);
const [addGifMode, setAddGifMode] = useState('upload'); // 'upload' or 'url'
const [selectedGifFile, setSelectedGifFile] = useState(null);
const [gifFormData, setGifFormData] = useState({
  name: '',
  url: '',
  position: 'center',
  animation: 'fade',
  duration: 3000,
});
```

**Step 2: Add fetchGifs function**

Add after the `fetchSounds` function:

```javascript
// Fetch GIFs list
const fetchGifs = useCallback(async () => {
  if (!roomId) return;

  try {
    const res = await fetch(`/api/gifs?roomId=${roomId}`);
    const data = await res.json();
    setPresetGifCategories(data.presetCategories || {});
    setCustomGifs(data.customGifs || []);
  } catch (error) {
    console.error('Failed to fetch GIFs:', error);
  }
}, [roomId]);
```

**Step 3: Update socket useEffect**

Add `gifs-updated` listener inside the useEffect, after `sounds-updated`:

```javascript
s.on('gifs-updated', () => {
  fetchGifs();
});
```

Add `fetchGifs()` call after `fetchSounds()`:

```javascript
fetchGifs();
```

Add cleanup in return:

```javascript
s.off('gifs-updated');
```

**Step 4: Add GIF handler functions**

Add after the `handleDelete` function:

```javascript
// Play GIF handler
const handlePlayGif = (gif) => {
  if (!socket || !connected) return;

  setPlayingGif(gif.id);
  socket.emit('play-gif', {
    roomId,
    gifId: gif.id,
    gifUrl: gif.url,
    position: gif.position || 'center',
    animation: gif.animation || 'fade',
    duration: gif.duration || 3000,
  });

  setTimeout(() => setPlayingGif(null), 300);
};

// GIF Upload handler
const handleGifUpload = async (e) => {
  e.preventDefault();

  if (!selectedGifFile) {
    setGifUploadStatus({ type: 'error', message: 'Please select a file' });
    return;
  }

  setGifUploadStatus({ type: 'info', message: 'Uploading...' });

  const formData = new FormData();
  formData.append('file', selectedGifFile);
  formData.append('name', gifFormData.name || '');
  formData.append('position', gifFormData.position);
  formData.append('animation', gifFormData.animation);
  formData.append('duration', gifFormData.duration.toString());

  try {
    const res = await fetch(`/api/gifs/upload?roomId=${roomId}`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      setGifUploadStatus({ type: 'success', message: `Uploaded: ${data.gif.name}` });
      fetchGifs();
      setSelectedGifFile(null);
      setGifFormData({ name: '', url: '', position: 'center', animation: 'fade', duration: 3000 });
    } else {
      setGifUploadStatus({ type: 'error', message: data.error || 'Upload failed' });
    }
  } catch (error) {
    setGifUploadStatus({ type: 'error', message: 'Upload failed' });
  }

  setTimeout(() => setGifUploadStatus(null), 3000);
};

// GIF URL handler
const handleGifUrl = async (e) => {
  e.preventDefault();

  if (!gifFormData.url) {
    setGifUploadStatus({ type: 'error', message: 'Please enter a URL' });
    return;
  }

  setGifUploadStatus({ type: 'info', message: 'Adding...' });

  try {
    const res = await fetch(`/api/gifs/url?roomId=${roomId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gifFormData),
    });

    const data = await res.json();

    if (res.ok) {
      setGifUploadStatus({ type: 'success', message: `Added: ${data.gif.name}` });
      fetchGifs();
      setGifFormData({ name: '', url: '', position: 'center', animation: 'fade', duration: 3000 });
    } else {
      setGifUploadStatus({ type: 'error', message: data.error || 'Failed to add' });
    }
  } catch (error) {
    setGifUploadStatus({ type: 'error', message: 'Failed to add' });
  }

  setTimeout(() => setGifUploadStatus(null), 3000);
};

// GIF Delete handler
const handleDeleteGif = async (gif) => {
  if (!confirm(`Delete "${gif.name}"?`)) return;

  try {
    const params = new URLSearchParams({ roomId });
    if (gif.type === 'url') {
      params.append('id', gif.id);
    } else {
      params.append('filename', gif.filename);
    }

    const res = await fetch(`/api/gifs/delete?${params}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchGifs();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to delete GIF');
    }
  } catch (error) {
    alert('Failed to delete GIF');
  }
};
```

**Step 5: Update the JSX return**

Replace the entire return statement with the new tabbed UI (this is a large change - see full code below).

The key changes:
1. Add tab navigation after the OBS URL section
2. Wrap sounds content in a conditional `{activeTab === 'sounds' && ...}`
3. Add GIFs tab content with `{activeTab === 'gifs' && ...}`

Full updated return:

```javascript
return (
  <>
    <Head>
      <title>{`JOE-BS Soundboard - ${roomId || ''}`}</title>
    </Head>
    <div className="input-page container">
      <h1>JOE-BS Soundboard</h1>
      <p className="room-info">
        Room: <strong>{roomId}</strong>
      </p>

      <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        {connected ? 'Connected' : 'Disconnected'}
      </div>

      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#2d2d44', borderRadius: '8px' }}>
        <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>
          Browser Source URL for OBS:
        </p>
        <code style={{ color: '#4ecdc4', wordBreak: 'break-all' }}>{outputUrl}</code>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'sounds' ? 'active' : ''}`}
          onClick={() => setActiveTab('sounds')}
        >
          Sounds
        </button>
        <button
          className={`tab-btn ${activeTab === 'gifs' ? 'active' : ''}`}
          onClick={() => setActiveTab('gifs')}
        >
          GIFs
        </button>
      </div>

      {/* Sounds Tab */}
      {activeTab === 'sounds' && (
        <>
          {Object.keys(presetCategories).length > 0 && (
            <>
              {Object.entries(presetCategories).map(([category, sounds]) => (
                <div key={category} className="sound-category">
                  <h3 className="category-title">{category}</h3>
                  <div className="sound-grid">
                    {sounds.map((sound) => (
                      <button
                        key={sound.id}
                        className={`sound-btn ${playingSound === sound.id ? 'playing' : ''}`}
                        onClick={() => handlePlaySound(sound)}
                        disabled={!connected}
                      >
                        {sound.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          <h2 style={{ marginBottom: '1rem', marginTop: Object.keys(presetCategories).length > 0 ? '2rem' : 0 }}>
            Custom Sounds
          </h2>
          {customSounds.length > 0 ? (
            <div className="sound-grid">
              {customSounds.map((sound) => (
                <div key={sound.id} className="sound-item">
                  <button
                    className={`sound-btn ${playingSound === sound.id ? 'playing' : ''}`}
                    onClick={() => handlePlaySound(sound)}
                    disabled={!connected}
                  >
                    {sound.name}
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(sound)}
                    title="Delete sound"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', marginBottom: '1rem' }}>No custom sounds yet. Upload one below!</p>
          )}

          <div className="upload-section">
            <h2>Upload Custom Sound</h2>
            <form className="upload-form" onSubmit={handleUpload}>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  name="file"
                  id="file-upload"
                  accept=".mp3,.wav,.ogg"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                />
                <label
                  htmlFor="file-upload"
                  className={`file-input-label ${selectedFile ? 'has-file' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {selectedFile ? 'Change file' : 'Choose file'}
                </label>
                {selectedFile && <span className="file-name">{selectedFile.name}</span>}
              </div>
              <input type="text" name="name" placeholder="Sound name (optional)" />
              <button type="submit" className="btn btn-primary" disabled={!selectedFile}>
                Upload
              </button>
            </form>
            {uploadStatus && (
              <div className={`upload-status ${uploadStatus.type}`}>
                {uploadStatus.message}
              </div>
            )}
          </div>
        </>
      )}

      {/* GIFs Tab */}
      {activeTab === 'gifs' && (
        <>
          {Object.keys(presetGifCategories).length > 0 && (
            <>
              {Object.entries(presetGifCategories).map(([category, gifs]) => (
                <div key={category} className="sound-category">
                  <h3 className="category-title">{category}</h3>
                  <div className="gif-grid">
                    {gifs.map((gif) => (
                      <button
                        key={gif.id}
                        className={`gif-btn ${playingGif === gif.id ? 'playing' : ''}`}
                        onClick={() => handlePlayGif(gif)}
                        disabled={!connected}
                      >
                        <img src={gif.url} alt={gif.name} />
                        <span className="gif-name">{gif.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          <h2 style={{ marginBottom: '1rem', marginTop: Object.keys(presetGifCategories).length > 0 ? '2rem' : 0 }}>
            Custom GIFs
          </h2>
          {customGifs.length > 0 ? (
            <div className="gif-grid">
              {customGifs.map((gif) => (
                <div key={gif.id} className="gif-item">
                  <button
                    className={`gif-btn ${playingGif === gif.id ? 'playing' : ''}`}
                    onClick={() => handlePlayGif(gif)}
                    disabled={!connected}
                  >
                    <img src={gif.url} alt={gif.name} />
                    <span className="gif-name">{gif.name}</span>
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteGif(gif)}
                    title="Delete GIF"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', marginBottom: '1rem' }}>No custom GIFs yet. Add one below!</p>
          )}

          <div className="add-gif-section">
            <h2>Add GIF</h2>

            <div className="add-gif-tabs">
              <button
                className={addGifMode === 'upload' ? 'active' : ''}
                onClick={() => setAddGifMode('upload')}
              >
                Upload File
              </button>
              <button
                className={addGifMode === 'url' ? 'active' : ''}
                onClick={() => setAddGifMode('url')}
              >
                Paste URL
              </button>
            </div>

            <form className="gif-form" onSubmit={addGifMode === 'upload' ? handleGifUpload : handleGifUrl}>
              {addGifMode === 'upload' ? (
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="gif-file-upload"
                    accept=".gif,.webp,.png,.apng"
                    onChange={(e) => setSelectedGifFile(e.target.files[0] || null)}
                  />
                  <label
                    htmlFor="gif-file-upload"
                    className={`file-input-label ${selectedGifFile ? 'has-file' : ''}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {selectedGifFile ? 'Change file' : 'Choose GIF'}
                  </label>
                  {selectedGifFile && <span className="file-name">{selectedGifFile.name}</span>}
                </div>
              ) : (
                <label>
                  GIF URL
                  <input
                    type="url"
                    placeholder="https://media.giphy.com/..."
                    value={gifFormData.url}
                    onChange={(e) => setGifFormData({ ...gifFormData, url: e.target.value })}
                  />
                </label>
              )}

              <div className="gif-form-row">
                <label>
                  Name (optional)
                  <input
                    type="text"
                    placeholder="My GIF"
                    value={gifFormData.name}
                    onChange={(e) => setGifFormData({ ...gifFormData, name: e.target.value })}
                  />
                </label>
              </div>

              <div className="gif-form-row">
                <label>
                  Position
                  <select
                    value={gifFormData.position}
                    onChange={(e) => setGifFormData({ ...gifFormData, position: e.target.value })}
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                    <option value="middle-left">Middle Left</option>
                    <option value="center">Center</option>
                    <option value="middle-right">Middle Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </label>

                <label>
                  Animation
                  <select
                    value={gifFormData.animation}
                    onChange={(e) => setGifFormData({ ...gifFormData, animation: e.target.value })}
                  >
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                    <option value="bounce">Bounce</option>
                    <option value="shake">Shake</option>
                    <option value="spin">Spin</option>
                    <option value="zoom">Zoom</option>
                    <option value="wiggle">Wiggle</option>
                    <option value="bounce-around">Bounce Around</option>
                  </select>
                </label>

                <label>
                  Duration (seconds)
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={gifFormData.duration / 1000}
                    onChange={(e) => setGifFormData({ ...gifFormData, duration: parseFloat(e.target.value) * 1000 })}
                  />
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addGifMode === 'upload' ? !selectedGifFile : !gifFormData.url}
                >
                  {addGifMode === 'upload' ? 'Upload' : 'Add GIF'}
                </button>
              </div>
            </form>

            {gifUploadStatus && (
              <div className={`upload-status ${gifUploadStatus.type}`}>
                {gifUploadStatus.message}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  </>
);
```

**Step 6: Commit**

```bash
git add pages/[roomId]/input.js
git commit -m "feat: add tabbed UI with GIF controls to input page"
```

---

## Task 10: Create public/gifs Directory

**Files:**
- Create: `public/gifs/.gitkeep`

**Step 1: Create directory structure**

```bash
mkdir -p public/gifs
touch public/gifs/.gitkeep
```

**Step 2: Commit**

```bash
git add public/gifs/.gitkeep
git commit -m "feat: add public/gifs directory for preset GIFs"
```

---

## Task 11: Test End-to-End

**Step 1: Start the dev server**

```bash
npm run dev
```

**Step 2: Manual testing checklist**

1. Open http://localhost:3000 and create a room
2. Open the output URL in another tab
3. Verify tabs switch between Sounds and GIFs
4. Add a GIF via URL (use any Giphy URL)
5. Click the GIF button - verify it appears in output tab
6. Verify position and animation work correctly
7. Upload a local GIF file
8. Delete a custom GIF
9. Test multiple GIFs triggering simultaneously

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address any issues found in testing"
```

---

## Summary

This implementation adds:
- Socket events for GIF triggering (`play-gif` / `gif-triggered`)
- CSS animations for 8 different entrance/exit effects
- 9-position grid overlay on output page
- API endpoints for fetching, uploading, URL-adding, and deleting GIFs
- Tabbed UI on input page to switch between Sounds and GIFs
- Full form for configuring position, animation, and duration per GIF

Future expansion points:
- Add preset GIF files to `public/gifs/`
- Add video clip support (similar pattern)
- Add full-screen transition mode
