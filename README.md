# JOE-BS

Stream tools that (should) just work.

## Soundboard

Play sounds on your stream via browser source.

## How it Works

1. **Streamer** adds `/{roomId}/output` as a browser source in OBS
2. **Controller** opens `/{roomId}/input` on any device (phone, tablet, etc.)
3. Controller clicks a sound button → sound plays on the streamer's output

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Production Deployment

### Build and Run

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `HOSTNAME` | `0.0.0.0` | Server hostname |
| `NODE_ENV` | - | Set to `production` for prod builds |

### Deploy to a VPS (Railway, Render, DigitalOcean, etc.)

1. Push your code to a Git repository
2. Connect your repo to your hosting platform
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Deploy!

### Deploy with Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Deploy to Vercel

> Note: Vercel doesn't support custom servers with WebSockets. Use Railway, Render, or a VPS instead.

## OBS Browser Source Settings

- **URL**: `https://your-domain.com/{roomId}/output`
- **Width**: 800 (or any)
- **Height**: 600 (or any)
- The page has a transparent background by default

## Adding Custom Sounds

### Preset Sounds
Add audio files to `public/sounds/` and register them in `pages/api/sounds.js`.

### User Uploads
Users can upload custom sounds per-room via the input page. Uploads are stored in `uploads/{roomId}/`.

## Tech Stack

- Next.js 16 (Pages Router)
- Socket.io for real-time communication
- Express 5 custom server
