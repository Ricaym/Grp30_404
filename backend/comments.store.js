// comments.store.js
// Persistance simple des commentaires horodatés dans un fichier JSON.
// Suffisant pour un hackathon : pas besoin d'une vraie DB pour démontrer la fonctionnalité.

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'comments.json');

// Charge les données depuis le disque (ou initialise un objet vide)
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (err) {
    console.error('Erreur lecture comments.json, réinitialisation.', err);
    return {};
  }
}

// Sauvegarde les données sur le disque
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

let db = loadData(); // { [videoId]: [ { id, timestamp, text, author, createdAt } ] }

function getComments(videoId) {
  const list = db[videoId] || [];
  // Triés par timestamp croissant (utile pour l'affichage chronologique)
  return [...list].sort((a, b) => a.timestamp - b.timestamp);
}

function addComment(videoId, { timestamp, text, author }) {
  if (typeof timestamp !== 'number' || timestamp < 0) {
    throw new Error('timestamp invalide');
  }
  if (!text || !text.trim()) {
    throw new Error('text est requis');
  }

  const comment = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    timestamp,          // en secondes, ex: 135.42
    text: text.trim(),
    author: author || 'Anonyme',
    createdAt: new Date().toISOString(),
  };

  if (!db[videoId]) db[videoId] = [];
  db[videoId].push(comment);
  saveData(db);

  return comment;
}

function deleteComment(videoId, commentId) {
  if (!db[videoId]) return false;
  const before = db[videoId].length;
  db[videoId] = db[videoId].filter((c) => c.id !== commentId);
  saveData(db);
  return db[videoId].length < before;
}

module.exports = { getComments, addComment, deleteComment };
