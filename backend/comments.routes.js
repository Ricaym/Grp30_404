// comments.routes.js
// Routes REST pour le module "Commentaires horodatés" (Tâche 3, Pôle 1).
//
// GET    /api/videos/:videoId/comments        -> liste des commentaires triés par timestamp
// POST   /api/videos/:videoId/comments        -> ajoute un commentaire { timestamp, text, author? }
// DELETE /api/videos/:videoId/comments/:id    -> supprime un commentaire

const express = require('express');
const router = express.Router();
const store = require('./comments.store');

router.get('/videos/:videoId/comments', (req, res) => {
  const { videoId } = req.params;
  const comments = store.getComments(videoId);
  res.json(comments);
});

router.post('/videos/:videoId/comments', (req, res) => {
  const { videoId } = req.params;
  const { timestamp, text, author } = req.body;

  try {
    const comment = store.addComment(videoId, { timestamp, text, author });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/videos/:videoId/comments/:commentId', (req, res) => {
  const { videoId, commentId } = req.params;
  const deleted = store.deleteComment(videoId, commentId);
  if (!deleted) return res.status(404).json({ error: 'Commentaire introuvable' });
  res.status(204).send();
});

module.exports = router;
