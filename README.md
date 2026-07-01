# Grp30_404 — Video Learning Hub

Monorepo du groupe 30. Application full-stack de formation vidéo augmentée.

[![Jupyter Notebook](https://img.shields.io/badge/Jupyter_Notebook-F37626?style=for-the-badge&logo=jupyter&logoColor=white)](https://jupyter.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/CSS)

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
- Dashboard vidéos avec **recherche** et **filtres par catégorie**
- Lecteur augmenté (commentaires, annotations, WebSocket)
- Upload vidéo (admin) + **analyse IA auto** après upload
- Indicateur **Pôle 2 SentinelX** (header + bannière au login)
- Panneau **IA Pôle 3** (bouton admin + intégration `push_to_api.py`)
- Export JSON collaboration

## Démo jury

Voir **[DEMO.md](./DEMO.md)** — script 5 minutes pour présenter les 3 pôles.

## État d'avancement

| Pôle | Statut | Où |
|------|--------|-----|
| Pôle 1 — App | ✅ Livré | `frontend/` + `backend/` |
| Pôle 2 — Sécurité | 🔗 Branché (login → SentinelX + badge UI) | [sentinelx](https://github.com/aaronba2/sentinelx) |
| Pôle 3 — Analytics IA | 🔗 Intégré (bouton, auto-upload, Streamlit) | `data/` + sidebar lien :8501 |

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
4. L'UI affiche un **badge Pôle 2** dans le header et une **bannière** après connexion.

> Le Pôle 2 accepte un body JSON dynamique (`event`, `ip`, `username`, `severity`).

## Intégration Pôle 3 (Analytics)

1. Lancer l'app : `npm run dev:all`
2. Copier la config : `cp backend/.env.example backend/.env`
3. **Dans l'app** : bouton « Lancer l'analyse IA » (admin) ou upload vidéo (analyse auto)
4. **Streamlit** : `cd data && pip install -r requirement.txt && streamlit run app.py` → http://localhost:8501
5. **CLI** (optionnel) :
   ```bash
   cd data
   python scripts/push_to_api.py --video 1
   ```
6. Ouvrir la vidéo `vid-1` dans le lecteur → panneau IA mis à jour.

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
