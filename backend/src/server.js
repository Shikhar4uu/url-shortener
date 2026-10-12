const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.port, () => {
  console.log(`🚀 API running on http://localhost:${env.port} (${env.nodeEnv})`);
});

// Graceful shutdown: stop new requests, finish current ones, then exit
function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log('✅ HTTP server closed. Bye!');
    process.exit(0);
  });

  // Safety net: force exit if it takes longer than 10 seconds
  setTimeout(() => {
    console.error('⏱️ Forced shutdown after 10s');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM')); // sent by Kubernetes/Docker
process.on('SIGINT', () => shutdown('SIGINT')); // sent by Ctrl + C
