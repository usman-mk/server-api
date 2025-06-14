import errorService from '../services/error.service.js';
import logger from '../services/logger.service.js';

export const notFoundHandler = (req, res, next) => {
  next(errorService.createNotFoundError('Route'));
};

export const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Get error response from error service
  const { status, body } = errorService.createErrorResponse(err);

  // Send error response
  res.status(status).json(body);
}; 