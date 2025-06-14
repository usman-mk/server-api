import logger from '../services/logger.service.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    logger.httpRequest(req, res, responseTime);
  });
  next();
}; 