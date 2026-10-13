const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const routes = require('./routes');
const redis = require('./config/redis');

const app = express();

// Security + parsing middleware (runs on every request, in this order)
app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '10kb' }));

// Health check: Kubernetes uses this to know the app is alive
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Readiness check: can we serve traffic right now? (DB check is added in A3)
app.get('/ready', async (req, res) => {
  try {
    await redis.ping();
    res.status(200).json({ status: 'ready', redis: 'up' });
  } catch {
    res.status(503).json({ status: 'not ready', redis: 'down' });
  }
});

// All API routes live under /api/v1
app.use('/api/v1', routes);

module.exports = app;
