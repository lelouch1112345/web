const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.get('/ping', (req, res) => {
  res.json({
    ok: true,
    message: 'Backend local de ajedrez funcionando'
  });
});

app.get('/analysis', (req, res) => {
  res.json({
    ok: true,
    summary: 'Análisis de ejemplo de la partida.',
    blunders: 1,
    mistakes: 3,
    inaccuracies: 5
  });
});

app.post('/coach', (req, res) => {
  const { question, fen, pgn } = req.body || {};
  if (!question) {
    return res.status(400).json({ ok: false, error: 'La pregunta es obligatoria.' });
  }

  const details = [];
  if (fen) details.push(`FEN recibido.`);
  if (pgn) details.push(`PGN recibido.`);

  res.json({
    ok: true,
    answer: `Respuesta de ejemplo del coach a la pregunta: ${question}. ${details.join(' ')}`.trim()
  });
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});
