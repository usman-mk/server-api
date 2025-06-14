import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import User from '../database/models/user.model.js';
import { config } from '../config/index.js';
import logger from './logger.service.js';
import { tokenService } from './token.service.js';

class AuthService {
  async register(userData, req) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { username: userData.username },
            { email: userData.email }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.username === userData.username) {
          throw new Error('Username already exists');
        }
        throw new Error('Email already exists');
      }

      // Create new user
      const user = await User.create(userData);

      // Generate token
      const token = this.generateToken(user);

      // Store token
      await tokenService.storeToken(user.id, token, config.jwt.expiresIn, req);

      return {
        user: this.sanitizeUser(user),
        token
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(username, password, req) {
    try {
      // Find user
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { username: username },
            { email: username }
          ]
        }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Get current active sessions
      const activeSessions = await tokenService.getActiveSessionCount(user.id);
      logger.info(`Active sessions for user ${user.id}: ${activeSessions}`);

      // Handle session limits based on multiple login settings
      if (!config.jwt.multipleLogin.enabled) {
        logger.info(`Multiple login disabled for user ${user.id}, revoking all sessions`);
        await tokenService.revokeAllUserTokens(user.id);
      } else if (activeSessions >= config.jwt.multipleLogin.maxSessions) {
        logger.info(`User ${user.id} has reached max sessions (${config.jwt.multipleLogin.maxSessions}), revoking oldest session`);
        await tokenService.revokeOldestToken(user.id);
      }

      const now = Date.now();

      // Generate access token
      const accessToken = this.generateToken(user);
      const accessTokenExpires = now + this.parseExpiresIn(config.jwt.expiresIn);

      // Store access token
      await tokenService.storeToken(user.id, accessToken, config.jwt.expiresIn, req);

      // Base response
      const response = {
        user: this.sanitizeUser(user),
        accessToken,
        accessTokenExpires
      };

      // Add refresh token if enabled
      if (config.jwt.refresh.enabled) {
        const refreshToken = this.generateRefreshToken(user);
        const refreshTokenExpires = now + this.parseExpiresIn(config.jwt.refresh.expiresIn);
        
        // Store refresh token
        await tokenService.storeRefreshToken(user.id, refreshToken, config.jwt.refresh.expiresIn, req);

        // Add refresh token to response
        response.refreshToken = refreshToken;
        response.refreshTokenExpires = refreshTokenExpires;
      }

      return response;
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async logout(userId, token) {
    try {
      await tokenService.revokeToken(userId, token);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  async logoutAll(userId) {
    try {
      await tokenService.revokeAllUserTokens(userId);
    } catch (error) {
      logger.error('Logout all error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken, req) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.secret);

      // Check if refresh token is valid and not blacklisted
      const isValid = await tokenService.validateRefreshToken(decoded.id, refreshToken);
      if (!isValid) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await User.findByPk(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      const now = Date.now();

      // Generate new access token
      const accessToken = this.generateToken(user);
      const accessTokenExpires = now + this.parseExpiresIn(config.jwt.expiresIn);

      // Base response
      const response = {
        user: this.sanitizeUser(user),
        accessToken,
        accessTokenExpires
      };

      // Add new refresh token if enabled
      if (config.jwt.refresh.enabled) {
        const newRefreshToken = this.generateRefreshToken(user);
        const refreshTokenExpires = now + this.parseExpiresIn(config.jwt.refresh.expiresIn);
        
        // Store new refresh token
        await tokenService.storeRefreshToken(user.id, newRefreshToken, config.jwt.refresh.expiresIn, req);
        
        // Revoke old refresh token
        await tokenService.revokeRefreshToken(user.id, refreshToken);

        // Add refresh token to response
        response.refreshToken = newRefreshToken;
        response.refreshTokenExpires = refreshTokenExpires;
      }

      return response;
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new Error('Invalid refresh token');
      }
      logger.error('Refresh token error:', error);
      throw error;
    }
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn
      }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user.id,
        type: 'refresh'
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.refresh.expiresIn
      }
    );
  }

  sanitizeUser(user) {
    const { password, ...sanitizedUser } = user.toJSON();
    return sanitizedUser;
  }

  parseExpiresIn(expiresIn) {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch(unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return value;
    }
  }
}

export const authService = new AuthService(); 