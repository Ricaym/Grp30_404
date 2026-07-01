import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { getUserById, publicUser, type DbUser } from '../db.js';

export interface AuthRequest extends Request {
  user?: DbUser;
}

interface JwtPayload {
  sub: string;
  role: string;
}

export function signToken(user: DbUser): string {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ error: 'Authentification requise.' });
    return;
  }

  try {
    const payload = verifyToken(token);
    const user = getUserById(payload.sub);
    if (!user) {
      res.status(401).json({ error: 'Utilisateur introuvable.' });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Session expirée ou token invalide.' });
  }
}

export function requireRole(...roles: Array<'admin' | 'student'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentification requise.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Accès refusé pour ce rôle.' });
      return;
    }

    next();
  };
}

export function authMeHandler(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Non authentifié.' });
    return;
  }
  res.json({ user: publicUser(req.user) });
}
