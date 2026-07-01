import type { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';

export function requireIntegrationKey(req: Request, res: Response, next: NextFunction): void {
  if (!config.integrationApiKey) {
    res.status(503).json({ error: 'Intégration non configurée (INTEGRATION_API_KEY manquant).' });
    return;
  }

  const key = req.headers['x-integration-key'];
  if (key !== config.integrationApiKey) {
    res.status(401).json({ error: 'Clé d\'intégration invalide.' });
    return;
  }

  next();
}
