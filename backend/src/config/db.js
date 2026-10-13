const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const db = new PrismaClient({
  datasources: {
    db: {
      url: env.databaseUrl,
    },
  },
  log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = db;
