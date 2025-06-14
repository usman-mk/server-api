import app from './app.js';
import logger from './services/logger.service.js';

const startServer = async () => {
  try {
    await app.init();
    await app.start();
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
};

startServer(); 