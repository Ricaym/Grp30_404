import type { Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { verifyToken } from './middleware/auth.js';
import { getUserById } from './db.js';

export type CollaborationEvent =
  | { type: 'comment:added'; payload: unknown }
  | { type: 'reply:added'; payload: unknown }
  | { type: 'annotation:added'; payload: unknown }
  | { type: 'annotation:updated'; payload: unknown }
  | { type: 'annotation:removed'; payload: unknown };

interface ClientMeta {
  videoId: string;
  userId: string;
}

export interface CollaborationHub {
  broadcast: (videoId: string, event: CollaborationEvent) => void;
}

export function attachCollaborationWebSocket(server: Server): CollaborationHub {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const rooms = new Map<string, Set<WebSocket>>();
  const clientMeta = new WeakMap<WebSocket, ClientMeta>();

  wss.on('connection', (socket, request) => {
    try {
      const url = new URL(request.url ?? '', 'http://localhost');
      const token = url.searchParams.get('token');
      const videoId = url.searchParams.get('videoId');

      if (!token || !videoId) {
        socket.close(1008, 'token and videoId required');
        return;
      }

      const payload = verifyToken(token);
      const user = getUserById(payload.sub);
      if (!user) {
        socket.close(1008, 'invalid user');
        return;
      }

      clientMeta.set(socket, { videoId, userId: user.id });
      if (!rooms.has(videoId)) rooms.set(videoId, new Set());
      rooms.get(videoId)!.add(socket);

      socket.send(JSON.stringify({ type: 'connected', payload: { videoId } }));

      socket.on('close', () => {
        const meta = clientMeta.get(socket);
        if (meta) rooms.get(meta.videoId)?.delete(socket);
      });
    } catch {
      socket.close(1008, 'unauthorized');
    }
  });

  return {
    broadcast(videoId, event) {
      const message = JSON.stringify(event);
      const clients = rooms.get(videoId);
      if (!clients) return;

      for (const client of clients) {
        if (client.readyState === client.OPEN) {
          client.send(message);
        }
      }
    },
  };
}
