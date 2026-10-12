const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const routes = require('./routes');

const app = express();

// Security + parsing middleware (runs on every request, in this order)
app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '10kb' }));

// Health check: Kubernetes uses this to know the app is alive
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// All API routes live under /api/v1
app.use('/api/v1', routes);

module.exports = app;
