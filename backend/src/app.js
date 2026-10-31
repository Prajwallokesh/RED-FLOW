'use strict';

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/donors',       require('./routes/donors'));
app.use('/api/blood-units',  require('./routes/bloodUnits'));
app.use('/api/verify',       require('./routes/verify'));
app.use('/api/requests',     require('./routes/requests'));
app.use('/api/donor-search', require('./routes/donorSearch'));
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/api/blockchain',   require('./routes/blockchain'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/camps',         require('./routes/camps'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'RedFlow API is operational' });
});

// Global error handler — { error: string, code: string }
app.use((err, req, res, next) => {
  console.error(err);
  const status  = err.status  || 500;
  const message = err.message || 'Internal Server Error';
  const code    = err.code    || 'SERVER_ERROR';
  res.status(status).json({ error: message, code });
});

module.exports = app;
