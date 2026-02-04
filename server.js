const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT, 10) || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = next({ dev, hostname: 'localhost', port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Store io instance for API routes
  expressApp.set('io', io);

  // Serve uploaded files
  expressApp.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', ({ roomId, role }) => {
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.role = role;
      console.log(`Client ${socket.id} joined room ${roomId} as ${role}`);
    });

    socket.on('play-sound', ({ roomId, soundId, soundUrl }) => {
      console.log(`Playing sound ${soundId} in room ${roomId}`);
      // Broadcast to all output clients in the room
      socket.to(roomId).emit('sound-triggered', { soundId, soundUrl });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Make io accessible to API routes via request
  expressApp.use((req, res, next) => {
    req.io = io;
    next();
  });

  // Handle all other routes with Next.js (Express 5 syntax)
  expressApp.all('/{*path}', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    if (!dev) {
      console.log(`> Production mode enabled`);
    }
  });
});
