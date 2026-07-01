import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle, Loader2, LogIn, Shield, UserRound } from 'lucide-react';
import { ApiError, useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/routes/paths';

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('marie.dupont@estiam.fr');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
            <LogIn className="h-7 w-7 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Video Learning Hub</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Connectez-vous pour accéder à la plateforme pédagogique.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-primary">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-primary">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              required
            />
          </div>

          {error && (
            <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Se connecter
          </button>
        </form>

        <div className="mt-8 space-y-3 rounded-2xl border border-border bg-surface-muted p-4 text-xs text-text-secondary">
          <p className="font-semibold text-text-primary">Comptes de démonstration</p>
          <div className="flex items-start gap-2">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <span>Admin : marie.dupont@estiam.fr / admin123</span>
          </div>
          <div className="flex items-start gap-2">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <span>Étudiant : lucas.martin@estiam.fr / student123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
