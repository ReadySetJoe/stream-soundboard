import fs from 'fs';
import path from 'path';

const SOUNDS_DIR = path.join(process.cwd(), 'public', 'sounds');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Pre-defined sound definitions (only included if file exists)
const predefinedSoundDefs = [
  // Sound Effects
  { id: 'airhorn', name: 'Air Horn', file: 'airhorn.ogg', category: 'Sound Effects' },
  { id: 'foghorn', name: 'Fog Horn', file: 'foghorn.mp3', category: 'Sound Effects' },
  { id: 'slap-bass', name: 'Slap Bass', file: 'slap-bass.mp3', category: 'Sound Effects' },
  { id: 'huh', name: 'Huh?', file: 'huh.mp3', category: 'Sound Effects' },

  // Reactions
  { id: 'sad-trombone', name: 'Sad Trombone', file: 'sad-trombone.wav', category: 'Reactions' },
  { id: 'victory', name: 'Victory', file: 'victory.mp3', category: 'Reactions' },
  { id: 'bruh', name: 'Bruh', file: 'bruh.mp3', category: 'Reactions' },
  { id: 'not-fine', name: 'Not Fine', file: 'not-fine.mp3', category: 'Reactions' },

  // Memes & Clips
  { id: 'curb-your-enthusiasm', name: 'Curb Your Enthusiasm', file: 'curb-your-enthusiasm.mp3', category: 'Memes & Clips' },
  { id: 'wombo-combo', name: 'Wombo Combo', file: 'wombo-combo.mp3', category: 'Memes & Clips' },
  { id: 'x-files', name: 'X-Files', file: 'x-files.mp3', category: 'Memes & Clips' },
  { id: 'you-need-to-leave', name: 'You Need to Leave', file: 'you-need-to-leave.mp3', category: 'Memes & Clips' },

  // Transitions
  { id: 'we-will-be-right-back', name: 'We Will Be Right Back', file: 'we-will-be-right-back.mp3', category: 'Transitions' },
  { id: '2000-years-later', name: '2000 Years Later', file: '2000-years-later.mp3', category: 'Transitions' },
  { id: 'here-we-go-again', name: 'Here We Go Again', file: 'here-we-go-again.mp3', category: 'Transitions' },
  { id: 'to-be-continued', name: 'To Be Continued', file: 'to-be-continued.mp3', category: 'Transitions' },
];

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId } = req.query;

  // Include pre-defined sounds only if the files exist, grouped by category
  const existingSounds = predefinedSoundDefs
    .filter((s) => fs.existsSync(path.join(SOUNDS_DIR, s.file)))
    .map((s) => ({ id: s.id, name: s.name, url: `/sounds/${s.file}`, category: s.category }));

  // Group by category
  const presetCategories = {};
  existingSounds.forEach((sound) => {
    if (!presetCategories[sound.category]) {
      presetCategories[sound.category] = [];
    }
    presetCategories[sound.category].push(sound);
  });

  // Add room-specific uploaded sounds if they exist
  const customSounds = [];
  if (roomId) {
    const roomUploadsDir = path.join(UPLOADS_DIR, roomId);

    if (fs.existsSync(roomUploadsDir)) {
      const files = fs.readdirSync(roomUploadsDir);

      files.forEach((file) => {
        if (file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg')) {
          const name = path.basename(file, path.extname(file));
          customSounds.push({
            id: `upload-${roomId}-${name}`,
            name: name,
            url: `/uploads/${roomId}/${file}`,
            filename: file,
          });
        }
      });
    }
  }

  res.status(200).json({ presetCategories, customSounds });
}
