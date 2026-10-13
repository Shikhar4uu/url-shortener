const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const routes = require('./routes');
const redis = require('./config/redis');
const db = require('./config/db');

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
  const [databaseResult, redisResult] = await Promise.allSettled([
    db.$queryRaw`SELECT 1`,
    redis.ping(),
  ]);

  const databaseUp = databaseResult.status === 'fulfilled';

  const redisUp = redisResult.status === 'fulfilled' && redisResult.value === 'PONG';

  const ready = databaseUp && redisUp;

  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not ready',
    database: databaseUp ? 'up' : 'down',
    redis: redisUp ? 'up' : 'down',
  });
});

// All API routes live under /api/v1
app.use('/api/v1', routes);

module.exports = app;
