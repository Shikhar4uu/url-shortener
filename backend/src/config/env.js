require('dotenv').config();

// Stop the app early if a required setting is missing
const required = ['NODE_ENV', 'PORT', 'DATABASE_URL', 'REDIS_URL'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const port = Number(process.env.PORT);
if (Number.isNaN(port)) {
  console.error('❌ PORT must be a number');
  process.exit(1);
}

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV,
  port,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
});

module.exports = env;
