import express from 'express';
import { register, login, logout, logoutAll, refresh } from '../controllers/auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { config } from '../../config/index.js';

const router = express.Router();

// Middleware to check if registration is enabled
const checkRegistrationEnabled = (req, res, next) => {
  if (!config.auth.enableRegistration) {
    return res.status(404).json({
      error: 'Route not found'
    });
  }
  next();
};

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', checkRegistrationEnabled, register);

/**
 * @route POST /auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /auth/refresh
 * @desc Refresh token
 * @access Private
 */
router.post('/refresh', refresh);

/**
 * @route POST /auth/logout
 * @desc Logout current device
 * @access Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route POST /auth/logout-all
 * @desc Logout from all devices
 * @access Private
 */
router.post('/logout-all', authenticate, logoutAll);

export default router; 