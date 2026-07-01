# Pôle 3 — IA & Données

Dossier réservé au pipeline IA du groupe (Whisper, transcription, résumés, chapitres).

## Intégration avec l'app

Le frontend et l'API sont déjà prêts. Le Pôle 3 peut :

1. Développer le service Python / pipeline dans ce dossier
2. Pousser les résultats vers l'API via :

```
POST http://localhost:3001/api/integration/videos/:videoId/ai
Header: X-Integration-Key: <clé définie dans backend/.env>
```

3. Les résultats s'affichent automatiquement dans le panneau IA du lecteur vidéo.

## Format attendu

```json
{
  "summary": "Résumé textuel de la vidéo",
  "keywords": ["react", "api", "formation"],
  "chapters": [
    { "time": "00:00", "title": "Introduction" },
    { "time": "02:30", "title": "Concepts clés" }
  ]
}
```

## Variables d'environnement

Voir `backend/.env.example` — `AI_SERVICE_URL` et `INTEGRATION_API_KEY`.
