import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

export const config = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: process.env.JWT_SECRET ?? 'video-learning-hub-dev-secret-2026',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  dbPath: path.join(rootDir, 'data', 'app.json'),
  uploadsDir: path.join(rootDir, 'uploads'),
  videosDir: path.join(rootDir, 'uploads', 'videos'),
  postersDir: path.join(rootDir, 'uploads', 'posters'),
  integrationApiKey: process.env.INTEGRATION_API_KEY ?? '',
  aiServiceUrl: process.env.AI_SERVICE_URL ?? '',
  securityServiceUrl: process.env.SECURITY_SERVICE_URL ?? '',
};
