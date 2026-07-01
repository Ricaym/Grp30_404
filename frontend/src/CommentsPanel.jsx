// CommentsPanel.jsx
// Composant "Commentaires horodatés" (Tâche 3, Pôle 1).
//
// Usage :
// <CommentsPanel
//   videoRef={videoRef}       // ref vers votre élément <video>
//   videoId="video-123"       // identifiant de la vidéo courante
//   apiBaseUrl="http://localhost:4000/api"
// />

import React, { useEffect, useState, useCallback } from 'react';
import './CommentsPanel.css';

function formatTimestamp(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CommentsPanel({ videoRef, videoId, apiBaseUrl }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/videos/${videoId}/comments`);
      if (!res.ok) throw new Error('Erreur chargement des commentaires');
      const data = await res.json();
      setComments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, videoId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;

    // Timestamp courant capturé automatiquement depuis le lecteur vidéo
    const currentTime = videoRef?.current?.currentTime ?? 0;

    try {
      const res = await fetch(`${apiBaseUrl}/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: currentTime, text }),
      });
      if (!res.ok) throw new Error('Erreur ajout du commentaire');
      const newComment = await res.json();

      // Insertion triée par timestamp, sans re-fetch complet
      setComments((prev) =>
        [...prev, newComment].sort((a, b) => a.timestamp - b.timestamp)
      );
      setText('');
    } catch (err) {
      setError(err.message);
    }
  }

  // Clique sur un commentaire -> déplace la lecture vidéo à ce timestamp
  function seekTo(timestamp) {
    if (videoRef?.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play?.();
    }
  }

  return (
    <div className="comments-panel">
      <h3 className="comments-panel__title">Commentaires</h3>

      <form className="comments-panel__form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ajouter un commentaire à l'instant courant..."
          className="comments-panel__input"
        />
        <button type="submit" className="comments-panel__submit">
          Ajouter
        </button>
      </form>

      {loading && <p className="comments-panel__status">Chargement...</p>}
      {error && <p className="comments-panel__status comments-panel__status--error">{error}</p>}

      <ul className="comments-panel__list">
        {comments.map((c) => (
          <li key={c.id} className="comments-panel__item" onClick={() => seekTo(c.timestamp)}>
            <span className="comments-panel__timestamp">{formatTimestamp(c.timestamp)}</span>
            <span className="comments-panel__text">{c.text}</span>
          </li>
        ))}
        {!loading && comments.length === 0 && (
          <li className="comments-panel__empty">Aucun commentaire pour le moment.</li>
        )}
      </ul>
    </div>
  );
}
