import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getUserByEmail, publicUser } from '../db.js';
import { authMeHandler, requireAuth, signToken, type AuthRequest } from '../middleware/auth.js';
import { clientIp, isSecurityEnabled, notifySecurityEvent } from '../services/securityClient.js';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const ip = clientIp(req);

  if (!email?.trim() || !password) {
    res.status(400).json({ error: 'Email et mot de passe requis.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = getUserByEmail(normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    notifySecurityEvent({
      type: 'LOGIN_FAILED',
      ip,
      username: normalizedEmail,
      severity: 'MEDIUM',
      metadata: { source: 'video-learning-hub' },
    });
    res.status(401).json({ error: 'Identifiants incorrects.' });
    return;
  }

  notifySecurityEvent({
    type: 'LOGIN_SUCCESS',
    ip,
    username: normalizedEmail,
    severity: 'LOW',
    metadata: { source: 'video-learning-hub', userId: user.id, role: user.role },
  });

  const token = signToken(user);
  res.json({
    token,
    user: publicUser(user),
    security: {
      enabled: isSecurityEnabled(),
      eventSent: isSecurityEnabled(),
      message: isSecurityEnabled()
        ? 'Événement de connexion transmis à SentinelX (Pôle 2).'
        : 'SentinelX non configuré (SECURITY_SERVICE_URL).',
    },
  });
});

authRouter.get('/me', requireAuth, authMeHandler);

authRouter.get('/admin-id', requireAuth, (_req: AuthRequest, res) => {
  const admin = getUserByEmail('marie.dupont@estiam.fr');
  res.json({ adminId: admin?.id ?? 'user-admin-1' });
});
