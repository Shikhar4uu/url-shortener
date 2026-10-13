const app = require('./app');
const env = require('./config/env');
const redis = require('./config/redis');

const server = app.listen(env.port, () => {
  console.log(`🚀 API running on http://localhost:${env.port} (${env.nodeEnv})`);
});

// Graceful shutdown: stop new requests, finish current ones, close connections, exit
function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    await redis.quit();
    console.log('✅ HTTP server and Redis closed. Bye!');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⏱️ Forced shutdown after 10s');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));