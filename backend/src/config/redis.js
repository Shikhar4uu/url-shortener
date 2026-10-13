const Redis = require('ioredis');
const env = require('./env');

// One Redis connection shared by the whole app
const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3, // fail a command after 3 tries instead of waiting forever
});

redis.on('connect', () => console.log('🟥 Redis connected'));
redis.on('error', (err) => console.error('❌ Redis error:', err.message));

module.exports = redis;
