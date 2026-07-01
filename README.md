# Grp30_404 — Video Learning Hub

Monorepo du groupe 30. Application full-stack de formation vidéo augmentée.

## Structure

```
Grp30_404/
├── frontend/          # Pôle 1 — React + Vite (dashboard, lecteur, upload)
├── backend/           # Pôle 1 — API Express + WebSocket + auth JWT
├── data/              # Pôle 3 — pipeline IA (à brancher)
├── legacy/            # Ancien code minimal (archivé)
└── package.json       # Scripts racine
```

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm run install:all

# 2. Configurer le backend (optionnel en dev)
cp backend/.env.example backend/.env

# 3. Lancer frontend + API
npm run dev:all
```

- **Frontend** : http://localhost:5173
- **API** : http://localhost:3001
- **WebSocket** : ws://localhost:3001/ws

## Comptes de démo

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | marie.dupont@estiam.fr | admin123 |
| Étudiant | lucas.martin@estiam.fr | student123 |

## Fonctionnalités (Pôle 1)

- Authentification JWT (admin / student)
- Dashboard vidéos + lecteur augmenté
- Upload vidéo (admin)
- Commentaires horodatés + réponses admin
- Annotations interactives sur la vidéo
- Synchronisation temps réel (WebSocket)
- Résultats IA (mock seed + endpoint d'intégration)
- Export JSON collaboration

## État d'avancement

| Pôle | Statut | Où |
|------|--------|-----|
| Pôle 1 — App | ✅ Livré | `frontend/` + `backend/` |
| Pôle 2 — Sécurité | 🔗 Branché (login → SentinelX) | [sentinelx](https://github.com/aaronba2/sentinelx) |
| Pôle 3 — Analytics IA | 🔗 Script de push prêt | `data/scripts/push_to_api.py` |

## Intégration Pôle 2 (SentinelX)

1. Lancer SentinelX (port **8000**) :
   ```bash
   cd sentinelx && docker compose up
   ```
2. Configurer `backend/.env` :
   ```
   SECURITY_SERVICE_URL=http://localhost:8000
   ```
3. À chaque **login** (succès ou échec), notre API envoie un événement vers `POST /security/event`.

> Le Pôle 2 doit accepter un body JSON dynamique (`event`, `ip`, `username`, `severity`). Tant que leur endpoint est en dur, l'appel part mais les données peuvent ne pas être correctes côté SentinelX.

## Intégration Pôle 3 (Analytics)

1. Lancer l'app : `npm run dev:all`
2. Copier la config : `cp backend/.env.example backend/.env`
3. Pousser l'analyse d'une vidéo vers le lecteur :
   ```bash
   cd data
   pip install -r requirement.txt
   python scripts/push_to_api.py --video 1
   ```
4. Ouvrir la vidéo `vid-1` dans le lecteur → panneau IA mis à jour.

Mapping : `video 1` (logs Pôle 3) → `vid-1` (app Pôle 1).

---

## Intégration Pôle 2 — détail technique

Configurer dans `backend/.env` :

```
SECURITY_SERVICE_URL=http://localhost:8000
```

## Intégration Pôle 3 — détail technique

Configurer dans `backend/.env` :

```
INTEGRATION_API_KEY=change-me-integration-key
```

Pousser les résultats IA vers l'app :

```
POST /api/integration/videos/:videoId/ai
Header: X-Integration-Key: votre-cle-partagee
Body: {
  "summary": "Résumé de la vidéo",
  "keywords": ["mot1", "mot2"],
  "chapters": [{ "time": "00:00", "title": "Introduction" }]
}
```

L'UI affiche automatiquement les résultats via `GET /api/videos/:id/ai`.

## API principale

```
POST /api/auth/login
GET  /api/auth/me
GET  /api/videos
POST /api/videos                    (admin, multipart)
GET  /api/videos/:id/comments
POST /api/videos/:id/comments       (student)
GET  /api/videos/:id/annotations
POST /api/videos/:id/annotations    (admin)
GET  /api/videos/:id/ai
GET  /api/videos/:id/export         (admin)
```

## Équipe

| Pôle | Responsable | Dossier |
|------|-------------|---------|
| Pôle 1 — App & Collaboration | Othmane DKHISSI | `frontend/` + `backend/` |
| Pôle 2 — Sécurité & Infra | Abdenour BESSAM | [sentinelx](https://github.com/aaronba2/sentinelx) + branchement login |
| Pôle 3 — IA & Données | Mohammed Sabar / Ousmane MANGANE | `data/` + `push_to_api.py` |
