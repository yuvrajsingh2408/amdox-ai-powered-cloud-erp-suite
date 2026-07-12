import app from './app';
import prisma from './config/db';
import env from './config/env';
import logger from './utils/logger';

const PORT = env.PORT;

const server = app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    logger.info({ event: 'startup', message: `Database connected successfully` });
    logger.info({ event: 'startup', message: `Amdox ERP backend running on port ${PORT}` });
    logger.info({ event: 'startup', message: `API docs: http://localhost:${PORT}/api-docs` });
    logger.info({ event: 'startup', message: `Metrics: http://localhost:${PORT}/metrics` });
    logger.info({ event: 'startup', message: `Health: http://localhost:${PORT}/health` });
  } catch (error) {
    logger.error({ event: 'startup_failure', error });
    process.exit(1);
  }
});

// ─── Graceful Shutdown ─────────────────────────────────────────────────────
const gracefulShutdown = async (signal: string) => {
  logger.info({ event: 'shutdown', signal, message: 'Starting graceful shutdown...' });

  server.close(async () => {
    logger.info({ event: 'shutdown', message: 'HTTP server closed' });
    try {
      await prisma.$disconnect();
      logger.info({ event: 'shutdown', message: 'Database connection closed' });
      process.exit(0);
    } catch (err) {
      logger.error({ event: 'shutdown_error', err });
      process.exit(1);
    }
  });

  // Force close if shutdown takes too long
  setTimeout(() => {
    logger.error({ event: 'shutdown_timeout', message: 'Forced exit after 30s' });
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: any) => {
  logger.error({ event: 'unhandled_rejection', reason: reason?.message || reason });
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err: Error) => {
  logger.error({ event: 'uncaught_exception', error: err.message, stack: err.stack });
  gracefulShutdown('uncaughtException');
});

export default server;
