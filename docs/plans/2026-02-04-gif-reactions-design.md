# GIF Reactions Feature Design

## Overview

Add visual GIF/image reactions to the soundboard that display on the output page (OBS browser source) when triggered from the input page.

## Architecture

Follows the existing sound pattern:

```
Input Page (trigger) → Socket.io → Output Page (display)
```

### Socket Events

- `play-gif` - Input emits: `{ roomId, gifId, gifUrl, position, animation, duration }`
- `gif-triggered` - Output receives and renders the GIF

### Data Model

```javascript
{
  id: 'unique-id',
  name: 'Deal With It',
  url: '/gifs/deal-with-it.gif',  // or external URL or upload path
  type: 'preset' | 'custom' | 'url',
  position: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right',
  animation: 'fade' | 'slide' | 'bounce' | 'shake' | 'spin' | 'zoom' | 'wiggle' | 'bounce-around',
  duration: 3000  // milliseconds, default 3000
}
```

### Storage

- **Presets:** Defined in code, files in `public/gifs/`
- **Custom uploads:** Stored in `uploads/{roomId}/gifs/`
- **URL-based:** Stored in `uploads/{roomId}/gif-urls.json`

## Output Page Rendering

### Position Grid

The output page overlays a 3x3 position grid:

```
┌──────────┬──────────┬──────────┐
│ top-left │top-center│top-right │
├──────────┼──────────┼──────────┤
│mid-left  │  center  │mid-right │
├──────────┼──────────┼──────────┤
│bot-left  │bot-center│bot-right │
└──────────┴──────────┴──────────┘
```

### Animations (CSS Keyframes)

**Basic:**
- `fade` - Opacity 0→1→0
- `slide` - Slides in from nearest edge
- `bounce` - Drops in with bounce easing
- `shake` - Quick horizontal shake

**Fun:**
- `spin` - 360° rotation while fading
- `zoom` - Scales from 0→120%→100%
- `wiggle` - Wobbles side to side
- `bounce-around` - Moves erratically within its zone

### Lifecycle

1. GIF triggered → create `<img>` element in position zone
2. Apply entrance animation (first third of duration)
3. Hold/loop the GIF (middle third)
4. Apply exit animation with fade out (final third)
5. Remove element from DOM

Multiple GIFs can display simultaneously, stacked by trigger order.

## Input Page UI

### Tabbed Interface

```
[🔊 Sounds] [🎬 GIFs]
```

- Default to Sounds tab (preserves current behavior)
- Active tab highlighted
- Clicking switches the view

### GIFs Tab Layout

1. **Preset categories** - Built-in reaction GIFs organized by category
2. **Custom GIFs section** - User-uploaded and URL-based GIFs
3. **Add GIF section** - Two input methods:
   - File upload (accepts .gif, .webp, .png, .apng)
   - URL paste (for Giphy/Tenor/etc)

### GIF Buttons

- Display small thumbnail preview
- Click to trigger with saved settings
- Gear icon for editing settings
- Trash icon for deletion (custom only)

### Add/Edit GIF Form

- Name (optional, defaults to filename or "Custom GIF")
- Position dropdown (9 options)
- Animation dropdown (8 options)
- Duration slider (1-10 seconds, default 3)

## API Endpoints

- `GET /api/gifs?roomId=X` - Fetch all GIFs (presets + custom + URLs)
- `POST /api/gifs/upload?roomId=X` - Upload custom GIF file
- `POST /api/gifs/url?roomId=X` - Add URL-based GIF
- `PUT /api/gifs/:id?roomId=X` - Update GIF settings
- `DELETE /api/gifs/:id?roomId=X` - Delete custom/URL GIF

## File Changes

### New Files
- `pages/api/gifs.js` - GET endpoint for fetching GIFs
- `pages/api/gifs/upload.js` - POST endpoint for uploads
- `pages/api/gifs/url.js` - POST endpoint for URL-based GIFs
- `pages/api/gifs/[id].js` - PUT/DELETE for individual GIFs
- `public/gifs/` - Preset GIF files

### Modified Files
- `pages/[roomId]/input.js` - Add tabs, GIF UI, trigger logic
- `pages/[roomId]/output.js` - Add GIF rendering layer
- `styles/globals.css` - Add animations and GIF-related styles
- `server.js` - Add `play-gif` / `gif-triggered` socket events

## Future Expansion

This design supports adding later:
- Video clips with audio (same pattern, different media type)
- Full-screen transitions (position: 'fullscreen' option)
