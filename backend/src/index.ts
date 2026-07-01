import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { config } from './config.js';
import './seed.js';
import { createCollaborationRouter } from './routes/collaboration.js';
import { authRouter } from './routes/auth.js';
import { integrationRouter } from './routes/integration.js';
import { videosRouter } from './routes/videos.js';
import { attachCollaborationWebSocket } from './websocket.js';

const app = express();
const server = http.createServer(app);
const hub = attachCollaborationWebSocket(server);

const VIDEO_MIME: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
        return;
      }
      if (origin === config.clientOrigin) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));

app.use('/uploads', (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  const mime = VIDEO_MIME[ext];
  if (mime) {
    res.setHeader('Content-Type', mime);
    res.setHeader('Accept-Ranges', 'bytes');
  }
  next();
}, express.static(path.join(path.dirname(config.uploadsDir), 'uploads'), {
  setHeaders(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = VIDEO_MIME[ext];
    if (mime) {
      res.setHeader('Content-Type', mime);
      res.setHeader('Accept-Ranges', 'bytes');
    }
  },
}));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'video-learning-hub-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/videos', videosRouter);
app.use('/api/integration', integrationRouter);
app.use('/api', createCollaborationRouter(hub));

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof Error && error.message.includes('File too large')) {
    res.status(413).json({ error: 'Fichier trop volumineux (max 500 Mo).' });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

function startServer(): void {
  server.listen(config.port, () => {
    fs.mkdirSync(config.videosDir, { recursive: true });
    fs.mkdirSync(config.postersDir, { recursive: true });
    console.log(`API ready on http://localhost:${config.port}`);
    console.log(`WebSocket on ws://localhost:${config.port}/ws`);
    console.log('Demo: marie.dupont@estiam.fr / admin123');
    console.log('Demo: lucas.martin@estiam.fr / student123');
  });
}

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} déjà utilisé. Arrêtez l'autre instance API puis relancez.`);
    process.exit(1);
  }
  throw error;
});

startServer();
