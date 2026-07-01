import { useEffect, useState } from 'react';
import { Shield, Sparkles, X } from 'lucide-react';
import { consumeLoginFlash, type LoginFlash } from '@/lib/loginFlash';

export function SystemAlerts() {
  const [flash, setFlash] = useState<LoginFlash | null>(null);

  useEffect(() => {
    setFlash(consumeLoginFlash());
  }, []);

  if (!flash) return null;

  return (
    <div className="space-y-3">
      {flash.enabled ? (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Pôle 2 — SentinelX actif</p>
              <p className="mt-0.5 text-sm text-emerald-700">{flash.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFlash(null)}
            className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">{flash.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setFlash(null)}
            className="rounded-lg p-1 text-amber-700 hover:bg-amber-100"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <p className="text-sm text-brand-800">
          Pôle 3 — Utilisez le bouton « Lancer l&apos;analyse IA » dans le lecteur, ou uploadez une
          vidéo (analyse auto). Dashboard analytics :{' '}
          <a
            href="http://localhost:8501"
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline"
          >
            Streamlit :8501
          </a>
        </p>
      </div>
    </div>
  );
}
