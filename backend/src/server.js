const app = require('./app');
const env = require('./config/env');
const redis = require('./config/redis');
const db = require('./config/db');

const server = app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port} (${env.nodeEnv})`);
});

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(`${signal} received. Shutting down gracefully...`);

  const forceExitTimer = setTimeout(() => {
    console.error('Forced shutdown after 10 seconds');
    process.exit(1);
  }, 10_000);

  forceExitTimer.unref();

  server.close(async (serverError) => {
    const results = await Promise.allSettled([redis.quit(), db.$disconnect()]);

    const cleanupFailed = results.some((result) => result.status === 'rejected');

    if (serverError) {
      console.error('HTTP shutdown failed:', serverError.message);
    }

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const service = index === 0 ? 'Redis' : 'Database';
        console.error(`${service} shutdown failed`);
      }
    });

    clearTimeout(forceExitTimer);

    if (serverError || cleanupFailed) {
      process.exit(1);
    }

    console.log('HTTP server, Redis and database connections closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
