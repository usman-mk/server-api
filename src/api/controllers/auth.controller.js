import { authService } from '../../services/auth.service.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../../validations/auth.validation.js';
import logger from '../../services/logger.service.js';

export const register = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    // Register user
    const result = await authService.register(value, req);

    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.message === 'Username already exists' || error.message === 'Email already exists') {
      res.status(409).json({ error: error.message });
    } else {
      next(error);
    }
  }
};

export const login = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    // Login user
    const result = await authService.login(value.username, value.password, req);

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ error: error.message });
    } else {
      next(error);
    }
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    await authService.logout(req.user.id, token);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    await authService.logoutAll(req.user.id);
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    logger.error('Logout all error:', error);
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = refreshTokenSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    // Refresh token
    const result = await authService.refreshToken(value.refreshToken, req);

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.message === 'Invalid refresh token') {
      res.status(401).json({ error: error.message });
    } else {
      next(error);
    }
  }
}; 