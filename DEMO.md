# Script démo jury — 5 minutes

## Avant la démo (5 min)

```bash
cd Grp30_404
npm run install:all
cp backend/.env.example backend/.env
# Éditer backend/.env : INTEGRATION_API_KEY + SECURITY_SERVICE_URL si SentinelX tourne
npm run dev:all
```

| Service | URL |
|---------|-----|
| App React | http://localhost:5173 (ou 5174) |
| API | http://localhost:3001 |
| SentinelX (Pôle 2) | http://localhost:8000 |
| Streamlit (Pôle 3) | http://localhost:8501 (`cd data && streamlit run app.py`) |

---

## 1. Login & sécurité (45 s)

1. Ouvrir l'app → page **Connexion**
2. Se connecter en **admin** : `marie.dupont@estiam.fr` / `admin123`
3. **Montrer** : bannière verte « Pôle 2 — SentinelX actif » (si `SECURITY_SERVICE_URL` configuré)
4. **Montrer** : badge **Pôle 2** dans le header (vert = configuré)

> Si SentinelX tourne : l'événement `LOGIN_SUCCESS` part vers `POST /security/event`.

---

## 2. Dashboard & filtres (45 s)

1. **Recherche** : taper « React » ou « Python »
2. **Catégories** : cliquer sur une pill (Développement, Data…)
3. **Montrer** : badges **IA Pôle 3** et **Uploadé** sur les cartes vidéo
4. Sidebar → lien **Dashboard Streamlit** (Pôle 3)

---

## 3. Lecteur augmenté — Pôle 1 (90 s)

1. Ouvrir une vidéo (ex. `vid-1`)
2. **Commentaire horodaté** : se connecter étudiant dans un autre onglet OU montrer le fil existant
3. **Annotation admin** : pause vidéo → ajouter une annotation sur le player
4. **Temps réel** : 2 onglets sur la même vidéo → nouveau commentaire visible sans refresh
5. **Export JSON** (admin) : bouton export collaboration

---

## 4. IA Pôle 3 (60 s)

**Option A — Bouton dans l'app**

1. Admin sur une vidéo → panneau IA → **« Lancer l'analyse IA (Pôle 3) »**
2. Résumé, mots-clés, chapitres, zones d'ennui (seek)

**Option B — Script CLI**

```bash
cd data
python scripts/push_to_api.py --video 1
```

3. Rafraîchir le lecteur → panneau IA mis à jour

**Option C — Upload auto**

1. Admin → **Upload vidéo**
2. Après upload : analyse auto si logs CSV présents

---

## 5. Rôles & upload (30 s)

1. Déconnexion → login **étudiant** : `lucas.martin@estiam.fr` / `student123`
2. **Montrer** : pas d'upload, peut commenter
3. Tentative upload → **403** (contrôle rôle)

---

## Messages clés jury

| Pôle | Ce qu'on montre |
|------|-----------------|
| **Pôle 1** | App complète : auth, dashboard, lecteur, WS, upload |
| **Pôle 2** | Login → événements SentinelX + indicateur UI |
| **Pôle 3** | Analytics engagement dans le lecteur + Streamlit séparé |

**Repo** : https://github.com/Ricaym/Grp30_404
