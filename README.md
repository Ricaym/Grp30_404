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

## Intégration Pôle 2 (Sécurité)

Configurer dans `backend/.env` :

```
INTEGRATION_API_KEY=votre-cle-partagee
SECURITY_SERVICE_URL=http://localhost:4000
```

Endpoints d'intégration (header `X-Integration-Key`) :

```
GET  /api/integration/status
POST /api/integration/security/events   { type, userId?, metadata? }
```

## Intégration Pôle 3 (IA)

Configurer dans `backend/.env` :

```
INTEGRATION_API_KEY=votre-cle-partagee
AI_SERVICE_URL=http://localhost:5000
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
| Pôle 2 — Sécurité & Infra | Abdenour BESSAM | à intégrer via `/api/integration` |
| Pôle 3 — IA & Données | Ousmane MANGANE | `data/` + `/api/integration/videos/:id/ai` |
