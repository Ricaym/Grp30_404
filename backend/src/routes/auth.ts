import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getUserByEmail, publicUser } from '../db.js';
import { authMeHandler, requireAuth, signToken, type AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email?.trim() || !password) {
    res.status(400).json({ error: 'Email et mot de passe requis.' });
    return;
  }

  const user = getUserByEmail(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Identifiants incorrects.' });
    return;
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

authRouter.get('/me', requireAuth, authMeHandler);

authRouter.get('/admin-id', requireAuth, (_req: AuthRequest, res) => {
  const admin = getUserByEmail('marie.dupont@estiam.fr');
  res.json({ adminId: admin?.id ?? 'user-admin-1' });
});
