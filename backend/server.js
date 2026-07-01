// server.js
// Exemple minimal pour brancher les routes de commentaires.
// A fusionner avec votre serveur existant si vous en avez déjà un (Sujet A / WebSockets etc.)

const express = require('express');
const cors = require('cors');
const path = require('path');
const commentsRoutes = require('./comments.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', commentsRoutes);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Application démarrée sur http://localhost:${PORT}`);
});

// Dépendances à installer :
//   npm install express cors
