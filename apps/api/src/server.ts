import { createApp } from './app.js';
import { logger } from './common/logger.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.PORT, env.HOST, () => {
  logger.info(`API listening on http://${env.HOST}:${env.PORT}`);
});

function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, 'Shutting down');
  server.close((error) => {
    if (error) {
      logger.error(error, 'Error while closing the HTTP server');
      process.exit(1);
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
