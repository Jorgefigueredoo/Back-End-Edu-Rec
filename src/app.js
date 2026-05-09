const express = require('express');
const cors = require('cors');
const matriculasRoutes = require('./routes/matriculas.routes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));

app.use(express.json());

// Health check — útil para o UptimeRobot pingar
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/api/matriculas', matriculasRoutes);

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

module.exports = app;
