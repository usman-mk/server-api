import logger from './logger.service.js';
import { config } from '../config/index.js';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends APIError {
  constructor(errors) {
    super('Validation Error', 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class ErrorService {
  /**
   * Handle API errors
   */
  handleError(error, req, res) {
    // Log the error
    logger.apiError(error, req);

    // Determine error status and message
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    const code = error.code || 'INTERNAL_SERVER_ERROR';

    // Handle validation errors
    if (error instanceof ValidationError) {
      return res.status(status).json({
        status: 'error',
        code,
        message,
        errors: error.errors
      });
    }

    // Handle Sequelize errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Validation Error',
        errors
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: `${err.path} already exists`
      }));
      
      return res.status(409).json({
        status: 'error',
        code: 'UNIQUE_CONSTRAINT_ERROR',
        message: 'Unique Constraint Error',
        errors
      });
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_TOKEN',
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_EXPIRED',
        message: 'Token expired'
      });
    }

    // Handle other errors
    const response = {
      status: 'error',
      code,
      message
    };

    // Include error details in development
    if (config.env === 'development') {
      response.stack = error.stack;
    }

    res.status(status).json(response);
  }

  /**
   * Create a new API error
   */
  createError(message, status = 500, code = 'INTERNAL_SERVER_ERROR') {
    return new APIError(message, status, code);
  }

  /**
   * Create a new validation error
   */
  createValidationError(errors) {
    const error = new Error('Validation failed');
    error.status = 400;
    error.errors = errors;
    return error;
  }

  /**
   * Create a not found error
   */
  createNotFoundError(resource) {
    const error = new Error(`${resource} not found`);
    error.status = 404;
    return error;
  }

  /**
   * Create an unauthorized error
   */
  createUnauthorizedError(message = 'Unauthorized') {
    return new APIError(
      message,
      401,
      'UNAUTHORIZED'
    );
  }

  /**
   * Create a forbidden error
   */
  createForbiddenError(message = 'Forbidden') {
    return new APIError(
      message,
      403,
      'FORBIDDEN'
    );
  }

  createErrorResponse(err) {
    const response = {
      status: 'error',
      message: err.message
    };

    // Add validation errors if present
    if (err.errors) {
      response.errors = err.errors;
    }

    // Set appropriate status code
    const status = err.status || 500;

    return {
      status,
      ...response
    };
  }
}

export default new ErrorService(); 